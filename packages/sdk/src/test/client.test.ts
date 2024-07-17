import {
    Account,
    Chain,
    Log,
    PublicClient,
    Transport,
    WalletClient,
    zeroAddress,
} from 'viem'

import { UplinkClient } from "../client/uplink";
import { uplinkActions } from './mocks/mocks';
import { InvalidConfigError, UnsupportedChainIdError } from '../errors';

const mockPublicClient = jest.fn(() => {
    return {
        simulateContract: jest.fn(
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

                return { request: jest.mock }
            },
        ),
    } as unknown as PublicClient<Transport, Chain>
})


describe("Client configuration", () => {
    const publicClient = new mockPublicClient()


    test('Invalid chain id fails', () => {
        expect(() => new UplinkClient({ chainId: 1 })).toThrow(
            UnsupportedChainIdError,
        )
    })

    test('Valid chain id passes', () => {
        expect(() => new UplinkClient({ chainId: 8453 })).not.toThrow()
        expect(() => new UplinkClient({ chainId: 84532 })).not.toThrow()
    })

    test('Including ens names with no provider fails', () => {
        expect(
            () => new UplinkClient({ chainId: 1, includeEnsNames: true }),
        ).toThrow(InvalidConfigError)
    })

    test('Including ens names with only ens provider passes', () => {
        expect(
            () =>
                new UplinkClient({
                    chainId: 84532,
                    includeEnsNames: true,
                    ensPublicClient: publicClient,
                }),
        ).not.toThrow()
    })

    test('Including ens names with only regular provider passes', () => {
        expect(
            () =>
                new UplinkClient({
                    chainId: 84532,
                    includeEnsNames: true,
                    publicClient,
                }),
        ).not.toThrow()
    })

});