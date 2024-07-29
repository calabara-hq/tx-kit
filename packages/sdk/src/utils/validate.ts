import { InvalidArgumentError } from "../errors";
import { ApproveERC20Config, ChannelFeeArguments, CreateFiniteChannelConfig, CreateInfiniteChannelConfig, CreateTokenConfig, DeferredTokenIntentWithSignature, DynamicLogicInputs, FiniteTransportLayer, InfiniteTransportLayer, isChannelFeeArguments, isChannelLogicArguments, LogicInteractionPowerTypes, MintTokenBatchConfig, SetupAction, SponsorTokenConfig, WithdrawRewardsConfig } from "../types";
import { isAddress, recoverTypedDataAddress, zeroAddress } from 'viem'
import { MAX_PRECISION_DECIMALS } from "../constants";
import { roundToDecimals } from "./numbers";

const getNumDigitsAfterDecimal = (value: number): number => {
    if (Number.isInteger(value)) return 0

    const decimalStr = value.toString().split('.')[1]
    return decimalStr.length
}

export const validateFeePercentage = (fee: number): void => {
    if (fee < 0 || fee > 100) {
        throw new InvalidArgumentError(`Invalid percentage: ${fee}. Must be between 0 and 100`)
    }

    if (getNumDigitsAfterDecimal(fee) > MAX_PRECISION_DECIMALS) {
        throw new InvalidArgumentError(`Invalid precision on percentage: ${fee}. Max precision is ${MAX_PRECISION_DECIMALS}`)
    }
}

export const validateAddress = (address: string): void => {
    if (!isAddress(address)) {
        throw new InvalidArgumentError(`Invalid address: ${address}`)
    }
}

export const validateHex = (hex: string): void => {
    if (!hex.startsWith('0x')) {
        throw new InvalidArgumentError(`Invalid hex data: ${hex}`)
    }
}

export const validateSetFeeInputs = (args: ChannelFeeArguments): void => {
    validateAddress(args.feeContract);
    if (args.feeArgs) {

        validateAddress(args.feeArgs.channelTreasury);
        validateAddress(args.feeArgs.erc20Contract);

        if (args.feeArgs.ethMintPrice <= 0) {
            throw new InvalidArgumentError(`Invalid eth mint price: ${args.feeArgs.ethMintPrice}`)
        }

        validateFeePercentage(args.feeArgs.uplinkPercentage);
        validateFeePercentage(args.feeArgs.channelPercentage);
        validateFeePercentage(args.feeArgs.creatorPercentage);
        validateFeePercentage(args.feeArgs.mintReferralPercentage);
        validateFeePercentage(args.feeArgs.sponsorPercentage);

        let totalAllocation =
            args.feeArgs.uplinkPercentage
            + args.feeArgs.channelPercentage
            + args.feeArgs.creatorPercentage
            + args.feeArgs.mintReferralPercentage
            + args.feeArgs.sponsorPercentage

        // Cutoff any decimals beyond the max precision, they may get introduced due
        // to javascript floating point precision
        totalAllocation = roundToDecimals(
            totalAllocation,
            MAX_PRECISION_DECIMALS,
        )
        if (totalAllocation !== 100)
            throw new InvalidArgumentError(
                `Fee percentages must add up to 100. The current total is ${totalAllocation}`,
            )
    }
}

export const validateSetLogicInputs = (inputs: DynamicLogicInputs[]): void => {
    const data = {
        targets: [] as any[],
        signatures: [] as any[],
        datas: [] as any[],
        literalOperands: [] as any[],
        operators: [] as any[],
        interactionPowerTypes: [] as any[],
        interactionPowers: [] as any[],
    };

    for (const input of inputs) {
        if (input.target) {
            validateAddress(input.target);
            data.targets.push(input.target);
        }

        if (input.signature) {
            validateHex(input.signature);
            data.signatures.push(input.signature);
        }

        if (input.data) {
            validateHex(input.data);
            data.datas.push(input.data);
        }

        if (input.literalOperand) {
            validateHex(input.literalOperand);
            data.literalOperands.push(input.literalOperand);
        }

        if (input.operator >= 0) {
            data.operators.push(input.operator);
        }

        if (input.interactionPowerType >= 0) {
            data.interactionPowerTypes.push(input.interactionPowerType);
        }

        if (input.interactionPower >= BigInt(0)) {
            data.interactionPowers.push(input.interactionPower);
        }
    }

    const allArraysEqualLength = Object.values(data).every(arr => arr.length === data.targets.length);

    if (!allArraysEqualLength) {
        throw new InvalidArgumentError(
            'Invalid logic inputs. Each logic element must have shape [interactionPower] if result of [target, signature, data] [gt/lt/eq] [literalOperand]'
        );
    }
};


export const validateInfiniteTransportLayer = (transportLayer: InfiniteTransportLayer): void => {

    if (transportLayer.saleDurationInSeconds <= 0) {
        throw new InvalidArgumentError(`Invalid sale duration: ${transportLayer.saleDurationInSeconds}. Duration must be greater than 0`)
    }
}

export const validateFiniteTransportLayer = (transportLayer: FiniteTransportLayer): void => {

    if (transportLayer.mintStartInSeconds <= transportLayer.createStartInSeconds) {
        throw new InvalidArgumentError(`Invalid mint start time: ${transportLayer.mintStartInSeconds}. Mint start time must be after create start time`)
    }

    if (transportLayer.mintEndInSeconds <= transportLayer.mintStartInSeconds) {
        throw new InvalidArgumentError(`Invalid mint end time: ${transportLayer.mintEndInSeconds}. Mint end time must be after mint start time`)
    }

    /// rank / allocation validation

    if (transportLayer.rewards.ranks.length !== transportLayer.rewards.allocations.length) {
        throw new InvalidArgumentError(`Invalid rewards. Ranks and allocations must be of the same length`)
    }

    let totalAllocation = BigInt(0);
    for (let i = 0; i < transportLayer.rewards.ranks.length; i++) {
        if (i != transportLayer.rewards.ranks.length - 1) {
            if (transportLayer.rewards.ranks[i] >= transportLayer.rewards.ranks[i + 1])
                throw new InvalidArgumentError(`Invalid rank ${transportLayer.rewards.ranks[i]}. Ranks cannot contain dupliecates and must be in ascending order`)
        }
        totalAllocation += transportLayer.rewards.allocations[i];
    }

    if (totalAllocation !== transportLayer.rewards.totalAllocation) {
        throw new InvalidArgumentError(`Invalid rewards. Computed total allocation ${totalAllocation} does not match provided total allocation ${transportLayer.rewards.totalAllocation}`)
    }

    validateAddress(transportLayer.rewards.token);

}

export const validateSetupActions = (actions: SetupAction[]): void => {
    for (const action of actions) {
        if (isChannelFeeArguments(action)) {
            validateAddress(action.feeContract);
            validateSetFeeInputs(action);
        }
        if (isChannelLogicArguments(action)) {
            validateAddress(action.logicContract);
            validateSetLogicInputs(action.creatorLogic);
            validateSetLogicInputs(action.minterLogic);
        }
    }
}

export const validateInfiniteChannelInputs = (inputs: CreateInfiniteChannelConfig): void => {
    validateAddress(inputs.defaultAdmin);
    inputs.managers.forEach(validateAddress);
    validateSetupActions(inputs.setupActions);
    validateInfiniteTransportLayer(inputs.transportLayer);
}

export const validateFiniteChannelInputs = (inputs: CreateFiniteChannelConfig): void => {
    validateAddress(inputs.defaultAdmin);
    inputs.managers.forEach(validateAddress);
    validateSetupActions(inputs.setupActions);
    validateFiniteTransportLayer(inputs.transportLayer);
}

export const validateCreateTokenInputs = (inputs: CreateTokenConfig): void => {

    validateAddress(inputs.channelAddress);

    if (!inputs.uri) {
        throw new InvalidArgumentError(`Invalid uri: ${inputs.uri}`)
    }


    if (inputs.maxSupply <= BigInt(0)) {
        throw new InvalidArgumentError(`Invalid max supply: ${inputs.maxSupply}. Max supply must be greater than 0`)
    }
}

export const validateMintTokenBatchInputs = (inputs: MintTokenBatchConfig): void => {
    validateAddress(inputs.channelAddress);
    validateAddress(inputs.to);
    validateAddress(inputs.mintReferral);

    if (inputs.tokenIds.length === 0) {
        throw new InvalidArgumentError(`At least one token id must be provided`)
    }

    if (inputs.tokenIds.length !== inputs.amounts.length) {
        throw new InvalidArgumentError(`Token ids and amounts must have same length`)
    }

    if (inputs.amounts.some(amount => amount <= 0)) {
        throw new InvalidArgumentError(`Invalid amount. Amounts must be greater than 0`)
    }
}

export const validateSponsorTokenInputs = async (inputs: SponsorTokenConfig): Promise<void> => {
    validateAddress(inputs.channelAddress);
    validateAddress(inputs.to);
    validateAddress(inputs.mintReferral);
    validateAddress(inputs.sponsoredToken.author)
    validateAddress(inputs.sponsoredToken.intent.domain.verifyingContract)

    let currentTimestamp = Math.floor(Date.now() / 1000);
    let deadline = Number(inputs.sponsoredToken.intent.message.deadline);

    if (currentTimestamp >= deadline) {
        throw new InvalidArgumentError(`Deferred token intent has expired`)
    }

    if (inputs.channelAddress !== inputs.sponsoredToken.intent.domain.verifyingContract) {
        throw new InvalidArgumentError(`Channel addresses do not match`)
    }

    if (inputs.amount <= 0) {
        throw new InvalidArgumentError(`Invalid amount. Amount must be greater than 0`)
    }

}



export const validateWithdrawRewardsInputs = (inputs: WithdrawRewardsConfig): void => {
    validateAddress(inputs.channelAddress);
    validateAddress(inputs.to);
    validateAddress(inputs.token);

    if (inputs.amount <= BigInt(0)) {
        throw new InvalidArgumentError(`Invalid amount: ${inputs.amount}. Amount must be greater than 0`)
    }
}

export const validateApproveERC20Inputs = (inputs: ApproveERC20Config): void => {
    validateAddress(inputs.erc20Contract)
    validateAddress(inputs.spender)

    if (inputs.amount <= BigInt(0)) {
        throw new InvalidArgumentError(`Invalid amount: ${inputs.amount}. Amount must be greater than 0`)
    }
}