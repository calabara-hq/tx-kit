"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UplinkClient = void 0;
const viem_1 = require("viem");
const nanoid_1 = require("nanoid");
const constants_js_1 = require("../constants.js");
const errors_js_1 = require("../errors.js");
const index_js_1 = require("../abi/index.js");
const validate_js_1 = require("../utils/validate.js");
const base_js_1 = require("./base.js");
const mixin_js_1 = require("./mixin.js");
const logic_js_1 = require("../utils/logic.js");
const fees_js_1 = require("../utils/fees.js");
const setupActions_js_1 = require("../utils/setupActions.js");
const transport_js_1 = require("../utils/transport.js");
class UplinkTransactions extends base_js_1.BaseTransactions {
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
        if (!constants_js_1.SUPPORTED_CHAIN_IDS.includes(chainId)) {
            throw new errors_js_1.UnsupportedChainIdError(chainId, constants_js_1.SUPPORTED_CHAIN_IDS);
        }
        this._channelFactoryAbi = index_js_1.channelFactoryAbi;
        this._customFeesAbi = index_js_1.customFeesAbi;
        this._dynamicLogicAbi = index_js_1.dynamicLogicAbi;
        this._channelAbi = index_js_1.channelAbi;
        this._infiniteChannelAbi = index_js_1.infiniteChannelAbi;
        this._finiteChannelAbi = index_js_1.finiteChannelAbi;
        this._rewardsAbi = index_js_1.rewardsAbi;
        this._channelFactoryContract = (0, viem_1.getContract)({
            abi: index_js_1.channelFactoryAbi,
            address: (0, constants_js_1.getChannelFactoryAddress)(chainId),
            client: this._publicClient,
            publicClient: this._publicClient,
        });
        this._customFeesContract = (0, viem_1.getContract)({
            abi: index_js_1.customFeesAbi,
            address: (0, constants_js_1.getCustomFeesAddress)(chainId),
            client: this._publicClient,
            publicClient: this._publicClient,
        });
        this._dynamicLogicContract = (0, viem_1.getContract)({
            abi: index_js_1.dynamicLogicAbi,
            address: viem_1.zeroAddress,
            client: this._publicClient,
            publicClient: this._publicClient,
        });
    }
    async _createInfiniteChannelTransaction({ uri, name, defaultAdmin, managers, setupActions, transportLayer, transactionOverrides = {}, }) {
        (0, validate_js_1.validateInfiniteChannelInputs)({ uri, name, defaultAdmin, managers, setupActions, transportLayer });
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
                (0, setupActions_js_1.createSetupActions)(setupActions),
                (0, transport_js_1.createInfiniteTransportLayerInput)(transportLayer),
            ],
            transactionOverrides
        });
        return result;
    }
    async _createFiniteChannelTransaction({ uri, name, defaultAdmin, managers, setupActions, transportLayer, transactionOverrides = {}, }) {
        (0, validate_js_1.validateFiniteChannelInputs)({ uri, name, defaultAdmin, managers, setupActions, transportLayer });
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
                (0, setupActions_js_1.createSetupActions)(setupActions),
                (0, transport_js_1.createFiniteTransportLayerInput)(transportLayer),
            ],
            transactionOverrides,
        });
        return result;
    }
    async _createUpdateChannelFeesTransaction({ channelAddress, feeContract = this._customFeesContract.address, feeArgs, transactionOverrides = {}, }) {
        (0, validate_js_1.validateAddress)(channelAddress);
        (0, validate_js_1.validateSetFeeInputs)({ feeContract, feeArgs });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._channelAbi,
            functionName: 'setFees',
            functionArgs: [
                feeContract,
                (0, fees_js_1.encodeCustomFeeInputs)(feeArgs)
            ],
            transactionOverrides,
        });
        return result;
    }
    async _createUpdateChannelLogicTransaction({ channelAddress, logicContract = this._dynamicLogicContract.address, creatorLogic, minterLogic, transactionOverrides = {}, }) {
        (0, validate_js_1.validateAddress)(channelAddress);
        (0, validate_js_1.validateAddress)(logicContract);
        (0, validate_js_1.validateSetLogicInputs)(creatorLogic);
        (0, validate_js_1.validateSetLogicInputs)(minterLogic);
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._channelAbi,
            functionName: 'setLogic',
            functionArgs: [
                logicContract,
                (0, logic_js_1.encodeDynamicLogicInputs)(creatorLogic),
                (0, logic_js_1.encodeDynamicLogicInputs)(minterLogic)
            ],
            transactionOverrides,
        });
        return result;
    }
    async _createUpdateInfiniteChannelTransportLayerTransaction({ channelAddress, saleDurationInSeconds, transactionOverrides = {} }) {
        (0, validate_js_1.validateAddress)(channelAddress);
        (0, validate_js_1.validateInfiniteTransportLayer)({ saleDurationInSeconds });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._infiniteChannelAbi,
            functionName: 'setTransportConfig',
            functionArgs: [
                (0, transport_js_1.createInfiniteTransportLayerInput)({ saleDurationInSeconds })
            ],
            transactionOverrides,
        });
        return result;
    }
    async _createUpdateChannelMetadataTransaction({ channelAddress, uri, name, transactionOverrides = {} }) {
        (0, validate_js_1.validateAddress)(channelAddress);
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
        (0, validate_js_1.validateAddress)(channelAddress);
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
        (0, validate_js_1.validateCreateTokenInputs)({ channelAddress, uri, maxSupply });
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
        mintReferral = mintReferral || viem_1.zeroAddress;
        (0, validate_js_1.validateMintTokenBatchInputs)({ channelAddress, to, tokenIds, amounts, mintReferral, data });
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
        mintReferral = mintReferral || viem_1.zeroAddress;
        (0, validate_js_1.validateMintTokenBatchInputs)({ channelAddress, to, tokenIds, amounts, mintReferral, data });
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
        mintReferral = mintReferral || viem_1.zeroAddress;
        await (0, validate_js_1.validateSponsorTokenInputs)({ channelAddress, sponsoredToken, to, amount, mintReferral, data });
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
        mintReferral = mintReferral || viem_1.zeroAddress;
        await (0, validate_js_1.validateSponsorTokenInputs)({ channelAddress, sponsoredToken, to, amount, mintReferral, data });
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
        (0, validate_js_1.validateWithdrawRewardsInputs)({ channelAddress, token, to, amount });
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
        (0, validate_js_1.validateApproveERC20Inputs)({ erc20Contract, spender, amount });
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        const result = await this._executeContractFunction({
            contractAddress: erc20Contract,
            contractAbi: viem_1.erc20Abi,
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
class UplinkClient extends UplinkTransactions {
    constructor({ chainId, publicClient, walletClient, includeEnsNames = false, ensPublicClient, paymasterConfig }) {
        super({
            transactionType: constants_js_1.TransactionType.Transaction,
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
                (0, viem_1.encodeEventTopics)({
                    abi: this._channelFactoryAbi,
                    eventName: 'SetupNewContract',
                })[0]
            ],
            createFiniteChannel: [
                (0, viem_1.encodeEventTopics)({
                    abi: this._channelFactoryAbi,
                    eventName: 'SetupNewContract',
                })[0]
            ],
            configUpdated: [
                (0, viem_1.encodeEventTopics)({
                    abi: this._channelAbi,
                    eventName: 'ConfigUpdated',
                })[0]
            ],
            channelMetadataUpdated: [
                (0, viem_1.encodeEventTopics)({
                    abi: this._channelAbi,
                    eventName: 'ChannelMetadataUpdated',
                })[0]
            ],
            infiniteTransportConfigSet: [
                (0, viem_1.encodeEventTopics)({
                    abi: this._infiniteChannelAbi,
                    eventName: 'InfiniteTransportConfigSet',
                })[0]
            ],
            tokenCreated: [
                (0, viem_1.encodeEventTopics)({
                    abi: this._channelAbi,
                    eventName: 'TokenCreated'
                })[0]
            ],
            tokenMinted: [
                (0, viem_1.encodeEventTopics)({
                    abi: this._channelAbi,
                    eventName: 'TokenMinted'
                })[0]
            ],
            settled: [
                (0, viem_1.encodeEventTopics)({
                    abi: this._finiteChannelAbi,
                    eventName: 'Settled'
                })[0]
            ],
            ethTransferred: [
                (0, viem_1.encodeEventTopics)({
                    abi: this._rewardsAbi,
                    eventName: 'ETHTransferred'
                })[0]
            ],
            erc20Transferred: [
                (0, viem_1.encodeEventTopics)({
                    abi: this._rewardsAbi,
                    eventName: 'ERC20Transferred'
                })[0]
            ],
            erc20Approved: [
                (0, viem_1.encodeEventTopics)({
                    abi: viem_1.erc20Abi,
                    eventName: 'Approval'
                })[0]
            ],
            upgraded: [
                (0, viem_1.encodeEventTopics)({
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
    }
    createDeferredTokenIntent(createTokenArgs) {
        (0, validate_js_1.validateCreateTokenInputs)(createTokenArgs);
        if (this._shouldRequireWalletClient)
            this._requireWalletClient();
        if (!this._walletClient?.account)
            throw new Error();
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
                    deadline: BigInt(Math.floor(Date.now() / 1000)) + constants_js_1.INTENT_DURATION,
                    nonce: `0x${(0, nanoid_1.customAlphabet)('0123456789abcdef', 64)}`
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
        const parsedSignature = (0, viem_1.parseErc6492Signature)(signature).signature;
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
    }
    async mintTokenBatchWithETH(mintTokenArgs) {
        const { txHash } = await this.submitMintTokenBatchWithETHTransaction(mintTokenArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
    }
    async mintTokenBatchWithERC20(mintTokenArgs) {
        const { txHash } = await this.submitMintTokenBatchWithERC20Transaction(mintTokenArgs);
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        });
        const event = events.length > 0 ? events[0] : undefined;
        if (event) {
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
                abi: viem_1.erc20Abi,
                data: event.data,
                topics: event.topics,
            });
            if (log.eventName !== 'Approval')
                throw new Error();
            return {
                event
            };
        }
        throw new errors_js_1.TransactionFailedError();
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
            const log = (0, viem_1.decodeEventLog)({
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
        throw new errors_js_1.TransactionFailedError();
    }
}
exports.UplinkClient = UplinkClient;
class UplinkCallData extends UplinkTransactions {
    constructor({ chainId, publicClient, walletClient, includeEnsNames = false, ensPublicClient, paymasterConfig }) {
        super({
            transactionType: constants_js_1.TransactionType.CallData,
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
(0, mixin_js_1.applyMixins)(UplinkClient, [base_js_1.BaseClientMixin]);
class UplinkGasEstimates extends UplinkTransactions {
    constructor({ chainId, publicClient, walletClient, includeEnsNames = false, ensPublicClient, paymasterConfig }) {
        super({
            transactionType: constants_js_1.TransactionType.GasEstimate,
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
(0, mixin_js_1.applyMixins)(UplinkGasEstimates, [base_js_1.BaseGasEstimatesMixin]);
//# sourceMappingURL=uplink.js.map