"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useEstimateFee = exports.default = void 0;

var _react = require("react");

var _terra = require("@terra-money/terra.js");

var _reactQuery = require("react-query");

var _context = require("../context");

var _useAddress = _interopRequireDefault(require("./useAddress"));

const useEstimateFee = ({
  msgs,
  enabled = true,
  gasAdjustment = 1.2
}) => {
  const {
    client
  } = (0, _context.useTerraWebapp)();
  const address = (0, _useAddress.default)();
  const {
    data,
    isLoading,
    error
  } = (0, _reactQuery.useQuery)(['fee', msgs], async () => {
    if (msgs == null || error != null) {
      throw new Error('Msgs is null or Error is not null');
    }

    const txOptions = {
      msgs,
      gasPrices: new _terra.Coins([new _terra.Coin('uusd', 0.15)]),
      gasAdjustment,
      feeDenoms: ['uusd']
    };
    const accountInfo = await client.auth.accountInfo(address);
    return client.tx.estimateFee([{
      sequenceNumber: accountInfo.getSequenceNumber(),
      publicKey: accountInfo.getPublicKey()
    }], txOptions);
  }, {
    enabled: msgs != null && msgs.length > 0 && enabled,
    refetchOnWindowFocus: false,
    retry: false
  });
  return (0, _react.useMemo)(() => {
    return {
      fee: data,
      isLoading,
      error
    };
  }, [data, isLoading, error]);
};

exports.useEstimateFee = useEstimateFee;
var _default = useEstimateFee;
exports.default = _default;