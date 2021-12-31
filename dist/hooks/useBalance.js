"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useBalance = exports.default = void 0;

var _reactQuery = require("react-query");

var _useAddress = require("../hooks/useAddress");

var _context = require("../context");

function isBalanceResponse(value) {
  return value.hasOwnProperty('balance');
}
/**
 *
 * @param token - contract address or native denom
 * @param contractAddress - override connected wallet address
 * @returns string;
 */


const useBalance = (token, contractAddress) => {
  var _data$0$get$amount$to, _data$0$get;

  const {
    client
  } = (0, _context.useTerraWebapp)();
  const terraAddress = (0, _useAddress.useAddress)();
  const address = contractAddress != null ? contractAddress : terraAddress; // TODO: Fix type to have Coins and Balance

  const {
    data,
    isLoading
  } = (0, _reactQuery.useQuery)(['balance', token, address], () => {
    // TODO: isNativeToken function
    if (token.startsWith('u')) {
      return client.bank.balance(address);
    }

    return client.wasm.contractQuery(token, {
      balance: {
        address
      }
    });
  });

  if (isLoading) {
    return '0';
  }

  if (data == null) {
    return null;
  }

  if (isBalanceResponse(data)) {
    return data.balance;
  }

  return (_data$0$get$amount$to = (_data$0$get = data[0].get(token)) == null ? void 0 : _data$0$get.amount.toString()) != null ? _data$0$get$amount$to : null;
};

exports.useBalance = useBalance;
var _default = useBalance;
exports.default = _default;