"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGraphqlClient = exports._channelUpgradeEventsQuery = exports._paginatedChannelTokensQuery = exports._allChannelsQuery = exports._channelQuery = exports.TOKEN_FRAGMENT = exports.FEE_CONFIG_FRAGMENT = exports.LOGIC_CONFIG_FRAGMENT = exports.TRANSPORT_LAYER_FRAGMENT = exports.CHANNEL_FRAGMENT = void 0;
const core_1 = require("@urql/core");
const constants_js_1 = require("../constants.js");
exports.CHANNEL_FRAGMENT = (0, core_1.gql) `
    fragment ChannelFragment on Channel {
        id
        name
        uri
        admin {
            id
        }
        managers {
            id
        }
        blockNumber
        blockTimestamp
    }
`;
exports.TRANSPORT_LAYER_FRAGMENT = (0, core_1.gql) `
    fragment TransportLayerFragment on TransportLayer {
        id
        type
        finiteTransportConfig {
            id
            createStart
            mintStart
            mintEnd
            ranks
            allocations
            totalAllocation
            token
            settled
            settledBy
            settledAt
        }
        infiniteTransportConfig {
            id
            saleDuration
        }
        blockNumber
        blockTimestamp
    }
`;
exports.LOGIC_CONFIG_FRAGMENT = (0, core_1.gql) `
    fragment LogicConfigFragment on LogicConfig {
        id
        logicContract
        type
        updatedBy
        dynamicLogic {
            id
            targets
            signatures
            datas
            operators
            literalOperands
            interactionPowerTypes
            interactionPowers
        }
    }

`;
exports.FEE_CONFIG_FRAGMENT = (0, core_1.gql) `
    fragment FeeConfigFragment on FeeConfig {
        id
        type
        updatedBy
        feeContract
        customFees {
            id
            channelTreasury
            uplinkBps
            channelBps
            creatorBps
            mintReferralBps
            sponsorBps
            ethMintPrice
            erc20MintPrice
            erc20Contract
        }
    }
`;
exports.TOKEN_FRAGMENT = (0, core_1.gql) `
    fragment TokenFragment on Token {
      id
      tokenId
      author {
        id
      }
      sponsor {
        id
      }
      uri
      metadata {
        id
        name
        description
        image
        animation
        type
      }
      totalMinted
      maxSupply
      blockNumber
      blockTimestamp
      holders {
        id
      }
    }
`;
exports._channelQuery = (0, core_1.gql) `
    query Channel($id: ID!, $includeTokens: Boolean) {
        channel(id: $id) {
            ...ChannelFragment
            transportLayer {
                ...TransportLayerFragment
            }
            creatorLogic {
                ...LogicConfigFragment
            }
            minterLogic {
                ...LogicConfigFragment
            }
            fees { 
                ...FeeConfigFragment 
            }
            tokens @include(if: $includeTokens) {
                ...TokenFragment
            }
        }
    }
    ${exports.CHANNEL_FRAGMENT}
    ${exports.TRANSPORT_LAYER_FRAGMENT}
    ${exports.LOGIC_CONFIG_FRAGMENT}
    ${exports.FEE_CONFIG_FRAGMENT}
    ${exports.TOKEN_FRAGMENT}
`;
exports._allChannelsQuery = (0, core_1.gql) `
    query Channels($includeTokens: Boolean, $where: Channel_filter, $pageSize: Int, $skip: Int, $orderBy: Channel_orderBy, $orderDirection: OrderDirection) {
        channels(where: $where, first: $pageSize, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
            ...ChannelFragment
            transportLayer {
                ...TransportLayerFragment
            }
            creatorLogic {
                ...LogicConfigFragment
            }
            minterLogic {
                ...LogicConfigFragment
            }
            fees { 
                ...FeeConfigFragment 
            }
            tokens @include(if: $includeTokens) {
                ...TokenFragment
            }
        }
    }
    ${exports.CHANNEL_FRAGMENT}
    ${exports.TRANSPORT_LAYER_FRAGMENT}
    ${exports.LOGIC_CONFIG_FRAGMENT}
    ${exports.FEE_CONFIG_FRAGMENT}
    ${exports.TOKEN_FRAGMENT}
`;
exports._paginatedChannelTokensQuery = (0, core_1.gql) `
    query Channel($id: ID!, $pageSize: Int!, $skip: Int!, $orderBy: Token_orderBy, $orderDirection: OrderDirection, $where: Token_filter) {
        channel(id: $id) {
            tokens(first: $pageSize, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
                ...TokenFragment
            }
        }
    }
    ${exports.TOKEN_FRAGMENT}

`;
exports._channelUpgradeEventsQuery = (0, core_1.gql) `
    query channelUpgrades($where: ChannelUpgradeRegisteredEvent_filter) {
        channelUpgradeRegisteredEvents(where: $where) {
            id
            baseImpl
            upgradeImpl
            blockNumber
            blockTimestamp
        }
    }
`;
const getGraphqlClient = (apiConfig) => {
    const serverURL = apiConfig?.serverUrl ?? constants_js_1.BASE_MAINNET_SUBGRAPH_URL;
    const headers = {};
    return (0, core_1.createClient)({
        url: serverURL,
        exchanges: [core_1.fetchExchange],
        fetchOptions: {
            headers,
        },
    });
};
exports.getGraphqlClient = getGraphqlClient;
//# sourceMappingURL=index.js.map