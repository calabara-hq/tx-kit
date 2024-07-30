import { gql, createClient, Client, fetchExchange } from '@urql/core'
import { ApiConfig } from '../types'
import { BASE_MAINNET_SUBGRAPH_URL } from '../constants'

const CHANNEL_FRAGMENT = gql`
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
`

const TRANSPORT_LAYER_FRAGMENT = gql`
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
`

const LOGIC_CONFIG_FRAGMENT = gql`
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

`
const FEE_CONFIG_FRAGMENT = gql`
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
`

const TOKEN_FRAGMENT = gql`
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
`


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


export type GqlVariables = {
    [key: string]: string | number | boolean | undefined | string[] | object
}

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