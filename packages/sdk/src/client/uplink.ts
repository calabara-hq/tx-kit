import {
    Address,
    Hash,
    Hex,
    Log,
    decodeEventLog,
    encodeEventTopics,
    erc20Abi,
    getContract,
    zeroAddress,
} from 'viem'

import { randomBytes } from 'crypto'
import { getChannelFactoryAddress, getCustomFeesAddress, INTENT_DURATION, SUPPORTED_CHAIN_IDS, TransactionType } from "../constants"
import { ApproveERC20Config, CallData, CreateFiniteChannelConfig, CreateInfiniteChannelConfig, CreateTokenConfig, DeferredTokenIntent, DeferredTokenIntentWithSignature, MintTokenBatchConfig, MintTokenConfig, SetChannelFeeConfig, SetChannelLogicConfig, SponsorTokenConfig, TransactionConfig, TransactionFormat, TransactionOverridesDict, TransmissionsClientConfig, UpdateChannelMetadataConfig, UpdateInfiniteChannelTransportLayerConfig, WithdrawRewardsConfig } from "../types"
import { TransactionFailedError, UnsupportedChainIdError } from '../errors'

import { channelAbi, channelFactoryAbi, customFeesAbi, dynamicLogicAbi, finiteChannelAbi, infiniteChannelAbi, rewardsAbi } from '../abi/index'
import { validateAddress, validateApproveERC20Inputs, validateCreateTokenInputs, validateFiniteChannelInputs, validateInfiniteChannelInputs, validateInfiniteTransportLayer, validateMintTokenBatchInputs, validateSetFeeInputs, validateSetLogicInputs, validateSponsorTokenInputs, validateWithdrawRewardsInputs } from '../utils/validate'
import { BaseClientMixin, BaseGasEstimatesMixin, BaseTransactions } from './base'
import { applyMixins } from './mixin'
import { encodeDynamicLogicInputs } from '../utils/logic'
import { encodeCustomFeeInputs } from '../utils/fees'
import { createSetupActions } from '../utils/setupActions'
import { createFiniteTransportLayerInput, createInfiniteTransportLayerInput } from '../utils/transport'
import { extractVRSfromSignature } from '../utils/signatures'


class UplinkTransactions extends BaseTransactions {
    protected readonly _channelFactoryAbi
    protected readonly _customFeesAbi
    protected readonly _dynamicLogicAbi
    protected readonly _channelAbi
    protected readonly _infiniteChannelAbi
    protected readonly _finiteChannelAbi
    protected readonly _rewardsAbi

    protected readonly _channelFactoryContract
    protected readonly _customFeesContract
    protected readonly _dynamicLogicContract

    constructor({
        transactionType,
        chainId,
        publicClient,
        ensPublicClient,
        walletClient,
        includeEnsNames = false,
    }: TransmissionsClientConfig & TransactionConfig) {
        super({
            transactionType,
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
        })

        if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
            throw new UnsupportedChainIdError(chainId, SUPPORTED_CHAIN_IDS)
        }

        /// abis
        this._channelFactoryAbi = channelFactoryAbi
        this._customFeesAbi = customFeesAbi
        this._dynamicLogicAbi = dynamicLogicAbi
        this._channelAbi = channelAbi
        this._infiniteChannelAbi = infiniteChannelAbi
        this._finiteChannelAbi = finiteChannelAbi
        this._rewardsAbi = rewardsAbi

        /// contracts
        this._channelFactoryContract = getContract({
            abi: channelFactoryAbi,
            address: getChannelFactoryAddress(chainId),
            // @ts-expect-error v1/v2 viem support
            client: this._publicClient,
            publicClient: this._publicClient,
        })

        this._customFeesContract = getContract({
            abi: customFeesAbi,
            address: getCustomFeesAddress(chainId),
            // @ts-expect-error v1/v2 viem support
            client: this._publicClient,
            publicClient: this._publicClient,
        })

        this._dynamicLogicContract = getContract({
            abi: dynamicLogicAbi,
            address: zeroAddress,
            // @ts-expect-error v1/v2 viem support
            client: this._publicClient,
            publicClient: this._publicClient,
        })


    }

    protected async _createInfiniteChannelTransaction({
        uri,
        name,
        defaultAdmin,
        managers,
        setupActions,
        transportLayer,
        transactionOverrides = {},
    }: CreateInfiniteChannelConfig): Promise<TransactionFormat> {

        validateInfiniteChannelInputs({ uri, name, defaultAdmin, managers, setupActions, transportLayer });

        if (this._shouldRequireWalletClient) this._requireWalletClient();

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
        })

        return result;
    }

    protected async _createFiniteChannelTransaction({
        uri,
        name,
        defaultAdmin,
        managers,
        setupActions,
        transportLayer,
        transactionOverrides = {},
    }: CreateFiniteChannelConfig): Promise<TransactionFormat> {

        validateFiniteChannelInputs({ uri, name, defaultAdmin, managers, setupActions, transportLayer });

        if (this._shouldRequireWalletClient) this._requireWalletClient();

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
        })

        return result;
    }

    protected async _createUpdateChannelFeesTransaction({
        channelAddress,
        feeContract = this._customFeesContract.address,
        feeArgs,
        transactionOverrides = {},
    }: SetChannelFeeConfig): Promise<TransactionFormat> {

        validateAddress(channelAddress)
        validateSetFeeInputs({ feeContract, feeArgs })

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
            contractAbi: this._channelAbi,
            functionName: 'setFees',
            functionArgs: [
                feeContract,
                encodeCustomFeeInputs(feeArgs)
            ],
            transactionOverrides,
        })

        return result
    }

    protected async _createUpdateChannelLogicTransaction({
        channelAddress,
        logicContract = this._dynamicLogicContract.address,
        creatorLogic,
        minterLogic,
        transactionOverrides = {},
    }: SetChannelLogicConfig): Promise<TransactionFormat> {

        validateAddress(channelAddress)
        validateAddress(logicContract)
        validateSetLogicInputs(creatorLogic)
        validateSetLogicInputs(minterLogic)

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
            contractAbi: this._channelAbi,
            functionName: 'setLogic',
            functionArgs: [
                logicContract,
                encodeDynamicLogicInputs(creatorLogic),
                encodeDynamicLogicInputs(minterLogic)
            ],
            transactionOverrides,
        })

        return result
    }

    protected async _createUpdateInfiniteChannelTransportLayerTransaction({
        channelAddress,
        saleDurationInSeconds,
        transactionOverrides = {}
    }: UpdateInfiniteChannelTransportLayerConfig): Promise<TransactionFormat> {
        validateAddress(channelAddress)
        validateInfiniteTransportLayer({ saleDurationInSeconds })

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
            contractAbi: this._infiniteChannelAbi,
            functionName: 'setTransportConfig',
            functionArgs: [
                createInfiniteTransportLayerInput({ saleDurationInSeconds })
            ],
            transactionOverrides,
        })

        return result
    }


    protected async _createUpdateChannelMetadataTransaction({
        channelAddress,
        uri,
        name,
        transactionOverrides = {}
    }: UpdateChannelMetadataConfig): Promise<TransactionFormat> {
        validateAddress(channelAddress)

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
            contractAbi: this._channelAbi,
            functionName: 'updateChannelMetadata',
            functionArgs: [
                name,
                uri
            ],
            transactionOverrides,
        })

        return result
    }

    protected async _createSettleFiniteChannelTransaction({
        channelAddress,
        transactionOverrides = {}
    }: { channelAddress: Address } & TransactionOverridesDict): Promise<TransactionFormat> {
        validateAddress(channelAddress)

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: channelAddress,
            contractAbi: this._finiteChannelAbi,
            functionName: 'settle',
            transactionOverrides,
        })

        return result
    }

    protected async _createTokenTransaction({
        channelAddress,
        uri,
        maxSupply,
        transactionOverrides = {}
    }: CreateTokenConfig): Promise<TransactionFormat> {

        validateCreateTokenInputs({ channelAddress, uri, maxSupply })

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
            contractAbi: [...this._infiniteChannelAbi, ...this._finiteChannelAbi],
            functionName: 'createToken',
            functionArgs: [
                uri,
                maxSupply
            ],
            transactionOverrides,
        })

        return result
    }

    protected async _mintTokenBatchWithETHTransaction({
        channelAddress,
        to,
        tokenIds,
        amounts,
        mintReferral,
        data,
        transactionOverrides = {}
    }: MintTokenBatchConfig): Promise<TransactionFormat> {

        mintReferral = mintReferral || zeroAddress

        validateMintTokenBatchInputs({ channelAddress, to, tokenIds, amounts, mintReferral, data })

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
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
        })
        return result
    }

    protected async _mintTokenBatchWithERC20Transaction({
        channelAddress,
        to,
        tokenIds,
        amounts,
        mintReferral,
        data,
        transactionOverrides = {}
    }: MintTokenBatchConfig): Promise<TransactionFormat> {

        mintReferral = mintReferral || zeroAddress

        validateMintTokenBatchInputs({ channelAddress, to, tokenIds, amounts, mintReferral, data })

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
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
        })
        return result
    }

    protected async _sponsorTokenWithETHTransaction({
        channelAddress,
        sponsoredToken,
        to,
        amount,
        mintReferral,
        data,
        transactionOverrides = {}
    }: SponsorTokenConfig): Promise<TransactionFormat> {

        mintReferral = mintReferral || zeroAddress

        await validateSponsorTokenInputs({ channelAddress, sponsoredToken, to, amount, mintReferral, data });

        const { v, r, s } = extractVRSfromSignature(sponsoredToken.signature);

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
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
                v,
                r,
                s,
                to,
                BigInt(amount),
                mintReferral,
                data as Hex
            ],
            transactionOverrides
        });
        return result;
    }

    protected async _sponsorTokenWithERC20Transaction({
        channelAddress,
        sponsoredToken,
        to,
        amount,
        mintReferral,
        data,
        transactionOverrides = {}
    }: SponsorTokenConfig): Promise<TransactionFormat> {

        mintReferral = mintReferral || zeroAddress

        await validateSponsorTokenInputs({ channelAddress, sponsoredToken, to, amount, mintReferral, data })

        const { v, r, s } = extractVRSfromSignature(sponsoredToken.signature)

        if (this._shouldRequireWalletClient) this._requireWalletClient()

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
            contractAbi: [...this._finiteChannelAbi, ...this._infiniteChannelAbi],
            functionName: 'sponsorWithERC20',
            functionArgs: [
                sponsoredToken.intent.message,
                sponsoredToken.author,
                v,
                r,
                s,
                to,
                amount,
                mintReferral,
                data
            ],
            transactionOverrides
        })
        return result

    }

    protected async _withdrawFiniteRewardsTransaction({
        channelAddress,
        token,
        to,
        amount,
        transactionOverrides = {}
    }: WithdrawRewardsConfig): Promise<TransactionFormat> {

        validateWithdrawRewardsInputs({ channelAddress, token, to, amount })

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: channelAddress as Address,
            contractAbi: this._finiteChannelAbi,
            functionName: 'withdrawRewards',
            functionArgs: [
                token,
                to,
                amount
            ],
            transactionOverrides
        })
        return result
    }

    protected async _approveERC20({
        erc20Contract,
        spender,
        amount,
        transactionOverrides = {}
    }: ApproveERC20Config): Promise<TransactionFormat> {

        validateApproveERC20Inputs({ erc20Contract, spender, amount })

        if (this._shouldRequireWalletClient) this._requireWalletClient();

        const result = await this._executeContractFunction({
            contractAddress: erc20Contract as Address,
            contractAbi: erc20Abi,
            functionName: 'approve',
            functionArgs: [
                spender,
                amount
            ],
            transactionOverrides
        })
        return result
    }

}



export class UplinkClient extends UplinkTransactions {
    readonly eventTopics: { [key: string]: Hex[] }
    readonly callData: UplinkCallData
    readonly estimateGas: UplinkGasEstimates

    constructor({
        chainId,
        publicClient,
        walletClient,
        includeEnsNames = false,
        ensPublicClient,
    }: TransmissionsClientConfig) {
        super({
            transactionType: TransactionType.Transaction,
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
        })

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
            ]
        }

        this.callData = new UplinkCallData({
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
        })
        this.estimateGas = new UplinkGasEstimates({
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
        })
    }


    async submitCreateInfiniteChannelTransaction(
        createInfiniteChannelArgs: CreateInfiniteChannelConfig
    ): Promise<{ txHash: Hash }> {
        const txHash = await this._createInfiniteChannelTransaction(createInfiniteChannelArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async createInfiniteChannel(createInfiniteChannelArgs: CreateInfiniteChannelConfig): Promise<{ contractAddress: Address, event: Log }> {
        const { txHash } = await this.submitCreateInfiniteChannelTransaction(createInfiniteChannelArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.createInfiniteChannel
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelFactoryAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'SetupNewContract') throw new Error()
            return {
                contractAddress: log.args.contractAddress,
                event,
            }
        }
        throw new TransactionFailedError()
    }


    async submitCreateFiniteChannelTransaction(
        createFiniteChannelArgs: CreateFiniteChannelConfig
    ): Promise<{ txHash: Hash }> {
        const txHash = await this._createFiniteChannelTransaction(createFiniteChannelArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async createFiniteChannel(createFiniteChannelArgs: CreateFiniteChannelConfig): Promise<{ contractAddress: Address, event: Log }> {
        const { txHash } = await this.submitCreateFiniteChannelTransaction(createFiniteChannelArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.createFiniteChannel
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelFactoryAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'SetupNewContract') throw new Error()
            return {
                contractAddress: log.args.contractAddress,
                event,
            }
        }
        throw new TransactionFailedError()
    }

    async submitUpdateChannelFeesTransaction(
        updateChannelFeeArgs: SetChannelFeeConfig
    ): Promise<{ txHash: Hash }> {
        const txHash = await this._createUpdateChannelFeesTransaction(updateChannelFeeArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async updateChannelFees(updateChannelFeeArgs: SetChannelFeeConfig): Promise<{ event: Log }> {
        const { txHash } = await this.submitUpdateChannelFeesTransaction(updateChannelFeeArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.configUpdated
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'ConfigUpdated') throw new Error()
            return {
                event
            }
        }
        throw new TransactionFailedError()
    }


    async submitUpdateChannelLogicTransaction(
        updateChanelLogicArgs: SetChannelLogicConfig
    ): Promise<{ txHash: Hash }> {
        const txHash = await this._createUpdateChannelLogicTransaction(updateChanelLogicArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }


    async updateChannelLogic(updateChanelLogicArgs: SetChannelLogicConfig): Promise<{ event: Log }> {
        const { txHash } = await this.submitUpdateChannelLogicTransaction(updateChanelLogicArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.configUpdated
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'ConfigUpdated') throw new Error();
            return {
                event
            }
        }
        throw new TransactionFailedError()
    }

    async submitUpdateInfiniteChannelTransportLayerTransaction(
        updateInfiniteChannelTransportLayerArgs: UpdateInfiniteChannelTransportLayerConfig
    ): Promise<{ txHash: Hash }> {
        const txHash = await this._createUpdateInfiniteChannelTransportLayerTransaction(updateInfiniteChannelTransportLayerArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async updateInfiniteChannelTransportLayer(updateInfiniteChannelTransportLayerArgs: UpdateInfiniteChannelTransportLayerConfig): Promise<{ event: Log }> {
        const { txHash } = await this.submitUpdateInfiniteChannelTransportLayerTransaction(updateInfiniteChannelTransportLayerArgs)

        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.infiniteTransportConfigSet
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._infiniteChannelAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'InfiniteTransportConfigSet') throw new Error();
            return {
                event
            }
        }
        throw new TransactionFailedError()
    }

    async submitUpdateChannelMetadataTransaction(
        updateChannelMetadataArgs: UpdateChannelMetadataConfig
    ): Promise<{ txHash: Hash }> {
        const txHash = await this._createUpdateChannelMetadataTransaction(updateChannelMetadataArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async updateChannelMetadata(updateChannelMetadataArgs: UpdateChannelMetadataConfig): Promise<{ uri: string, channelName: string, event: Log }> {
        const { txHash } = await this.submitUpdateChannelMetadataTransaction(updateChannelMetadataArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.channelMetadataUpdated
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'ChannelMetadataUpdated') throw new Error()
            return {
                uri: log.args.uri,
                channelName: log.args.channelName,
                event
            }
        }
        throw new TransactionFailedError()
    }

    async submitSettleFiniteChannelTransaction(
        settleFiniteChannelArgs: { channelAddress: Address }
    ): Promise<{ txHash: Hash }> {
        const txHash = await this._createSettleFiniteChannelTransaction(settleFiniteChannelArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async settleFiniteChannel(settleFiniteChannelArgs: { channelAddress: Address }): Promise<{ event: Log }> {
        const { txHash } = await this.submitSettleFiniteChannelTransaction(settleFiniteChannelArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.settled
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._finiteChannelAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'Settled') throw new Error()
            return {
                event
            }
        }
        throw new TransactionFailedError()
    }

    createDeferredTokenIntent(createTokenArgs: CreateTokenConfig): DeferredTokenIntent {
        validateCreateTokenInputs(createTokenArgs)

        if (this._shouldRequireWalletClient) this._requireWalletClient()
        if (!this._walletClient?.account) throw new Error()

        return {
            author: this._walletClient?.account.address as Address,
            intent: {
                domain: {
                    name: "Transmissions",
                    version: "1",
                    chainId: this._chainId,
                    verifyingContract: createTokenArgs.channelAddress as Address
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
                    nonce: `0x${randomBytes(32).toString('hex')}` as Hex
                }
            }
        }
    }

    async signDeferredTokenIntent(args: DeferredTokenIntent): Promise<DeferredTokenIntentWithSignature> {
        if (this._shouldRequireWalletClient) this._requireWalletClient()
        if (!this._walletClient?.account) throw new Error()

        const signature = await this._walletClient.signTypedData(args.intent)
        return {
            ...args,
            signature
        }
    }


    async submitCreateTokenTransaction(
        createTokenArgs: CreateTokenConfig
    ): Promise<{ txHash: Hash }> {
        const txHash = await this._createTokenTransaction(createTokenArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async createToken(createTokenArgs: CreateTokenConfig): Promise<{ tokenId: bigint, event: Log }> {
        const { txHash } = await this.submitCreateTokenTransaction(createTokenArgs)

        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenCreated
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: [...this._finiteChannelAbi, ...this._infiniteChannelAbi],
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'TokenCreated') throw new Error()
            return {
                tokenId: log.args.tokenId,
                event
            }
        }
        throw new TransactionFailedError()
    }

    async submitMintTokenBatchWithETHTransaction(mintTokenArgs: MintTokenBatchConfig): Promise<{ txHash: Hash }> {
        const txHash = await this._mintTokenBatchWithETHTransaction(mintTokenArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async mintTokenWithETH(mintTokenArgs: MintTokenConfig): Promise<{ event: Log }> {
        const { txHash } = await this.submitMintTokenBatchWithETHTransaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        })

        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'TokenMinted') throw new Error()
            return {
                event
            }
        }
        throw new TransactionFailedError()
    }


    async mintTokenBatchWithETH(mintTokenArgs: MintTokenBatchConfig): Promise<{ event: Log }> {
        const { txHash } = await this.submitMintTokenBatchWithETHTransaction(mintTokenArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'TokenMinted') throw new Error()
            return {
                event
            }
        }
        throw new TransactionFailedError()
    }

    async submitMintTokenBatchWithERC20Transaction(mintTokenArgs: MintTokenBatchConfig): Promise<{ txHash: Hash }> {
        const txHash = await this._mintTokenBatchWithERC20Transaction(mintTokenArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async mintTokenWithERC20(mintTokenArgs: MintTokenConfig): Promise<{ event: Log }> {
        const { txHash } = await this.submitMintTokenBatchWithERC20Transaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        })

        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'TokenMinted') throw new Error()
            return {
                event
            }
        }
        throw new TransactionFailedError()
    }

    async mintTokenBatchWithERC20(mintTokenArgs: MintTokenBatchConfig): Promise<{ event: Log }> {
        const { txHash } = await this.submitMintTokenBatchWithERC20Transaction(mintTokenArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'TokenMinted') throw new Error()
            return {
                event
            }
        }
        throw new TransactionFailedError()
    }

    async submitSponsorTokenWithERC20Transaction(sponsorTokenArgs: SponsorTokenConfig): Promise<{ txHash: Hash }> {
        const txHash = await this._sponsorTokenWithERC20Transaction(sponsorTokenArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async sponsorWithERC20(sponsorTokenArgs: SponsorTokenConfig): Promise<{ tokenId: bigint, event: Log }> {
        const { txHash } = await this.submitSponsorTokenWithERC20Transaction(sponsorTokenArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: [...this._infiniteChannelAbi, ...this._finiteChannelAbi],
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'TokenMinted') throw new Error()
            return {
                event,
                tokenId: log.args.tokenIds[0]
            }
        }
        throw new TransactionFailedError()
    }

    async submitSponsorTokenWithETHTransaction(sponsorTokenArgs: SponsorTokenConfig): Promise<{ txHash: Hash }> {
        const txHash = await this._sponsorTokenWithETHTransaction(sponsorTokenArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async sponsorWithETH(sponsorTokenArgs: SponsorTokenConfig): Promise<{ tokenId: bigint, event: Log }> {
        const { txHash } = await this.submitSponsorTokenWithETHTransaction(sponsorTokenArgs)
        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.tokenMinted
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: [...this._infiniteChannelAbi, ...this._finiteChannelAbi],
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'TokenMinted') throw new Error()
            return {
                event,
                tokenId: log.args.tokenIds[0]
            }
        }
        throw new TransactionFailedError()
    }


    async submitWithdrawRewardsTransaction(withdrawRewardsArgs: WithdrawRewardsConfig): Promise<{ txHash: Hash }> {
        const txHash = await this._withdrawFiniteRewardsTransaction(withdrawRewardsArgs)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async adminWithdrawFiniteChannelRewards(withdrawRewardsArgs: WithdrawRewardsConfig): Promise<{ success: boolean, event: Log }> {
        const { txHash } = await this.submitWithdrawRewardsTransaction(withdrawRewardsArgs)

        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: [...this.eventTopics.ethTransferred, ...this.eventTopics.erc20Transferred]
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: this._channelAbi,
                data: event.data,
                topics: event.topics,
            })

            if (log.eventName !== 'ETHTransferred' && log.eventName !== 'ERC20Transferred') throw new Error()
            return {
                success: true,
                event
            }
        }
        throw new TransactionFailedError()
    }


    async submitApproveERC20Transaction(approveERC20Args: ApproveERC20Config): Promise<{ txHash: Hash }> {
        const txHash = await this._approveERC20(approveERC20Args)

        if (!this._isContractTransaction(txHash)) {
            throw new Error('Invalid Response')
        }

        return { txHash }
    }

    async approveERC20(approveERC20Args: ApproveERC20Config): Promise<{ event: Log }> {
        const { txHash } = await this.submitApproveERC20Transaction(approveERC20Args)

        const events = await this.getTransactionEvents({
            txHash,
            eventTopics: this.eventTopics.erc20Approved
        })

        const event = events.length > 0 ? events[0] : undefined

        if (event) {
            const log = decodeEventLog({
                abi: erc20Abi,
                data: event.data,
                topics: event.topics,
            })
            if (log.eventName !== 'Approval') throw new Error()
            return {
                event
            }
        }
        throw new TransactionFailedError()
    }

}


class UplinkCallData extends UplinkTransactions {
    constructor({
        chainId,
        publicClient,
        walletClient,
        includeEnsNames = false,
        ensPublicClient,
    }: TransmissionsClientConfig) {
        super({
            transactionType: TransactionType.CallData,
            chainId,
            publicClient,
            walletClient,
            includeEnsNames,
            ensPublicClient,
        })
    }


    async createInfiniteChannel(createInfiniteChannelArgs: CreateInfiniteChannelConfig): Promise<CallData> {
        const result = await this._createInfiniteChannelTransaction(createInfiniteChannelArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async createFiniteChannel(createFiniteChannelArgs: CreateFiniteChannelConfig): Promise<CallData> {
        const result = await this._createFiniteChannelTransaction(createFiniteChannelArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async updateChannelFees(updateChannelFeeArgs: SetChannelFeeConfig): Promise<CallData> {
        const result = await this._createUpdateChannelFeesTransaction(updateChannelFeeArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async updateChannelLogic(updateChanelLogicArgs: SetChannelLogicConfig): Promise<CallData> {
        const result = await this._createUpdateChannelLogicTransaction(updateChanelLogicArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async updateChannelMetadata(updateChannelMetadataArgs: UpdateChannelMetadataConfig): Promise<CallData> {
        const result = await this._createUpdateChannelMetadataTransaction(updateChannelMetadataArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async updateInfiniteChannelTransportLayer(updateInfiniteChannelTransportLayerArgs: UpdateInfiniteChannelTransportLayerConfig): Promise<CallData> {
        const result = await this._createUpdateInfiniteChannelTransportLayerTransaction(updateInfiniteChannelTransportLayerArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async settleFiniteChannel(settleFiniteChannelArgs: { channelAddress: Address }): Promise<CallData> {
        const result = await this._createSettleFiniteChannelTransaction(settleFiniteChannelArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async createToken(createTokenArgs: CreateTokenConfig): Promise<CallData> {
        const result = await this._createTokenTransaction(createTokenArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async mintTokenWithETH(mintTokenArgs: MintTokenConfig): Promise<CallData> {
        const result = await this._mintTokenBatchWithETHTransaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        })
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async mintTokenBatchWithETH(mintTokenArgs: MintTokenBatchConfig): Promise<CallData> {
        const result = await this._mintTokenBatchWithETHTransaction(mintTokenArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async mintTokenWithERC20(mintTokenArgs: MintTokenConfig): Promise<CallData> {
        const result = await this._mintTokenBatchWithERC20Transaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        })
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async mintTokenBatchWithERC20(mintTokenArgs: MintTokenBatchConfig): Promise<CallData> {
        const result = await this._mintTokenBatchWithERC20Transaction(mintTokenArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async sponsorWithERC20(sponsorTokenArgs: SponsorTokenConfig): Promise<CallData> {
        const result = await this._sponsorTokenWithERC20Transaction(sponsorTokenArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async sponsorWithETH(sponsorTokenArgs: SponsorTokenConfig): Promise<CallData> {
        const result = await this._sponsorTokenWithETHTransaction(sponsorTokenArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async adminWithdrawFiniteChannelRewards(withdrawRewardsArgs: WithdrawRewardsConfig): Promise<CallData> {
        const result = await this._withdrawFiniteRewardsTransaction(withdrawRewardsArgs)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }

    async approveERC20(approveERC20Args: ApproveERC20Config): Promise<CallData> {
        const result = await this._approveERC20(approveERC20Args)
        if (this._isCallData(result)) {
            return result
        }
        throw new Error('Invalid Response')
    }
}


export interface UplinkClient extends BaseClientMixin { }
applyMixins(UplinkClient, [BaseClientMixin])


class UplinkGasEstimates extends UplinkTransactions {
    constructor({
        chainId,
        publicClient,
        walletClient,
        includeEnsNames = false,
        ensPublicClient,
    }: TransmissionsClientConfig) {
        super({
            transactionType: TransactionType.GasEstimate,
            chainId,
            publicClient,
            walletClient,
            includeEnsNames,
            ensPublicClient,
        })
    }

    async createInfiniteChannel(createInfiniteChannelArgs: CreateInfiniteChannelConfig): Promise<bigint> {
        const gasEstimate = await this._createInfiniteChannelTransaction(createInfiniteChannelArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async createFiniteChannel(createFiniteChannelArgs: CreateFiniteChannelConfig): Promise<bigint> {
        const gasEstimate = await this._createFiniteChannelTransaction(createFiniteChannelArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async updateChannelFees(setChannelFeeArgs: SetChannelFeeConfig): Promise<bigint> {
        const gasEstimate = await this._createUpdateChannelFeesTransaction(setChannelFeeArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async updateChannelLogic(setChannelLogicArgs: SetChannelLogicConfig): Promise<bigint> {
        const gasEstimate = await this._createUpdateChannelLogicTransaction(setChannelLogicArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async updateChannelMetadata(updateChannelMetadataArgs: UpdateChannelMetadataConfig): Promise<bigint> {
        const gasEstimate = await this._createUpdateChannelMetadataTransaction(updateChannelMetadataArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async updateInfiniteChannelTransportLayer(updateInfiniteChannelTransportLayerArgs: UpdateInfiniteChannelTransportLayerConfig): Promise<bigint> {
        const gasEstimate = await this._createUpdateInfiniteChannelTransportLayerTransaction(updateInfiniteChannelTransportLayerArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async settleFiniteChannel(settleFiniteChannelArgs: { channelAddress: Address }): Promise<bigint> {
        const gasEstimate = await this._createSettleFiniteChannelTransaction(settleFiniteChannelArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async createToken(createTokenArgs: CreateTokenConfig): Promise<bigint> {
        const gasEstimate = await this._createTokenTransaction(createTokenArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async mintTokenWithETH(mintTokenArgs: MintTokenConfig): Promise<bigint> {
        const gasEstimate = await this._mintTokenBatchWithETHTransaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        })
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async mintTokenBatchWithETH(mintTokenArgs: MintTokenBatchConfig): Promise<bigint> {
        const gasEstimate = await this._mintTokenBatchWithETHTransaction(mintTokenArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async mintTokenWithERC20(mintTokenArgs: MintTokenConfig): Promise<bigint> {
        const gasEstimate = await this._mintTokenBatchWithERC20Transaction({
            ...mintTokenArgs,
            tokenIds: [mintTokenArgs.tokenId],
            amounts: [mintTokenArgs.amount]
        })
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async mintTokenBatchWithERC20(mintTokenArgs: MintTokenBatchConfig): Promise<bigint> {
        const gasEstimate = await this._mintTokenBatchWithERC20Transaction(mintTokenArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async sponsorWithERC20(sponsorTokenArgs: SponsorTokenConfig): Promise<bigint> {
        const gasEstimate = await this._sponsorTokenWithERC20Transaction(sponsorTokenArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async sponsorWithETH(sponsorTokenArgs: SponsorTokenConfig): Promise<bigint> {
        const gasEstimate = await this._sponsorTokenWithETHTransaction(sponsorTokenArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async adminWithdrawFiniteChannelRewards(withdrawRewardsArgs: WithdrawRewardsConfig): Promise<bigint> {
        const gasEstimate = await this._withdrawFiniteRewardsTransaction(withdrawRewardsArgs)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

    async approveERC20(approveERC20Args: ApproveERC20Config): Promise<bigint> {
        const gasEstimate = await this._approveERC20(approveERC20Args)
        if (!this._isBigInt(gasEstimate)) {
            throw new Error('Invalid Response')
        }
        return gasEstimate
    }

}

interface UplinkGasEstimates extends BaseGasEstimatesMixin { }
applyMixins(UplinkGasEstimates, [BaseGasEstimatesMixin])