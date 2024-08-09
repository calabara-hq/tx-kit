"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicInteractionPowerTypes = exports.LogicOperators = exports.isChannelLogicArguments = exports.isChannelFeeArguments = void 0;
const isChannelFeeArguments = (action) => {
    return 'feeContract' in action;
};
exports.isChannelFeeArguments = isChannelFeeArguments;
const isChannelLogicArguments = (action) => {
    return 'logicContract' in action;
};
exports.isChannelLogicArguments = isChannelLogicArguments;
var LogicOperators;
(function (LogicOperators) {
    LogicOperators[LogicOperators["lt"] = 0] = "lt";
    LogicOperators[LogicOperators["gt"] = 1] = "gt";
    LogicOperators[LogicOperators["eq"] = 2] = "eq";
})(LogicOperators || (exports.LogicOperators = LogicOperators = {}));
var LogicInteractionPowerTypes;
(function (LogicInteractionPowerTypes) {
    LogicInteractionPowerTypes[LogicInteractionPowerTypes["uniform"] = 0] = "uniform";
    LogicInteractionPowerTypes[LogicInteractionPowerTypes["weighted"] = 1] = "weighted";
})(LogicInteractionPowerTypes || (exports.LogicInteractionPowerTypes = LogicInteractionPowerTypes = {}));
//# sourceMappingURL=types.js.map