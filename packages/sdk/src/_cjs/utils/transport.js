"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInfiniteTransportLayerInput = void 0;
exports.createFiniteTransportLayerInput = createFiniteTransportLayerInput;
const viem_1 = require("viem");
const numbers_js_1 = require("./numbers.js");
const createInfiniteTransportLayerInput = (input) => {
    return (0, viem_1.encodeAbiParameters)([
        { name: 'saleDuration', type: 'uint40' }
    ], [
        (0, numbers_js_1.normalizeTimestamp)(input.saleDurationInSeconds)
    ]);
};
exports.createInfiniteTransportLayerInput = createInfiniteTransportLayerInput;
function createFiniteTransportLayerInput(input) {
    return (0, viem_1.encodeAbiParameters)([
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
    ], [{
            createStart: (0, numbers_js_1.normalizeTimestamp)(input.createStartInSeconds),
            mintStart: (0, numbers_js_1.normalizeTimestamp)(input.mintStartInSeconds),
            mintEnd: (0, numbers_js_1.normalizeTimestamp)(input.mintEndInSeconds),
            rewards: {
                ranks: input.rewards.ranks,
                allocations: input.rewards.allocations,
                totalAllocation: input.rewards.totalAllocation,
                token: input.rewards.token
            }
        }]);
}
//# sourceMappingURL=transport.js.map