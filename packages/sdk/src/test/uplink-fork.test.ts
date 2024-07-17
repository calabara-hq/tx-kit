import { testClient, walletClient, publicClient, BOB, CHANNEL_TREASURY, debugClient, resetBlockchainState, increaseEvmTime } from "./forkUtils"
import { UplinkClient } from '../client/uplink'
import { baseSepolia } from 'viem/chains'
import { Abi, Account, Address, Chain, ContractFunctionExecutionError, decodeEventLog, encodeAbiParameters, encodeEventTopics, isAddress, parseEther, PublicClient, Transport, WalletClient, zeroAddress } from 'viem'
import { ChannelFeeArguments, ChannelLogicArguments, CreateFiniteChannelConfig, CreateInfiniteChannelConfig, SetupAction } from '../types'
import { getChannelFactoryAddress, getCustomFeesAddress, NATIVE_TOKEN } from "../constants"
import { baseSepoliaWETH, GENERIC_ERC20_ABI, balanceOfERC20, allowanceOfERC20, mintERC20, setERC20Approval, ALICE } from "./forkUtils"
import { UniformInteractionPower } from "../utils/logic"
import { channelAbi, channelFactoryAbi, finiteChannelAbi, infiniteChannelAbi } from "../abi/abi"

import { describe, expect, test, beforeAll, beforeEach, afterEach, vi } from 'vitest'


const CUSTOM_FEES = getCustomFeesAddress(baseSepolia.id)
const DYNAMIC_LOGIC = zeroAddress

const erc20BalanceOfData = encodeAbiParameters([{ type: "address", name: "address" }], [zeroAddress])

const setupActions: SetupAction[] = [
    {
        feeContract: CUSTOM_FEES,
        feeArgs: {
            channelTreasury: CHANNEL_TREASURY,
            uplinkPercentage: 10,
            channelPercentage: 15,
            creatorPercentage: 60,
            mintReferralPercentage: 5,
            sponsorPercentage: 10,
            ethMintPrice: parseEther('0.000666'),
            erc20MintPrice: parseEther('0.000666'),
            erc20Contract: baseSepoliaWETH
        }
    },
    {
        logicContract: DYNAMIC_LOGIC,
        creatorLogic: [],//[new UniformInteractionPower(BigInt(10)).ifResultOf(baseSepoliaWETH, '0x70a08231', erc20BalanceOfData).gt(BigInt(1))],
        minterLogic: []//[new UniformInteractionPower(BigInt(10)).ifResultOf(baseSepoliaWETH, '0x70a08231', erc20BalanceOfData).gt(BigInt(1))]
    }
]


const generateInfiniteChannelArgs = (): CreateInfiniteChannelConfig => {
    return {
        uri: 'https://sample.com',
        name: 'channel name',
        defaultAdmin: ALICE,
        managers: [],
        setupActions: setupActions,
        transportLayer: { saleDurationInSeconds: 100 }
    }
}


const generateFiniteChannelArgs = async (): Promise<CreateFiniteChannelConfig> => {
    const blockTimestamp = await publicClient.getBlock().then(data => Number(data.timestamp))

    return {
        uri: 'https://sample.com',
        name: 'channel name',
        defaultAdmin: ALICE,
        managers: [],
        setupActions: setupActions,
        transportLayer: {
            createStartInSeconds: blockTimestamp,
            mintStartInSeconds: blockTimestamp + 30,
            mintEndInSeconds: blockTimestamp + 60,
            rewards: {
                ranks: [1],
                allocations: [parseEther('0.000777')],
                totalAllocation: parseEther('0.000777'),
                token: NATIVE_TOKEN
            }
        }
    }
}

const createClient = (account: Address): UplinkClient => {
    return new UplinkClient({
        chainId: baseSepolia.id,
        publicClient: publicClient as PublicClient<Transport, Chain>,
        walletClient: walletClient(account) as WalletClient<
            Transport,
            Chain,
            Account
        >,
    })
}


describe("Infinite Channel creation", () => {

    test("Create infinite channel passes", async () => {
        const client = createClient(ALICE);
        const { event, contractAddress } = await client.createInfiniteChannel(generateInfiniteChannelArgs())
        expect(isAddress(contractAddress)).toBeTruthy()
    })
})

describe("Finite Channel creation", () => {

    test("Create finite channel fails with invalid ETH value sent", async () => {
        const client = createClient(ALICE);
        await expect(
            async () =>
                await client.createFiniteChannel(await generateFiniteChannelArgs()),
        ).rejects.toThrow(ContractFunctionExecutionError)
    })


    test("Create finite channel passes with valid ETH value sent", async () => {
        const client = createClient(ALICE);
        const args = await generateFiniteChannelArgs();
        const { event, contractAddress } = await client.createFiniteChannel({ ...args, transactionOverrides: { value: parseEther('0.000777') } })
        expect(isAddress(contractAddress)).toBeTruthy()
    })

    test("Create finite channel fails with isufficient ERC20 balance", async () => {

        const baseData = await generateFiniteChannelArgs()
        const args: CreateFiniteChannelConfig = {
            ...baseData,
            transportLayer: {
                ...baseData.transportLayer,
                rewards: {
                    ...baseData.transportLayer.rewards,
                    token: baseSepoliaWETH
                }
            }
        }

        const client = createClient(ALICE);
        await expect(
            async () =>
                await client.createFiniteChannel(args),
        ).rejects.toThrow(ContractFunctionExecutionError)
    })


    test("Create finite channel passes with valid ERC20 approval", async () => {
        const baseData = await generateFiniteChannelArgs()
        const args: CreateFiniteChannelConfig = {
            ...baseData,
            transportLayer: {
                ...baseData.transportLayer,
                rewards: {
                    ...baseData.transportLayer.rewards,
                    token: baseSepoliaWETH
                }
            }
        }

        await mintERC20(baseSepoliaWETH, ALICE, parseEther('10'));

        await setERC20Approval(baseSepoliaWETH, getChannelFactoryAddress(84532), ALICE, parseEther('10'));

        await allowanceOfERC20(baseSepoliaWETH, getChannelFactoryAddress(84532), ALICE);

        const client = createClient(ALICE);
        const { event, contractAddress } = await client.createFiniteChannel(args)
        expect(isAddress(contractAddress)).toBeTruthy()
    })

    // test("Create finite channel passes with valid signed approval", async () => {
    //     const args: CreateFiniteChannelConfig = {
    //         ...createFiniteChannelArgs,
    //         transportLayer: {
    //             ...createFiniteChannelArgs.transportLayer,
    //             rewards: {
    //                 ...createFiniteChannelArgs.transportLayer.rewards,
    //                 token: baseSepoliaWETH
    //             }
    //         }
    //     }

    //     await mintERC20(baseSepoliaWETH, ALICE);

    //     await setERC20Approval(baseSepoliaWETH, getChannelFactoryAddress(84532), ALICE);

    //     await allowanceOfERC20(baseSepoliaWETH, getChannelFactoryAddress(84532), ALICE);

    //     const client = createClient(ALICE);
    //     const { event, contractAddress } = await client.createFiniteChannel(args)
    //     expect(isAddress(contractAddress)).toBeTruthy()
    // })

})


describe("Channel", () => {

    // let targetInfiniteChannel: Address;
    // let targetFiniteChannel: Address;

    // beforeEach(async () => {
    //     const _client = createClient(ALICE)

    // })


    describe("Update channel fees", () => {
        test("Clear infinite channel fees", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())
            const { event } = await client.updateChannelFees({ channelAddress: targetInfiniteChannel, feeContract: zeroAddress, feeArgs: null })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ConfigUpdated')
        })


        test("Clear finite channel fees", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetFiniteChannel } = await client.createFiniteChannel({ ...await generateFiniteChannelArgs(), transactionOverrides: { value: parseEther('0.000777') } })
            const { event } = await client.updateChannelFees({ channelAddress: targetFiniteChannel, feeContract: zeroAddress, feeArgs: null })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ConfigUpdated')
        })

        test("Repopulate infinite channel fees", async () => {
            const client = createClient(ALICE)
            /// @ts-ignore
            const newArgs: ChannelFeeArguments = setupActions[0]
            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())
            const { event } = await client.updateChannelFees({ channelAddress: targetInfiniteChannel, ...newArgs })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ConfigUpdated')
        })

        test("Repopulate finite channel fees", async () => {
            const client = createClient(ALICE)
            /// @ts-ignore
            const newArgs: ChannelFeeArguments = setupActions[0]
            const { contractAddress: targetFiniteChannel } = await client.createFiniteChannel({ ...await generateFiniteChannelArgs(), transactionOverrides: { value: parseEther('0.000777') } })
            const { event } = await client.updateChannelFees({ channelAddress: targetFiniteChannel, ...newArgs })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ConfigUpdated')
        })
    })

    describe("Update channel logic", () => {
        test("Clear infinite channel logic", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())
            const { event } = await client.updateChannelLogic({ channelAddress: targetInfiniteChannel, logicContract: zeroAddress, creatorLogic: [], minterLogic: [] })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ConfigUpdated')
        })

        test("Clear finite channel logic", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetFiniteChannel } = await client.createFiniteChannel({ ...await generateFiniteChannelArgs(), transactionOverrides: { value: parseEther('0.000777') } })
            const { event } = await client.updateChannelLogic({ channelAddress: targetFiniteChannel, logicContract: zeroAddress, creatorLogic: [], minterLogic: [] })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ConfigUpdated')
        })

        test("Repopulate infinite channel logic", async () => {
            const client = createClient(ALICE)
            // @ts-ignore
            const newArgs: ChannelLogicArguments = setupActions[1];
            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())
            const { event } = await client.updateChannelLogic({ channelAddress: targetInfiniteChannel, ...newArgs })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ConfigUpdated')
        })

        test("Repopulate finite channel logic", async () => {
            const client = createClient(ALICE)
            // @ts-ignore
            const newArgs: ChannelLogicArguments = setupActions[1];
            const { contractAddress: targetFiniteChannel } = await client.createFiniteChannel({ ...await generateFiniteChannelArgs(), transactionOverrides: { value: parseEther('0.000777') } })
            const { event } = await client.updateChannelLogic({ channelAddress: targetFiniteChannel, ...newArgs })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ConfigUpdated')
        })

    })

    describe("Update channel metadata", () => {
        test("Update infinite channel metadata", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())
            const { event, uri, channelName } = await client.updateChannelMetadata({ channelAddress: targetInfiniteChannel, name: "new channel name", uri: "new channel uri" })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ChannelMetadataUpdated')
            expect(uri).toEqual("new channel uri")
            expect(channelName).toEqual("new channel name")
        })

        test("Update finite channel metadata", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetFiniteChannel } = await client.createFiniteChannel({ ...await generateFiniteChannelArgs(), transactionOverrides: { value: parseEther('0.000777') } })
            const { event, uri, channelName } = await client.updateChannelMetadata({ channelAddress: targetFiniteChannel, name: "new channel name", uri: "new channel uri" })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('ChannelMetadataUpdated')
            expect(uri).toEqual("new channel uri")
            expect(channelName).toEqual("new channel name")
        })
    })

    describe("Create token infinite channel", () => {
        test("Infinite channel create token passes with valid interaction power", async () => {
            const client = createClient(ALICE)
            await mintERC20(baseSepoliaWETH, ALICE, parseEther('10'))
            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())
            const { tokenId } = await client.createToken({ channelAddress: targetInfiniteChannel, uri: "token uri", maxSupply: BigInt(1) })
            expect(tokenId).toEqual(BigInt(1))
        })

    })

    describe("Create token finite channel", () => {
        test("Finite channel create token passes with valid interaction power", async () => {
            const client = createClient(ALICE)
            await mintERC20(baseSepoliaWETH, ALICE, parseEther('10'))
            const { contractAddress: targetFiniteChannel } = await client.createFiniteChannel({ ...await generateFiniteChannelArgs(), transactionOverrides: { value: parseEther('0.000777') } })
            const { tokenId } = await client.createToken({ channelAddress: targetFiniteChannel, uri: "token uri", maxSupply: BigInt(1) })
            expect(tokenId).toEqual(BigInt(1))
        })
    })


    // describe("sponsor token", () => { })

    describe("update infinite transport layer", () => {
        test("update infinite transport layer", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())
            const { event } = await client.updateInfiniteChannelTransportLayer({ channelAddress: targetInfiniteChannel, saleDurationInSeconds: 200 })
            const log = decodeEventLog({
                abi: infiniteChannelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('InfiniteTransportConfigSet')
        })
    })


    describe("admin withdrawal from finite channel", () => {
        test("admin withdrawal from finite channel", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetFiniteChannel } = await client.createFiniteChannel({ ...await generateFiniteChannelArgs(), transactionOverrides: { value: parseEther('0.000777') } })
            const { success } = await client.adminWithdrawFiniteChannelRewards({ channelAddress: targetFiniteChannel, token: NATIVE_TOKEN, to: ALICE, amount: parseEther('0.000777') })
            expect(success).toBeTruthy()
        })
    })

    describe("mint token", () => {
        let targetInfiniteChannel: Address = zeroAddress;
        let targetFiniteChannel: Address = zeroAddress;
        beforeEach(async () => {
            const client = createClient(ALICE)
            await mintERC20(baseSepoliaWETH, ALICE, parseEther('10'))
            const { contractAddress: _targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())
            const { contractAddress: _targetFiniteChannel } = await client.createFiniteChannel({ ...await generateFiniteChannelArgs(), transactionOverrides: { value: parseEther('0.000777') } })
            await client.createToken({ channelAddress: _targetInfiniteChannel, uri: "token uri", maxSupply: BigInt(1) })
            await client.createToken({ channelAddress: _targetFiniteChannel, uri: "token uri", maxSupply: BigInt(1) })
            await increaseEvmTime(30);
            targetInfiniteChannel = _targetInfiniteChannel;
            targetFiniteChannel = _targetFiniteChannel;
        })
        test("infinite channel mint token with ETH", async () => {
            const client = createClient(ALICE)
            const { event } = await client.mintTokenWithETH({ channelAddress: targetInfiniteChannel, to: ALICE, tokenId: BigInt(1), amount: 1, mintReferral: ALICE, data: "", transactionOverrides: { value: parseEther('0.000666') } })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('TokenMinted')
        })

        test("finite channel mint token with ETH", async () => {
            const client = createClient(ALICE)
            const { event } = await client.mintTokenWithETH({ channelAddress: targetFiniteChannel, to: ALICE, tokenId: BigInt(1), amount: 1, mintReferral: ALICE, data: "", transactionOverrides: { value: parseEther('0.000666') } })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('TokenMinted')
        })

        test("infinite channel mint token with ERC20", async () => {
            const client = createClient(ALICE)
            await setERC20Approval(baseSepoliaWETH, targetInfiniteChannel, ALICE, parseEther('0.000666'))
            const { event } = await client.mintTokenWithERC20({ channelAddress: targetInfiniteChannel, to: ALICE, tokenId: BigInt(1), amount: 1, mintReferral: ALICE, data: "" })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('TokenMinted')
        })

        test("finite channel mint token with ERC20", async () => {
            const client = createClient(ALICE)
            await setERC20Approval(baseSepoliaWETH, targetFiniteChannel, ALICE, parseEther('0.000666'))
            const { event } = await client.mintTokenWithERC20({ channelAddress: targetFiniteChannel, to: ALICE, tokenId: BigInt(1), amount: 1, mintReferral: ALICE, data: "" })
            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('TokenMinted')
        })

        // todo: batch mints + mint with signed approval
    })

    describe("settle finite channel", () => {
        test("settle finite channel", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetFiniteChannel } = await client.createFiniteChannel({ ...await generateFiniteChannelArgs(), transactionOverrides: { value: parseEther('0.000777') } })

            await increaseEvmTime(1200);

            const { event } = await client.settleFiniteChannel({ channelAddress: targetFiniteChannel })
            const log = decodeEventLog({
                abi: finiteChannelAbi,
                data: event.data,
                topics: event.topics,
            })
            expect(log.eventName).toEqual('Settled')
        })
    })

    describe("sponsor token", () => {
        beforeEach(async () => {
            await mintERC20(baseSepoliaWETH, ALICE, parseEther('10'))
        });
        test("sponsor with ETH", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())

            const result = client.createDeferredTokenIntent({
                channelAddress: targetInfiniteChannel,
                uri: "token uri",
                maxSupply: BigInt(1)
            })

            const signature = await walletClient(ALICE).signTypedData(result.intent)
            const { event } = await client.sponsorWithETH({
                channelAddress: targetInfiniteChannel,
                sponsoredToken: { ...result, signature },
                to: ALICE,
                amount: 1,
                mintReferral: ALICE,
                data: "",
                transactionOverrides: { value: parseEther('0.000666') }
            })

            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })

            expect(log.eventName).toEqual('TokenMinted')
        })

        test("sponsor with ERC20", async () => {
            const client = createClient(ALICE)
            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())

            const result = client.createDeferredTokenIntent({
                channelAddress: targetInfiniteChannel,
                uri: "token uri",
                maxSupply: BigInt(1)
            })

            const signature = await walletClient(ALICE).signTypedData(result.intent)

            await setERC20Approval(baseSepoliaWETH, targetInfiniteChannel, ALICE, parseEther('0.000666'))

            const { event } = await client.sponsorWithERC20({
                channelAddress: targetInfiniteChannel,
                sponsoredToken: { ...result, signature },
                to: ALICE,
                amount: 1,
                mintReferral: ALICE,
                data: "",
            })

            const log = decodeEventLog({
                abi: channelAbi,
                data: event.data,
                topics: event.topics,
            })

            expect(log.eventName).toEqual('TokenMinted')
        })
    })

    describe("multicall", () => {
        test("multicall update infinite channel settings", async () => {
            const client = createClient(ALICE)

            const { contractAddress: targetInfiniteChannel } = await client.createInfiniteChannel(generateInfiniteChannelArgs())

            const [
                cd_0,
                cd_1,
                cd_2,
                cd_3
            ] = await Promise.all([
                client.callData.updateChannelMetadata({ channelAddress: targetInfiniteChannel, name: "new channel name", uri: "new channel uri" }),
                client.callData.updateChannelFees({ channelAddress: targetInfiniteChannel, feeContract: zeroAddress, feeArgs: null }),
                client.callData.updateChannelLogic({ channelAddress: targetInfiniteChannel, logicContract: zeroAddress, creatorLogic: [], minterLogic: [] }),
                client.callData.updateInfiniteChannelTransportLayer({ channelAddress: targetInfiniteChannel, saleDurationInSeconds: 200 })
            ])


            const { events } = await client.multicall({
                channelAddress: targetInfiniteChannel,
                calls: [cd_0, cd_1, cd_2, cd_3]
            })

            expect(events.length).toEqual(4)

        })
    })

})



