import { Address, encodeAbiParameters } from "viem"
import { Hex } from "viem/_types"
import { DeferredTokenIntent, DeferredTokenIntentWithSignature, FiniteTransportLayer, InfiniteTransportLayer } from "../types"
import { normalizeTimestamp } from "./numbers"


export const createInfiniteTransportLayerInput = (input: InfiniteTransportLayer): Hex => {
    return encodeAbiParameters(
        [
            { name: 'saleDuration', type: 'uint40' }
        ],
        [
            normalizeTimestamp(input.saleDurationInSeconds)
        ]
    )
}


export function createFiniteTransportLayerInput(input: FiniteTransportLayer): Hex {
    return encodeAbiParameters(
        [
            {
                name: "FiniteParams",
                type: "tuple",
                components: [
                    { name: "createStart", type: "uint40" },
                    { name: "mintStart", type: "uint40" },
                    { name: "mintEnd", type: "uint40" },
                    {
                        name: "rewards",
                        type: "tuple",
                        components: [
                            { name: "ranks", type: "uint40[]" },
                            { name: "allocations", type: "uint256[]" },
                            { name: "totalAllocation", type: "uint256" },
                            { name: "token", type: "address" },
                        ]
                    }
                ],
            }
        ],
        [{
            createStart: normalizeTimestamp(input.createStartInSeconds),
            mintStart: normalizeTimestamp(input.mintStartInSeconds),
            mintEnd: normalizeTimestamp(input.mintEndInSeconds),
            rewards: {
                ranks: input.rewards.ranks,
                allocations: input.rewards.allocations,
                totalAllocation: input.rewards.totalAllocation,
                token: input.rewards.token as Address
            }
        }]
    );
}
