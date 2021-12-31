/**
 *
 * @param token - contract address or native denom
 * @param contractAddress - override connected wallet address
 * @returns string;
 */
export declare const useBalance: (token: string, contractAddress?: string | undefined) => string | null;
export default useBalance;
