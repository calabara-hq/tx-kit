"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCustomFeeInputs = void 0;
const viem_1 = require("viem");
const numbers_js_1 = require("./numbers.js");
const encodeCustomFeeInputs = (input) => {
    if (input) {
        const preparedContractInputs = {
            channelTreasury: input.channelTreasury,
            uplinkBps: (0, numbers_js_1.getNumberFromPercent)(input.uplinkPercentage),
            channelBps: (0, numbers_js_1.getNumberFromPercent)(input.channelPercentage),
            creatorBps: (0, numbers_js_1.getNumberFromPercent)(input.creatorPercentage),
            mintReferralBps: (0, numbers_js_1.getNumberFromPercent)(input.mintReferralPercentage),
            sponsorBps: (0, numbers_js_1.getNumberFromPercent)(input.sponsorPercentage),
            ethMintPrice: input.ethMintPrice,
            erc20MintPrice: input.erc20MintPrice,
            erc20Contract: input.erc20Contract
        };
        return (0, viem_1.encodeAbiParameters)([
            { name: 'channelTreasury', type: 'address' },
            { name: 'uplinkBps', type: 'uint16' },
            { name: 'channelBps', type: 'uint16' },
            { name: 'creatorBps', type: 'uint16' },
            { name: 'mintReferralBps', type: 'uint16' },
            { name: 'sponsorBps', type: 'uint16' },
            { name: 'ethMintPrice', type: 'uint256' },
            { name: 'erc20MintPrice', type: 'uint256' },
            { name: 'erc20Contract', type: 'address' }
        ], [
            preparedContractInputs.channelTreasury,
            preparedContractInputs.uplinkBps,
            preparedContractInputs.channelBps,
            preparedContractInputs.creatorBps,
            preparedContractInputs.mintReferralBps,
            preparedContractInputs.sponsorBps,
            preparedContractInputs.ethMintPrice,
            preparedContractInputs.erc20MintPrice,
            preparedContractInputs.erc20Contract
        ]);
    }
    else
        return viem_1.zeroHash;
};
exports.encodeCustomFeeInputs = encodeCustomFeeInputs;
//# sourceMappingURL=fees.js.map