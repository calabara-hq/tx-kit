import { Address, Hex } from "viem";
import { LogicOperators, LogicInteractionPowerTypes, DynamicLogicInputs } from "../types.js";
declare class LogicBuilderBase {
    _target: Address;
    _signature: Hex;
    _data: Hex;
    _power: bigint;
    _interactionPowerType: LogicInteractionPowerTypes;
    constructor(power: bigint, powerType: LogicInteractionPowerTypes);
    private _encodeOperand;
    ifResultOf(target: string, signature: string, data: string): this;
    gt(literalOperand: bigint): DynamicLogicInputs;
    lt(literalOperand: bigint): DynamicLogicInputs;
    eq(literalOperand: bigint): DynamicLogicInputs;
}
export declare class WeightedInteractionPower extends LogicBuilderBase {
    constructor();
}
export declare class UniformInteractionPower extends LogicBuilderBase {
    constructor(power: bigint);
}
export declare const encodeDynamicLogicInputs: (inputs: {
    target: string;
    signature: string;
    data: string;
    operator: LogicOperators;
    literalOperand: Hex;
    interactionPowerType: LogicInteractionPowerTypes;
    interactionPower: bigint;
}[]) => Hex;
export {};
//# sourceMappingURL=logic.d.ts.map