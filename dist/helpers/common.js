"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.truncate = truncate;

function truncate(str) {
  return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;
}