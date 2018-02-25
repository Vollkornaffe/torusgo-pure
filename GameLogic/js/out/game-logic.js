'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactAutobind = require('react-autobind');

var _reactAutobind2 = _interopRequireDefault(_reactAutobind);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _GameLogic = require('../lib/GameLogic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = function () {
  function State(x, y) {
    _classCallCheck(this, State);

    (0, _reactAutobind2.default)(this);
    if (!(typeof x === 'number' && typeof y === 'number')) {
      throw new Error('State\'s constructor requires two numbers as arguments');
    }

    this.pursState = (0, _GameLogic.interface_init)(x)(y);
    this.jsonState = (0, _GameLogic.interface_convertState)(this.pursState);
    this.scoreMarks = (0, _GameLogic.interface_markEmpty)(this.pursState);
  }

  /**
   * returns a new State object if the passed purs state is, in fact,
   * a new state. returns this otherwise
   * @param pursState a new purs state
   * @return {State}
   */


  _createClass(State, [{
    key: 'newState',
    value: function newState(pursState) {
      if (pursState !== this.pursState) {
        return (0, _immutabilityHelper2.default)(this, {
          pursState: { $set: pursState },
          jsonState: { $set: (0, _GameLogic.interface_convertState)(pursState) },
          scoreMarks: { $set: (0, _GameLogic.interface_markEmpty)(pursState) }
        });
      } else {
        return this;
      }
    }
  }, {
    key: 'makeMove',
    value: function makeMove(x, y) {
      return this.newState((0, _GameLogic.interface_makeMove)(this.pursState)(x)(y));
    }
  }, {
    key: 'directCapture',
    value: function directCapture(x, y) {
      return this.newState((0, _GameLogic.interface_directCapture)(this.pursState)(x)(y));
    }
  }, {
    key: 'cascadingCapture',
    value: function cascadingCapture(x, y) {
      return this.newState((0, _GameLogic.interface_cascadingCapture)(this.pursState)(x)(y));
    }
  }, {
    key: 'pass',
    value: function pass() {
      return this.newState((0, _GameLogic.interface_pass)(this.pursState));
    }
  }, {
    key: 'testLegal',
    value: function testLegal(x, y) {
      return (0, _GameLogic.interface_testLegal)(this.pursState)(x)(y);
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      return this.jsonState.size;
    }
  }, {
    key: 'getMoveNumber',
    value: function getMoveNumber() {
      return this.jsonState.moveNum;
    }
  }, {
    key: 'getKoPosition',
    value: function getKoPosition() {
      if (this.jsonState.ko) {
        return this.jsonState.koPos;
      } else {
        return null;
      }
    }
  }, {
    key: 'getBlackPrisoners',
    value: function getBlackPrisoners() {
      return this.jsonState.bPrison;
    }
  }, {
    key: 'getWhitePrisoners',
    value: function getWhitePrisoners() {
      return this.jsonState.wPrison;
    }
  }, {
    key: 'getMovingColor',
    value: function getMovingColor() {
      return this.jsonState.curCol;
    }
  }, {
    key: 'getFieldArray',
    value: function getFieldArray() {
      return this.jsonState.board;
    }
  }, {
    key: 'getScoringMarks',
    value: function getScoringMarks() {
      return this.scoreMarks;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return JSON.stringify(this.jsonState);
    }
  }]);

  return State;
}();

exports.default = State;