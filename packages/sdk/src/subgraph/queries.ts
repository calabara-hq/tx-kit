import { gql, createClient, Client, fetchExchange } from '@urql/core'
import { ApiConfig } from '../types.js'
import { BASE_MAINNET_SUBGRAPH_URL } from '../constants.js'
import { CHANNEL_FRAGMENT, FEE_CONFIG_FRAGMENT, LOGIC_CONFIG_FRAGMENT, TOKEN_FRAGMENT, TRANSPORT_LAYER_FRAGMENT } from './fragments.js'


export const _channelQuery = gql`
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
    ${CHANNEL_FRAGMENT}
    ${TRANSPORT_LAYER_FRAGMENT}
    ${LOGIC_CONFIG_FRAGMENT}
    ${FEE_CONFIG_FRAGMENT}
    ${TOKEN_FRAGMENT}
`

export const _allChannelsQuery = gql`
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
    ${CHANNEL_FRAGMENT}
    ${TRANSPORT_LAYER_FRAGMENT}
    ${LOGIC_CONFIG_FRAGMENT}
    ${FEE_CONFIG_FRAGMENT}
    ${TOKEN_FRAGMENT}
`

export const _paginatedChannelTokensQuery = gql`
    query Channel($id: ID!, $pageSize: Int!, $skip: Int!, $orderBy: Token_orderBy, $orderDirection: OrderDirection, $where: Token_filter) {
        channel(id: $id) {
            tokens(first: $pageSize, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
                ...TokenFragment
            }
        }
    }
    ${TOKEN_FRAGMENT}

`

export const _channelUpgradeEventsQuery = gql`
    query channelUpgrades($where: ChannelUpgradeRegisteredEvent_filter) {
        channelUpgradeRegisteredEvents(where: $where) {
            id
            baseImpl
            upgradeImpl
            blockNumber
            blockTimestamp
        }
    }
`
export const getGraphqlClient = (apiConfig?: ApiConfig): Client => {
    const serverURL = apiConfig?.serverUrl ?? BASE_MAINNET_SUBGRAPH_URL

    const headers = {}

    return createClient({
        url: serverURL,
        exchanges: [fetchExchange],
        fetchOptions: {
            headers,
        },
    })
}