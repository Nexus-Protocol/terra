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
  taxRate: undefined
});
exports.TerraWebappContext = TerraWebappContext;

const TerraWebappProvider = ({
  children
}) => {
  const {
    network
  } = (0, _walletProvider.useWallet)();
  const client = (0, _react.useMemo)(() => {
    return new _terra.LCDClient({
      URL: network.lcd,
      chainID: network.chainID
    });
  }, [network]);
  const {
    data: taxCap
  } = (0, _reactQuery.useQuery)('taxCap', () => {
    return client.treasury.taxCap('uusd');
  });
  const {
    data: taxRate
  } = (0, _reactQuery.useQuery)('taxRate', () => {
    return client.treasury.taxRate();
  });
  const value = (0, _react.useMemo)(() => {
    return {
      network,
      client,
      taxCap,
      taxRate
    };
  }, [network, client, taxCap, taxRate]);
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