import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import _asyncToGenerator from '@babel/runtime/helpers/esm/asyncToGenerator';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import React, { createContext, useMemo, useContext, useState, useEffect, useCallback } from 'react';
import { LCDClient, Coins, Coin } from '@terra-money/terra.js';
import { useWallet, useConnectedWallet, UserDenied, CreateTxFailed, TxFailed, Timeout, TxUnspecifiedError } from '@terra-money/wallet-provider';
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
  taxRate: undefined
});
var TerraWebappProvider = function TerraWebappProvider(_ref) {
  var children = _ref.children;

  var _useWallet = useWallet(),
      network = _useWallet.network;

  var client = useMemo(function () {
    return new LCDClient({
      URL: network.lcd,
      chainID: network.chainID
    });
  }, [network]);

  var _useQuery = useQuery('taxCap', function () {
    return client.treasury.taxCap('uusd');
  }),
      taxCap = _useQuery.data;

  var _useQuery2 = useQuery('taxRate', function () {
    return client.treasury.taxRate();
  }),
      taxRate = _useQuery2.data;

  var value = useMemo(function () {
    return {
      network: network,
      client: client,
      taxCap: taxCap,
      taxRate: taxRate
    };
  }, [network, client, taxCap, taxRate]);
  return /*#__PURE__*/React.createElement(TerraWebappContext.Provider, {
    value: value
  }, children);
};
function useTerraWebapp() {
  return useContext(TerraWebappContext);
}
var TerraWebappConsumer = TerraWebappContext.Consumer;

/**
 * Wallet address of connected wallet
 * @returns string;
 */

var useAddress = function useAddress() {
  var _connectedWallet$terr;

  var connectedWallet = useConnectedWallet();
  return (_connectedWallet$terr = connectedWallet == null ? void 0 : connectedWallet.terraAddress) != null ? _connectedWallet$terr : '';
};

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
      onSuccess = _ref.onSuccess,
      _onError = _ref.onError;

  var _useTerraWebapp = useTerraWebapp(),
      client = _useTerraWebapp.client;

  var _useWallet = useWallet(),
      post = _useWallet.post;

  var address = useAddress();
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

  var _useQuery = useQuery(['fee', debouncedMsgs, error], function () {
    if (debouncedMsgs == null || txStep != TxStep.Idle || error != null) {
      throw new Error('Error in estimaging fee');
    }

    setError(null);
    setTxStep(TxStep.Estimating);
    return client.tx.estimateFee(address, debouncedMsgs, {
      gasPrices: new Coins([new Coin('uusd', 0.15)]),
      gasAdjustment: 1.35,
      feeDenoms: ['uusd']
    });
  }, {
    enabled: debouncedMsgs != null && txStep == TxStep.Idle && error == null,
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: function onSuccess() {
      setTxStep(TxStep.Ready);
    },
    onError: function onError(e) {
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

  var submit = useCallback( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(fee == null || msgs == null || msgs.length < 1)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            mutate({
              msgs: msgs,
              fee: fee
            });

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })), [msgs, fee, mutate]);
  useEffect(function () {
    if (txInfo != null && txHash != null) {
      if (txInfo.code) {
        setTxStep(TxStep.Failed);
        _onError == null ? void 0 : _onError(txHash);
      } else {
        setTxStep(TxStep.Success);
        onSuccess == null ? void 0 : onSuccess(txHash);
      }
    }
  }, [txInfo, _onError, onSuccess, txHash]);
  useEffect(function () {
    if (error) {
      setError(null);
    }

    if (txStep != TxStep.Idle && txStep != TxStep.Success && txStep != TxStep.Failed && txHash == null) {
      setTxStep(TxStep.Idle);
    } // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [debouncedMsgs]);
  return {
    fee: fee,
    submit: submit,
    txStep: txStep,
    txInfo: txInfo,
    txHash: txHash,
    error: error,
    reset: reset
  };
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
  var _data$get$amount$toSt, _data$get;

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

  return (_data$get$amount$toSt = (_data$get = data.get(token)) == null ? void 0 : _data$get.amount.toString()) != null ? _data$get$amount$toSt : null;
};

export { TerraWebappConsumer, TerraWebappContext, TerraWebappProvider, TxStep, fromTerraAmount, num, toBase64, toDecimal, toNumber, toTerraAmount, useAddress, useBalance, useTerraWebapp, useTransaction };
