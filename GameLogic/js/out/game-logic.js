'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Nothing = exports.Black = exports.White = exports.State = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _autoBind = require('auto-bind');

var _autoBind2 = _interopRequireDefault(_autoBind);

var _GameLogic = require('../lib/GameLogic');

var _GameLogic2 = _interopRequireDefault(_GameLogic);

var _Data = require('../lib/Data.Tuple');

var _Data2 = _interopRequireDefault(_Data);

var _Data3 = require('../lib/Data.Maybe');

var _Data4 = _interopRequireDefault(_Data3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Black = _GameLogic2.default.Black,
    White = _GameLogic2.default.White,
    Pass = _GameLogic2.default.Pass;
var Tuple = _Data2.default.Tuple;
var Nothing = _Data4.default.Nothing,
    Just = _Data4.default.Just;

var State = function () {

  // _state =  {
  //   size: null,
  //   moveNum: 0,
  //   koPos: null,
  //   bPrison: 0,
  //   wPrison: 0,
  //   board: []
  // };

  function State(x, y) {
    _classCallCheck(this, State);

    if (!(typeof x === 'number' && typeof y === 'number')) {
      throw new Error('State\'s constructor requires two numbers as arguments');
    }

    var size = new Tuple(x, y);
    this._setState(_GameLogic2.default.init(size));

    (0, _autoBind2.default)(this);
  }

  _createClass(State, [{
    key: '_setState',
    value: function _setState(state) {
      this._state = state;
      imbueSize(this._state.size);
      imbuePosition(this._state.koPos);
      imbueField(this._state.curCol);

      this._state.board = this._state.board.map(function (field) {
        return imbueField(field);
      });

      return this;
    }
  }, {
    key: 'makeMove',
    value: function makeMove(x, y) {
      var position = new Tuple(x, y);
      var play = new _GameLogic2.default.Play(position);
      return this._setState(_GameLogic2.default.makeMove(this._state)(play));
    }
  }, {
    key: 'pass',
    value: function pass() {
      return this._setState(_GameLogic2.default.makeMove(this._state)(new Pass()));
    }
  }, {
    key: 'testLegal',
    value: function testLegal(x, y) {
      var position = new Tuple(x, y);
      return _GameLogic2.default.testLegal(this._state)(position);
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      return this._state.size;
    }
  }, {
    key: 'getMoveNumber',
    value: function getMoveNumber() {
      return this._state.moveNum;
    }
  }, {
    key: 'getKoPosition',
    value: function getKoPosition() {
      return this._state.koPos;
    }
  }, {
    key: 'getPrisoners',
    value: function getPrisoners(color) {
      if (color.isBlack()) {
        return this._state.bPrison;
      } else if (color.isWhite()) {
        return this._state.wPrison;
      } else {
        return 0;
      }
    }
  }, {
    key: 'getBlackPrisoners',
    value: function getBlackPrisoners() {
      return this._state.bPrison;
    }
  }, {
    key: 'getWhitePrisoners',
    value: function getWhitePrisoners() {
      return this._state.wPrison;
    }
  }, {
    key: 'getMovingColor',
    value: function getMovingColor() {
      return this._state.curCol;
    }
  }, {
    key: 'getField',
    value: function getField(x, y) {
      var position = new Tuple(x, y);
      var canonicalPosition = _GameLogic2.default.canonPos(this.getSize())(position);
      return this.getFieldArray()[canonicalPosition];
    }
  }, {
    key: 'getFieldArray',
    value: function getFieldArray() {
      return this._state.board;
    }
  }, {
    key: 'toString',
    value: function toString() {
      var size = this.getSize();
      var move = this.getMoveNumber();
      var moving = this.getMovingColor();
      var ko = this.getKoPosition();
      var bPrison = this.getWhitePrisoners();
      var wPrison = this.getBlackPrisoners();
      var board = this.getFieldArray();
      return '{ size: ' + size + ', moves: ' + move + ', moving: ' + moving + ', ko-position: ' + ko + ', b-prisoners: ' + bPrison + ', w-prisoners: ' + wPrison + ', board: ' + board + ' }';
    }
  }]);

  return State;
}();

function imbueField(field) {
  if (field instanceof Just) {
    field = field.value0;
  }

  var color = field instanceof Black || field instanceof White;
  var black = field instanceof Black;

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
    return s.x + 'x' + s.y;
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
    return '(' + p.x + ', ' + p.y + ')';
  };

  return p;
}

exports.State = State;
exports.White = White;
exports.Black = Black;
exports.Nothing = Nothing;