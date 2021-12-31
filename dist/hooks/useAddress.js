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
  var _connectedWallet$terr;

  const connectedWallet = (0, _walletProvider.useConnectedWallet)();
  return (_connectedWallet$terr = connectedWallet == null ? void 0 : connectedWallet.terraAddress) != null ? _connectedWallet$terr : '';
};

exports.useAddress = useAddress;
var _default = useAddress;
exports.default = _default;