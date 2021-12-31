"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TerraWebappProvider = exports.TerraWebappContext = exports.TerraWebappConsumer = void 0;
exports.useTerraWebapp = useTerraWebapp;

var _react = _interopRequireWildcard(require("react"));

var _terra = require("@terra-money/terra.js");

var _walletProvider = require("@terra-money/wallet-provider");

var _reactQuery = require("react-query");

var _useAddress = require("./hooks/useAddress");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const DEFAULT_NETWORK = {
  name: 'mainnet',
  chainID: 'colombus-5',
  lcd: 'https://lcd.terra.dev'
};
const TerraWebappContext = /*#__PURE__*/(0, _react.createContext)({
  network: DEFAULT_NETWORK,
  client: new _terra.LCDClient({
    URL: DEFAULT_NETWORK.lcd,
    chainID: DEFAULT_NETWORK.chainID
  }),
  taxCap: undefined,
  taxRate: undefined,
  accountInfo: undefined
});
exports.TerraWebappContext = TerraWebappContext;

const TerraWebappProvider = ({
  children,
  config
}) => {
  const {
    network
  } = (0, _walletProvider.useWallet)();
  const address = (0, _useAddress.useAddress)();
  const client = (0, _react.useMemo)(() => {
    if (config != null && config.lcdClientUrl) {
      return new _terra.LCDClient({
        URL: config == null ? void 0 : config.lcdClientUrl,
        chainID: network.chainID
      });
    }

    return new _terra.LCDClient({
      URL: network.lcd,
      chainID: network.chainID
    });
  }, [network]);
  const {
    data: taxCap
  } = (0, _reactQuery.useQuery)(['taxCap', network.chainID], () => {
    return client.treasury.taxCap('uusd');
  }, {
    refetchOnWindowFocus: false
  });
  const {
    data: taxRate
  } = (0, _reactQuery.useQuery)(['taxRate', network.chainID], () => {
    return client.treasury.taxRate();
  }, {
    refetchOnWindowFocus: false
  });
  const {
    data: accountInfo
  } = (0, _reactQuery.useQuery)(['accountInfo', network.chainID], () => {
    return client.auth.accountInfo(address);
  }, {
    refetchOnWindowFocus: false
  });
  const value = (0, _react.useMemo)(() => {
    return {
      network,
      client,
      taxCap,
      taxRate,
      accountInfo
    };
  }, [network, client, taxCap, taxRate, accountInfo]);
  return /*#__PURE__*/_react.default.createElement(TerraWebappContext.Provider, {
    value: value
  }, children);
};

exports.TerraWebappProvider = TerraWebappProvider;

function useTerraWebapp() {
  return (0, _react.useContext)(TerraWebappContext);
}

const TerraWebappConsumer = TerraWebappContext.Consumer;
exports.TerraWebappConsumer = TerraWebappConsumer;