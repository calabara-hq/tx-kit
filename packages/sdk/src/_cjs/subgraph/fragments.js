"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_FRAGMENT = exports.FEE_CONFIG_FRAGMENT = exports.LOGIC_CONFIG_FRAGMENT = exports.TRANSPORT_LAYER_FRAGMENT = exports.CHANNEL_FRAGMENT = void 0;
const core_1 = require("@urql/core");
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
//# sourceMappingURL=fragments.js.map