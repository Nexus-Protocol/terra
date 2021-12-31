import { FC, ReactNode, Context, Consumer } from 'react';
import { Coin, Dec, LCDClient } from '@terra-money/terra.js';
import { NetworkInfo } from '@terra-money/wallet-provider';
declare type TerraWebapp = {
    network: NetworkInfo;
    client: LCDClient;
    taxCap: Coin | undefined;
    taxRate: Dec | undefined;
};
export declare const TerraWebappContext: Context<TerraWebapp>;
declare type Props = {
    children: ReactNode;
};
export declare const TerraWebappProvider: FC<Props>;
export declare function useTerraWebapp(): TerraWebapp;
export declare const TerraWebappConsumer: Consumer<TerraWebapp>;
export {};
