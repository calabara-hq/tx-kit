import { encodeAbiParameters, zeroAddress, zeroHash } from "viem";
import { LogicOperators, LogicInteractionPowerTypes } from "../types.js";
class LogicBuilderBase {
    constructor(power, powerType) {
        Object.defineProperty(this, "_target", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: zeroAddress
        });
        Object.defineProperty(this, "_signature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: zeroHash
        });
        Object.defineProperty(this, "_data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: zeroHash
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
            value: LogicInteractionPowerTypes.uniform
        });
        this._power = power;
        this._interactionPowerType = powerType;
    }
    _encodeOperand(operand) {
        return encodeAbiParameters([
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
            operator: LogicOperators.gt,
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
            operator: LogicOperators.lt,
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
            operator: LogicOperators.eq,
            literalOperand: this._encodeOperand(literalOperand),
            interactionPowerType: this._interactionPowerType,
            interactionPower: this._power
        };
    }
}
export class WeightedInteractionPower extends LogicBuilderBase {
    constructor() {
        super(BigInt(0), LogicInteractionPowerTypes.weighted);
    }
}
export class UniformInteractionPower extends LogicBuilderBase {
    constructor(power) {
        super(power, LogicInteractionPowerTypes.uniform);
    }
}
export const encodeDynamicLogicInputs = (inputs) => {
    const preparedContractInputs = {
        targets: inputs.map(input => input.target),
        signatures: inputs.map(input => input.signature),
        datas: inputs.map(input => input.data),
        operators: inputs.map(input => input.operator),
        literalOperands: inputs.map(input => input.literalOperand),
        interactionPowerTypes: inputs.map(input => input.interactionPowerType),
        interactionPowers: inputs.map(input => input.interactionPower)
    };
    return encodeAbiParameters([
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
//# sourceMappingURL=logic.js.map