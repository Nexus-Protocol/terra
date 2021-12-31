"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toTerraAmount = exports.toNumber = exports.toDecimal = exports.num = exports.fromTerraAmount = void 0;

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _numeral = _interopRequireDefault(require("numeral"));

var _constants = require("./constants");

_bignumber.default.config({
  ROUNDING_MODE: _bignumber.default.ROUND_DOWN,
  EXPONENTIAL_AT: [-10, 20]
});
/**
 * Format Terra amount
 * @param value - string: amount from Terra blockchain
 * @param format - string: numeral format
 * @returns string
 */


const fromTerraAmount = (value = '0', format = '0,0.00a') => {
  const amount = new _bignumber.default(value).div(_constants.ONE_TOKEN);
  return (0, _numeral.default)(amount).format(format).toUpperCase();
};

exports.fromTerraAmount = fromTerraAmount;

const toTerraAmount = (value = '0') => {
  return new _bignumber.default(value).dp(6).times(_constants.ONE_TOKEN).toString();
};

exports.toTerraAmount = toTerraAmount;

const toDecimal = (value = '0', dp = 6) => {
  return new _bignumber.default(value).toFixed(dp).toString();
};

exports.toDecimal = toDecimal;

const toNumber = (value = '0') => {
  return new _bignumber.default(value).toNumber();
};

exports.toNumber = toNumber;

const num = (value = '0') => {
  return new _bignumber.default(value);
};

exports.num = num;