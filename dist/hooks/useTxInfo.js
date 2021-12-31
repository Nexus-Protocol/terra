"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTxInfo = exports.default = void 0;

var _react = require("react");

var _reactQuery = require("react-query");

var _context = require("../context");

const useTxInfo = ({
  txHash,
  onSuccess,
  onError
}) => {
  const {
    client
  } = (0, _context.useTerraWebapp)();
  const {
    data,
    isLoading
  } = (0, _reactQuery.useQuery)(['txInfo', txHash], () => {
    if (txHash == null) {
      return;
    }

    return client.tx.txInfo(txHash);
  }, {
    enabled: txHash != null,
    retry: true
  });
  (0, _react.useEffect)(() => {
    if (data != null && txHash != null) {
      if (data.code) {
        onError == null ? void 0 : onError(txHash, data);
      } else {
        onSuccess == null ? void 0 : onSuccess(txHash, data);
      }
    }
  }, [data, onError, onSuccess, txHash]);
  return {
    isLoading,
    txInfo: data
  };
};

exports.useTxInfo = useTxInfo;
var _default = useTxInfo;
exports.default = _default;