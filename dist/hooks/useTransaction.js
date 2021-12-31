"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTransaction = exports.default = exports.TxStep = void 0;

var _react = require("react");

var _terra = require("@terra-money/terra.js");

var _walletProvider = require("@terra-money/wallet-provider");

var _reactQuery = require("react-query");

var _context = require("../context");

var _useAddress = require("./useAddress");

var _useDebounceValue = _interopRequireDefault(require("./useDebounceValue"));

let TxStep;
exports.TxStep = TxStep;

(function (TxStep) {
  TxStep[TxStep["Idle"] = 0] = "Idle";
  TxStep[TxStep["Estimating"] = 1] = "Estimating";
  TxStep[TxStep["Ready"] = 2] = "Ready";
  TxStep[TxStep["Posting"] = 3] = "Posting";
  TxStep[TxStep["Broadcasting"] = 4] = "Broadcasting";
  TxStep[TxStep["Success"] = 5] = "Success";
  TxStep[TxStep["Failed"] = 6] = "Failed";
})(TxStep || (exports.TxStep = TxStep = {}));

const useTransaction = ({
  msgs,
  onSuccess,
  onError
}) => {
  const {
    client
  } = (0, _context.useTerraWebapp)();
  const {
    post
  } = (0, _walletProvider.useWallet)();
  const address = (0, _useAddress.useAddress)();
  const debouncedMsgs = (0, _useDebounceValue.default)(msgs, 200);
  const [txStep, setTxStep] = (0, _react.useState)(TxStep.Idle);
  const [txHash, setTxHash] = (0, _react.useState)(undefined);
  const [error, setError] = (0, _react.useState)(null);
  const {
    data: fee
  } = (0, _reactQuery.useQuery)(['fee', debouncedMsgs, error], () => {
    if (debouncedMsgs == null || txStep != TxStep.Idle || error != null) {
      throw new Error('Error in estimaging fee');
    }

    setError(null);
    setTxStep(TxStep.Estimating);
    return client.tx.estimateFee(address, debouncedMsgs, {
      gasPrices: new _terra.Coins([new _terra.Coin('uusd', 0.15)]),
      gasAdjustment: 1.35,
      feeDenoms: ['uusd']
    });
  }, {
    enabled: debouncedMsgs != null && txStep == TxStep.Idle && error == null,
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: () => {
      setTxStep(TxStep.Ready);
    },
    onError: e => {
      var _e$response, _e$response$data;

      // @ts-expect-error - don't know anything about error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e != null && (_e$response = e.response) != null && (_e$response$data = _e$response.data) != null && _e$response$data.error) {
        // @ts-expect-error - don't know anything about error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        setError(e.response.data.error);
      } else {
        setError('Something went wrong');
      }

      setTxStep(TxStep.Idle);
    }
  });
  const {
    mutate
  } = (0, _reactQuery.useMutation)(data => {
    return post(data);
  }, {
    onMutate: () => {
      setTxStep(TxStep.Posting);
    },
    onError: e => {
      if (e instanceof _walletProvider.UserDenied) {
        setError('User Denied');
      } else if (e instanceof _walletProvider.CreateTxFailed) {
        setError(`Create Tx Failed: ${e.message}`);
      } else if (e instanceof _walletProvider.TxFailed) {
        setError(`Tx Failed: ${e.message}`);
      } else if (e instanceof _walletProvider.Timeout) {
        setError('Timeout');
      } else if (e instanceof _walletProvider.TxUnspecifiedError) {
        setError(`Unspecified Error: ${e.message}`);
      } else {
        setError(`Unknown Error: ${e instanceof Error ? e.message : String(e)}`);
      }

      setTxStep(TxStep.Failed);
      onError == null ? void 0 : onError();
    },
    onSuccess: data => {
      setTxStep(TxStep.Broadcasting);
      setTxHash(data.result.txhash);
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

  const reset = () => {
    setError(null);
    setTxHash(undefined);
    setTxStep(TxStep.Idle);
  };

  const submit = (0, _react.useCallback)(async () => {
    if (fee == null || msgs == null || msgs.length < 1) {
      return;
    }

    mutate({
      msgs,
      fee
    });
  }, [msgs, fee, mutate]);
  (0, _react.useEffect)(() => {
    if (txInfo != null && txHash != null) {
      if (txInfo.code) {
        setTxStep(TxStep.Failed);
        onError == null ? void 0 : onError(txHash);
      } else {
        setTxStep(TxStep.Success);
        onSuccess == null ? void 0 : onSuccess(txHash);
      }
    }
  }, [txInfo, onError, onSuccess, txHash]);
  (0, _react.useEffect)(() => {
    if (error) {
      setError(null);
    }

    if (txStep != TxStep.Idle && txStep != TxStep.Success && txStep != TxStep.Failed && txHash == null) {
      setTxStep(TxStep.Idle);
    } // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [debouncedMsgs]);
  return {
    fee,
    submit,
    txStep,
    txInfo,
    txHash,
    error,
    reset
  };
};

exports.useTransaction = useTransaction;
var _default = useTransaction;
exports.default = _default;