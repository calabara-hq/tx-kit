import { encodeAbiParameters, Hex, zeroHash, Address } from "viem";
import { CustomFeeInputs } from "../types.js";
import { getNumberFromPercent } from "./numbers.js";

export const encodeCustomFeeInputs = (input: CustomFeeInputs): Hex => {

    if (input) {

        const preparedContractInputs = {
            channelTreasury: input.channelTreasury as Address,
            uplinkBps: getNumberFromPercent(input.uplinkPercentage),
            channelBps: getNumberFromPercent(input.channelPercentage),
            creatorBps: getNumberFromPercent(input.creatorPercentage),
            mintReferralBps: getNumberFromPercent(input.mintReferralPercentage),
            sponsorBps: getNumberFromPercent(input.sponsorPercentage),
            ethMintPrice: input.ethMintPrice,
            erc20MintPrice: input.erc20MintPrice,
            erc20Contract: input.erc20Contract as Address
        }

        return encodeAbiParameters(
            [
                { name: 'channelTreasury', type: 'address' },
                { name: 'uplinkBps', type: 'uint16' },
                { name: 'channelBps', type: 'uint16' },
                { name: 'creatorBps', type: 'uint16' },
                { name: 'mintReferralBps', type: 'uint16' },
                { name: 'sponsorBps', type: 'uint16' },
                { name: 'ethMintPrice', type: 'uint256' },
                { name: 'erc20MintPrice', type: 'uint256' },
                { name: 'erc20Contract', type: 'address' }
            ],
            [
                preparedContractInputs.channelTreasury,
                preparedContractInputs.uplinkBps,
                preparedContractInputs.channelBps,
                preparedContractInputs.creatorBps,
                preparedContractInputs.mintReferralBps,
                preparedContractInputs.sponsorBps,
                preparedContractInputs.ethMintPrice,
                preparedContractInputs.erc20MintPrice,
                preparedContractInputs.erc20Contract
            ]
        )
    } else return zeroHash

}