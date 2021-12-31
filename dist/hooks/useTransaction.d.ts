import { MsgExecuteContract, Fee, TxInfo } from '@terra-money/terra.js';
export declare enum TxStep {
    /**
     * Idle
     */
    Idle = 0,
    /**
     * Estimating fees
     */
    Estimating = 1,
    /**
     * Ready to post transaction
     */
    Ready = 2,
    /**
     * Signing transaction in Terra Station
     */
    Posting = 3,
    /**
     * Broadcasting
     */
    Broadcasting = 4,
    /**
     * Succesful
     */
    Success = 5,
    /**
     * Failed
     */
    Failed = 6
}
declare type Params = {
    msgs: MsgExecuteContract[] | null;
    gasAdjustment?: number;
    estimateEnabled?: boolean;
    onBroadcasting?: (txHash: string) => void;
    onSuccess?: (txHash: string, txInfo?: TxInfo) => void;
    onError?: (txHash?: string, txInfo?: TxInfo) => void;
};
export declare const useTransaction: ({ msgs, gasAdjustment, estimateEnabled, onBroadcasting, onSuccess, onError, }: Params) => {
    fee: Fee | null | undefined;
    submit: () => Promise<void>;
    txStep: TxStep;
    txInfo: TxInfo | undefined;
    txHash: string | undefined;
    error: unknown;
    reset: () => void;
};
export default useTransaction;
