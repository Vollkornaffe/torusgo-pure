const autoBind = require('auto-bind');
const GameLogic = require('./output/GameLogic');
const DataTuple = require('./output/Data.Tuple');
const DataMaybe = require('./output/Data.Maybe');

const {Black, White, Pass} = GameLogic;
const {Tuple} = DataTuple;
const {Nothing, Just} = DataMaybe;


class State {

  // _state =  {
  //   size: null,
  //   moveNum: 0,
  //   koPos: null,
  //   bPrison: 0,
  //   wPrison: 0,
  //   board: []
  // };

  constructor(x, y) {
    let size = new Tuple(x, y);
    this._setState(GameLogic.init(size));

    autoBind(this);
  }

  _setState(state) {
    this._state = state;
    imbueSize(this._state.size);
    imbuePosition(this._state.koPos);
    imbueField(this._state.curCol);

    this._state.board = this._state.board.map((field) => (imbueField(field)));

    return this;
  }

  makeMove(x, y) {
    let position = new Tuple(x, y);
    let play = new GameLogic.Play(position);
    return this._setState(GameLogic.makeMove(this._state)(play));
  }

  pass() {
    return this._setState(GameLogic.makeMove(this._state)(new Pass()));
  }

  testLegal(x, y) {
    let position = new Tuple(x, y);
    return GameLogic.testLegal(this._state)(position);
  }

  getSize() {
    return this._state.size;
  }

  getMoveNumber() {
    return this._state.moveNum;
  }

  getKoPosition() {
    return this._state.koPos;
  }

  getPrisoners(color) {
    if (color.isBlack()) {
      return this._state.bPrison;
    } else if (color.isWhite()) {
      return this._state.wPrison;
    } else {
      return 0;
    }
  }

  getBlackPrisoners() {
    return this._state.bPrison;
  }

  getWhitePrisoners() {
    return this._state.wPrison;
  }

  getMovingColor() {
    return this._state.curCol;
  }

  getField(x, y) {
    let position = new Tuple(x, y);
    let canonicalPosition = GameLogic.canonPos(this.getSize())(position);
    return this.getFieldArray()[canonicalPosition];
  }

  getFieldArray() {
    return this._state.board;
  }

  toString() {
    let size = this.getSize();
    let move = this.getMoveNumber();
    let moving = this.getMovingColor();
    let ko = this.getKoPosition();
    let bPrison = this.getWhitePrisoners();
    let wPrison = this.getBlackPrisoners();
    let board = this.getFieldArray();
    return `State: { 
  size: ${size}, 
  moves: ${move}, 
  to move: ${moving}, 
  ko position: ${ko} 
  b prisoners: ${bPrison}, 
  w prisoners: ${wPrison},
  board: ${board}
}`;
  }
}

function imbueField(field) {
  if (field instanceof Just) {
    field = field.value0;
  }

  let color = (field instanceof Black || field instanceof White);
  let black = (field instanceof Black);


  field.isWhite = function () {
    return !black && color;
  };

  field.isBlack = function () {
    return black;
  };

  field.isEmpty = function () {
    return !color;
  };

  field.equals = function (f) {
    if (field instanceof Black && f instanceof Black) {
      return true;
    }
    if (field instanceof White && f instanceof White) {
      return true;
    }
    return field instanceof Nothing && f instanceof Nothing;
  };

  field.toString = function () {
    return !color ? '-' : black ? 'b' : 'w';
  };

  return field;
}

function imbueSize(s) {
  if (s instanceof Just) {
    s = s.value0;
  }

  s.x = s.value0;
  s.y = s.value1;

  s.toString = function () {
    return `${s.x}x${s.y}`;
  };
  return s;
}

function imbuePosition(p) {
  if (p instanceof Just) {
    p = p.value0;
  }
  p.x = p.value0;
  p.y = p.value1;
  p.toString = function () {
    return `(${p.x}, ${p.y})`;
  };
  return p;
}

module.exports = {
  State, White, Black, Nothing
};

debugger;