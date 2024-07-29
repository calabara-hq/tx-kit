export const channelAbi = [
    {
        type: "function",
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "DEFERRED_TOKEN_TYPEHASH",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "DOMAIN_SEPARATOR",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "EIP712_DOMAIN_TYPEHASH",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "MANAGER_ROLE",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "UPGRADE_INTERFACE_VERSION",
        outputs: [{ name: "", internalType: "string", type: "string" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "account", internalType: "address", type: "address" },
            { name: "id", internalType: "uint256", type: "uint256" },
        ],
        name: "balanceOf",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "accounts", internalType: "address[]", type: "address[]" },
            { name: "ids", internalType: "uint256[]", type: "uint256[]" },
        ],
        name: "balanceOfBatch",
        outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "contractURI",
        outputs: [{ name: "", internalType: "string", type: "string" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "uri", internalType: "string", type: "string" },
            { name: "maxSupply", internalType: "uint256", type: "uint256" },
        ],
        name: "createToken",
        outputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
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
        type: "function",
        inputs: [],
        name: "feeContract",
        outputs: [{ name: "", internalType: "contract IFees", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "role", internalType: "bytes32", type: "bytes32" }],
        name: "getRoleAdmin",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32" },
            { name: "index", internalType: "uint256", type: "uint256" },
        ],
        name: "getRoleMember",
        outputs: [{ name: "", internalType: "address", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "role", internalType: "bytes32", type: "bytes32" }],
        name: "getRoleMemberCount",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
        name: "getToken",
        outputs: [
            {
                name: "",
                internalType: "struct ChannelStorage.TokenConfig",
                type: "tuple",
                components: [
                    { name: "uri", internalType: "string", type: "string" },
                    { name: "author", internalType: "address", type: "address" },
                    { name: "maxSupply", internalType: "uint256", type: "uint256" },
                    { name: "totalMinted", internalType: "uint256", type: "uint256" },
                    { name: "sponsor", internalType: "address", type: "address" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32" },
            { name: "account", internalType: "address", type: "address" },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32" },
            { name: "account", internalType: "address", type: "address" },
        ],
        name: "hasRole",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "uri", internalType: "string", type: "string" },
            { name: "name", internalType: "string", type: "string" },
            { name: "defaultAdmin", internalType: "address", type: "address" },
            { name: "managers", internalType: "address[]", type: "address[]" },
            { name: "setupActions", internalType: "bytes[]", type: "bytes[]" },
            { name: "transportConfig", internalType: "bytes", type: "bytes" },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "addr", internalType: "address", type: "address" }],
        name: "isAdmin",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "account", internalType: "address", type: "address" },
            { name: "operator", internalType: "address", type: "address" },
        ],
        name: "isApprovedForAll",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "addr", internalType: "address", type: "address" }],
        name: "isManager",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "logicContract",
        outputs: [{ name: "", internalType: "contract ILogic", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "to", internalType: "address", type: "address" },
            { name: "tokenId", internalType: "uint256", type: "uint256" },
            { name: "amount", internalType: "uint256", type: "uint256" },
            { name: "mintReferral", internalType: "address", type: "address" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "to", internalType: "address", type: "address" },
            { name: "ids", internalType: "uint256[]", type: "uint256[]" },
            { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
            { name: "mintReferral", internalType: "address", type: "address" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "mintBatchWithERC20",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "to", internalType: "address", type: "address" },
            { name: "ids", internalType: "uint256[]", type: "uint256[]" },
            { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
            { name: "mintReferral", internalType: "address", type: "address" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "mintBatchWithETH",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "to", internalType: "address", type: "address" },
            { name: "tokenId", internalType: "uint256", type: "uint256" },
            { name: "amount", internalType: "uint256", type: "uint256" },
            { name: "mintReferral", internalType: "address", type: "address" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "mintWithERC20",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "data", internalType: "bytes[]", type: "bytes[]" }],
        name: "multicall",
        outputs: [{ name: "results", internalType: "bytes[]", type: "bytes[]" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "name",
        outputs: [{ name: "", internalType: "string", type: "string" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "proxiableUUID",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32" },
            { name: "callerConfirmation", internalType: "address", type: "address" },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32" },
            { name: "account", internalType: "address", type: "address" },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "from", internalType: "address", type: "address" },
            { name: "to", internalType: "address", type: "address" },
            { name: "ids", internalType: "uint256[]", type: "uint256[]" },
            { name: "values", internalType: "uint256[]", type: "uint256[]" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "safeBatchTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "from", internalType: "address", type: "address" },
            { name: "to", internalType: "address", type: "address" },
            { name: "id", internalType: "uint256", type: "uint256" },
            { name: "value", internalType: "uint256", type: "uint256" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "operator", internalType: "address", type: "address" },
            { name: "approved", internalType: "bool", type: "bool" },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "fees", internalType: "address", type: "address" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "setFees",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "logic", internalType: "address", type: "address" },
            { name: "creatorLogic", internalType: "bytes", type: "bytes" },
            { name: "minterLogic", internalType: "bytes", type: "bytes" },
        ],
        name: "setLogic",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "managers", internalType: "address[]", type: "address[]" }],
        name: "setManagers",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "data", internalType: "bytes", type: "bytes" }],
        name: "setTransportConfig",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "tokenPermission",
                internalType: "struct DeferredTokenAuthorization.DeferredTokenPermission",
                type: "tuple",
                components: [
                    { name: "uri", internalType: "string", type: "string" },
                    { name: "maxSupply", internalType: "uint256", type: "uint256" },
                    { name: "deadline", internalType: "uint256", type: "uint256" },
                    { name: "nonce", internalType: "bytes32", type: "bytes32" },
                ],
            },
            { name: "author", internalType: "address", type: "address" },
            { name: "signature", internalType: "bytes", type: "bytes" },
            { name: "to", internalType: "address", type: "address" },
            { name: "amount", internalType: "uint256", type: "uint256" },
            { name: "mintReferral", internalType: "address", type: "address" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "sponsorWithERC20",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "tokenPermission",
                internalType: "struct DeferredTokenAuthorization.DeferredTokenPermission",
                type: "tuple",
                components: [
                    { name: "uri", internalType: "string", type: "string" },
                    { name: "maxSupply", internalType: "uint256", type: "uint256" },
                    { name: "deadline", internalType: "uint256", type: "uint256" },
                    { name: "nonce", internalType: "bytes32", type: "bytes32" },
                ],
            },
            { name: "author", internalType: "address", type: "address" },
            { name: "signature", internalType: "bytes", type: "bytes" },
            { name: "to", internalType: "address", type: "address" },
            { name: "amount", internalType: "uint256", type: "uint256" },
            { name: "mintReferral", internalType: "address", type: "address" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "sponsorWithETH",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
        name: "supportsInterface",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
        name: "transferAdmin",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "channelName", internalType: "string", type: "string" },
            { name: "uri", internalType: "string", type: "string" },
        ],
        name: "updateChannelMetadata",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "newImplementation", internalType: "address", type: "address" },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "upgradeToAndCall",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
        name: "uri",
        outputs: [{ name: "", internalType: "string", type: "string" }],
        stateMutability: "view",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "previousAdmin",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "newAdmin",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "AdminTransferred",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "account",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "operator",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            { name: "approved", internalType: "bool", type: "bool", indexed: false },
        ],
        name: "ApprovalForAll",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "updater",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "channelName",
                internalType: "string",
                type: "string",
                indexed: false,
            },
            { name: "uri", internalType: "string", type: "string", indexed: false },
        ],
        name: "ChannelMetadataUpdated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "updater",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "updateType",
                internalType: "enum Channel.ConfigUpdate",
                type: "uint8",
                indexed: true,
            },
            {
                name: "feeContract",
                internalType: "address",
                type: "address",
                indexed: false,
            },
            {
                name: "logicContract",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "ConfigUpdated",
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
                name: "manager",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "ManagerRenounced",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "managers",
                internalType: "address[]",
                type: "address[]",
                indexed: false,
            },
        ],
        name: "ManagersUpdated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
            {
                name: "previousAdminRole",
                internalType: "bytes32",
                type: "bytes32",
                indexed: true,
            },
            {
                name: "newAdminRole",
                internalType: "bytes32",
                type: "bytes32",
                indexed: true,
            },
        ],
        name: "RoleAdminChanged",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
            {
                name: "account",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "sender",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "RoleGranted",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
            {
                name: "account",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "sender",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "RoleRevoked",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "tokenId",
                internalType: "uint256",
                type: "uint256",
                indexed: true,
            },
            {
                name: "token",
                internalType: "struct ChannelStorage.TokenConfig",
                type: "tuple",
                components: [
                    { name: "uri", internalType: "string", type: "string" },
                    { name: "author", internalType: "address", type: "address" },
                    { name: "maxSupply", internalType: "uint256", type: "uint256" },
                    { name: "totalMinted", internalType: "uint256", type: "uint256" },
                    { name: "sponsor", internalType: "address", type: "address" },
                ],
                indexed: false,
            },
        ],
        name: "TokenCreated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "minter",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "mintReferral",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "tokenIds",
                internalType: "uint256[]",
                type: "uint256[]",
                indexed: false,
            },
            {
                name: "amounts",
                internalType: "uint256[]",
                type: "uint256[]",
                indexed: false,
            },
            { name: "data", internalType: "bytes", type: "bytes", indexed: false },
        ],
        name: "TokenMinted",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "operator",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            { name: "from", internalType: "address", type: "address", indexed: true },
            { name: "to", internalType: "address", type: "address", indexed: true },
            {
                name: "ids",
                internalType: "uint256[]",
                type: "uint256[]",
                indexed: false,
            },
            {
                name: "values",
                internalType: "uint256[]",
                type: "uint256[]",
                indexed: false,
            },
        ],
        name: "TransferBatch",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "operator",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            { name: "from", internalType: "address", type: "address", indexed: true },
            { name: "to", internalType: "address", type: "address", indexed: true },
            { name: "id", internalType: "uint256", type: "uint256", indexed: false },
            {
                name: "value",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "TransferSingle",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "value", internalType: "string", type: "string", indexed: false },
            { name: "id", internalType: "uint256", type: "uint256", indexed: true },
        ],
        name: "URI",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "implementation",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "Upgraded",
    },
    { type: "error", inputs: [], name: "AccessControlBadConfirmation" },
    {
        type: "error",
        inputs: [
            { name: "account", internalType: "address", type: "address" },
            { name: "neededRole", internalType: "bytes32", type: "bytes32" },
        ],
        name: "AccessControlUnauthorizedAccount",
    },
    {
        type: "error",
        inputs: [{ name: "target", internalType: "address", type: "address" }],
        name: "AddressEmptyCode",
    },
    {
        type: "error",
        inputs: [{ name: "account", internalType: "address", type: "address" }],
        name: "AddressInsufficientBalance",
    },
    { type: "error", inputs: [], name: "AmountExceedsMaxSupply" },
    { type: "error", inputs: [], name: "AmountZero" },
    {
        type: "error",
        inputs: [
            { name: "sender", internalType: "address", type: "address" },
            { name: "balance", internalType: "uint256", type: "uint256" },
            { name: "needed", internalType: "uint256", type: "uint256" },
            { name: "tokenId", internalType: "uint256", type: "uint256" },
        ],
        name: "ERC1155InsufficientBalance",
    },
    {
        type: "error",
        inputs: [{ name: "approver", internalType: "address", type: "address" }],
        name: "ERC1155InvalidApprover",
    },
    {
        type: "error",
        inputs: [
            { name: "idsLength", internalType: "uint256", type: "uint256" },
            { name: "valuesLength", internalType: "uint256", type: "uint256" },
        ],
        name: "ERC1155InvalidArrayLength",
    },
    {
        type: "error",
        inputs: [{ name: "operator", internalType: "address", type: "address" }],
        name: "ERC1155InvalidOperator",
    },
    {
        type: "error",
        inputs: [{ name: "receiver", internalType: "address", type: "address" }],
        name: "ERC1155InvalidReceiver",
    },
    {
        type: "error",
        inputs: [{ name: "sender", internalType: "address", type: "address" }],
        name: "ERC1155InvalidSender",
    },
    {
        type: "error",
        inputs: [
            { name: "operator", internalType: "address", type: "address" },
            { name: "owner", internalType: "address", type: "address" },
        ],
        name: "ERC1155MissingApprovalForAll",
    },
    {
        type: "error",
        inputs: [{ name: "implementation", internalType: "address", type: "address" }],
        name: "ERC1967InvalidImplementation",
    },
    { type: "error", inputs: [], name: "ERC1967NonPayable" },
    { type: "error", inputs: [], name: "ERC20TransferFailed" },
    { type: "error", inputs: [], name: "FailedInnerCall" },
    { type: "error", inputs: [], name: "InsufficientBalance" },
    { type: "error", inputs: [], name: "InsufficientInteractionPower" },
    { type: "error", inputs: [], name: "InvalidAmountSent" },
    { type: "error", inputs: [], name: "InvalidContractSignature" },
    { type: "error", inputs: [], name: "InvalidInitialization" },
    { type: "error", inputs: [], name: "InvalidSignature" },
    { type: "error", inputs: [], name: "InvalidSignature" },
    { type: "error", inputs: [], name: "InvalidSignatureLength" },
    { type: "error", inputs: [], name: "InvalidSigner" },
    { type: "error", inputs: [], name: "InvalidTotalAllocation" },
    { type: "error", inputs: [], name: "InvalidUpgrade" },
    { type: "error", inputs: [], name: "NotInitializing" },
    { type: "error", inputs: [], name: "NotMintable" },
    { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
    {
        type: "error",
        inputs: [{ name: "token", internalType: "address", type: "address" }],
        name: "SafeERC20FailedOperation",
    },
    { type: "error", inputs: [], name: "SignatureExpired" },
    { type: "error", inputs: [], name: "SoldOut" },
    { type: "error", inputs: [], name: "SplitLengthMismatch" },
    { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
    {
        type: "error",
        inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
        name: "UUPSUnsupportedProxiableUUID",
    },
    { type: "error", inputs: [], name: "Unauthorized" },
] as const;