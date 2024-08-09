"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeDynamicLogicInputs = exports.UniformInteractionPower = exports.WeightedInteractionPower = void 0;
const viem_1 = require("viem");
const types_js_1 = require("../types.js");
class LogicBuilderBase {
    constructor(power, powerType) {
        Object.defineProperty(this, "_target", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: viem_1.zeroAddress
        });
        Object.defineProperty(this, "_signature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: viem_1.zeroHash
        });
        Object.defineProperty(this, "_data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: viem_1.zeroHash
        });
        Object.defineProperty(this, "_power", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: BigInt(0)
        });
        Object.defineProperty(this, "_interactionPowerType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: types_js_1.LogicInteractionPowerTypes.uniform
        });
        this._power = power;
        this._interactionPowerType = powerType;
    }
    _encodeOperand(operand) {
        return (0, viem_1.encodeAbiParameters)([
            { name: 'literalOperand', type: 'uint256' }
        ], [
            operand
        ]);
    }
    ifResultOf(target, signature, data) {
        this._target = target;
        this._signature = signature;
        this._data = data;
        return this;
    }
    gt(literalOperand) {
        return {
            target: this._target,
            signature: this._signature,
            data: this._data,
            operator: types_js_1.LogicOperators.gt,
            literalOperand: this._encodeOperand(literalOperand),
            interactionPowerType: this._interactionPowerType,
            interactionPower: this._power
        };
    }
    lt(literalOperand) {
        return {
            target: this._target,
            signature: this._signature,
            data: this._data,
            operator: types_js_1.LogicOperators.lt,
            literalOperand: this._encodeOperand(literalOperand),
            interactionPowerType: this._interactionPowerType,
            interactionPower: this._power
        };
    }
    eq(literalOperand) {
        return {
            target: this._target,
            signature: this._signature,
            data: this._data,
            operator: types_js_1.LogicOperators.eq,
            literalOperand: this._encodeOperand(literalOperand),
            interactionPowerType: this._interactionPowerType,
            interactionPower: this._power
        };
    }
}
class WeightedInteractionPower extends LogicBuilderBase {
    constructor() {
        super(BigInt(0), types_js_1.LogicInteractionPowerTypes.weighted);
    }
}
exports.WeightedInteractionPower = WeightedInteractionPower;
class UniformInteractionPower extends LogicBuilderBase {
    constructor(power) {
        super(power, types_js_1.LogicInteractionPowerTypes.uniform);
    }
}
exports.UniformInteractionPower = UniformInteractionPower;
const encodeDynamicLogicInputs = (inputs) => {
    const preparedContractInputs = {
        targets: inputs.map(input => input.target),
        signatures: inputs.map(input => input.signature),
        datas: inputs.map(input => input.data),
        operators: inputs.map(input => input.operator),
        literalOperands: inputs.map(input => input.literalOperand),
        interactionPowerTypes: inputs.map(input => input.interactionPowerType),
        interactionPowers: inputs.map(input => input.interactionPower)
    };
    return (0, viem_1.encodeAbiParameters)([
        { name: 'targets', type: 'address[]' },
        { name: 'signatures', type: 'bytes4[]' },
        { name: 'datas', type: 'bytes[]' },
        { name: 'operators', type: 'uint8[]' },
        { name: 'literalOperands', type: 'bytes[]' },
        { name: 'interactionPowerTypes', type: 'uint8[]' },
        { name: 'interactionPowers', type: 'uint256[]' }
    ], [
        preparedContractInputs.targets,
        preparedContractInputs.signatures,
        preparedContractInputs.datas,
        preparedContractInputs.operators,
        preparedContractInputs.literalOperands,
        preparedContractInputs.interactionPowerTypes,
        preparedContractInputs.interactionPowers
    ]);
};
exports.encodeDynamicLogicInputs = encodeDynamicLogicInputs;
//# sourceMappingURL=logic.js.map