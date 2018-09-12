import {EColor, EField, IGame, IPosition, IRawGame, IRuleSet, ISize, TGameBoard, TMove} from '../types/game';
import {start} from "repl";

export function testMove(game: IGame, move: TMove): boolean {

  // TODO

  return false;
}

export function applyMove(game: Readonly<IGame>, move: TMove): IGame {

  // TODO

  return game;
}

// here the port from purescript, maybe exported to a npm module.
// everything is intended to be purely functional

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

// I don't know whether this will ever be needed
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

// just annoying cast to field
function colorToField(color: EColor): EField{
  switch (color) {
    case EColor.White: return EField.White;
    case EColor.Black: return EField.Black;
  }
}

function getField(size: ISize, board: TGameBoard, pos: IPosition) {
  return board[posToIndex(size, pos)];
}

// when this is called, the returned board is modified
// remember that boards captured in filter functions etc.
// will NOT be up to date then!
function setField(size: ISize, board: TGameBoard, field: EField, pos: IPosition) : TGameBoard {
  const newBoard = [...board];
  newBoard[posToIndex(size, pos)] = field;
  return newBoard;
}

// can be passed a filter
// to only find positions that have a certain field value
// or to make sure that no loops happen in depth searches
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

// there may be a better way for this
// the intention is to remove duplicate positions
// first get canonical positions, then only add if not present yet
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

// this is the head for the recursive group search
// can be passed a filter which will usually just check for correct field
// THE STARTING POSITION WILL NOT BE FILTERED
function getGroupWithFilter(
  size: ISize,
  board: TGameBoard,
  filter: (pos: IPosition) => boolean,
  startingPos: IPosition,
): IPosition[] {
  return getGroupWithFilterRecursive(size, board, filter, [], [canonPos(size, startingPos)]);
}

// members and newMembers always canonical
function getGroupWithFilterRecursive(
  size: ISize,
  board: TGameBoard,
  filter: (pos: IPosition) => boolean,
  members: IPosition[],
  newMembers: IPosition[],
) : IPosition[] {

  // we don't want to add previously visited positions -> infinite loop
  // also apply the passed filter
  const neighFilter = (potentialNeigh: IPosition): boolean => {
    return membersNext.indexOf(canonPos(size, potentialNeigh)) === -1
      && filter(potentialNeigh);
  };

  // get the wanted unvisited neighbors of all newMembers
  const newMembersSameFieldNeighArrays = newMembers.map(
    (newMember: IPosition): IPosition[] => {
    return getNeighPosArray(newMember, neighFilter);
  });

  // flatten result & remove duplicates
  const newMembersNextWithDups = [].concat.apply([], newMembersSameFieldNeighArrays);
  const newMembersNext = canonAndRemoveDups(size, newMembersNextWithDups);

  // previous newMembers are now done
  const membersNext = members.concat(newMembers);

  if (newMembersNext === []) {
    // recursion stop nothing new was found
    return members;
  } else {
    // next step in search
    return getGroupWithFilterRecursive(size, board, filter, membersNext, newMembersNext);
  }
}

// for a given position gets the positions of empty fields
// adjecent to the connected group
// only makes sense to call this with a color
function groupEmptyPositions(size: ISize, board: TGameBoard, color: EColor, pos: IPosition): IPosition[] {

  const field = colorToField(color);

  // only same color ofc
  const groupFilter = (pos: IPosition) => {
    return getField(size, board, pos) === field;
  };
  const group = getGroupWithFilter(size, board, groupFilter, pos);

  // get the adject empty neighbors as multiple arrays
  const groupEmptyPositionsArrays = group.map((member: IPosition) => {
    getNeighPosArray(member, (potentialEmpty: IPosition) => {
      return getField(size, board, potentialEmpty) === EField.Empty;
    });
  });

  // flatten result & remove duplicates
  const groupEmptyPositionsWithDups = [].concat.apply([], groupEmptyPositionsArrays);
  return canonAndRemoveDups(size, groupEmptyPositionsWithDups);
}

// tests the legality of the intended move without applying it
function testLegal(
  toMove: EColor,
  size: ISize,
  board: TGameBoard,
  ko: boolean,
  koPosition: IPosition,
  intendedPos: IPosition,
): boolean {

  // can't play on non empty
  if (getField(size, board, intendedPos) !== EField.Empty) {
    return false;
  }

  // can't play in the ko
  if(ko && canonPos(size, intendedPos) === koPosition) {
    return false;
  }

  // maybe we capture some enemy stones then?
  const enemyEmpty = groupEmptyPositions(size, board, flipColor(toMove), intendedPos);
  if (enemyEmpty.length === 1) {
    if (enemyEmpty.indexOf(canonPos(size, intendedPos)) > -1) {
      return true;
    }
  }

  // now we must look into the empty fields
  return groupEmptyPositions(size, board, toMove, intendedPos).length > 0;
}













