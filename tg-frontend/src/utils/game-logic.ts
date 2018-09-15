import {EColor, IGame, IPosition, IRawGame, IRuleSet, ISize, TField, TGameBoard, TMove} from '../types/game';

import store from "../redux/store";

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
  // const board = [];
  // for (let i = 0; i < ruleSet.size.x * ruleSet.size.y; i++) {
  //   board.push(null);
  // }

  const boardInts = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 1, 2, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 1, 2, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];

  const board = boardInts.map((i) => {
    switch (i) {
      case 1:
        return EColor.Black;
      case 2:
        return EColor.White;
      default:
        return null;
    }
  });

  return {
    ruleSet,
    toMove: EColor.Black,
    board,
    ko: false,
    koPosition: {x: 0, y: 0},
    capturedByBlack: 0,
    capturedByWhite: 0,
  };
}

// return canonical position in [(0,0), (size.x-1, size.y-1)]
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

function getField(size: ISize, board: TGameBoard, pos: IPosition) {
  return board[posToIndex(size, pos)];
}

// when this is called, the returned board is modified
// remember that boards captured in filter functions etc.
// will NOT be up to date then!
function setField(size: ISize, board: TGameBoard, field: TField, pos: IPosition) : TGameBoard {
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

function flipField(field: TField) : TField {
  switch(field) {
    case null: return null;
    case EColor.Black: return EColor.White;
    case EColor.White: return EColor.Black;
  }
}

// all inputs canon
function posInArray(positions: IPosition[], toFind: IPosition) : boolean {
  for (const pos of positions) {
    if (pos.x === toFind.x && pos.y === toFind.y) {
      return true;
    }
  }
  return false;
}

// there may be a better way for this
// the intention is to remove duplicate positions
// first get canonical positions, then only add if not present yet
function canonAndRemoveDups(size: ISize, positions: IPosition[]) : IPosition[] {
  const canonPositions = positions.map((pos: IPosition) => {
    return canonPos(size, pos);
  });

  const noDups: IPosition[] = [];
  for (const pos of canonPositions) {
    if (!posInArray(noDups, pos)) {
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
  filter: (pos: IPosition) => boolean,
  startingPos: IPosition,
): IPosition[] {
  return getGroupWithFilterRecursive(size, filter, [], [canonPos(size, startingPos)]);
}

// members and newMembers always canonical
function getGroupWithFilterRecursive(
  size: ISize,
  filter: (pos: IPosition) => boolean,
  members: IPosition[],
  newMembers: IPosition[],
) : IPosition[] {

  // nothing new found end recursion
  if (newMembers.length === 0) {
    return members;
  }

  // previous newMembers are now also members
  const membersNext = members.concat(newMembers);

  // we don't want to add previously visited positions -> infinite loop
  // also apply the passed filter
  const neighFilter = (potentialNeigh: IPosition): boolean => {
    return !posInArray(membersNext, canonPos(size, potentialNeigh))
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

  // next step in search
  return getGroupWithFilterRecursive(size, filter, membersNext, newMembersNext);
}

// for a given position gets the positions of empty fields
// adjecent to the connected group
// only makes sense to call this with a color
function groupEmptyPositions(size: ISize, board: TGameBoard, color: TField, pos: IPosition): IPosition[] {

  // only same color ofc
  const groupFilter = (potentialMember: IPosition) => {
    return getField(size, board, potentialMember) === color;
  };
  const group = getGroupWithFilter(size, groupFilter, pos);

  // get the adject empty neighbors as multiple arrays
  const groupEmptyPositionsArrays = group.map((member: IPosition) => {
    return getNeighPosArray(member, (potentialEmpty: IPosition) => {
      return getField(size, board, potentialEmpty) === null;
    });
  });

  // flatten result & remove duplicates
  const groupEmptyPositionsWithDups = [].concat.apply([], groupEmptyPositionsArrays);
  return canonAndRemoveDups(size, groupEmptyPositionsWithDups);
}

function testPosition(
  size: ISize,
  board: TGameBoard,
  koPosition: IPosition,
  toMove: EColor,
  intededPos: IPosition,
) : boolean {

  // first canonize
  const pos = canonPos(size, intededPos);

  // gotta be empty field
  if (getField(size, board, pos) !== null) {
    return false;
  }

  console.log("is empty");

  // check for ko
  if (koPosition) {
    if (koPosition === pos) {
      return false;
    }
  }

  console.log("not ko");

  // some filters
  const friendFilter = (potentialFriend: IPosition) => {
    return getField(size, board, potentialFriend) === toMove;
  };
  const enemyFilter = (potentialEnemy: IPosition) => {
    return getField(size, board, potentialEnemy) === flipField(toMove);
  };

  // capturing enemy stones?
  // i.e. a neighboring enemy group has 1 liberty: pos
  const enemyNeigh = getNeighPosArray(pos, enemyFilter);
  if (enemyNeigh.length > 0) {
    const enemyNeighsFreedoms = enemyNeigh.map((n) => {
      return groupEmptyPositions(size, board, flipField(toMove), n);
    });
    if (enemyNeighsFreedoms.some( (freedoms: IPosition[]) => {
      return freedoms.length === 1;
    })) {

      console.log("capturing enemy, all good");

      return true;
    }
  }

  // if no enemy stones are captured, we must take care to not suicide other friendly stones
  // so at least one neighboring group needs to have at least 2 liberties
  // or there are no friendly stones at all
  const friendNeigh = getNeighPosArray(pos, friendFilter);
  if (friendNeigh.length > 0) {
    const friendNeighsFreedoms = friendNeigh.map((n) => {
      return groupEmptyPositions(size, board, toMove, n);
    });
    if (friendNeighsFreedoms.some((freedoms: IPosition[]) => {
      return freedoms.length > 1;
    })) {

      console.log("one neighboring friendly group has enough libs");

      return true;

    } else {
      console.log("capturing friends, illegal");

      return false;
    }
  }

  const directEmpty = getNeighPosArray(pos, (potentialEmpty: IPosition) => {
    return getField(size, board, potentialEmpty) === null;
  });

  if (directEmpty.length > 0) {

    console.log("got space, nothing happening though");

    return true;

  } else {

    console.log("got no space, illegal");

    return true;

  }
}

// tests the legality of the intended move without applying it
export const testLegal = (
  move: IPosition,
): boolean => {

  const rawGame = store.getState().localGame.rawGame;

  const legal = testPosition(
    rawGame.ruleSet.size,
    rawGame.board,
    rawGame.koPosition,
    rawGame.toMove,
    move);



  return legal;
};






