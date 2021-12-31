import { MsgExecuteContract, Fee } from '@terra-money/terra.js';
declare type Params = {
    msgs: MsgExecuteContract[] | null;
    enabled?: boolean;
    gasAdjustment?: number;
};
export declare const useEstimateFee: ({ msgs, enabled, gasAdjustment, }: Params) => {
    fee: Fee | null | undefined;
    isLoading: boolean;
    error: unknown;
};
export default useEstimateFee;
