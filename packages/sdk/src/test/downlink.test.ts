import { Chain, PublicClient, Transport, zeroAddress } from "viem";
import { DownlinkClient } from "../client/downlink";
import { InvalidConfigError } from "../errors";
import { BASE_SEPOLIA_SUBGRAPH_URL } from "../constants";
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
    const publicClient = new mockPublicClient()
    return new DownlinkClient({
        publicClient: publicClient,
        apiConfig: {
            serverUrl: BASE_SEPOLIA_SUBGRAPH_URL
        }
    })
}


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
