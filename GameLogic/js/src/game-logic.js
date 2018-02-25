import autoBind from 'react-autobind';
import update from 'immutability-helper';
import {
  interface_init, interface_pass, interface_makeMove, interface_convertState, interface_testLegal,
  interface_directCapture, interface_cascadingCapture, interface_computeScore, interface_markEmpty
} from '../lib/GameLogic';

class State {

  constructor(x, y) {
    autoBind(this);
    if(!(typeof x === 'number' && typeof y === 'number')) {
      throw new Error('State\'s constructor requires two numbers as arguments');
    }

    this.pursState = interface_init(x)(y);
    this.jsonState = interface_convertState(this.pursState);
    this.scoreMarks = interface_markEmpty(this.pursState);

  }

  /**
   * returns a new State object if the passed purs state is, in fact,
   * a new state. returns this otherwise
   * @param pursState a new purs state
   * @return {State}
   */
  newState(pursState) {
    if(pursState !== this.pursState) {
      return update(this, {
        pursState: {$set: pursState},
        jsonState: {$set: interface_convertState(pursState)},
        scoreMarks: {$set: interface_markEmpty(pursState)}
      });
    } else {
      return this;
    }
  }

  makeMove(x, y) {
    return this.newState(interface_makeMove(this.pursState)(x)(y));
  }

  directCapture(x, y) {
    return this.newState(interface_directCapture(this.pursState)(x)(y));
  }

  cascadingCapture(x, y) {
    return this.newState(interface_cascadingCapture(this.pursState)(x)(y));
  }

  pass() {
    return this.newState(interface_pass(this.pursState));
  }

  testLegal(x, y) {
    return interface_testLegal(this.pursState)(x)(y);
  }

  getSize() {
    return this.jsonState.size;
  }

  getMoveNumber() {
    return this.jsonState.moveNum;
  }

  getKoPosition() {
    if (this.jsonState.ko) {
      return this.jsonState.koPos;
    } else {
      return null;
    }
  }

  getBlackPrisoners() {
    return this.jsonState.bPrison;
  }

  getWhitePrisoners() {
    return this.jsonState.wPrison;
  }

  getMovingColor() {
    return this.jsonState.curCol;
  }

  getFieldArray() {
    return this.jsonState.board;
  }

  getScoringMarks() {
    return this.scoreMarks;
  }

  toString() {
    return JSON.stringify(this.jsonState);
  }
}

export default State;
