"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTx = exports.default = void 0;

var _react = require("react");

var _walletProvider = require("@terra-money/wallet-provider");

var _reactQuery = require("react-query");

var _context = require("../context");

const useTx = ({
  onPosting,
  onBroadcasting,
  onSuccess,
  onError
}) => {
  const {
    client
  } = (0, _context.useTerraWebapp)();
  const {
    post
  } = (0, _walletProvider.useWallet)();
  const [txHash, setTxHash] = (0, _react.useState)(undefined);
  const {
    mutate
  } = (0, _reactQuery.useMutation)(opts => {
    return post(opts);
  }, {
    onMutate: () => {
      setTxHash(undefined);
      onPosting == null ? void 0 : onPosting();
    },
    onError: e => {
      let error = `Unknown Error: ${e instanceof Error ? e.message : String(e)}`;

      if (e instanceof _walletProvider.UserDenied) {
        error = 'User Denied';
      } else if (e instanceof _walletProvider.CreateTxFailed) {
        error = `Create Tx Failed: ${e.message}`;
      } else if (e instanceof _walletProvider.TxFailed) {
        error = `Tx Failed: ${e.message}`;
      } else if (e instanceof _walletProvider.Timeout) {
        error = 'Timeout';
      } else if (e instanceof _walletProvider.TxUnspecifiedError) {
        error = `Unspecified Error: ${e.message}`;
      } else {
        error = `Unknown Error: ${e instanceof Error ? e.message : String(e)}`;
      }

      onError == null ? void 0 : onError(error);
    },
    onSuccess: res => {
      setTxHash(res.result.txhash);
      onBroadcasting == null ? void 0 : onBroadcasting(res.result.txhash);
    }
  });
  const {
    data: txInfo
  } = (0, _reactQuery.useQuery)(['txInfo', txHash], () => {
    if (txHash == null) {
      return;
    }

    return client.tx.txInfo(txHash);
  }, {
    enabled: txHash != null,
    retry: true
  });
  const submit = (0, _react.useCallback)(async ({
    msgs,
    fee
  }) => {
    if (fee == null || msgs == null || msgs.length < 1) {
      return;
    }

    mutate({
      msgs,
      fee
    });
  }, [mutate]);
  (0, _react.useEffect)(() => {
    if (txInfo != null && txHash != null) {
      if (txInfo.code) {
        onError == null ? void 0 : onError(txHash, txInfo);
      } else {
        onSuccess == null ? void 0 : onSuccess(txHash, txInfo);
      }
    }
  }, [txInfo, onError, onSuccess, txHash]);
  return (0, _react.useMemo)(() => {
    return {
      submit,
      txHash
    };
  }, [submit, txHash]);
};

exports.useTx = useTx;
var _default = useTx;
exports.default = _default;