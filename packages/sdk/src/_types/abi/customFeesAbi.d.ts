export declare const customFeesAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_uplinkRewardsAddress";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly name: "channelFees";
    readonly outputs: readonly [{
        readonly name: "channelTreasury";
        readonly internalType: "address";
        readonly type: "address";
    }, {
        readonly name: "uplinkBps";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }, {
        readonly name: "channelBps";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }, {
        readonly name: "creatorBps";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }, {
        readonly name: "mintReferralBps";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }, {
        readonly name: "sponsorBps";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }, {
        readonly name: "ethMintPrice";
        readonly internalType: "uint256";
        readonly type: "uint256";
    }, {
        readonly name: "erc20MintPrice";
        readonly internalType: "uint256";
        readonly type: "uint256";
    }, {
        readonly name: "erc20Contract";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly inputs: readonly [];
    readonly name: "codeRepository";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "string";
        readonly type: "string";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly inputs: readonly [];
    readonly name: "contractName";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "string";
        readonly type: "string";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly inputs: readonly [];
    readonly name: "contractVersion";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "string";
        readonly type: "string";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly inputs: readonly [];
    readonly name: "getErc20MintPrice";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "uint256";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly inputs: readonly [];
    readonly name: "getEthMintPrice";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "uint256";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly inputs: readonly [];
    readonly name: "getFeeBps";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }, {
        readonly name: "";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }, {
        readonly name: "";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }, {
        readonly name: "";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }, {
        readonly name: "";
        readonly internalType: "uint16";
        readonly type: "uint16";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "creators";
        readonly internalType: "address[]";
        readonly type: "address[]";
    }, {
        readonly name: "sponsors";
        readonly internalType: "address[]";
        readonly type: "address[]";
    }, {
        readonly name: "amounts";
        readonly internalType: "uint256[]";
        readonly type: "uint256[]";
    }, {
        readonly name: "mintReferral";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly name: "requestErc20Mint";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "struct Rewards.Split";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "recipients";
            readonly internalType: "address[]";
            readonly type: "address[]";
        }, {
            readonly name: "allocations";
            readonly internalType: "uint256[]";
            readonly type: "uint256[]";
        }, {
            readonly name: "totalAllocation";
            readonly internalType: "uint256";
            readonly type: "uint256";
        }, {
            readonly name: "token";
            readonly internalType: "address";
            readonly type: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "creators";
        readonly internalType: "address[]";
        readonly type: "address[]";
    }, {
        readonly name: "sponsors";
        readonly internalType: "address[]";
        readonly type: "address[]";
    }, {
        readonly name: "amounts";
        readonly internalType: "uint256[]";
        readonly type: "uint256[]";
    }, {
        readonly name: "mintReferral";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly name: "requestEthMint";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "struct Rewards.Split";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "recipients";
            readonly internalType: "address[]";
            readonly type: "address[]";
        }, {
            readonly name: "allocations";
            readonly internalType: "uint256[]";
            readonly type: "uint256[]";
        }, {
            readonly name: "totalAllocation";
            readonly internalType: "uint256";
            readonly type: "uint256";
        }, {
            readonly name: "token";
            readonly internalType: "address";
            readonly type: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "data";
        readonly internalType: "bytes";
        readonly type: "bytes";
    }];
    readonly name: "setChannelFees";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly name: "channel";
        readonly internalType: "address";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "feeconfig";
        readonly internalType: "struct CustomFees.FeeConfig";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "channelTreasury";
            readonly internalType: "address";
            readonly type: "address";
        }, {
            readonly name: "uplinkBps";
            readonly internalType: "uint16";
            readonly type: "uint16";
        }, {
            readonly name: "channelBps";
            readonly internalType: "uint16";
            readonly type: "uint16";
        }, {
            readonly name: "creatorBps";
            readonly internalType: "uint16";
            readonly type: "uint16";
        }, {
            readonly name: "mintReferralBps";
            readonly internalType: "uint16";
            readonly type: "uint16";
        }, {
            readonly name: "sponsorBps";
            readonly internalType: "uint16";
            readonly type: "uint16";
        }, {
            readonly name: "ethMintPrice";
            readonly internalType: "uint256";
            readonly type: "uint256";
        }, {
            readonly name: "erc20MintPrice";
            readonly internalType: "uint256";
            readonly type: "uint256";
        }, {
            readonly name: "erc20Contract";
            readonly internalType: "address";
            readonly type: "address";
        }];
        readonly indexed: false;
    }];
    readonly name: "FeeConfigSet";
}, {
    readonly type: "error";
    readonly inputs: readonly [];
    readonly name: "AddressZero";
}, {
    readonly type: "error";
    readonly inputs: readonly [];
    readonly name: "ERC20MintingDisabled";
}, {
    readonly type: "error";
    readonly inputs: readonly [];
    readonly name: "InvalidBps";
}, {
    readonly type: "error";
    readonly inputs: readonly [];
    readonly name: "InvalidETHMintPrice";
}, {
    readonly type: "error";
    readonly inputs: readonly [];
    readonly name: "InvalidSplit";
}, {
    readonly type: "error";
    readonly inputs: readonly [];
    readonly name: "TotalValueMismatch";
}];
//# sourceMappingURL=customFeesAbi.d.ts.map