import BigNumber from 'bignumber.js';
/**
 * Format Terra amount
 * @param value - string: amount from Terra blockchain
 * @param format - string: numeral format
 * @returns string
 */
export declare const fromTerraAmount: (value?: string, format?: string) => string;
export declare const toTerraAmount: (value?: string) => string;
export declare const toDecimal: (value?: string, dp?: number) => string;
export declare const toNumber: (value?: string) => number;
export declare const num: (value?: string) => BigNumber;
