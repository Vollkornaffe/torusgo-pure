import autoBind from 'auto-bind';
import {
  interface_init, interface_pass, interface_makeMove, interface_convertState, interface_testLegal,
  interface_directCapture, interface_cascadingCapture, interface_computeScore, interface_markEmpty
} from '../lib/GameLogic';

class State {

  constructor(x, y) {
    if(!(typeof x === 'number' && typeof y === 'number')) {
      throw new Error('State\'s constructor requires two numbers as arguments');
    }

    this.purs_State = interface_init(x)(y);
    this.json_State = interface_convertState(this.purs_State);

    this.scoreMarks = interface_markEmpty(this.purs_State);

    autoBind(this);
  }

  setState(state) {
    this.purs_State = state;
    this.json_State = interface_convertState(this.purs_State);
    this.updateScore();
  }

  updateScore() {
    this.scoreMarks = interface_markEmpty(this.purs_State);
  }

  getScoringMarks() {
    return this.scoreMarks;
  }

  makeMove(x, y) {
    this.purs_State = interface_makeMove(this.purs_State)(x)(y);
    this.json_State = interface_convertState(this.purs_State);
    this.updateScore();
  }

  directCapture(x, y) {
    this.purs_State = interface_directCapture(this.purs_State)(x)(y);
    this.json_State = interface_convertState(this.purs_State);
    this.updateScore();
  }

  cascadingCapture(x,y) {
    this.purs_State = interface_cascadingCapture(this.purs_State)(x)(y);
    this.json_State = interface_convertState(this.purs_State);
    this.updateScore();
  }

  pass() {
    this.purs_State = interface_pass(this.purs_State);
    this.json_State = interface_convertState(this.purs_State);
    this.updateScore();
  }

  testLegal(x, y) {
    return interface_testLegal(this.purs_State)(x)(y);
  }

  getSize() {
    return this.json_State.size;
  }

  getMoveNumber() {
    return this.json_State.moveNum;
  }

  getKoPosition() {
    if (this.json_State.ko) {
      return this.json_State.koPos;
    } else {
      return null;
    }
  }

  getBlackPrisoners() {
    return this.json_State.bPrison;
  }

  getWhitePrisoners() {
    return this.json_State.wPrison;
  }

  getMovingColor() {
    return this.json_State.curCol;
  }

  getFieldArray() {
    return this.json_State.board;
  }

  toString() {
    return JSON.stringify(this.json_State);
  }

}

export {State};
