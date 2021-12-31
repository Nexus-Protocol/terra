import { MsgExecuteContract, StdFee } from '@terra-money/terra.js';
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
    onSuccess?: (txHash: string) => void;
    onError?: (txHash?: string) => void;
};
export declare const useTransaction: ({ msgs, onSuccess, onError }: Params) => {
    fee: StdFee | null | undefined;
    submit: () => Promise<void>;
    txStep: TxStep;
    txInfo: import("@terra-money/terra.js").TxInfo | undefined;
    txHash: string | undefined;
    error: unknown;
    reset: () => void;
};
export default useTransaction;
