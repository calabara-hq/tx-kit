import { Address, encodeAbiParameters, Hex, zeroAddress, zeroHash } from "viem"
import { LogicOperators, LogicInteractionPowerTypes, DynamicLogicInputs } from "../types";


class LogicBuilderBase {
    _target: Address = zeroAddress;
    _signature: Hex = zeroHash;
    _data: Hex = zeroHash;
    _power: bigint = BigInt(0);
    _interactionPowerType: LogicInteractionPowerTypes = LogicInteractionPowerTypes.uniform;

    constructor(power: bigint, powerType: LogicInteractionPowerTypes) {
        this._power = power;
        this._interactionPowerType = powerType;

    }

    private _encodeOperand(operand: bigint): Hex {
        return encodeAbiParameters(
            [
                { name: 'literalOperand', type: 'uint256' }
            ],
            [
                operand
            ]
        )
    }

    ifResultOf(target: string, signature: string, data: string) {
        this._target = target as Address;
        this._signature = signature as Hex;
        this._data = data as Hex;
        return this;
    }

    gt(literalOperand: bigint): DynamicLogicInputs {
        return {
            target: this._target,
            signature: this._signature,
            data: this._data,
            operator: LogicOperators.gt,
            literalOperand: this._encodeOperand(literalOperand),
            interactionPowerType: this._interactionPowerType,
            interactionPower: this._power
        }
    }

    lt(literalOperand: bigint): DynamicLogicInputs {
        return {
            target: this._target,
            signature: this._signature,
            data: this._data,
            operator: LogicOperators.lt,
            literalOperand: this._encodeOperand(literalOperand),
            interactionPowerType: this._interactionPowerType,
            interactionPower: this._power
        }
    }

    eq(literalOperand: bigint): DynamicLogicInputs {
        return {
            target: this._target,
            signature: this._signature,
            data: this._data,
            operator: LogicOperators.eq,
            literalOperand: this._encodeOperand(literalOperand),
            interactionPowerType: this._interactionPowerType,
            interactionPower: this._power
        }
    }

}

export class WeightedInteractionPower extends LogicBuilderBase {
    constructor() {
        super(BigInt(0), LogicInteractionPowerTypes.weighted);
    }
}

export class UniformInteractionPower extends LogicBuilderBase {
    constructor(power: bigint) {
        super(power, LogicInteractionPowerTypes.uniform);
    }
}

export const encodeDynamicLogicInputs = (
    inputs: {
        target: string,
        signature: string,
        data: string,
        operator: LogicOperators,
        literalOperand: Hex,
        interactionPowerType: LogicInteractionPowerTypes,
        interactionPower: bigint
    }[]): Hex => {


    const preparedContractInputs = {
        targets: inputs.map(input => input.target as Address),
        signatures: inputs.map(input => input.signature as Hex),
        datas: inputs.map(input => input.data as Hex),
        operators: inputs.map(input => input.operator),
        literalOperands: inputs.map(input => input.literalOperand),
        interactionPowerTypes: inputs.map(input => input.interactionPowerType),
        interactionPowers: inputs.map(input => input.interactionPower)
    }

    return encodeAbiParameters(
        [
            { name: 'targets', type: 'address[]' },
            { name: 'signatures', type: 'bytes4[]' },
            { name: 'datas', type: 'bytes[]' },
            { name: 'operators', type: 'uint8[]' },
            { name: 'literalOperands', type: 'bytes[]' },
            { name: 'interactionPowerTypes', type: 'uint8[]' },
            { name: 'interactionPowers', type: 'uint256[]' }
        ],
        [
            preparedContractInputs.targets,
            preparedContractInputs.signatures,
            preparedContractInputs.datas,
            preparedContractInputs.operators,
            preparedContractInputs.literalOperands,
            preparedContractInputs.interactionPowerTypes,
            preparedContractInputs.interactionPowers
        ]
    )

}

