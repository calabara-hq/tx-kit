"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGasEstimatesMixin = exports.BaseClientMixin = exports.BaseTransactions = void 0;
const viem_1 = require("viem");
const errors_js_1 = require("../errors.js");
const constants_js_1 = require("../constants.js");
const index_js_1 = require("../abi/index.js");
const experimental_1 = require("viem/experimental");
class BaseClient {
    constructor({ chainId, publicClient, ensPublicClient, walletClient, includeEnsNames = false, paymasterConfig }) {
        Object.defineProperty(this, "_chainId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_ensPublicClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_walletClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_publicClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_includeEnsNames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_paymasterConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (includeEnsNames && !publicClient && !ensPublicClient)
            throw new errors_js_1.InvalidConfigError('Must include a mainnet public client if includeEnsNames is set to true');
        this._ensPublicClient = ensPublicClient ?? publicClient;
        this._publicClient = publicClient;
        this._chainId = chainId;
        this._walletClient = walletClient;
        this._includeEnsNames = includeEnsNames;
        this._paymasterConfig = paymasterConfig;
    }
    _requirePublicClient() {
        if (!this._publicClient)
            throw new errors_js_1.MissingPublicClientError('Public client required to perform this action, please update your call to the constructor');
    }
    _requireWalletClient() {
        this._requirePublicClient();
        if (!this._walletClient)
            throw new errors_js_1.MissingWalletClientError('Wallet client required to perform this action, please update your call to the constructor');
        if (!this._walletClient.account)
            throw new errors_js_1.MissingWalletClientError('Wallet client must have an account attached to it to perform this action, please update your wallet client passed into the constructor');
    }
}
class BaseTransactions extends BaseClient {
    constructor({ transactionType, chainId, publicClient, ensPublicClient, walletClient, includeEnsNames = false, paymasterConfig }) {
        super({
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
            paymasterConfig
        });
        Object.defineProperty(this, "_transactionType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_shouldRequireWalletClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._transactionType = transactionType;
        this._shouldRequireWalletClient = [
            constants_js_1.TransactionType.GasEstimate,
            constants_js_1.TransactionType.Transaction,
        ].includes(transactionType);
    }
    async _executeContractFunction({ contractAddress, contractAbi, functionName, functionArgs, transactionOverrides, value, }) {
        this._requirePublicClient();
        if (!this._publicClient)
            throw new Error();
        if (this._shouldRequireWalletClient) {
            this._requireWalletClient();
        }
        if (this._transactionType === constants_js_1.TransactionType.GasEstimate) {
            if (!this._walletClient?.account)
                throw new Error();
            const gasEstimate = await this._publicClient.estimateContractGas({
                address: contractAddress,
                abi: contractAbi,
                functionName,
                account: this._walletClient.account,
                args: functionArgs ?? [],
                value,
                ...transactionOverrides,
            });
            return gasEstimate;
        }
        else if (this._transactionType === constants_js_1.TransactionType.CallData) {
            const calldata = (0, viem_1.encodeFunctionData)({
                abi: contractAbi,
                functionName,
                args: functionArgs ?? [],
            });
            return {
                address: contractAddress,
                data: calldata,
                value,
            };
        }
        else if (this._transactionType === constants_js_1.TransactionType.Transaction) {
            if (!this._walletClient?.account)
                throw new Error();
            try {
                const eip5792Client = this._walletClient.extend((0, experimental_1.walletActionsEip5792)());
                const capabilitiesForChain = await eip5792Client.getCapabilities().then(data => data[this._chainId]).catch(() => { throw new errors_js_1.InvalidPaymasterError(); });
                const capabilities = {};
                if (this._paymasterConfig?.paymasterUrl) {
                    if (capabilitiesForChain["paymasterService"] && capabilitiesForChain["paymasterService"].supported) {
                        capabilities['paymasterService'] = { url: this._paymasterConfig.paymasterUrl };
                    }
                }
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
                };
                const txHash = await eip5792Client.writeContracts(config);
                return txHash;
            }
            catch (e) {
                if (e instanceof errors_js_1.InvalidPaymasterError) {
                    const { request } = await this._publicClient.simulateContract({
                        address: contractAddress,
                        abi: contractAbi,
                        functionName,
                        account: this._walletClient.account,
                        args: functionArgs ?? [],
                        value,
                        ...transactionOverrides,
                    });
                    const txHash = await this._walletClient.writeContract(request);
                    return txHash;
                }
                throw e;
            }
        }
        else
            throw new Error(`Unknown transaction type: ${this._transactionType}`);
    }
    _isContractTransaction(txHash) {
        return typeof txHash === 'string';
    }
    _isBigInt(gasEstimate) {
        return typeof gasEstimate === 'bigint';
    }
    _isCallData(callData) {
        if (callData instanceof BigInt)
            return false;
        if (typeof callData === 'string')
            return false;
        return true;
    }
    async _multicallTransaction({ channelAddress, calls, transactionOverrides = {}, }) {
        this._requireWalletClient();
        if (!this._walletClient)
            throw new Error();
        const callRequests = calls.map((call) => {
            return call.data;
        });
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: index_js_1.channelAbi,
            functionName: 'multicall',
            functionArgs: [callRequests],
            transactionOverrides,
        });
        return result;
    }
}
exports.BaseTransactions = BaseTransactions;
class BaseClientMixin extends BaseTransactions {
    async _pollForSendCallsStatus({ txId, retryCount = 6, retryDelay = ({ count }) => Math.min(2000, ~~(1 << count) * 200), timeout = 30000, }) {
        let count = 0;
        let isTimeout = false;
        const _walletClient = this._walletClient;
        if (!_walletClient)
            throw new Error('Wallet client required to get send calls events');
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                isTimeout = true;
                reject(new Error('Polling for transaction status timed out.'));
            }, timeout);
            async function poll() {
                if (isTimeout)
                    return;
                try {
                    const { status, receipts } = await _walletClient
                        .extend((0, experimental_1.walletActionsEip5792)())
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
                }
                catch (error) {
                    if (isTimeout)
                        return;
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
    async _getSendCallsEvents({ txId, eventTopics, includeAll, }) {
        if (!this._walletClient)
            throw new Error('Wallet client required to get send calls events');
        const { status, receipts } = await this._pollForSendCallsStatus({ txId });
        if (status === 'CONFIRMED' && receipts) {
            return this._getSendTransactionEvents({ txHash: receipts[0].transactionHash, eventTopics, includeAll });
        }
        return [];
    }
    async _getSendTransactionEvents({ txHash, eventTopics, includeAll, }) {
        if (!this._publicClient)
            throw new Error('Public client required to get send calls events');
        const transaction = await this._publicClient.waitForTransactionReceipt({
            hash: txHash,
        });
        if (transaction.status === 'success') {
            const events = transaction.logs?.filter((log) => {
                if (includeAll)
                    return true;
                if (log.topics[0])
                    return eventTopics.includes(log.topics[0]);
                return false;
            });
            return events;
        }
        return [];
    }
    async getTransactionEvents({ txHash, eventTopics, includeAll, }) {
        if (txHash.length === 66) {
            return this._getSendTransactionEvents({ txHash, eventTopics, includeAll });
        }
        else {
            return this._getSendCallsEvents({ txId: txHash, eventTopics, includeAll });
        }
    }
    async submitMulticallTransaction(multicallArgs) {
        const multicallResult = await this._multicallTransaction(multicallArgs);
        if (!this._isContractTransaction(multicallResult))
            throw new Error('Invalid response');
        return { txHash: multicallResult };
    }
    async multicall(multicallArgs) {
        this._requirePublicClient();
        if (!this._publicClient)
            throw new Error();
        const { txHash } = await this.submitMulticallTransaction(multicallArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: [],
            includeAll: true,
        });
        return { events };
    }
}
exports.BaseClientMixin = BaseClientMixin;
class BaseGasEstimatesMixin extends BaseTransactions {
}
exports.BaseGasEstimatesMixin = BaseGasEstimatesMixin;
//# sourceMappingURL=base.js.map