"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFeesAbi = void 0;
exports.customFeesAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_uplinkRewardsAddress",
                internalType: "address",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "", internalType: "address", type: "address" }],
        name: "channelFees",
        outputs: [
            { name: "channelTreasury", internalType: "address", type: "address" },
            { name: "uplinkBps", internalType: "uint16", type: "uint16" },
            { name: "channelBps", internalType: "uint16", type: "uint16" },
            { name: "creatorBps", internalType: "uint16", type: "uint16" },
            { name: "mintReferralBps", internalType: "uint16", type: "uint16" },
            { name: "sponsorBps", internalType: "uint16", type: "uint16" },
            { name: "ethMintPrice", internalType: "uint256", type: "uint256" },
            { name: "erc20MintPrice", internalType: "uint256", type: "uint256" },
            { name: "erc20Contract", internalType: "address", type: "address" },
        ],
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
        name: "getErc20MintPrice",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getEthMintPrice",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getFeeBps",
        outputs: [
            { name: "", internalType: "uint16", type: "uint16" },
            { name: "", internalType: "uint16", type: "uint16" },
            { name: "", internalType: "uint16", type: "uint16" },
            { name: "", internalType: "uint16", type: "uint16" },
            { name: "", internalType: "uint16", type: "uint16" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "creators", internalType: "address[]", type: "address[]" },
            { name: "sponsors", internalType: "address[]", type: "address[]" },
            { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
            { name: "mintReferral", internalType: "address", type: "address" },
        ],
        name: "requestErc20Mint",
        outputs: [
            {
                name: "",
                internalType: "struct Rewards.Split",
                type: "tuple",
                components: [
                    { name: "recipients", internalType: "address[]", type: "address[]" },
                    { name: "allocations", internalType: "uint256[]", type: "uint256[]" },
                    { name: "totalAllocation", internalType: "uint256", type: "uint256" },
                    { name: "token", internalType: "address", type: "address" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "creators", internalType: "address[]", type: "address[]" },
            { name: "sponsors", internalType: "address[]", type: "address[]" },
            { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
            { name: "mintReferral", internalType: "address", type: "address" },
        ],
        name: "requestEthMint",
        outputs: [
            {
                name: "",
                internalType: "struct Rewards.Split",
                type: "tuple",
                components: [
                    { name: "recipients", internalType: "address[]", type: "address[]" },
                    { name: "allocations", internalType: "uint256[]", type: "uint256[]" },
                    { name: "totalAllocation", internalType: "uint256", type: "uint256" },
                    { name: "token", internalType: "address", type: "address" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "data", internalType: "bytes", type: "bytes" }],
        name: "setChannelFees",
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
                name: "feeconfig",
                internalType: "struct CustomFees.FeeConfig",
                type: "tuple",
                components: [
                    { name: "channelTreasury", internalType: "address", type: "address" },
                    { name: "uplinkBps", internalType: "uint16", type: "uint16" },
                    { name: "channelBps", internalType: "uint16", type: "uint16" },
                    { name: "creatorBps", internalType: "uint16", type: "uint16" },
                    { name: "mintReferralBps", internalType: "uint16", type: "uint16" },
                    { name: "sponsorBps", internalType: "uint16", type: "uint16" },
                    { name: "ethMintPrice", internalType: "uint256", type: "uint256" },
                    { name: "erc20MintPrice", internalType: "uint256", type: "uint256" },
                    { name: "erc20Contract", internalType: "address", type: "address" },
                ],
                indexed: false,
            },
        ],
        name: "FeeConfigSet",
    },
    { type: "error", inputs: [], name: "AddressZero" },
    { type: "error", inputs: [], name: "ERC20MintingDisabled" },
    { type: "error", inputs: [], name: "InvalidBps" },
    { type: "error", inputs: [], name: "InvalidETHMintPrice" },
    { type: "error", inputs: [], name: "InvalidSplit" },
    { type: "error", inputs: [], name: "TotalValueMismatch" },
];
//# sourceMappingURL=customFeesAbi.js.map