import {EColor, EField, IGame, IPosition, IRawGame, IRuleSet, ISize, TGameBoard, TMove} from '../types/game';

export function testMove(game: IGame, move: TMove): boolean {

  // TODO

  return false;
}

export function applyMove(game: Readonly<IGame>, move: TMove): IGame {

  // TODO

  return game;
}

// here the port from purescript, maybe exported to a npm module.

// init game with empty board
// TODO handle handicap
export function initGame(ruleSet: IRuleSet) : IRawGame {
  const board = [];
  for (let i = 0; i < ruleSet.size.x * ruleSet.size.y; i++) {
    board.push(EField.Empty);
  }

  return {
    ruleSet,
    toMove: EColor.Black,
    board,
    ko: false,
    capturedByBlack: 0,
    capturedByWhite: 0,
  }
}

// return canonical position in [(0,0), (size.x, size.y)]
function canonPos(size: ISize, pos: IPosition) : IPosition {
  let x = pos.x;
  let y = pos.y;
  while(x < 0) {
    x += size.x;
  }
  while(x > size.x-1) {
    x -= size.x;
  }
  while(y < 0) {
    y += size.y;
  }
  while(y > size.y-1) {
    y -= size.y;
  }
  return { x, y };
}

function indexToPos(size: ISize, idx: number) : IPosition {
  let remainder = idx;
  let x = 0;
  while(remainder > size.y - 1) {
    remainder -= size.y;
    x += 1;
  }
  return { x, y: remainder};
}

function posToIndex(size: ISize, pos: IPosition) {
  const cPos = canonPos(size, pos);
  return cPos.y + cPos.x * size.y;
}

function setField(board: TGameBoard, field: EField, idx: number) : TGameBoard {
  const newBoard = [...board];
  newBoard[idx] = field;
  return newBoard;
}

function getNeighPosArray(
  pos: IPosition,
  posFilter = (potentialNeigh: IPosition) => true,
) : IPosition[] {
  return [
    {x: pos.x - 1, y: pos.y},
    {x: pos.x + 1, y: pos.y},
    {x: pos.x, y: pos.y - 1},
    {x: pos.x, y: pos.y + 1},
  ].filter(posFilter);
}

function flipColor(color: EColor) : EColor {
  return color === EColor.Black ? EColor.Black : EColor.White;
}

function canonAndRemoveDups(size: ISize, positions: IPosition[]) : IPosition[] {
  const canonPositions = positions.map((pos: IPosition) => {
    return canonPos(size, pos);
  });

  const noDups = [];
  for (const pos of canonPositions) {
    if (noDups.indexOf(pos) > -1) {
      noDups.push(pos);
    }
  }

  return noDups;
}

function getGroup(
  size: ISize,
  board: TGameBoard,
  startingPos: IPosition,
  field: EField,
): IPosition[] {
  if (board[posToIndex(size, startingPos)] !== field) {
    return [];
  }
  return getGroupRecursive(size, board, [], [canonPos(size, startingPos)]);
}

// members and newMembers always canonical
function getGroupRecursive(
  size: ISize,
  board: TGameBoard,
  members: IPosition[],
  newMembers: IPosition[],
) : IPosition[] {
  if (newMembers === []) {
    return members;
  }

  const membersNext = members.concat(newMembers);
  const neighFilter = (potentialNeigh: IPosition): boolean => {
    return membersNext.indexOf(canonPos(size, potentialNeigh)) === -1;
  };
  const newMembersSameFieldNeighArrays = newMembers.map(
    (newMember: IPosition): IPosition[] => {
    return getNeighPosArray(newMember, neighFilter);
  });
  const newMembersNextWithDups = [].concat.apply([], newMembersSameFieldNeighArrays);
  const newMembersNext = canonAndRemoveDups(size, newMembersNextWithDups);

  return getGroupRecursive(size, board, membersNext, newMembersNext);
}

function directLiberties(size: ISize, board: TGameBoard, pos: IPosition): number {
  const freePositions = getNeighPosArray(pos, (potentialFree: IPosition) => {
    return board[posToIndex(size, potentialFree)] === EField.Empty;
  });
  return freePositions.length;
}

