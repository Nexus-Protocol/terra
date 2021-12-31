"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toBase64 = void 0;

const toBase64 = obj => {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
};

exports.toBase64 = toBase64;