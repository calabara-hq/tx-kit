"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradePathAbi = void 0;
exports.upgradePathAbi = [
    { type: "constructor", inputs: [], stateMutability: "nonpayable" },
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
        inputs: [{ name: "_initOwner", internalType: "address", type: "address" }],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "", internalType: "address", type: "address" },
            { name: "", internalType: "address", type: "address" },
        ],
        name: "isAllowedUpgrade",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "baseImpl", internalType: "address", type: "address" },
            { name: "upgradeImpl", internalType: "address", type: "address" },
        ],
        name: "isRegisteredUpgradePath",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
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
        inputs: [
            { name: "baseImpls", internalType: "address[]", type: "address[]" },
            { name: "upgradeImpl", internalType: "address", type: "address" },
        ],
        name: "registerUpgradePath",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "baseImpl", internalType: "address", type: "address" },
            { name: "upgradeImpl", internalType: "address", type: "address" },
        ],
        name: "removeUpgradePath",
        outputs: [],
        stateMutability: "nonpayable",
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
                name: "version",
                internalType: "uint64",
                type: "uint64",
                indexed: false,
            },
        ],
        name: "Initialized",
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
        inputs: [],
        name: "UpgradePathContractInitialized",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "baseImpl",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "upgradeImpl",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "UpgradeRegistered",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "baseImpl",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "upgradeImpl",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "UpgradeRemoved",
    },
    { type: "error", inputs: [], name: "InvalidInitialization" },
    { type: "error", inputs: [], name: "NotInitializing" },
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
//# sourceMappingURL=upgradePathAbi.js.map