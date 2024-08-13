import { decodeEventLog, encodeEventTopics, erc20Abi, getContract, parseErc6492Signature, zeroAddress, } from 'viem';
import { customAlphabet } from 'nanoid';
import { getChannelFactoryAddress, getCustomFeesAddress, INTENT_DURATION, SUPPORTED_CHAIN_IDS, TransactionType } from "../constants.js";
import { TransactionFailedError, UnsupportedChainIdError } from '../errors.js';
import { channelAbi, channelFactoryAbi, customFeesAbi, dynamicLogicAbi, finiteChannelAbi, infiniteChannelAbi, rewardsAbi } from '../abi/index.js';
import { validateAddress, validateApproveERC20Inputs, validateCreateTokenInputs, validateFiniteChannelInputs, validateInfiniteChannelInputs, validateInfiniteTransportLayer, validateMintTokenBatchInputs, validateSetFeeInputs, validateSetLogicInputs, validateSponsorTokenInputs, validateWithdrawRewardsInputs } from '../utils/validate.js';
import { BaseClientMixin, BaseGasEstimatesMixin, BaseTransactions } from './base.js';
import { applyMixins } from './mixin.js';
import { encodeDynamicLogicInputs } from '../utils/logic.js';
import { encodeCustomFeeInputs } from '../utils/fees.js';
import { createSetupActions } from '../utils/setupActions.js';
import { createFiniteTransportLayerInput, createInfiniteTransportLayerInput } from '../utils/transport.js';
class UplinkTransactions extends BaseTransactions {
    constructor({ transactionType, chainId, publicClient, ensPublicClient, walletClient, includeEnsNames = false, paymasterConfig }) {
        super({
            transactionType,
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
            paymasterConfig,
        });
        Object.defineProperty(this, "_channelFactoryAbi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_customFeesAbi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_dynamicLogicAbi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_channelAbi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_infiniteChannelAbi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_finiteChannelAbi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_rewardsAbi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_channelFactoryContract", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_customFeesContract", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_dynamicLogicContract", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
            throw new UnsupportedChainIdError(chainId, SUPPORTED_CHAIN_IDS);
        }
        /// abis
        this._channelFactoryAbi = channelFactoryAbi;
        this._customFeesAbi = customFeesAbi;
        this._dynamicLogicAbi = dynamicLogicAbi;
        this._channelAbi = channelAbi;
        this._infiniteChannelAbi = infiniteChannelAbi;
        this._finiteChannelAbi = finiteChannelAbi;
        this._rewardsAbi = rewardsAbi;
        /// contracts
        this._channelFactoryContract = getContract({
            abi: channelFactoryAbi,
            address: getChannelFactoryAddress(chainId),
            // @ts-expect-error v1/v2 viem support
            client: this._publicClient,
            publicClient: this._publicClient,
        });
        this._customFeesContract = getContract({
            abi: customFeesAbi,
            address: getCustomFeesAddress(chainId),
            // @ts-expect-error v1/v2 viem support
            client: this._publicClient,
            publicClient: this._publicClient,
        });
        this._dynamicLogicContract = getContract({
            abi: dynamicLogicAbi,
            address: zeroAddress,
            // @ts-expect-error v1/v2 viem support
            client: this._publicClient,
            publicClient: this._publicClient,
        });
    }
    async _createInfiniteChannelTransaction({ uri, name, defaultAdmin, managers, setupActions, transportLayer, transactionOverrides = {}, }) {
        validateInfiniteChannelInputs({ uri, name, defaultAdmin, managers, setupActions, transportLayer });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: this._channelFactoryContract.address,
            contractAbi: [...this._channelFactoryAbi, ...this._infiniteChannelAbi],
            functionName: 'createInfiniteChannel',
            functionArgs: [
                uri,
                name,
                defaultAdmin,
                managers,
                createSetupActions(setupActions),
                createInfiniteTransportLayerInput(transportLayer),
            ],
            transactionOverrides
        });
        return result;
    }
    async _createFiniteChannelTransaction({ uri, name, defaultAdmin, managers, setupActions, transportLayer, transactionOverrides = {}, }) {
        validateFiniteChannelInputs({ uri, name, defaultAdmin, managers, setupActions, transportLayer });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: this._channelFactoryContract.address,
            contractAbi: [...this._channelFactoryAbi, ...this._finiteChannelAbi],
            functionName: 'createFiniteChannel',
            functionArgs: [
                uri,
                name,
                defaultAdmin,
                managers,
                createSetupActions(setupActions),
                createFiniteTransportLayerInput(transportLayer),
            ],
            transactionOverrides,
        });
        return result;
    }
    async _createUpdateChannelFeesTransaction({ channelAddress, feeContract = this._customFeesContract.address, feeArgs, transactionOverrides = {}, }) {
        validateAddress(channelAddress);
        validateSetFeeInputs({ feeContract, feeArgs });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._channelAbi,
            functionName: 'setFees',
            functionArgs: [
                feeContract,
                encodeCustomFeeInputs(feeArgs)
            ],
            transactionOverrides,
        });
        return result;
    }
    async _createUpdateChannelLogicTransaction({ channelAddress, logicContract = this._dynamicLogicContract.address, creatorLogic, minterLogic, transactionOverrides = {}, }) {
        validateAddress(channelAddress);
        validateAddress(logicContract);
        validateSetLogicInputs(creatorLogic);
        validateSetLogicInputs(minterLogic);
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._channelAbi,
            functionName: 'setLogic',
            functionArgs: [
                logicContract,
                encodeDynamicLogicInputs(creatorLogic),
                encodeDynamicLogicInputs(minterLogic)
            ],
            transactionOverrides,
        });
        return result;
    }
    async _createUpdateInfiniteChannelTransportLayerTransaction({ channelAddress, saleDurationInSeconds, transactionOverrides = {} }) {
        validateAddress(channelAddress);
        validateInfiniteTransportLayer({ saleDurationInSeconds });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._infiniteChannelAbi,
            functionName: 'setTransportConfig',
            functionArgs: [
                createInfiniteTransportLayerInput({ saleDurationInSeconds })
            ],
            transactionOverrides,
        });
        return result;
    }
    async _createUpdateChannelMetadataTransaction({ channelAddress, uri, name, transactionOverrides = {} }) {
        validateAddress(channelAddress);
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._channelAbi,
            functionName: 'updateChannelMetadata',
            functionArgs: [
                name,
                uri
            ],
            transactionOverrides,
        });
        return result;
    }
    async _createSettleFiniteChannelTransaction({ channelAddress, transactionOverrides = {} }) {
        validateAddress(channelAddress);
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._finiteChannelAbi,
            functionName: 'settle',
            transactionOverrides,
        });
        return result;
    }
    async _createTokenTransaction({ channelAddress, uri, maxSupply, transactionOverrides = {} }) {
        validateCreateTokenInputs({ channelAddress, uri, maxSupply });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: [...this._infiniteChannelAbi, ...this._finiteChannelAbi],
            functionName: 'createToken',
            functionArgs: [
                uri,
                maxSupply
            ],
            transactionOverrides,
        });
        return result;
    }
    async _mintTokenBatchWithETHTransaction({ channelAddress, to, tokenIds, amounts, mintReferral, data, transactionOverrides = {} }) {
        mintReferral = mintReferral || zeroAddress;
        validateMintTokenBatchInputs({ channelAddress, to, tokenIds, amounts, mintReferral, data });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: [...this._finiteChannelAbi, ...this._infiniteChannelAbi],
            functionName: 'mintBatchWithETH',
            functionArgs: [
                to,
                tokenIds,
                amounts,
                mintReferral,
                data
            ],
            transactionOverrides
        });
        return result;
    }
    async _mintTokenBatchWithERC20Transaction({ channelAddress, to, tokenIds, amounts, mintReferral, data, transactionOverrides = {} }) {
        mintReferral = mintReferral || zeroAddress;
        validateMintTokenBatchInputs({ channelAddress, to, tokenIds, amounts, mintReferral, data });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: [...this._finiteChannelAbi, ...this._infiniteChannelAbi],
            functionName: 'mintBatchWithERC20',
            functionArgs: [
                to,
                tokenIds,
                amounts,
                mintReferral,
                data
            ],
            transactionOverrides
        });
        return result;
    }
    async _sponsorTokenWithETHTransaction({ channelAddress, sponsoredToken, to, amount, mintReferral, data, transactionOverrides = {} }) {
        mintReferral = mintReferral || zeroAddress;
        await validateSponsorTokenInputs({ channelAddress, sponsoredToken, to, amount, mintReferral, data });
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: [...this._infiniteChannelAbi, ...this._finiteChannelAbi],
            functionName: 'sponsorWithETH',
            functionArgs: [
                {
                    uri: sponsoredToken.intent.message.uri,
                    maxSupply: sponsoredToken.intent.message.maxSupply,
                    deadline: sponsoredToken.intent.message.deadline,
                    nonce: sponsoredToken.intent.message.nonce
                },
                sponsoredToken.author,
                sponsoredToken.signature,
                to,
                BigInt(amount),
                mintReferral,
                data
            ],
            transactionOverrides
        });
        return result;
    }
    async _sponsorTokenWithERC20Transaction({ channelAddress, sponsoredToken, to, amount, mintReferral, data, transactionOverrides = {} }) {
        mintReferral = mintReferral || zeroAddress;
        await validateSponsorTokenInputs({ channelAddress, sponsoredToken, to, amount, mintReferral, data });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: [...this._finiteChannelAbi, ...this._infiniteChannelAbi],
            functionName: 'sponsorWithERC20',
            functionArgs: [
                sponsoredToken.intent.message,
                sponsoredToken.author,
                sponsoredToken.signature,
                to,
                amount,
                mintReferral,
                data
            ],
            transactionOverrides
        });
        return result;
    }
    async _withdrawFiniteRewardsTransaction({ channelAddress, token, to, amount, transactionOverrides = {} }) {
        validateWithdrawRewardsInputs({ channelAddress, token, to, amount });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._finiteChannelAbi,
            functionName: 'withdrawRewards',
            functionArgs: [
                token,
                to,
                amount
            ],
            transactionOverrides
        });
        return result;
    }
    async _approveERC20({ erc20Contract, spender, amount, transactionOverrides = {} }) {
        validateApproveERC20Inputs({ erc20Contract, spender, amount });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: erc20Contract,
            contractAbi: erc20Abi,
            functionName: 'approve',
            functionArgs: [
                spender,
                amount
            ],
            transactionOverrides
        });
        return result;
    }
    async _upgradeChannel({ channelAddress, newImplementation, transactionOverrides = {} }) {
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._channelAbi,
            functionName: 'upgradeToAndCall',
            functionArgs: [
                newImplementation,
                ""
            ],
            transactionOverrides
        });
        return result;
    }
}
export class UplinkClient extends UplinkTransactions {
    constructor({ chainId, publicClient, walletClient, includeEnsNames = false, ensPublicClient, paymasterConfig }) {
        super({
            transactionType: TransactionType.Transaction,
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
            paymasterConfig
        });
        Object.defineProperty(this, "eventTopics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "callData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "estimateGas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.eventTopics = {
            createInfiniteChannel: [
                encodeEventTopics({
                    abi: this._channelFactoryAbi,
                    eventName: 'SetupNewContract',
                })[0]
            ],
            createFiniteChannel: [
                encodeEventTopics({
                    abi: this._channelFactoryAbi,
                    eventName: 'SetupNewContract',
                })[0]
            ],
            configUpdated: [
                encodeEventTopics({
                    abi: this._channelAbi,
                    eventName: 'ConfigUpdated',
                })[0]
            ],
            channelMetadataUpdated: [
                encodeEventTopics({
                    abi: this._channelAbi,
                    eventName: 'ChannelMetadataUpdated',
                })[0]
            ],
            infiniteTransportConfigSet: [
                encodeEventTopics({
                    abi: this._infiniteChannelAbi,
                    eventName: 'InfiniteTransportConfigSet',
                })[0]
            ],
            tokenCreated: [
                encodeEventTopics({
                    abi: this._channelAbi,
                    eventName: 'TokenCreated'
                })[0]
            ],
            tokenMinted: [
                encodeEventTopics({
                    abi: this._channelAbi,
                    eventName: 'TokenMinted'
                })[0]
            ],
            settled: [
                encodeEventTopics({
                    abi: this._finiteChannelAbi,
                    eventName: 'Settled'
                })[0]
            ],
            ethTransferred: [
                encodeEventTopics({
                    abi: this._rewardsAbi,
                    eventName: 'ETHTransferred'
                })[0]
            ],
            erc20Transferred: [
                encodeEventTopics({
                    abi: this._rewardsAbi,
                    eventName: 'ERC20Transferred'
                })[0]
            ],
            erc20Approved: [
                encodeEventTopics({
                    abi: erc20Abi,
                    eventName: 'Approval'
                })[0]
            ],
            upgraded: [
                encodeEventTopics({
                    abi: this._channelAbi,
                    eventName: 'Upgraded'
                })[0]
            ]
        };
        this.callData = new UplinkCallData({
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
            paymasterConfig
        });
        this.estimateGas = new UplinkGasEstimates({
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
            paymasterConfig
        });
    }
    async submitCreateInfiniteChannelTransaction(createInfiniteChannelArgs) {
        const txHash = await this._createInfiniteChannelTransaction(createInfiniteChannelArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async createInfiniteChannel(createInfiniteChannelArgs) {
        const { txHash } = await this.submitCreateInfiniteChannelTransaction(createInfiniteChannelArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.createInfiniteChannel
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelFactoryAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'SetupNewContract')
                throw new Error();
            return {
                contractAddress: log.args.contractAddress,
                event,
            };
        }
        throw new TransactionFailedError();
    }
    async submitCreateFiniteChannelTransaction(createFiniteChannelArgs) {
        const txHash = await this._createFiniteChannelTransaction(createFiniteChannelArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async createFiniteChannel(createFiniteChannelArgs) {
        const { txHash } = await this.submitCreateFiniteChannelTransaction(createFiniteChannelArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.createFiniteChannel
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelFactoryAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'SetupNewContract')
                throw new Error();
            return {
                contractAddress: log.args.contractAddress,
                event,
            };
        }
        throw new TransactionFailedError();
    }
    async submitUpdateChannelFeesTransaction(updateChannelFeeArgs) {
        const txHash = await this._createUpdateChannelFeesTransaction(updateChannelFeeArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async updateChannelFees(updateChannelFeeArgs) {
        const { txHash } = await this.submitUpdateChannelFeesTransaction(updateChannelFeeArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.configUpdated
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'ConfigUpdated')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
    async submitUpdateChannelLogicTransaction(updateChanelLogicArgs) {
        const txHash = await this._createUpdateChannelLogicTransaction(updateChanelLogicArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async updateChannelLogic(updateChanelLogicArgs) {
        const { txHash } = await this.submitUpdateChannelLogicTransaction(updateChanelLogicArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.configUpdated
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'ConfigUpdated')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
    async submitUpdateInfiniteChannelTransportLayerTransaction(updateInfiniteChannelTransportLayerArgs) {
        const txHash = await this._createUpdateInfiniteChannelTransportLayerTransaction(updateInfiniteChannelTransportLayerArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async updateInfiniteChannelTransportLayer(updateInfiniteChannelTransportLayerArgs) {
        const { txHash } = await this.submitUpdateInfiniteChannelTransportLayerTransaction(updateInfiniteChannelTransportLayerArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.infiniteTransportConfigSet
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._infiniteChannelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'InfiniteTransportConfigSet')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
    async submitUpdateChannelMetadataTransaction(updateChannelMetadataArgs) {
        const txHash = await this._createUpdateChannelMetadataTransaction(updateChannelMetadataArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async updateChannelMetadata(updateChannelMetadataArgs) {
        const { txHash } = await this.submitUpdateChannelMetadataTransaction(updateChannelMetadataArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.channelMetadataUpdated
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'ChannelMetadataUpdated')
                throw new Error();
            return {
                uri: log.args.uri,
                channelName: log.args.channelName,
                event
            };
        }
        throw new TransactionFailedError();
    }
    async submitSettleFiniteChannelTransaction(settleFiniteChannelArgs) {
        const txHash = await this._createSettleFiniteChannelTransaction(settleFiniteChannelArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async settleFiniteChannel(settleFiniteChannelArgs) {
        const { txHash } = await this.submitSettleFiniteChannelTransaction(settleFiniteChannelArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.settled
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._finiteChannelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'Settled')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
    createDeferredTokenIntent(createTokenArgs) {
        validateCreateTokenInputs(createTokenArgs);
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        if (!this._walletClient?.account)
            throw new Error();
        const genRandomBytes = () => {
            const nanoid = customAlphabet('0123456789abcdef', 64);
            return `0x${nanoid()}`;
        };
        return {
            author: this._walletClient?.account.address,
            intent: {
                domain: {
                    name: "Transmissions",
                    version: "1",
                    chainId: this._chainId,
                    verifyingContract: createTokenArgs.channelAddress
                },
                types: {
                    DeferredTokenPermission: [
                        { name: "uri", type: "string" },
                        { name: "maxSupply", type: "uint256" },
                        { name: "deadline", type: "uint256" },
                        { name: "nonce", type: "bytes32" }
                    ]
                },
                primaryType: "DeferredTokenPermission",
                message: {
                    uri: createTokenArgs.uri,
                    maxSupply: createTokenArgs.maxSupply,
                    deadline: BigInt(Math.floor(Date.now() / 1000)) + INTENT_DURATION,
                    nonce: genRandomBytes()
                }
            }
        };
    }
    async signDeferredTokenIntent(args) {
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        if (!this._walletClient?.account)
            throw new Error();
        const signature = await this._walletClient.signTypedData(args.intent);
        const parsedSignature = parseErc6492Signature(signature).signature;
        return {
            ...args,
            signature: parsedSignature
        };
    }
    async submitCreateTokenTransaction(createTokenArgs) {
        const txHash = await this._createTokenTransaction(createTokenArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async createToken(createTokenArgs) {
        const { txHash } = await this.submitCreateTokenTransaction(createTokenArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenCreated
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: [...this._finiteChannelAbi, ...this._infiniteChannelAbi],
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'TokenCreated')
                throw new Error();
            return {
                tokenId: log.args.tokenId,
                event
            };
        }
        throw new TransactionFailedError();
    }
    async submitMintTokenBatchWithETHTransaction(mintTokenArgs) {
        const txHash = await this._mintTokenBatchWithETHTransaction(mintTokenArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async mintTokenWithETH(mintTokenArgs) {
        const { txHash } = await this.submitMintTokenBatchWithETHTransaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        });
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'TokenMinted')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
    async mintTokenBatchWithETH(mintTokenArgs) {
        const { txHash } = await this.submitMintTokenBatchWithETHTransaction(mintTokenArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'TokenMinted')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
    async submitMintTokenBatchWithERC20Transaction(mintTokenArgs) {
        const txHash = await this._mintTokenBatchWithERC20Transaction(mintTokenArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async mintTokenWithERC20(mintTokenArgs) {
        const { txHash } = await this.submitMintTokenBatchWithERC20Transaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        });
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'TokenMinted')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
    async mintTokenBatchWithERC20(mintTokenArgs) {
        const { txHash } = await this.submitMintTokenBatchWithERC20Transaction(mintTokenArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'TokenMinted')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
    async submitSponsorTokenWithERC20Transaction(sponsorTokenArgs) {
        const txHash = await this._sponsorTokenWithERC20Transaction(sponsorTokenArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async sponsorWithERC20(sponsorTokenArgs) {
        const { txHash } = await this.submitSponsorTokenWithERC20Transaction(sponsorTokenArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: [...this._infiniteChannelAbi, ...this._finiteChannelAbi],
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'TokenMinted')
                throw new Error();
            return {
                event,
                tokenId: log.args.tokenIds[0]
            };
        }
        throw new TransactionFailedError();
    }
    async submitSponsorTokenWithETHTransaction(sponsorTokenArgs) {
        const txHash = await this._sponsorTokenWithETHTransaction(sponsorTokenArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async sponsorWithETH(sponsorTokenArgs) {
        const { txHash } = await this.submitSponsorTokenWithETHTransaction(sponsorTokenArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: [...this._infiniteChannelAbi, ...this._finiteChannelAbi],
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'TokenMinted')
                throw new Error();
            return {
                event,
                tokenId: log.args.tokenIds[0]
            };
        }
        throw new TransactionFailedError();
    }
    async submitWithdrawRewardsTransaction(withdrawRewardsArgs) {
        const txHash = await this._withdrawFiniteRewardsTransaction(withdrawRewardsArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async adminWithdrawFiniteChannelRewards(withdrawRewardsArgs) {
        const { txHash } = await this.submitWithdrawRewardsTransaction(withdrawRewardsArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: [...this.eventTopics.ethTransferred, ...this.eventTopics.erc20Transferred]
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'ETHTransferred' && log.eventName !== 'ERC20Transferred')
                throw new Error();
            return {
                success: true,
                event
            };
        }
        throw new TransactionFailedError();
    }
    async submitApproveERC20Transaction(approveERC20Args) {
        const txHash = await this._approveERC20(approveERC20Args);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async approveERC20(approveERC20Args) {
        const { txHash } = await this.submitApproveERC20Transaction(approveERC20Args);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.erc20Approved
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: erc20Abi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'Approval')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
    async submitUpgradeChannelTransaction(upgradeChannelArgs) {
        const txHash = await this._upgradeChannel(upgradeChannelArgs);
        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response');
        }
        return { txHash };
    }
    async upgradeChannel(upgradeChannelArgs) {
        const { txHash } = await this.submitUpgradeChannelTransaction(upgradeChannelArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.upgraded
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'Upgraded')
                throw new Error();
            return {
                event
            };
        }
        throw new TransactionFailedError();
    }
}
class UplinkCallData extends UplinkTransactions {
    constructor({ chainId, publicClient, walletClient, includeEnsNames = false, ensPublicClient, paymasterConfig }) {
        super({
            transactionType: TransactionType.CallData,
            chainId,
            publicClient,
            walletClient,
            includeEnsNames,
            ensPublicClient,
            paymasterConfig
        });
    }
    async createInfiniteChannel(createInfiniteChannelArgs) {
        const result = await this._createInfiniteChannelTransaction(createInfiniteChannelArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async createFiniteChannel(createFiniteChannelArgs) {
        const result = await this._createFiniteChannelTransaction(createFiniteChannelArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async updateChannelFees(updateChannelFeeArgs) {
        const result = await this._createUpdateChannelFeesTransaction(updateChannelFeeArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async updateChannelLogic(updateChanelLogicArgs) {
        const result = await this._createUpdateChannelLogicTransaction(updateChanelLogicArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async updateChannelMetadata(updateChannelMetadataArgs) {
        const result = await this._createUpdateChannelMetadataTransaction(updateChannelMetadataArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async updateInfiniteChannelTransportLayer(updateInfiniteChannelTransportLayerArgs) {
        const result = await this._createUpdateInfiniteChannelTransportLayerTransaction(updateInfiniteChannelTransportLayerArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async settleFiniteChannel(settleFiniteChannelArgs) {
        const result = await this._createSettleFiniteChannelTransaction(settleFiniteChannelArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async createToken(createTokenArgs) {
        const result = await this._createTokenTransaction(createTokenArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async mintTokenWithETH(mintTokenArgs) {
        const result = await this._mintTokenBatchWithETHTransaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        });
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async mintTokenBatchWithETH(mintTokenArgs) {
        const result = await this._mintTokenBatchWithETHTransaction(mintTokenArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async mintTokenWithERC20(mintTokenArgs) {
        const result = await this._mintTokenBatchWithERC20Transaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        });
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async mintTokenBatchWithERC20(mintTokenArgs) {
        const result = await this._mintTokenBatchWithERC20Transaction(mintTokenArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async sponsorWithERC20(sponsorTokenArgs) {
        const result = await this._sponsorTokenWithERC20Transaction(sponsorTokenArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async sponsorWithETH(sponsorTokenArgs) {
        const result = await this._sponsorTokenWithETHTransaction(sponsorTokenArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async adminWithdrawFiniteChannelRewards(withdrawRewardsArgs) {
        const result = await this._withdrawFiniteRewardsTransaction(withdrawRewardsArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async approveERC20(approveERC20Args) {
        const result = await this._approveERC20(approveERC20Args);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
    async upgradeChannel(upgradeChannelArgs) {
        const result = await this._upgradeChannel(upgradeChannelArgs);
        if (this._isCallData(result)) {
            return result;
        }
        throw new Error('Invalid Response');
    }
}
applyMixins(UplinkClient, [BaseClientMixin]);
class UplinkGasEstimates extends UplinkTransactions {
    constructor({ chainId, publicClient, walletClient, includeEnsNames = false, ensPublicClient, paymasterConfig }) {
        super({
            transactionType: TransactionType.GasEstimate,
            chainId,
            publicClient,
            walletClient,
            includeEnsNames,
            ensPublicClient,
            paymasterConfig
        });
    }
    async createInfiniteChannel(createInfiniteChannelArgs) {
        const gasEstimate = await this._createInfiniteChannelTransaction(createInfiniteChannelArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async createFiniteChannel(createFiniteChannelArgs) {
        const gasEstimate = await this._createFiniteChannelTransaction(createFiniteChannelArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async updateChannelFees(setChannelFeeArgs) {
        const gasEstimate = await this._createUpdateChannelFeesTransaction(setChannelFeeArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async updateChannelLogic(setChannelLogicArgs) {
        const gasEstimate = await this._createUpdateChannelLogicTransaction(setChannelLogicArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async updateChannelMetadata(updateChannelMetadataArgs) {
        const gasEstimate = await this._createUpdateChannelMetadataTransaction(updateChannelMetadataArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async updateInfiniteChannelTransportLayer(updateInfiniteChannelTransportLayerArgs) {
        const gasEstimate = await this._createUpdateInfiniteChannelTransportLayerTransaction(updateInfiniteChannelTransportLayerArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async settleFiniteChannel(settleFiniteChannelArgs) {
        const gasEstimate = await this._createSettleFiniteChannelTransaction(settleFiniteChannelArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async createToken(createTokenArgs) {
        const gasEstimate = await this._createTokenTransaction(createTokenArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async mintTokenWithETH(mintTokenArgs) {
        const gasEstimate = await this._mintTokenBatchWithETHTransaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        });
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async mintTokenBatchWithETH(mintTokenArgs) {
        const gasEstimate = await this._mintTokenBatchWithETHTransaction(mintTokenArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async mintTokenWithERC20(mintTokenArgs) {
        const gasEstimate = await this._mintTokenBatchWithERC20Transaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        });
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async mintTokenBatchWithERC20(mintTokenArgs) {
        const gasEstimate = await this._mintTokenBatchWithERC20Transaction(mintTokenArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async sponsorWithERC20(sponsorTokenArgs) {
        const gasEstimate = await this._sponsorTokenWithERC20Transaction(sponsorTokenArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async sponsorWithETH(sponsorTokenArgs) {
        const gasEstimate = await this._sponsorTokenWithETHTransaction(sponsorTokenArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async adminWithdrawFiniteChannelRewards(withdrawRewardsArgs) {
        const gasEstimate = await this._withdrawFiniteRewardsTransaction(withdrawRewardsArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async approveERC20(approveERC20Args) {
        const gasEstimate = await this._approveERC20(approveERC20Args);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
    async upgradeChannel(upgradeChannelArgs) {
        const gasEstimate = await this._upgradeChannel(upgradeChannelArgs);
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response');
        }
        return gasEstimate;
    }
}
applyMixins(UplinkGasEstimates, [BaseGasEstimatesMixin]);
//# sourceMappingURL=uplink.js.map