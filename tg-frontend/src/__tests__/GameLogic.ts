import {EColor, IPosition, TKo} from "../types/game";

import {boardFromInts, flipField, testPosition} from "../utils/GameLogic";

// NOTE: 1 is black, 2 is white

describe("testPosition", () => {
  // test a position with the given board and the inverted board
  function testWhite(size: IPosition, boardInts: number[], koPosition: TKo, pos: IPosition, truthValue: boolean) {
    expect(testPosition(
      size,
      boardFromInts(boardInts),
      koPosition,
      EColor.White,
      pos,
    )).toEqual(truthValue);
    expect(testPosition(
      size,
      boardFromInts(boardInts).map(field => flipField(field)),
      koPosition,
      EColor.Black,
      pos,
    )).toEqual(truthValue);
  }
  function testBlack(size: IPosition, boardInts: number[], koPosition: TKo, pos: IPosition, truthValue: boolean) {
    expect(testPosition(
      size,
      boardFromInts(boardInts),
      koPosition,
      EColor.Black,
      pos,
    )).toEqual(truthValue);
    expect(testPosition(
      size,
      boardFromInts(boardInts).map(field => flipField(field)),
      koPosition,
      EColor.White,
      pos,
    )).toEqual(truthValue);
  }

  it("empty board", () => {
    const boardInts = [
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ];
    const size = { x: 3, y: 3 };

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (const c of [EColor.White, EColor.Black]) {
          testWhite(size, boardInts, null, {x, y}, true);
          testBlack(size, boardInts, null, {x, y}, true);
        }
      }
    }
  });

  it("not quite empty board", () => {
    const boardInts = [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0,
    ];
    const size = { x: 3, y: 3 };

    testWhite(size, boardInts, null, { x: 1, y: 1 }, false);
    testBlack(size, boardInts, null, { x: 1, y: 1 }, false);
  });

  it("no self kill", () => {
    const boardInts = [
      1, 1, 1,
      1, 0, 1,
      1, 1, 1,
    ];
    const size = { x: 3, y: 3 };

    // White can capture
    testWhite(size, boardInts, null, { x: 1, y: 1 }, true);

    // Black can't self kill
    testBlack(size, boardInts, null, { x: 1, y: 1 }, false);
  });

  it("no space", () => {
    const boardInts = [
      0, 0, 0,
      1, 1, 1,
      1, 0, 1,
      1, 1, 1,
    ];
    const size = { x: 4, y: 3 };

    // White can't move in the center of the eye
    testWhite(size, boardInts, null, { x: 2, y: 1 }, false);

    // Black can though
    testBlack(size, boardInts, null, { x: 2, y: 1 }, true);
  });

  it("ko inactive", () => {
    const boardInts = [
      0, 1, 2, 0,
      1, 2, 0, 2,
      0, 1, 2, 0,
    ];
    const size = { x: 3, y: 4 };

    testBlack(size, boardInts, null, { x: 0, y: 0 }, true);

    // Can capture and place
    testBlack(size, boardInts, null, { x: 1, y: 2 }, true);

    testWhite(size, boardInts, null, { x: 1, y: 2 }, true);
  });

  it("ko active", () => {
    const boardInts = [
      0, 1, 2, 0,
      1, 2, 0, 2,
      0, 1, 2, 0,
    ];
    const size = { x: 3, y: 4 };
    const koPosition = { x: 1, y: 2};

    // Black can't play in ko position
    testBlack(size, boardInts, koPosition, { x: 1, y: 2 }, false);

    // Note that this doesn't happen in a real game
    testBlack(size, boardInts, koPosition, { x: 1, y: 2 }, false);
  });
});