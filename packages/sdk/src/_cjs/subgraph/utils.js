"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatGqlUpgradePath = exports.formatGqlChannel = exports.formatGqlTokens = exports.formatGqlTokenMetadata = exports.formatGqlFeeConfig = exports.formatGqlCustomFees = exports.formatGqlLogicConfig = exports.formatGqlDynamicLogic = exports.formatGqlTransportLayer = void 0;
const viem_1 = require("viem");
const numbers_js_1 = require("../utils/numbers.js");
const formatGqlTransportLayer = (transportLayer) => {
    const formatted = {};
    if (transportLayer) {
        formatted.id = transportLayer.id;
        formatted.blockNumber = BigInt(transportLayer.blockNumber);
        formatted.blockTimestamp = BigInt(transportLayer.blockTimestamp);
        if (transportLayer.type === "finite") {
            formatted.type = "finite";
            formatted.transportConfig = {
                id: transportLayer.finiteTransportConfig.id,
                createStart: transportLayer.finiteTransportConfig.createStart,
                mintStart: transportLayer.finiteTransportConfig.mintStart,
                mintEnd: transportLayer.finiteTransportConfig.mintEnd,
                ranks: transportLayer.finiteTransportConfig.ranks,
                allocations: transportLayer.finiteTransportConfig.allocations.map(BigInt),
                totalAllocation: BigInt(transportLayer.finiteTransportConfig.totalAllocation),
                token: (0, viem_1.getAddress)(transportLayer.finiteTransportConfig.token),
                settled: transportLayer.finiteTransportConfig.settled,
                settledBy: (0, viem_1.getAddress)(transportLayer.finiteTransportConfig.settledBy),
                settledAt: transportLayer.finiteTransportConfig.settledAt
            };
        }
        else if (transportLayer.type === "infinite") {
            formatted.type = "infinite";
            formatted.transportConfig = {
                id: transportLayer.infiniteTransportConfig.id,
                saleDuration: transportLayer.infiniteTransportConfig.saleDuration
            };
        }
    }
    return formatted;
};
exports.formatGqlTransportLayer = formatGqlTransportLayer;
const formatGqlDynamicLogic = (dynamicLogic) => {
    return {
        id: dynamicLogic.id,
        targets: dynamicLogic.targets.map(viem_1.getAddress),
        signatures: dynamicLogic.signatures,
        datas: dynamicLogic.datas,
        operators: dynamicLogic.operators,
        literalOperands: dynamicLogic.literalOperands,
        interactionPowerTypes: dynamicLogic.interactionPowerTypes,
        interactionPowers: dynamicLogic.interactionPowers
    };
};
exports.formatGqlDynamicLogic = formatGqlDynamicLogic;
const formatGqlLogicConfig = (logicConfig) => {
    if (logicConfig.type === "dynamicLogic") {
        return {
            id: logicConfig.id,
            type: "dynamicLogic",
            updatedBy: (0, viem_1.getAddress)(logicConfig.updatedBy),
            logicContract: (0, viem_1.getAddress)(logicConfig.logicContract),
            logic: (0, exports.formatGqlDynamicLogic)(logicConfig.dynamicLogic)
        };
    }
};
exports.formatGqlLogicConfig = formatGqlLogicConfig;
const formatGqlCustomFees = (fees) => {
    return {
        id: fees.id,
        channelTreasury: (0, viem_1.getAddress)(fees.channelTreasury),
        uplinkPercentage: (0, numbers_js_1.fromBigIntToPercent)(BigInt(fees.uplinkBps)),
        channelPercentage: (0, numbers_js_1.fromBigIntToPercent)(BigInt(fees.channelBps)),
        creatorPercentage: (0, numbers_js_1.fromBigIntToPercent)(BigInt(fees.creatorBps)),
        mintReferralPercentage: (0, numbers_js_1.fromBigIntToPercent)(BigInt(fees.mintReferralBps)),
        sponsorPercentage: (0, numbers_js_1.fromBigIntToPercent)(BigInt(fees.sponsorBps)),
        ethMintPrice: BigInt(fees.ethMintPrice),
        erc20MintPrice: BigInt(fees.erc20MintPrice),
        erc20Contract: (0, viem_1.getAddress)(fees.erc20Contract)
    };
};
exports.formatGqlCustomFees = formatGqlCustomFees;
const formatGqlFeeConfig = (feeConfig) => {
    if (feeConfig.type === "customFees") {
        return {
            id: feeConfig.id,
            type: "customFees",
            updatedBy: (0, viem_1.getAddress)(feeConfig.updatedBy),
            feeContract: (0, viem_1.getAddress)(feeConfig.feeContract),
            fees: (0, exports.formatGqlCustomFees)(feeConfig.customFees)
        };
    }
};
exports.formatGqlFeeConfig = formatGqlFeeConfig;
const formatGqlTokenMetadata = (metadata) => {
    if (metadata)
        return metadata;
    return null;
};
exports.formatGqlTokenMetadata = formatGqlTokenMetadata;
const formatGqlTokens = (tokens) => {
    return tokens.map(token => {
        return {
            id: token.id,
            channelAddress: (0, viem_1.getAddress)(token.id.split('-')[0]),
            tokenId: BigInt(token.tokenId),
            author: (0, viem_1.getAddress)(token.author.id),
            sponsor: (0, viem_1.getAddress)(token.sponsor.id),
            uri: token.uri,
            metadata: (0, exports.formatGqlTokenMetadata)(token.metadata),
            totalMinted: BigInt(token.totalMinted),
            maxSupply: BigInt(token.maxSupply),
            blockNumber: BigInt(token.blockNumber),
            blockTimestamp: BigInt(token.blockTimestamp),
        };
    });
};
exports.formatGqlTokens = formatGqlTokens;
const formatGqlChannel = (channel) => {
    const formatted = {
        id: (0, viem_1.getAddress)(channel.id),
        uri: channel.uri,
        name: channel.name,
        admin: (0, viem_1.getAddress)(channel.admin.id),
        managers: channel.managers.map(user => (0, viem_1.getAddress)(user.id)),
        transportLayer: (0, exports.formatGqlTransportLayer)(channel.transportLayer),
        blockNumber: BigInt(channel.blockNumber),
        blockTimestamp: BigInt(channel.blockTimestamp),
        creatorLogic: null,
        minterLogic: null,
        fees: null,
        tokens: []
    };
    if (channel.creatorLogic) {
        if (channel.creatorLogic.logicContract !== viem_1.zeroAddress) {
            const formattedLogic = (0, exports.formatGqlLogicConfig)(channel.creatorLogic);
            if (formattedLogic) {
                formatted.creatorLogic = formattedLogic;
            }
        }
    }
    if (channel.minterLogic) {
        if (channel.minterLogic.logicContract !== viem_1.zeroAddress) {
            const formattedLogic = (0, exports.formatGqlLogicConfig)(channel.minterLogic);
            if (formattedLogic) {
                formatted.minterLogic = formattedLogic;
            }
        }
    }
    if (channel.fees) {
        if (channel.fees.feeContract !== viem_1.zeroAddress) {
            const formattedFees = (0, exports.formatGqlFeeConfig)(channel.fees);
            if (formattedFees) {
                formatted.fees = formattedFees;
            }
        }
    }
    if (channel.tokens) {
        formatted.tokens = (0, exports.formatGqlTokens)(channel.tokens);
    }
    return formatted;
};
exports.formatGqlChannel = formatGqlChannel;
const formatGqlUpgradePath = (upgradePath) => {
    if (!upgradePath)
        return null;
    return {
        id: upgradePath.id,
        baseImpl: (0, viem_1.getAddress)(upgradePath.baseImpl),
        upgradeImpl: (0, viem_1.getAddress)(upgradePath.upgradeImpl),
        blockNumber: BigInt(upgradePath.blockNumber),
        blockTimestamp: BigInt(upgradePath.blockTimestamp)
    };
};
exports.formatGqlUpgradePath = formatGqlUpgradePath;
//# sourceMappingURL=utils.js.map