import autoBind from 'auto-bind';
import GameLogic, {Black, White} from './output/GameLogic';
import {Tuple} from './output/Data.Tuple';
import Maybe, {Nothing} from './output/Data.Maybe';

const BLACK = imbueField(new Black());
const WHITE = imbueField(new White());
const PASS = new GameLogic.Pass();

function imbueField(field) {
  let color = (field instanceof Black || field instanceof White);
  let black = (field instanceof Black);


  field.isWhite = function () {
    return !black && color;
  };

  field.isBlack = function () {
    return black;
  };

  field.isEmpty = function() {
    return !color;
  };

  field.equals = function(f) {
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
}

function imbueSize(s) {
  s.x = s.value0;
  s.y = s.value1;
  s.toString = function () {
    return `${s.x}x${s.y}`;
  };
  return s;
}

function imbuePosition(p) {

  p.x = p.value0;
  p.y = p.value1;
  p.toString = function () {
    return `(${p.x}, ${p.y})`;
  };
  return p;
}

class State {
  constructor(x, y) {
    let size = new Tuple(x,y);
    this.setState(GameLogic.init(size));

    autoBind(this);
  }

  setState(state ) {
    this._state = state;
    imbueSize(this._state.size);
    imbuePosition(this._state.koPos); //todo handle maybe
    imbueField(this._state.curCol);
    this._state.board.forEach((field) => {
      imbueField(field);
    });

    return this;
  }

  makeMove(x,y) {
    let position = new Tuple(x,y);
    let play = new GameLogic.Play(position);
    return this.setState(GameLogic.makeMove(this._state)(play));
  }

  pass() {
    return this.setState(GameLogic.makeMove(this._state)(PASS));
  }

  testLegal(x,y) {
    let position = new Tuple(x,y);
    return GameLogic.testLegal(this._state)(position);
  }

  getSize() {
    return this._state.size;
  }

  getMove() {
    return this._state.moveNum;
  }

  getKoPosition() {
    return this._state.koPos;
    //TODO handle maybe
  }

  getPrisoners(color) {
    if(color.isBlack()) {
      return this._state.bPrison;
    } else if(color.isWhite()){
      return this._state.wPrison;
    } else {
      return 0;
    }
  }

  getMovingColor() {
    return this._state.curCol;
  }

  getField(x,y) {
    let position = new Tuple(x,y);
    let field = GameLogic.getField(this._state)(position);
    return Maybe.fromMaybe(field);
  }

  getFieldArray() {
    return this._state.board;
  }

  get2dFieldArray() {
    let size = this.getSize();

    let array2d = [];
    for(let i = 0; i < size.x; i++) {
      array2d.push([]);
      for(let j = 0; j < size.y; j++) {
        array2d[i].push(this.getField(i,j));
      }
    }
    return array2d;
  }

  toString() {
    let size = this.getSize();
    let move = this.getMove();
    let moving = this.getMovingColor();
    let ko = this.getKoPosition();
    let bPrison = this.getPrisoners(BLACK);
    let wPrison = this.getPrisoners(WHITE);
    let board = this.get2dFieldArray();
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

export default {
  BLACK,
  WHITE,
  PASS,
  State
};