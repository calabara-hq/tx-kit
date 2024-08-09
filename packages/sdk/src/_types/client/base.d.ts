import { PublicClient, WalletClient, Address, Abi, Hash, Log, Hex, Transport, Chain, Account } from 'viem';
import { TransmissionsClientConfig, TransactionConfig, TransactionOverrides, TransactionFormat, CallData, MulticallConfig, PaymasterConfig } from '../types.js';
import { TransactionType } from '../constants.js';
import { GetCallsStatusReturnType } from 'viem/experimental';
declare class BaseClient {
    readonly _chainId: number;
    readonly _ensPublicClient: PublicClient<Transport, Chain> | undefined;
    readonly _walletClient: WalletClient<Transport, Chain, Account> | undefined;
    readonly _publicClient: PublicClient<Transport, Chain> | undefined;
    readonly _includeEnsNames: boolean;
    readonly _paymasterConfig: PaymasterConfig | undefined;
    constructor({ chainId, publicClient, ensPublicClient, walletClient, includeEnsNames, paymasterConfig }: TransmissionsClientConfig);
    protected _requirePublicClient(): void;
    protected _requireWalletClient(): void;
}
export declare class BaseTransactions extends BaseClient {
    protected readonly _transactionType: TransactionType;
    protected readonly _shouldRequireWalletClient: boolean;
    constructor({ transactionType, chainId, publicClient, ensPublicClient, walletClient, includeEnsNames, paymasterConfig }: TransmissionsClientConfig & TransactionConfig);
    protected _executeContractFunction({ contractAddress, contractAbi, functionName, functionArgs, transactionOverrides, value, }: {
        contractAddress: Address;
        contractAbi: Abi;
        functionName: string;
        functionArgs?: unknown[];
        transactionOverrides: TransactionOverrides;
        value?: bigint;
    }): Promise<bigint | `0x${string}` | {
        address: `0x${string}`;
        data: `0x${string}`;
        value: bigint | undefined;
    }>;
    protected _isContractTransaction(txHash: TransactionFormat): txHash is Hash;
    protected _isBigInt(gasEstimate: TransactionFormat): gasEstimate is bigint;
    protected _isCallData(callData: TransactionFormat): callData is CallData;
    _multicallTransaction({ channelAddress, calls, transactionOverrides, }: MulticallConfig): Promise<TransactionFormat>;
}
export declare class BaseClientMixin extends BaseTransactions {
    protected _pollForSendCallsStatus({ txId, retryCount, retryDelay, // exponential backoff
    timeout, }: {
        txId: Hash;
        retryCount?: number;
        retryDelay?: ({ count }: {
            count: number;
        }) => number;
        timeout?: number;
    }): Promise<GetCallsStatusReturnType>;
    protected _getSendCallsEvents({ txId, eventTopics, includeAll, }: {
        txId: Hash;
        eventTopics: Hex[];
        includeAll?: boolean;
    }): Promise<Log[]>;
    protected _getSendTransactionEvents({ txHash, eventTopics, includeAll, }: {
        txHash: Hash;
        eventTopics: Hex[];
        includeAll?: boolean;
    }): Promise<Log[]>;
    getTransactionEvents({ txHash, eventTopics, includeAll, }: {
        txHash: Hash;
        eventTopics: Hex[];
        includeAll?: boolean;
    }): Promise<Log[]>;
    submitMulticallTransaction(multicallArgs: MulticallConfig): Promise<{
        txHash: Hash;
    }>;
    multicall(multicallArgs: MulticallConfig): Promise<{
        events: Log[];
    }>;
}
export declare class BaseGasEstimatesMixin extends BaseTransactions {
}
export {};
//# sourceMappingURL=base.d.ts.map