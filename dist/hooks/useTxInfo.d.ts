import { TxInfo } from '@terra-money/terra.js';
declare type Params = {
    txHash: string | null;
    onSuccess?: (txHash: string, txInfo?: TxInfo) => void;
    onError?: (txHash?: string, txInfo?: TxInfo) => void;
};
export declare const useTxInfo: ({ txHash, onSuccess, onError }: Params) => {
    isLoading: boolean;
    txInfo: TxInfo | undefined;
};
export default useTxInfo;
