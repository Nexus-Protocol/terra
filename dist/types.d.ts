export declare type IncreaseAllowance = {
    increase_allowance: {
        spender: string;
        amount: string;
    };
};
export declare type Send = {
    send: {
        amount: string;
        contract: string;
        msg: string;
    };
};
export declare type Balance = {
    balance: {
        address: string;
    };
};
export declare type BalanceResponse = {
    balance: string;
};
export declare type TokenInfo = {
    token_info: {};
};
export declare type TokenInfoResponse = {
    decimals: number;
    name: string;
    symbol: string;
    total_supply: string;
};
