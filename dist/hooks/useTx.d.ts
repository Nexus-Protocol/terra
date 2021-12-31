import { TxInfo } from '@terra-money/terra.js';
declare type Params = {
    onPosting?: () => void;
    onBroadcasting?: (txHash: string) => void;
    onSuccess?: (txHash: string, txInfo?: TxInfo) => void;
    onError?: (txHash?: string, txInfo?: TxInfo) => void;
};
export declare const useTx: ({ onPosting, onBroadcasting, onSuccess, onError, }: Params) => {
    submit: ({ msgs, fee }: any) => Promise<void>;
    txHash: string | undefined;
};
export default useTx;
