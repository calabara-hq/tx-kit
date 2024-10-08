import {
    Account,
    Chain,
    createTestClient,
    http,
    Log,
    PublicClient,
    Transport,
    WalletClient,
    zeroAddress,
} from 'viem'
import { getCapabilities } from 'viem/experimental';
import { UplinkClient } from "../client/uplink.js";
import { MissingPublicClientError, MissingWalletClientError } from '../errors.js';
import { CreateFiniteChannelConfig, CreateInfiniteChannelConfig } from '../types.js';
import { MockViemContract } from './mocks/viemContract.js';
import { uplinkActions, downlinkActions } from './mocks/mocks.js'
import { NATIVE_TOKEN } from '../constants.js';
import { describe, expect, test, vitest, beforeEach } from 'vitest'


const testAccount = '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC';

vitest.mock('viem', async (importOriginal) => {
    const originalModule = await importOriginal();
    return {
        ...originalModule,
        getContract: vitest.fn(() => {
            return new MockViemContract(downlinkActions, uplinkActions);
        }),
        getAddress: vitest.fn((address) => address),
        decodeEventLog: vitest.fn(() => {
            return {
                eventName: 'SetupNewContract',
                args: {
                    contractAddress: '0xchannel',
                },
            };
        }),
    };
});
const mockPublicClient = vitest.fn(() => {
    return {
        simulateContract: vitest.fn(
            async ({
                functionName,
                args,
            }: {
                functionName: string
                args: unknown[]
            }) => {
                type writeActionsType = typeof uplinkActions
                type writeKeys = keyof writeActionsType
                uplinkActions[functionName as writeKeys].call(this, ...args)

                return { request: vitest.mock }
            },
        ),
    } as unknown as PublicClient<Transport, Chain>
})

const mockWalletClient = vitest.fn(() => {
    return {
        account: {
            address: testAccount
        },
        writeContract: vitest.fn(() => {
            return '0xhash'
        }),
        extend: vitest.fn(() => {
            return {
                account: {
                    address: testAccount
                },
                writeContract: vitest.fn(() => {
                    return '0xhash'
                }),
                getCapabilities: vitest.fn(async () => {
                    return {}
                }),
                writeContracts: vitest.fn(() => {
                    return '0xhash'
                })
            }
        })
    } as unknown as WalletClient<Transport, Chain, Account>
})


describe("Client write operations", () => {
    const publicClient = new mockPublicClient();
    const walletClient = new mockWalletClient();
    const uplinkClient = new UplinkClient({ chainId: 84532, publicClient, walletClient })

    const getTransactionEventsSpy = vitest
        .spyOn(uplinkClient, 'getTransactionEvents')
        .mockImplementation(async () => {
            const event = {
                blockNumber: 12345,
                args: {
                    contractAddress: '0xchannel',
                },
            } as unknown as Log
            return [event]
        })


    beforeEach(() => {
        //; (validateAddress as vitest.Mock).mockClear()
        //     ; (validateFiniteChannelInputs as vitest.Mock).mockClear()
        //     ; (validateInfiniteChannelInputs as vitest.Mock).mockClear()
        getTransactionEventsSpy.mockClear()
    })


    describe('create infinite channel tests', () => {

        const createInfChannelArgs: CreateInfiniteChannelConfig = {
            uri: 'https://sample.com',
            name: 'channel name',
            defaultAdmin: zeroAddress,
            managers: [],
            setupActions: [],
            transportLayer: { saleDurationInSeconds: 100 }
        }

        test('Create inf channel fails with no provider', async () => {
            const uplinkClient = new UplinkClient({
                chainId: 84532,
            })

            await expect(
                async () =>
                    await uplinkClient.createInfiniteChannel(createInfChannelArgs),
            ).rejects.toThrow(MissingPublicClientError)
        })

        test('Create inf channel fails with no wallet signer', async () => {
            const uplinkClient = new UplinkClient({
                chainId: 84532,
                publicClient,
            })

            await expect(
                async () =>
                    await uplinkClient.createInfiniteChannel(createInfChannelArgs),
            ).rejects.toThrow(MissingWalletClientError)
        })

        test('Create inf channel passes', async () => {
            const { event, contractAddress } = await uplinkClient.createInfiniteChannel(createInfChannelArgs)
            expect(contractAddress).toEqual('0xchannel')
        });

    });

    describe('create finite channel tests', () => {
        const createFiniteChannelArgs: CreateFiniteChannelConfig = {
            uri: 'https://sample.com',
            name: 'channel name',
            defaultAdmin: zeroAddress,
            managers: [],
            setupActions: [],
            transportLayer: {
                createStartInSeconds: Date.now() + 1000,
                mintStartInSeconds: Date.now() + 2000,
                mintEndInSeconds: Date.now() + 3000,
                rewards: {
                    ranks: [1],
                    allocations: [BigInt(0.000777 * 10 ** 18)],
                    totalAllocation: BigInt(0.000777 * 10 ** 18),
                    token: NATIVE_TOKEN
                }
            }
        }

        test('Create finite channel fails with no provider', async () => {
            const uplinkClient = new UplinkClient({
                chainId: 84532,
            })

            await expect(
                async () =>
                    await uplinkClient.createFiniteChannel(createFiniteChannelArgs),
            ).rejects.toThrow(MissingPublicClientError)
        })

        test('Create finite channel fails with no wallet signer', async () => {
            const uplinkClient = new UplinkClient({
                chainId: 84532,
                publicClient,
            })

            await expect(
                async () =>
                    await uplinkClient.createFiniteChannel(createFiniteChannelArgs),
            ).rejects.toThrow(MissingWalletClientError)
        })


        test('Create finite channel passes', async () => {
            const { event, contractAddress } = await uplinkClient.createFiniteChannel({ ...createFiniteChannelArgs, transactionOverrides: { value: BigInt(0.000777 * 10 ** 18) } })
            expect(contractAddress).toEqual('0xchannel')
        });


        // test('Create finite channel passes (ERC20 rewards)', async () => {

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
        //     const { event, contractAddress } = await uplinkClient!.createFiniteChannel(args)
        //     expect(contractAddress).toEqual('0xchannel')
        // });
    })

    // describe('sponsor token tests', () => {
    //     test("", async () => {
    //         const sponsorTokenInputs: SponsorTokenConfig = {
    //             channelAddress: '0x9fab5b58c1bc180533b716b5c1d078e23cd06301',
    //             sponsoredToken: {
    //                 author: '0xc0e1a376697d5eF7bbFb06EBeE53E71DAD6950f4',
    //                 intent: {
    //                     domain: {
    //                         name: 'Transmissions',
    //                         version: '1',
    //                         chainId: 84532,
    //                         verifyingContract: '0x9fab5b58c1bc180533b716b5c1d078e23cd06301'
    //                     },
    //                     types: {
    //                         DeferredTokenPermission: [
    //                             { name: "uri", type: "string" },
    //                             { name: "maxSupply", type: "uint256" },
    //                             { name: "deadline", type: "uint256" },
    //                             { name: "nonce", type: "bytes32" }
    //                         ]
    //                     },
    //                     primaryType: 'DeferredTokenPermission',
    //                     message: {
    //                         uri: 'my new token',
    //                         maxSupply: BigInt(100),
    //                         deadline: BigInt(1718839220),
    //                         nonce: '0x59dfb5054a297e42adb60cf52b923124b760f1fa2a421a6dc3288964e89d01dc'
    //                     }
    //                 },
    //                 signature: '0xa956e920b5734a9086c9b18329d91f78ee5c29c034319dab5500ebfa62c0f2013a6d31a78990147bf1c4e5d4e133051b0ff2c90b337e4b226640d6ea02b4e5ef1c'
    //             },
    //             to: zeroAddress,
    //             amount: 1,
    //             mintReferral: zeroAddress,
    //             data: ""
    //         }

    //         const uplinkClient = new UplinkClient({
    //             chainId: 84532,
    //             publicClient,
    //             walletClient
    //         })

    //         //  const signature = await walletClient.account.signTypedData(sponsorTokenInputs.sponsoredToken.intent);

    //         const { event } = await uplinkClient.sponsorWithETH(sponsorTokenInputs)


    //     })
    // })

});