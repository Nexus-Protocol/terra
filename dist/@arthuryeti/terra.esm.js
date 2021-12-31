import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import _asyncToGenerator from '@babel/runtime/helpers/esm/asyncToGenerator';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import React, { createContext, useMemo, useContext, useState, useEffect, useCallback } from 'react';
import { LCDClient, Coins, Coin } from '@terra-money/terra.js';
import { useConnectedWallet, useWallet, UserDenied, CreateTxFailed, TxFailed, Timeout, TxUnspecifiedError } from '@terra-money/wallet-provider';
import { useQuery, useMutation } from 'react-query';

var toBase64 = function toBase64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
};

var ONE_TOKEN = 1000000;

BigNumber.config({
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-10, 20]
});
/**
 * Format Terra amount
 * @param value - string: amount from Terra blockchain
 * @param format - string: numeral format
 * @returns string
 */

var fromTerraAmount = function fromTerraAmount(value, format) {
  if (value === void 0) {
    value = '0';
  }

  if (format === void 0) {
    format = '0,0.00a';
  }

  var amount = new BigNumber(value).div(ONE_TOKEN);
  return numeral(amount).format(format).toUpperCase();
};
var toTerraAmount = function toTerraAmount(value) {
  if (value === void 0) {
    value = '0';
  }

  return new BigNumber(value).dp(6).times(ONE_TOKEN).toString();
};
var toDecimal = function toDecimal(value, dp) {
  if (value === void 0) {
    value = '0';
  }

  if (dp === void 0) {
    dp = 6;
  }

  return new BigNumber(value).toFixed(dp).toString();
};
var toNumber = function toNumber(value) {
  if (value === void 0) {
    value = '0';
  }

  return new BigNumber(value).toNumber();
};
var num = function num(value) {
  if (value === void 0) {
    value = '0';
  }

  return new BigNumber(value);
};

/**
 * Wallet address of connected wallet
 * @returns string;
 */

var useAddress = function useAddress() {
  var _wallet$terraAddress;

  var wallet = useConnectedWallet();
  return (_wallet$terraAddress = wallet == null ? void 0 : wallet.terraAddress) != null ? _wallet$terraAddress : '';
};

var DEFAULT_NETWORK = {
  name: 'mainnet',
  chainID: 'colombus-5',
  lcd: 'https://lcd.terra.dev'
};
var TerraWebappContext = /*#__PURE__*/createContext({
  network: DEFAULT_NETWORK,
  client: new LCDClient({
    URL: DEFAULT_NETWORK.lcd,
    chainID: DEFAULT_NETWORK.chainID
  }),
  taxCap: undefined,
  taxRate: undefined,
  accountInfo: undefined
});
var TerraWebappProvider = function TerraWebappProvider(_ref) {
  var children = _ref.children,
      config = _ref.config;

  var _useWallet = useWallet(),
      network = _useWallet.network;

  var address = useAddress();
  var client = useMemo(function () {
    if (config != null && config.lcdClientUrl) {
      return new LCDClient({
        URL: config == null ? void 0 : config.lcdClientUrl,
        chainID: network.chainID
      });
    }

    return new LCDClient({
      URL: network.lcd,
      chainID: network.chainID
    });
  }, [network]);

  var _useQuery = useQuery(['taxCap', network.chainID], function () {
    return client.treasury.taxCap('uusd');
  }, {
    refetchOnWindowFocus: false
  }),
      taxCap = _useQuery.data;

  var _useQuery2 = useQuery(['taxRate', network.chainID], function () {
    return client.treasury.taxRate();
  }, {
    refetchOnWindowFocus: false
  }),
      taxRate = _useQuery2.data;

  var _useQuery3 = useQuery(['accountInfo', network.chainID], function () {
    return client.auth.accountInfo(address);
  }, {
    refetchOnWindowFocus: false
  }),
      accountInfo = _useQuery3.data;

  var value = useMemo(function () {
    return {
      network: network,
      client: client,
      taxCap: taxCap,
      taxRate: taxRate,
      accountInfo: accountInfo
    };
  }, [network, client, taxCap, taxRate, accountInfo]);
  return /*#__PURE__*/React.createElement(TerraWebappContext.Provider, {
    value: value
  }, children);
};
function useTerraWebapp() {
  return useContext(TerraWebappContext);
}
var TerraWebappConsumer = TerraWebappContext.Consumer;

var useDebounceValue = function useDebounceValue(value, delay) {
  // State and setters for debounced value
  var _useState = useState(value),
      debouncedValue = _useState[0],
      setDebouncedValue = _useState[1];

  useEffect(function () {
    // Update debounced value after delay
    var handler = setTimeout(function () {
      setDebouncedValue(value);
    }, delay); // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.

    return function () {
      clearTimeout(handler);
    };
  }, [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
};

var TxStep;

(function (TxStep) {
  TxStep[TxStep["Idle"] = 0] = "Idle";
  TxStep[TxStep["Estimating"] = 1] = "Estimating";
  TxStep[TxStep["Ready"] = 2] = "Ready";
  TxStep[TxStep["Posting"] = 3] = "Posting";
  TxStep[TxStep["Broadcasting"] = 4] = "Broadcasting";
  TxStep[TxStep["Success"] = 5] = "Success";
  TxStep[TxStep["Failed"] = 6] = "Failed";
})(TxStep || (TxStep = {}));

var useTransaction = function useTransaction(_ref) {
  var msgs = _ref.msgs,
      _ref$gasAdjustment = _ref.gasAdjustment,
      gasAdjustment = _ref$gasAdjustment === void 0 ? 1.2 : _ref$gasAdjustment,
      _ref$estimateEnabled = _ref.estimateEnabled,
      estimateEnabled = _ref$estimateEnabled === void 0 ? true : _ref$estimateEnabled,
      onBroadcasting = _ref.onBroadcasting,
      onSuccess = _ref.onSuccess,
      _onError = _ref.onError;

  var _useTerraWebapp = useTerraWebapp(),
      client = _useTerraWebapp.client;

  var address = useAddress();

  var _useWallet = useWallet(),
      post = _useWallet.post;

  var debouncedMsgs = useDebounceValue(msgs, 200);

  var _useState = useState(TxStep.Idle),
      txStep = _useState[0],
      setTxStep = _useState[1];

  var _useState2 = useState(undefined),
      txHash = _useState2[0],
      setTxHash = _useState2[1];

  var _useState3 = useState(null),
      error = _useState3[0],
      setError = _useState3[1];

  var _useQuery = useQuery(['fee', debouncedMsgs, error], /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
    var txOptions, accountInfo;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(debouncedMsgs == null || txStep != TxStep.Idle || error != null)) {
              _context.next = 2;
              break;
            }

            throw new Error('Error in estimaging fee');

          case 2:
            setError(null);
            setTxStep(TxStep.Estimating);
            txOptions = {
              msgs: debouncedMsgs,
              gasPrices: new Coins([new Coin('uusd', 0.15)]),
              gasAdjustment: gasAdjustment,
              feeDenoms: ['uusd']
            };
            _context.next = 7;
            return client.auth.accountInfo(address);

          case 7:
            accountInfo = _context.sent;
            return _context.abrupt("return", client.tx.estimateFee([{
              sequenceNumber: accountInfo.getSequenceNumber(),
              publicKey: accountInfo.getPublicKey()
            }], txOptions));

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })), {
    enabled: debouncedMsgs != null && txStep == TxStep.Idle && error == null && estimateEnabled,
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: function onSuccess() {
      setTxStep(TxStep.Ready);
    },
    onError: function onError(e) {
      var _e$response, _e$response$data;

      // @ts-expect-error - don't know anything about error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e != null && (_e$response = e.response) != null && (_e$response$data = _e$response.data) != null && _e$response$data.message) {
        // @ts-expect-error - don't know anything about error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        setError(e.response.data.message);
      } else {
        setError('Something went wrong');
      }

      setTxStep(TxStep.Idle);
    }
  }),
      fee = _useQuery.data;

  var _useMutation = useMutation(function (data) {
    return post(data);
  }, {
    onMutate: function onMutate() {
      setTxStep(TxStep.Posting);
    },
    onError: function onError(e) {
      if (e instanceof UserDenied) {
        setError('User Denied');
      } else if (e instanceof CreateTxFailed) {
        setError("Create Tx Failed: " + e.message);
      } else if (e instanceof TxFailed) {
        setError("Tx Failed: " + e.message);
      } else if (e instanceof Timeout) {
        setError('Timeout');
      } else if (e instanceof TxUnspecifiedError) {
        setError("Unspecified Error: " + e.message);
      } else {
        setError("Unknown Error: " + (e instanceof Error ? e.message : String(e)));
      }

      setTxStep(TxStep.Failed);
      _onError == null ? void 0 : _onError();
    },
    onSuccess: function onSuccess(data) {
      setTxStep(TxStep.Broadcasting);
      setTxHash(data.result.txhash);
      onBroadcasting == null ? void 0 : onBroadcasting(data.result.txhash);
    }
  }),
      mutate = _useMutation.mutate;

  var _useQuery2 = useQuery(['txInfo', txHash], function () {
    if (txHash == null) {
      return;
    }

    return client.tx.txInfo(txHash);
  }, {
    enabled: txHash != null,
    retry: true
  }),
      txInfo = _useQuery2.data;

  var reset = function reset() {
    setError(null);
    setTxHash(undefined);
    setTxStep(TxStep.Idle);
  };

  var submit = useCallback( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(fee == null || msgs == null || msgs.length < 1)) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return");

          case 2:
            mutate({
              msgs: msgs,
              fee: fee
            });

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })), [msgs, fee, mutate]);
  useEffect(function () {
    if (txInfo != null && txHash != null) {
      if (txInfo.code) {
        setTxStep(TxStep.Failed);
        _onError == null ? void 0 : _onError(txHash, txInfo);
      } else {
        setTxStep(TxStep.Success);
        onSuccess == null ? void 0 : onSuccess(txHash, txInfo);
      }
    }
  }, [txInfo, _onError, onSuccess, txHash]);
  useEffect(function () {
    if (error) {
      setError(null);
    }

    if (txStep != TxStep.Idle) {
      setTxStep(TxStep.Idle);
    } // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [debouncedMsgs]);
  return useMemo(function () {
    return {
      fee: fee,
      submit: submit,
      txStep: txStep,
      txInfo: txInfo,
      txHash: txHash,
      error: error,
      reset: reset
    };
  }, [fee, submit, txStep, txInfo, txHash, error, reset]);
};

var useTx = function useTx(_ref) {
  var onPosting = _ref.onPosting,
      onBroadcasting = _ref.onBroadcasting,
      onSuccess = _ref.onSuccess,
      _onError = _ref.onError;

  var _useTerraWebapp = useTerraWebapp(),
      client = _useTerraWebapp.client;

  var _useWallet = useWallet(),
      post = _useWallet.post;

  var _useState = useState(undefined),
      txHash = _useState[0],
      setTxHash = _useState[1];

  var _useMutation = useMutation(function (opts) {
    return post(opts);
  }, {
    onMutate: function onMutate() {
      setTxHash(undefined);
      onPosting == null ? void 0 : onPosting();
    },
    onError: function onError(e) {
      var error = "Unknown Error: " + (e instanceof Error ? e.message : String(e));

      if (e instanceof UserDenied) {
        error = 'User Denied';
      } else if (e instanceof CreateTxFailed) {
        error = "Create Tx Failed: " + e.message;
      } else if (e instanceof TxFailed) {
        error = "Tx Failed: " + e.message;
      } else if (e instanceof Timeout) {
        error = 'Timeout';
      } else if (e instanceof TxUnspecifiedError) {
        error = "Unspecified Error: " + e.message;
      } else {
        error = "Unknown Error: " + (e instanceof Error ? e.message : String(e));
      }

      _onError == null ? void 0 : _onError(error);
    },
    onSuccess: function onSuccess(res) {
      setTxHash(res.result.txhash);
      onBroadcasting == null ? void 0 : onBroadcasting(res.result.txhash);
    }
  }),
      mutate = _useMutation.mutate;

  var _useQuery = useQuery(['txInfo', txHash], function () {
    if (txHash == null) {
      return;
    }

    return client.tx.txInfo(txHash);
  }, {
    enabled: txHash != null,
    retry: true
  }),
      txInfo = _useQuery.data;

  var submit = useCallback( /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref2) {
      var msgs, fee;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              msgs = _ref2.msgs, fee = _ref2.fee;

              if (!(fee == null || msgs == null || msgs.length < 1)) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return");

            case 3:
              mutate({
                msgs: msgs,
                fee: fee
              });

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }(), [mutate]);
  useEffect(function () {
    if (txInfo != null && txHash != null) {
      if (txInfo.code) {
        _onError == null ? void 0 : _onError(txHash, txInfo);
      } else {
        onSuccess == null ? void 0 : onSuccess(txHash, txInfo);
      }
    }
  }, [txInfo, _onError, onSuccess, txHash]);
  return useMemo(function () {
    return {
      submit: submit,
      txHash: txHash
    };
  }, [submit, txHash]);
};

var useEstimateFee = function useEstimateFee(_ref) {
  var msgs = _ref.msgs,
      _ref$enabled = _ref.enabled,
      enabled = _ref$enabled === void 0 ? true : _ref$enabled,
      _ref$gasAdjustment = _ref.gasAdjustment,
      gasAdjustment = _ref$gasAdjustment === void 0 ? 1.2 : _ref$gasAdjustment;

  var _useTerraWebapp = useTerraWebapp(),
      client = _useTerraWebapp.client;

  var address = useAddress();

  var _useQuery = useQuery(['fee', msgs], /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
    var txOptions, accountInfo;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(msgs == null || error != null)) {
              _context.next = 2;
              break;
            }

            throw new Error('Msgs is null or Error is not null');

          case 2:
            txOptions = {
              msgs: msgs,
              gasPrices: new Coins([new Coin('uusd', 0.15)]),
              gasAdjustment: gasAdjustment,
              feeDenoms: ['uusd']
            };
            _context.next = 5;
            return client.auth.accountInfo(address);

          case 5:
            accountInfo = _context.sent;
            return _context.abrupt("return", client.tx.estimateFee([{
              sequenceNumber: accountInfo.getSequenceNumber(),
              publicKey: accountInfo.getPublicKey()
            }], txOptions));

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })), {
    enabled: msgs != null && msgs.length > 0 && enabled,
    refetchOnWindowFocus: false,
    retry: false
  }),
      data = _useQuery.data,
      isLoading = _useQuery.isLoading,
      error = _useQuery.error;

  return useMemo(function () {
    return {
      fee: data,
      isLoading: isLoading,
      error: error
    };
  }, [data, isLoading, error]);
};

function isBalanceResponse(value) {
  return value.hasOwnProperty('balance');
}
/**
 *
 * @param token - contract address or native denom
 * @param contractAddress - override connected wallet address
 * @returns string;
 */


var useBalance = function useBalance(token, contractAddress) {
  var _data$0$get$amount$to, _data$0$get;

  var _useTerraWebapp = useTerraWebapp(),
      client = _useTerraWebapp.client;

  var terraAddress = useAddress();
  var address = contractAddress != null ? contractAddress : terraAddress; // TODO: Fix type to have Coins and Balance

  var _useQuery = useQuery(['balance', token, address], function () {
    // TODO: isNativeToken function
    if (token.startsWith('u')) {
      return client.bank.balance(address);
    }

    return client.wasm.contractQuery(token, {
      balance: {
        address: address
      }
    });
  }),
      data = _useQuery.data,
      isLoading = _useQuery.isLoading;

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

var useTxInfo = function useTxInfo(_ref) {
  var txHash = _ref.txHash,
      onSuccess = _ref.onSuccess,
      onError = _ref.onError;

  var _useTerraWebapp = useTerraWebapp(),
      client = _useTerraWebapp.client;

  var _useQuery = useQuery(['txInfo', txHash], function () {
    if (txHash == null) {
      return;
    }

    return client.tx.txInfo(txHash);
  }, {
    enabled: txHash != null,
    retry: true
  }),
      data = _useQuery.data,
      isLoading = _useQuery.isLoading;

  useEffect(function () {
    if (data != null && txHash != null) {
      if (data.code) {
        onError == null ? void 0 : onError(txHash, data);
      } else {
        onSuccess == null ? void 0 : onSuccess(txHash, data);
      }
    }
  }, [data, onError, onSuccess, txHash]);
  return {
    isLoading: isLoading,
    txInfo: data
  };
};

export { TerraWebappConsumer, TerraWebappContext, TerraWebappProvider, TxStep, fromTerraAmount, num, toBase64, toDecimal, toNumber, toTerraAmount, useAddress, useBalance, useEstimateFee, useTerraWebapp, useTransaction, useTx, useTxInfo };
