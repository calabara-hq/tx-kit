export const isChannelFeeArguments = (action) => {
    return 'feeContract' in action;
};
export const isChannelLogicArguments = (action) => {
    return 'logicContract' in action;
};
export var LogicOperators;
(function (LogicOperators) {
    LogicOperators[LogicOperators["lt"] = 0] = "lt";
    LogicOperators[LogicOperators["gt"] = 1] = "gt";
    LogicOperators[LogicOperators["eq"] = 2] = "eq";
})(LogicOperators || (LogicOperators = {}));
export var LogicInteractionPowerTypes;
(function (LogicInteractionPowerTypes) {
    LogicInteractionPowerTypes[LogicInteractionPowerTypes["uniform"] = 0] = "uniform";
    LogicInteractionPowerTypes[LogicInteractionPowerTypes["weighted"] = 1] = "weighted";
})(LogicInteractionPowerTypes || (LogicInteractionPowerTypes = {}));
//# sourceMappingURL=types.js.map