export declare const dynamicLogicAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_initOwner";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "signature";
        readonly internalType: "bytes4";
        readonly type: "bytes4";
    }, {
        readonly name: "calldataAddressPosition";
        readonly internalType: "uint256";
        readonly type: "uint256";
    }];
    readonly name: "approveLogic";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "user";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly name: "calculateCreatorInteractionPower";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "uint256";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "user";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly name: "calculateMinterInteractionPower";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "uint256";
        readonly type: "uint256";
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
    readonly name: "owner";
    readonly outputs: readonly [{
        readonly name: "";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly inputs: readonly [];
    readonly name: "renounceOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "data";
        readonly internalType: "bytes";
        readonly type: "bytes";
    }];
    readonly name: "setCreatorLogic";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "data";
        readonly internalType: "bytes";
        readonly type: "bytes";
    }];
    readonly name: "setMinterLogic";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly name: "transferOwnership";
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
        readonly name: "logic";
        readonly internalType: "struct DynamicLogic.InteractionLogic";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "targets";
            readonly internalType: "address[]";
            readonly type: "address[]";
        }, {
            readonly name: "signatures";
            readonly internalType: "bytes4[]";
            readonly type: "bytes4[]";
        }, {
            readonly name: "datas";
            readonly internalType: "bytes[]";
            readonly type: "bytes[]";
        }, {
            readonly name: "operators";
            readonly internalType: "enum DynamicLogic.Operator[]";
            readonly type: "uint8[]";
        }, {
            readonly name: "literalOperands";
            readonly internalType: "bytes[]";
            readonly type: "bytes[]";
        }, {
            readonly name: "interactionPowerTypes";
            readonly internalType: "enum DynamicLogic.InteractionPowerType[]";
            readonly type: "uint8[]";
        }, {
            readonly name: "interactionPowers";
            readonly internalType: "uint256[]";
            readonly type: "uint256[]";
        }];
        readonly indexed: false;
    }];
    readonly name: "CreatorLogicSet";
}, {
    readonly type: "event";
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly name: "channel";
        readonly internalType: "address";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "logic";
        readonly internalType: "struct DynamicLogic.InteractionLogic";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "targets";
            readonly internalType: "address[]";
            readonly type: "address[]";
        }, {
            readonly name: "signatures";
            readonly internalType: "bytes4[]";
            readonly type: "bytes4[]";
        }, {
            readonly name: "datas";
            readonly internalType: "bytes[]";
            readonly type: "bytes[]";
        }, {
            readonly name: "operators";
            readonly internalType: "enum DynamicLogic.Operator[]";
            readonly type: "uint8[]";
        }, {
            readonly name: "literalOperands";
            readonly internalType: "bytes[]";
            readonly type: "bytes[]";
        }, {
            readonly name: "interactionPowerTypes";
            readonly internalType: "enum DynamicLogic.InteractionPowerType[]";
            readonly type: "uint8[]";
        }, {
            readonly name: "interactionPowers";
            readonly internalType: "uint256[]";
            readonly type: "uint256[]";
        }];
        readonly indexed: false;
    }];
    readonly name: "MinterLogicSet";
}, {
    readonly type: "event";
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly internalType: "address";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "newOwner";
        readonly internalType: "address";
        readonly type: "address";
        readonly indexed: true;
    }];
    readonly name: "OwnershipTransferred";
}, {
    readonly type: "event";
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly name: "signature";
        readonly internalType: "bytes4";
        readonly type: "bytes4";
        readonly indexed: false;
    }, {
        readonly name: "calldataAddressPosition";
        readonly internalType: "uint256";
        readonly type: "uint256";
        readonly indexed: false;
    }];
    readonly name: "SignatureApproved";
}, {
    readonly type: "error";
    readonly inputs: readonly [];
    readonly name: "CallFailed";
}, {
    readonly type: "error";
    readonly inputs: readonly [];
    readonly name: "InvalidSignature";
}, {
    readonly type: "error";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly name: "OwnableInvalidOwner";
}, {
    readonly type: "error";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly internalType: "address";
        readonly type: "address";
    }];
    readonly name: "OwnableUnauthorizedAccount";
}];
//# sourceMappingURL=dynamicLogicAbi.d.ts.map