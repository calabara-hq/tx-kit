"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSetupActions = void 0;
const viem_1 = require("viem");
const index_js_1 = require("../abi/index.js");
const logic_js_1 = require("../utils/logic.js");
const fees_js_1 = require("../utils/fees.js");
const types_js_1 = require("../types.js");
const createSetupActions = (actions) => {
    let setupActions = [];
    for (const action of actions) {
        if ((0, types_js_1.isChannelFeeArguments)(action)) {
            if (action.feeContract !== viem_1.zeroAddress && action.feeArgs !== null) {
                setupActions.push((0, viem_1.encodeFunctionData)({
                    abi: index_js_1.channelAbi,
                    functionName: 'setFees',
                    args: [
                        action.feeContract,
                        (0, fees_js_1.encodeCustomFeeInputs)(action.feeArgs)
                    ]
                }));
            }
        }
        else if ((0, types_js_1.isChannelLogicArguments)(action) && action.logicContract !== viem_1.zeroAddress) {
            setupActions.push((0, viem_1.encodeFunctionData)({
                abi: index_js_1.channelAbi,
                functionName: 'setLogic',
                args: [
                    action.logicContract,
                    (0, logic_js_1.encodeDynamicLogicInputs)(action.creatorLogic),
                    (0, logic_js_1.encodeDynamicLogicInputs)(action.minterLogic),
                ]
            }));
        }
    }
    return setupActions;
};
exports.createSetupActions = createSetupActions;
//# sourceMappingURL=setupActions.js.map