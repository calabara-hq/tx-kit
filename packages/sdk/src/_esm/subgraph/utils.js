import { getAddress, zeroAddress } from "viem";
import { fromBigIntToPercent } from "../utils/numbers.js";
export const formatGqlTransportLayer = (transportLayer) => {
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
                token: getAddress(transportLayer.finiteTransportConfig.token),
                settled: transportLayer.finiteTransportConfig.settled,
                settledBy: getAddress(transportLayer.finiteTransportConfig.settledBy),
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
export const formatGqlDynamicLogic = (dynamicLogic) => {
    return {
        id: dynamicLogic.id,
        targets: dynamicLogic.targets.map(getAddress),
        signatures: dynamicLogic.signatures,
        datas: dynamicLogic.datas,
        operators: dynamicLogic.operators,
        literalOperands: dynamicLogic.literalOperands,
        interactionPowerTypes: dynamicLogic.interactionPowerTypes,
        interactionPowers: dynamicLogic.interactionPowers
    };
};
export const formatGqlLogicConfig = (logicConfig) => {
    if (logicConfig.type === "dynamicLogic") {
        return {
            id: logicConfig.id,
            type: "dynamicLogic",
            updatedBy: getAddress(logicConfig.updatedBy),
            logicContract: getAddress(logicConfig.logicContract),
            logic: formatGqlDynamicLogic(logicConfig.dynamicLogic)
        };
    }
};
export const formatGqlCustomFees = (fees) => {
    return {
        id: fees.id,
        channelTreasury: getAddress(fees.channelTreasury),
        uplinkPercentage: fromBigIntToPercent(BigInt(fees.uplinkBps)),
        channelPercentage: fromBigIntToPercent(BigInt(fees.channelBps)),
        creatorPercentage: fromBigIntToPercent(BigInt(fees.creatorBps)),
        mintReferralPercentage: fromBigIntToPercent(BigInt(fees.mintReferralBps)),
        sponsorPercentage: fromBigIntToPercent(BigInt(fees.sponsorBps)),
        ethMintPrice: BigInt(fees.ethMintPrice),
        erc20MintPrice: BigInt(fees.erc20MintPrice),
        erc20Contract: getAddress(fees.erc20Contract)
    };
};
export const formatGqlFeeConfig = (feeConfig) => {
    if (feeConfig.type === "customFees") {
        return {
            id: feeConfig.id,
            type: "customFees",
            updatedBy: getAddress(feeConfig.updatedBy),
            feeContract: getAddress(feeConfig.feeContract),
            fees: formatGqlCustomFees(feeConfig.customFees)
        };
    }
};
export const formatGqlTokenMetadata = (metadata) => {
    if (metadata)
        return metadata;
    return null;
};
export const formatGqlTokens = (tokens) => {
    return tokens.map(token => {
        return {
            id: token.id,
            channelAddress: getAddress(token.id.split('-')[0]),
            tokenId: BigInt(token.tokenId),
            author: getAddress(token.author.id),
            sponsor: getAddress(token.sponsor.id),
            uri: token.uri,
            metadata: formatGqlTokenMetadata(token.metadata),
            totalMinted: BigInt(token.totalMinted),
            maxSupply: BigInt(token.maxSupply),
            blockNumber: BigInt(token.blockNumber),
            blockTimestamp: BigInt(token.blockTimestamp),
        };
    });
};
export const formatGqlChannel = (channel) => {
    const formatted = {
        id: getAddress(channel.id),
        uri: channel.uri,
        name: channel.name,
        admin: getAddress(channel.admin.id),
        managers: channel.managers.map(user => getAddress(user.id)),
        transportLayer: formatGqlTransportLayer(channel.transportLayer),
        blockNumber: BigInt(channel.blockNumber),
        blockTimestamp: BigInt(channel.blockTimestamp),
        creatorLogic: null,
        minterLogic: null,
        fees: null,
        tokens: []
    };
    if (channel.creatorLogic) {
        if (channel.creatorLogic.logicContract !== zeroAddress) {
            const formattedLogic = formatGqlLogicConfig(channel.creatorLogic);
            if (formattedLogic) {
                formatted.creatorLogic = formattedLogic;
            }
        }
    }
    if (channel.minterLogic) {
        if (channel.minterLogic.logicContract !== zeroAddress) {
            const formattedLogic = formatGqlLogicConfig(channel.minterLogic);
            if (formattedLogic) {
                formatted.minterLogic = formattedLogic;
            }
        }
    }
    if (channel.fees) {
        if (channel.fees.feeContract !== zeroAddress) {
            const formattedFees = formatGqlFeeConfig(channel.fees);
            if (formattedFees) {
                formatted.fees = formattedFees;
            }
        }
    }
    if (channel.tokens) {
        formatted.tokens = formatGqlTokens(channel.tokens);
    }
    return formatted;
};
export const formatGqlUpgradePath = (upgradePath) => {
    if (!upgradePath)
        return null;
    return {
        id: upgradePath.id,
        baseImpl: getAddress(upgradePath.baseImpl),
        upgradeImpl: getAddress(upgradePath.upgradeImpl),
        blockNumber: BigInt(upgradePath.blockNumber),
        blockTimestamp: BigInt(upgradePath.blockTimestamp)
    };
};
//# sourceMappingURL=utils.js.map