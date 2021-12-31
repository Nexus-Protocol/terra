import BigNumber from 'bignumber.js';
/**
 * Format Terra amount
 * @param value - string: amount from Terra blockchain
 * @param format - string: numeral format
 * @returns string
 */
export declare const fromTerraAmount: (value?: BigNumber.Value, format?: string) => string;
export declare const toTerraAmount: (value?: BigNumber.Value) => string;
export declare const toDecimal: (value?: BigNumber.Value, dp?: number) => string;
export declare const toNumber: (value?: BigNumber.Value) => number;
export declare const num: (value?: BigNumber.Value) => BigNumber;
