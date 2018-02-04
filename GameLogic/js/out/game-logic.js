'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.State = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _autoBind = require('auto-bind');

var _autoBind2 = _interopRequireDefault(_autoBind);

var _GameLogic = require('../lib/GameLogic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = function () {
  function State(x, y) {
    _classCallCheck(this, State);

    if (!(typeof x === 'number' && typeof y === 'number')) {
      throw new Error('State\'s constructor requires two numbers as arguments');
    }

    this.purs_State = (0, _GameLogic.interface_init)(x)(y);
    this.json_State = (0, _GameLogic.interface_convertState)(this.purs_State);

    (0, _autoBind2.default)(this);
  }

  _createClass(State, [{
    key: 'setState',
    value: function setState(state) {
      this.purs_State = state;
      this.json_State = (0, _GameLogic.interface_convertState)(this.purs_State);
    }
  }, {
    key: 'makeMove',
    value: function makeMove(x, y) {
      this.purs_State = (0, _GameLogic.interface_makeMove)(this.purs_State)(x)(y);
      this.json_State = (0, _GameLogic.interface_convertState)(this.purs_State);
    }
  }, {
    key: 'pass',
    value: function pass() {
      this.purs_State = (0, _GameLogic.interface_pass)(this.purs_State);
      this.json_State = (0, _GameLogic.interface_convertState)(this.purs_State);
    }
  }, {
    key: 'testLegal',
    value: function testLegal(x, y) {
      return (0, _GameLogic.interface_testLegal)(this.purs_State)(x)(y);
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      return this.json_State.size;
    }
  }, {
    key: 'getMoveNumber',
    value: function getMoveNumber() {
      return this.json_State.moveNum;
    }
  }, {
    key: 'getKoPosition',
    value: function getKoPosition() {
      if (this.json_State.ko) {
        return this.json_State.koPos;
      } else {
        return null;
      }
    }
  }, {
    key: 'getBlackPrisoners',
    value: function getBlackPrisoners() {
      return this.json_State.bPrison;
    }
  }, {
    key: 'getWhitePrisoners',
    value: function getWhitePrisoners() {
      return this.json_State.wPrison;
    }
  }, {
    key: 'getMovingColor',
    value: function getMovingColor() {
      return this.json_State.curCol;
    }
  }, {
    key: 'getFieldArray',
    value: function getFieldArray() {
      return this.json_State.board;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return JSON.stringify(this.json_State);
    }
  }]);

  return State;
}();

exports.State = State;