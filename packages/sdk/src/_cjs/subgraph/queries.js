"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGraphqlClient = exports._channelUpgradeEventsQuery = exports._paginatedChannelTokensQuery = exports._allChannelsQuery = exports._channelQuery = void 0;
const core_1 = require("@urql/core");
const constants_js_1 = require("../constants.js");
const fragments_js_1 = require("./fragments.js");
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
    ${fragments_js_1.CHANNEL_FRAGMENT}
    ${fragments_js_1.TRANSPORT_LAYER_FRAGMENT}
    ${fragments_js_1.LOGIC_CONFIG_FRAGMENT}
    ${fragments_js_1.FEE_CONFIG_FRAGMENT}
    ${fragments_js_1.TOKEN_FRAGMENT}
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
    ${fragments_js_1.CHANNEL_FRAGMENT}
    ${fragments_js_1.TRANSPORT_LAYER_FRAGMENT}
    ${fragments_js_1.LOGIC_CONFIG_FRAGMENT}
    ${fragments_js_1.FEE_CONFIG_FRAGMENT}
    ${fragments_js_1.TOKEN_FRAGMENT}
`;
exports._paginatedChannelTokensQuery = (0, core_1.gql) `
    query Channel($id: ID!, $pageSize: Int!, $skip: Int!, $orderBy: Token_orderBy, $orderDirection: OrderDirection, $where: Token_filter) {
        channel(id: $id) {
            tokens(first: $pageSize, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
                ...TokenFragment
            }
        }
    }
    ${fragments_js_1.TOKEN_FRAGMENT}

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
//# sourceMappingURL=queries.js.map