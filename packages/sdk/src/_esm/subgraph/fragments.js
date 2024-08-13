import { gql } from '@urql/core';
export const CHANNEL_FRAGMENT = gql `
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
export const TRANSPORT_LAYER_FRAGMENT = gql `
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
export const LOGIC_CONFIG_FRAGMENT = gql `
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
export const FEE_CONFIG_FRAGMENT = gql `
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
export const TOKEN_FRAGMENT = gql `
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
//# sourceMappingURL=fragments.js.map