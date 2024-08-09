"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApproveERC20Inputs = exports.validateWithdrawRewardsInputs = exports.validateSponsorTokenInputs = exports.validateMintTokenBatchInputs = exports.validateCreateTokenInputs = exports.validateFiniteChannelInputs = exports.validateInfiniteChannelInputs = exports.validateSetupActions = exports.validateFiniteTransportLayer = exports.validateInfiniteTransportLayer = exports.validateSetLogicInputs = exports.validateSetFeeInputs = exports.validateHex = exports.validateAddress = exports.validateFeePercentage = void 0;
const errors_js_1 = require("../errors.js");
const types_js_1 = require("../types.js");
const viem_1 = require("viem");
const constants_js_1 = require("../constants.js");
const numbers_js_1 = require("./numbers.js");
const getNumDigitsAfterDecimal = (value) => {
    if (Number.isInteger(value))
        return 0;
    const decimalStr = value.toString().split('.')[1];
    return decimalStr.length;
};
const validateFeePercentage = (fee) => {
    if (fee < 0 || fee > 100) {
        throw new errors_js_1.InvalidArgumentError(`Invalid percentage: ${fee}. Must be between 0 and 100`);
    }
    if (getNumDigitsAfterDecimal(fee) > constants_js_1.MAX_PRECISION_DECIMALS) {
        throw new errors_js_1.InvalidArgumentError(`Invalid precision on percentage: ${fee}. Max precision is ${constants_js_1.MAX_PRECISION_DECIMALS}`);
    }
};
exports.validateFeePercentage = validateFeePercentage;
const validateAddress = (address) => {
    if (!(0, viem_1.isAddress)(address)) {
        throw new errors_js_1.InvalidArgumentError(`Invalid address: ${address}`);
    }
};
exports.validateAddress = validateAddress;
const validateHex = (hex) => {
    if (!hex.startsWith('0x')) {
        throw new errors_js_1.InvalidArgumentError(`Invalid hex data: ${hex}`);
    }
};
exports.validateHex = validateHex;
const validateSetFeeInputs = (args) => {
    (0, exports.validateAddress)(args.feeContract);
    if (args.feeArgs) {
        (0, exports.validateAddress)(args.feeArgs.channelTreasury);
        (0, exports.validateAddress)(args.feeArgs.erc20Contract);
        if (args.feeArgs.ethMintPrice <= 0) {
            throw new errors_js_1.InvalidArgumentError(`Invalid eth mint price: ${args.feeArgs.ethMintPrice}`);
        }
        (0, exports.validateFeePercentage)(args.feeArgs.uplinkPercentage);
        (0, exports.validateFeePercentage)(args.feeArgs.channelPercentage);
        (0, exports.validateFeePercentage)(args.feeArgs.creatorPercentage);
        (0, exports.validateFeePercentage)(args.feeArgs.mintReferralPercentage);
        (0, exports.validateFeePercentage)(args.feeArgs.sponsorPercentage);
        let totalAllocation = args.feeArgs.uplinkPercentage
            + args.feeArgs.channelPercentage
            + args.feeArgs.creatorPercentage
            + args.feeArgs.mintReferralPercentage
            + args.feeArgs.sponsorPercentage;
        totalAllocation = (0, numbers_js_1.roundToDecimals)(totalAllocation, constants_js_1.MAX_PRECISION_DECIMALS);
        if (totalAllocation !== 100)
            throw new errors_js_1.InvalidArgumentError(`Fee percentages must add up to 100. The current total is ${totalAllocation}`);
    }
};
exports.validateSetFeeInputs = validateSetFeeInputs;
const validateSetLogicInputs = (inputs) => {
    const data = {
        targets: [],
        signatures: [],
        datas: [],
        literalOperands: [],
        operators: [],
        interactionPowerTypes: [],
        interactionPowers: [],
    };
    for (const input of inputs) {
        if (input.target) {
            (0, exports.validateAddress)(input.target);
            data.targets.push(input.target);
        }
        if (input.signature) {
            (0, exports.validateHex)(input.signature);
            data.signatures.push(input.signature);
        }
        if (input.data) {
            (0, exports.validateHex)(input.data);
            data.datas.push(input.data);
        }
        if (input.literalOperand) {
            (0, exports.validateHex)(input.literalOperand);
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
        throw new errors_js_1.InvalidArgumentError('Invalid logic inputs. Each logic element must have shape [interactionPower] if result of [target, signature, data] [gt/lt/eq] [literalOperand]');
    }
};
exports.validateSetLogicInputs = validateSetLogicInputs;
const validateInfiniteTransportLayer = (transportLayer) => {
    if (transportLayer.saleDurationInSeconds <= 0) {
        throw new errors_js_1.InvalidArgumentError(`Invalid sale duration: ${transportLayer.saleDurationInSeconds}. Duration must be greater than 0`);
    }
};
exports.validateInfiniteTransportLayer = validateInfiniteTransportLayer;
const validateFiniteTransportLayer = (transportLayer) => {
    if (transportLayer.mintStartInSeconds <= transportLayer.createStartInSeconds) {
        throw new errors_js_1.InvalidArgumentError(`Invalid mint start time: ${transportLayer.mintStartInSeconds}. Mint start time must be after create start time`);
    }
    if (transportLayer.mintEndInSeconds <= transportLayer.mintStartInSeconds) {
        throw new errors_js_1.InvalidArgumentError(`Invalid mint end time: ${transportLayer.mintEndInSeconds}. Mint end time must be after mint start time`);
    }
    if (transportLayer.rewards.ranks.length !== transportLayer.rewards.allocations.length) {
        throw new errors_js_1.InvalidArgumentError(`Invalid rewards. Ranks and allocations must be of the same length`);
    }
    let totalAllocation = BigInt(0);
    for (let i = 0; i < transportLayer.rewards.ranks.length; i++) {
        if (i != transportLayer.rewards.ranks.length - 1) {
            if (transportLayer.rewards.ranks[i] >= transportLayer.rewards.ranks[i + 1])
                throw new errors_js_1.InvalidArgumentError(`Invalid rank ${transportLayer.rewards.ranks[i]}. Ranks cannot contain dupliecates and must be in ascending order`);
        }
        totalAllocation += transportLayer.rewards.allocations[i];
    }
    if (totalAllocation !== transportLayer.rewards.totalAllocation) {
        throw new errors_js_1.InvalidArgumentError(`Invalid rewards. Computed total allocation ${totalAllocation} does not match provided total allocation ${transportLayer.rewards.totalAllocation}`);
    }
    (0, exports.validateAddress)(transportLayer.rewards.token);
};
exports.validateFiniteTransportLayer = validateFiniteTransportLayer;
const validateSetupActions = (actions) => {
    for (const action of actions) {
        if ((0, types_js_1.isChannelFeeArguments)(action)) {
            (0, exports.validateAddress)(action.feeContract);
            (0, exports.validateSetFeeInputs)(action);
        }
        if ((0, types_js_1.isChannelLogicArguments)(action)) {
            (0, exports.validateAddress)(action.logicContract);
            (0, exports.validateSetLogicInputs)(action.creatorLogic);
            (0, exports.validateSetLogicInputs)(action.minterLogic);
        }
    }
};
exports.validateSetupActions = validateSetupActions;
const validateInfiniteChannelInputs = (inputs) => {
    (0, exports.validateAddress)(inputs.defaultAdmin);
    inputs.managers.forEach(exports.validateAddress);
    (0, exports.validateSetupActions)(inputs.setupActions);
    (0, exports.validateInfiniteTransportLayer)(inputs.transportLayer);
};
exports.validateInfiniteChannelInputs = validateInfiniteChannelInputs;
const validateFiniteChannelInputs = (inputs) => {
    (0, exports.validateAddress)(inputs.defaultAdmin);
    inputs.managers.forEach(exports.validateAddress);
    (0, exports.validateSetupActions)(inputs.setupActions);
    (0, exports.validateFiniteTransportLayer)(inputs.transportLayer);
};
exports.validateFiniteChannelInputs = validateFiniteChannelInputs;
const validateCreateTokenInputs = (inputs) => {
    (0, exports.validateAddress)(inputs.channelAddress);
    if (!inputs.uri) {
        throw new errors_js_1.InvalidArgumentError(`Invalid uri: ${inputs.uri}`);
    }
    if (inputs.maxSupply <= BigInt(0)) {
        throw new errors_js_1.InvalidArgumentError(`Invalid max supply: ${inputs.maxSupply}. Max supply must be greater than 0`);
    }
};
exports.validateCreateTokenInputs = validateCreateTokenInputs;
const validateMintTokenBatchInputs = (inputs) => {
    (0, exports.validateAddress)(inputs.channelAddress);
    (0, exports.validateAddress)(inputs.to);
    (0, exports.validateAddress)(inputs.mintReferral);
    if (inputs.tokenIds.length === 0) {
        throw new errors_js_1.InvalidArgumentError(`At least one token id must be provided`);
    }
    if (inputs.tokenIds.length !== inputs.amounts.length) {
        throw new errors_js_1.InvalidArgumentError(`Token ids and amounts must have same length`);
    }
    if (inputs.amounts.some(amount => amount <= 0)) {
        throw new errors_js_1.InvalidArgumentError(`Invalid amount. Amounts must be greater than 0`);
    }
};
exports.validateMintTokenBatchInputs = validateMintTokenBatchInputs;
const validateSponsorTokenInputs = async (inputs) => {
    (0, exports.validateAddress)(inputs.channelAddress);
    (0, exports.validateAddress)(inputs.to);
    (0, exports.validateAddress)(inputs.mintReferral);
    (0, exports.validateAddress)(inputs.sponsoredToken.author);
    (0, exports.validateAddress)(inputs.sponsoredToken.intent.domain.verifyingContract);
    let currentTimestamp = Math.floor(Date.now() / 1000);
    let deadline = Number(inputs.sponsoredToken.intent.message.deadline);
    if (currentTimestamp >= deadline) {
        throw new errors_js_1.InvalidArgumentError(`Deferred token intent has expired`);
    }
    if (inputs.channelAddress !== inputs.sponsoredToken.intent.domain.verifyingContract) {
        throw new errors_js_1.InvalidArgumentError(`Channel addresses do not match`);
    }
    if (inputs.amount <= 0) {
        throw new errors_js_1.InvalidArgumentError(`Invalid amount. Amount must be greater than 0`);
    }
};
exports.validateSponsorTokenInputs = validateSponsorTokenInputs;
const validateWithdrawRewardsInputs = (inputs) => {
    (0, exports.validateAddress)(inputs.channelAddress);
    (0, exports.validateAddress)(inputs.to);
    (0, exports.validateAddress)(inputs.token);
    if (inputs.amount <= BigInt(0)) {
        throw new errors_js_1.InvalidArgumentError(`Invalid amount: ${inputs.amount}. Amount must be greater than 0`);
    }
};
exports.validateWithdrawRewardsInputs = validateWithdrawRewardsInputs;
const validateApproveERC20Inputs = (inputs) => {
    (0, exports.validateAddress)(inputs.erc20Contract);
    (0, exports.validateAddress)(inputs.spender);
    if (inputs.amount <= BigInt(0)) {
        throw new errors_js_1.InvalidArgumentError(`Invalid amount: ${inputs.amount}. Amount must be greater than 0`);
    }
};
exports.validateApproveERC20Inputs = validateApproveERC20Inputs;
//# sourceMappingURL=validate.js.map