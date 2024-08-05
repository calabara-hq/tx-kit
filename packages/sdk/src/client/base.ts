
import {
    PublicClient,
    WalletClient,
    Address,
    Abi,
    Hash,
    encodeFunctionData,
    Log,
    Hex,
    Transport,
    Chain,
    Account,
    WalletCallReceipt,
    WalletCapabilities,
} from 'viem'
import {
    InvalidConfigError,
    InvalidPaymasterError,
    MissingPublicClientError,
    MissingWalletClientError,
} from '../errors'
import { TransmissionsClientConfig, TransactionConfig, TransactionOverrides, TransactionFormat, CallData, MulticallConfig, PaymasterConfig } from '../types';
import { TransactionType } from '../constants';
import { channelAbi } from '../abi/index';
import { GetCallsStatusReturnType, walletActionsEip5792 } from 'viem/experimental'


class BaseClient {
    readonly _chainId: number
    readonly _ensPublicClient: PublicClient<Transport, Chain> | undefined
    readonly _walletClient: WalletClient<Transport, Chain, Account> | undefined
    readonly _publicClient: PublicClient<Transport, Chain> | undefined
    readonly _includeEnsNames: boolean
    readonly _paymasterConfig: PaymasterConfig | undefined

    constructor({
        chainId,
        publicClient,
        ensPublicClient,
        walletClient,
        includeEnsNames = false,
        paymasterConfig
    }: TransmissionsClientConfig) {
        if (includeEnsNames && !publicClient && !ensPublicClient)
            throw new InvalidConfigError(
                'Must include a mainnet public client if includeEnsNames is set to true',
            )

        this._ensPublicClient = ensPublicClient ?? publicClient
        this._publicClient = publicClient
        this._chainId = chainId
        this._walletClient = walletClient
        this._includeEnsNames = includeEnsNames
        this._paymasterConfig = paymasterConfig
    }


    protected _requirePublicClient() {
        if (!this._publicClient)
            throw new MissingPublicClientError(
                'Public client required to perform this action, please update your call to the constructor',
            )
    }

    protected _requireWalletClient() {
        this._requirePublicClient()
        if (!this._walletClient)
            throw new MissingWalletClientError(
                'Wallet client required to perform this action, please update your call to the constructor',
            )
        if (!this._walletClient.account)
            throw new MissingWalletClientError(
                'Wallet client must have an account attached to it to perform this action, please update your wallet client passed into the constructor',
            )
    }
}

export class BaseTransactions extends BaseClient {
    protected readonly _transactionType: TransactionType
    protected readonly _shouldRequireWalletClient: boolean

    constructor({
        transactionType,
        chainId,
        publicClient,
        ensPublicClient,
        walletClient,
        includeEnsNames = false,
        paymasterConfig
    }: TransmissionsClientConfig & TransactionConfig) {

        super({
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
            paymasterConfig
        })

        this._transactionType = transactionType
        this._shouldRequireWalletClient = [
            TransactionType.GasEstimate,
            TransactionType.Transaction,
        ].includes(transactionType)
    }

    protected async _executeContractFunction({
        contractAddress,
        contractAbi,
        functionName,
        functionArgs,
        transactionOverrides,
        value,
    }: {
        contractAddress: Address
        contractAbi: Abi
        functionName: string
        functionArgs?: unknown[]
        transactionOverrides: TransactionOverrides
        value?: bigint
    }) {
        this._requirePublicClient()
        if (!this._publicClient) throw new Error()
        if (this._shouldRequireWalletClient) {
            this._requireWalletClient()
        }

        if (this._transactionType === TransactionType.GasEstimate) {
            if (!this._walletClient?.account) throw new Error()
            const gasEstimate = await this._publicClient.estimateContractGas({
                address: contractAddress,
                abi: contractAbi,
                functionName,
                account: this._walletClient.account,
                args: functionArgs ?? [],
                value,
                ...transactionOverrides,
            })
            return gasEstimate
        } else if (this._transactionType === TransactionType.CallData) {
            const calldata = encodeFunctionData({
                abi: contractAbi,
                functionName,
                args: functionArgs ?? [],
            })

            return {
                address: contractAddress,
                data: calldata,
                value,
            }
        } else if (this._transactionType === TransactionType.Transaction) {
            if (!this._walletClient?.account) throw new Error()



            try {

                // check capabilities
                const eip5792Client = this._walletClient.extend(walletActionsEip5792())
                const capabilitiesForChain = await eip5792Client.getCapabilities().then(data => data[this._chainId]).catch(() => { throw new InvalidPaymasterError() })

                const capabilities: WalletCapabilities = {};

                if (this._paymasterConfig?.paymasterUrl) {
                    if (capabilitiesForChain["paymasterService"] && capabilitiesForChain["paymasterService"].supported) {
                        capabilities['paymasterService'] = { url: this._paymasterConfig.paymasterUrl }
                    }
                }

                // pass transaction simulation to the wallet client (auxilliary funding may be available)


                const config = {
                    contracts: [{
                        address: contractAddress,
                        abi: contractAbi,
                        functionName,
                        args: functionArgs ?? [],
                        value,
                        ...transactionOverrides
                    }],
                    capabilities
                }

                const txHash = await eip5792Client.writeContracts(config)
                return txHash as Hash


            } catch (e) {
                if (e instanceof InvalidPaymasterError) {
                    // fallback to normal transaction

                    const { request } = await this._publicClient.simulateContract({
                        address: contractAddress,
                        abi: contractAbi,
                        functionName,
                        account: this._walletClient.account,
                        args: functionArgs ?? [],
                        value,
                        ...transactionOverrides,
                    })


                    const txHash = await this._walletClient.writeContract(request)
                    return txHash as Hash
                }
                throw e
            }


            // return txHash as Hash
        } else throw new Error(`Unknown transaction type: ${this._transactionType}`)
    }

    protected _isContractTransaction(txHash: TransactionFormat): txHash is Hash {
        return typeof txHash === 'string'
    }

    protected _isBigInt(gasEstimate: TransactionFormat): gasEstimate is bigint {
        return typeof gasEstimate === 'bigint'
    }

    protected _isCallData(callData: TransactionFormat): callData is CallData {
        if (callData instanceof BigInt) return false
        if (typeof callData === 'string') return false

        return true
    }


    async _multicallTransaction({
        channelAddress,
        calls,
        transactionOverrides = {},
    }: MulticallConfig): Promise<TransactionFormat> {
        this._requireWalletClient()
        if (!this._walletClient) throw new Error()

        const callRequests = calls.map((call) => {
            return call.data
        })

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
            contractAbi: channelAbi,
            functionName: 'multicall',
            functionArgs: [callRequests],
            transactionOverrides,
        })
        return result
    }
}


export class BaseClientMixin extends BaseTransactions {


    protected async _pollForSendCallsStatus(
        {
            txId,
            retryCount = 6,
            retryDelay = ({ count }) => Math.min(2000, ~~(1 << count) * 200), // exponential backoff
            timeout = 30000, // 30 secs
        }: {
            txId: Hash;
            retryCount?: number;
            retryDelay?: ({ count }: { count: number }) => number;
            timeout?: number;
        },
    ): Promise<GetCallsStatusReturnType> {
        let count = 0;
        let isTimeout = false;


        const _walletClient = this._walletClient;

        if (!_walletClient)
            throw new Error('Wallet client required to get send calls events')

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                isTimeout = true;
                reject(new Error('Polling for transaction status timed out.'));
            }, timeout);

            async function poll() {
                if (isTimeout) return;

                try {
                    const { status, receipts } = await _walletClient!
                        .extend(walletActionsEip5792())
                        .getCallsStatus({ id: txId });

                    if (status === 'CONFIRMED' && receipts) {
                        clearTimeout(timeoutId);
                        resolve({ status, receipts });
                        return;
                    }

                    if (count >= retryCount) {
                        clearTimeout(timeoutId);
                        reject(new Error('Maximum retry attempts reached.'));
                        return;
                    }

                    count++;
                    setTimeout(poll, retryDelay({ count }));
                } catch (error) {
                    if (isTimeout) return;

                    count++;
                    if (count >= retryCount) {
                        clearTimeout(timeoutId);
                        reject(new Error('Polling failed due to repeated errors.'));
                        return;
                    }

                    setTimeout(poll, retryDelay({ count }));
                }
            }

            poll();
        });
    }


    protected async _getSendCallsEvents({
        txId,
        eventTopics,
        includeAll,
    }: {
        txId: Hash
        eventTopics: Hex[]
        includeAll?: boolean
    }): Promise<Log[]> {

        if (!this._walletClient)
            throw new Error('Wallet client required to get send calls events')

        const { status, receipts } = await this._pollForSendCallsStatus({ txId })

        if (status === 'CONFIRMED' && receipts) {
            return this._getSendTransactionEvents({ txHash: receipts[0].transactionHash, eventTopics, includeAll })
        }
        return [];

    }

    protected async _getSendTransactionEvents({
        txHash,
        eventTopics,
        includeAll,
    }: {
        txHash: Hash
        eventTopics: Hex[]
        includeAll?: boolean
    }): Promise<Log[]> {

        if (!this._publicClient)
            throw new Error('Public client required to get send calls events')

        const transaction = await this._publicClient.waitForTransactionReceipt({
            hash: txHash,
        })
        if (transaction.status === 'success') {
            const events = transaction.logs?.filter((log) => {
                if (includeAll) return true
                if (log.topics[0]) return eventTopics.includes(log.topics[0])

                return false
            })

            return events
        }

        return []
    }


    async getTransactionEvents({
        txHash,
        eventTopics,
        includeAll,
    }: {
        txHash: Hash
        eventTopics: Hex[]
        includeAll?: boolean
    }): Promise<Log[]> {


        if (txHash.length === 66) {
            return this._getSendTransactionEvents({ txHash, eventTopics, includeAll })
        } else {
            return this._getSendCallsEvents({ txId: txHash, eventTopics, includeAll })
        }
    }

    async submitMulticallTransaction(multicallArgs: MulticallConfig): Promise<{
        txHash: Hash
    }> {
        const multicallResult = await this._multicallTransaction(multicallArgs)
        if (!this._isContractTransaction(multicallResult))
            throw new Error('Invalid response')

        return { txHash: multicallResult }
    }

    async multicall(multicallArgs: MulticallConfig): Promise<{ events: Log[] }> {
        this._requirePublicClient()
        if (!this._publicClient) throw new Error()

        const { txHash } = await this.submitMulticallTransaction(multicallArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: [],
            includeAll: true,
        })
        return { events }
    }
}

export class BaseGasEstimatesMixin extends BaseTransactions { }

