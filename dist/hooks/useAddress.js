"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAddress = exports.default = void 0;

var _walletProvider = require("@terra-money/wallet-provider");

/**
 * Wallet address of connected wallet
 * @returns string;
 */
const useAddress = () => {
  var _wallet$terraAddress;

  const wallet = (0, _walletProvider.useConnectedWallet)();
  return (_wallet$terraAddress = wallet == null ? void 0 : wallet.terraAddress) != null ? _wallet$terraAddress : '';
};

exports.useAddress = useAddress;
var _default = useAddress;
exports.default = _default;