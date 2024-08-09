import { Chain, createPublicClient, http, PublicClient, Transport } from "viem";
import { DownlinkClient } from "../client/downlink.js";
import { InvalidConfigError } from "../errors.js";
import { BASE_SEPOLIA_SUBGRAPH_URL } from "../constants.js";
import { baseSepolia } from "viem/chains";
const mockPublicClient = jest.fn(() => {
    return {} as unknown as PublicClient<Transport, Chain>
})

describe("Client configuration", () => {
    test('Invalid configuration fails', () => {
        expect(() => new DownlinkClient({ includeEnsNames: true }))
            .toThrow(InvalidConfigError)
    })

    test('Valid configuration passes', () => {
        const publicClient = new mockPublicClient()
        expect(() => new DownlinkClient({ publicClient: publicClient }))
            .not.toThrow()

        expect(() => new DownlinkClient({ apiConfig: { serverUrl: 'random' } }))
            .not.toThrow()

        expect(() => new DownlinkClient({}))
            .not.toThrow()
    })
})

const createClient = () => {
    const publicClient = createPublicClient({
        chain: baseSepolia as Chain,
        transport: http()
    })
    return new DownlinkClient({
        publicClient: publicClient,
        apiConfig: {
            serverUrl: BASE_SEPOLIA_SUBGRAPH_URL
        }
    })
}

describe("Load channel", () => {
    test("load channel with tokens", async () => {
        const client = createClient();
        const data = await client.getChannel({
            channelAddress: "0x1EFfA2BA49394028fc8201E888B439E038bC5142",
            includeTokens: true
        })
        expect(data).toBeDefined()
        expect(data!.tokens.length).toBeGreaterThan(0)
    })
})

describe("Load channels", () => {
    test("load all channels", async () => {
        const client = createClient();
        const data = await client.getAllChannels();
        expect(Array.isArray(data)).toBe(true)
    })
    test("load all channels with modifiers", async () => {
        const client = createClient();

        const data = await client.getAllChannels(
            {
                includeTokens: true,
                filters: {
                    where: {
                        transportLayer_: {
                            type: "infinite"
                        },
                    }
                }
            }
        )
        expect(Array.isArray(data)).toBe(true)
    })
})

describe.only("Get upgrade path", () => {
    test("get optimal upgrade path", async () => {
        const client = createClient();
        const path = await client.getOptimalUpgradePath({
            address: "0x3a937D7B6079dA0745824B0B97700F494B750361"
        })

        expect(path).toBeDefined()
    })
})
