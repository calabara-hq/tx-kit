"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicLogicAbi = void 0;
exports.dynamicLogicAbi = [
    {
        type: "constructor",
        inputs: [{ name: "_initOwner", internalType: "address", type: "address" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "signature", internalType: "bytes4", type: "bytes4" },
            {
                name: "calldataAddressPosition",
                internalType: "uint256",
                type: "uint256",
            },
        ],
        name: "approveLogic",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "user", internalType: "address", type: "address" }],
        name: "calculateCreatorInteractionPower",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "user", internalType: "address", type: "address" }],
        name: "calculateMinterInteractionPower",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "codeRepository",
        outputs: [{ name: "", internalType: "string", type: "string" }],
        stateMutability: "pure",
    },
    {
        type: "function",
        inputs: [],
        name: "contractName",
        outputs: [{ name: "", internalType: "string", type: "string" }],
        stateMutability: "pure",
    },
    {
        type: "function",
        inputs: [],
        name: "contractVersion",
        outputs: [{ name: "", internalType: "string", type: "string" }],
        stateMutability: "pure",
    },
    {
        type: "function",
        inputs: [],
        name: "owner",
        outputs: [{ name: "", internalType: "address", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "data", internalType: "bytes", type: "bytes" }],
        name: "setCreatorLogic",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "data", internalType: "bytes", type: "bytes" }],
        name: "setMinterLogic",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "channel",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "logic",
                internalType: "struct DynamicLogic.InteractionLogic",
                type: "tuple",
                components: [
                    { name: "targets", internalType: "address[]", type: "address[]" },
                    { name: "signatures", internalType: "bytes4[]", type: "bytes4[]" },
                    { name: "datas", internalType: "bytes[]", type: "bytes[]" },
                    {
                        name: "operators",
                        internalType: "enum DynamicLogic.Operator[]",
                        type: "uint8[]",
                    },
                    { name: "literalOperands", internalType: "bytes[]", type: "bytes[]" },
                    {
                        name: "interactionPowerTypes",
                        internalType: "enum DynamicLogic.InteractionPowerType[]",
                        type: "uint8[]",
                    },
                    {
                        name: "interactionPowers",
                        internalType: "uint256[]",
                        type: "uint256[]",
                    },
                ],
                indexed: false,
            },
        ],
        name: "CreatorLogicSet",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "channel",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "logic",
                internalType: "struct DynamicLogic.InteractionLogic",
                type: "tuple",
                components: [
                    { name: "targets", internalType: "address[]", type: "address[]" },
                    { name: "signatures", internalType: "bytes4[]", type: "bytes4[]" },
                    { name: "datas", internalType: "bytes[]", type: "bytes[]" },
                    {
                        name: "operators",
                        internalType: "enum DynamicLogic.Operator[]",
                        type: "uint8[]",
                    },
                    { name: "literalOperands", internalType: "bytes[]", type: "bytes[]" },
                    {
                        name: "interactionPowerTypes",
                        internalType: "enum DynamicLogic.InteractionPowerType[]",
                        type: "uint8[]",
                    },
                    {
                        name: "interactionPowers",
                        internalType: "uint256[]",
                        type: "uint256[]",
                    },
                ],
                indexed: false,
            },
        ],
        name: "MinterLogicSet",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "previousOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "newOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipTransferred",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "signature",
                internalType: "bytes4",
                type: "bytes4",
                indexed: false,
            },
            {
                name: "calldataAddressPosition",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "SignatureApproved",
    },
    { type: "error", inputs: [], name: "CallFailed" },
    { type: "error", inputs: [], name: "InvalidSignature" },
    {
        type: "error",
        inputs: [{ name: "owner", internalType: "address", type: "address" }],
        name: "OwnableInvalidOwner",
    },
    {
        type: "error",
        inputs: [{ name: "account", internalType: "address", type: "address" }],
        name: "OwnableUnauthorizedAccount",
    },
];
//# sourceMappingURL=dynamicLogicAbi.js.map