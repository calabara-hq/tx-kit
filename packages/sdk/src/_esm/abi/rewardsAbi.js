export const rewardsAbi = [
    {
        type: "constructor",
        inputs: [{ name: "weth", internalType: "address", type: "address" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "", internalType: "address", type: "address" }],
        name: "erc20Balances",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "spender",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "recipient",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "amount",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
            {
                name: "token",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "ERC20Transferred",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "spender",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "recipient",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "amount",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "ETHTransferred",
    },
    { type: "error", inputs: [], name: "ERC20TransferFailed" },
    { type: "error", inputs: [], name: "InsufficientBalance" },
    { type: "error", inputs: [], name: "InvalidAmountSent" },
    { type: "error", inputs: [], name: "InvalidTotalAllocation" },
    { type: "error", inputs: [], name: "SplitLengthMismatch" },
];
//# sourceMappingURL=rewardsAbi.js.map