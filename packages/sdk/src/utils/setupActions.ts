import { Address, encodeFunctionData, Hex, zeroAddress } from "viem"
import { channelAbi } from "../abi/index.js"
import { encodeDynamicLogicInputs } from "../utils/logic.js"
import { encodeCustomFeeInputs } from "../utils/fees.js"
import { isChannelFeeArguments, isChannelLogicArguments, SetupAction } from "../types.js"


export const createSetupActions = (actions: SetupAction[]): Hex[] => {

    let setupActions = [];

    for (const action of actions) {

        if (isChannelFeeArguments(action)) {
            if (action.feeContract !== zeroAddress && action.feeArgs !== null) {
                setupActions.push(
                    encodeFunctionData({
                        abi: channelAbi,
                        functionName: 'setFees',
                        args: [
                            action.feeContract as Address,
                            encodeCustomFeeInputs(action.feeArgs) // fee args can't be null here
                        ]
                    })
                )
            }
        }

        else if (isChannelLogicArguments(action) && action.logicContract !== zeroAddress) {
            setupActions.push(
                encodeFunctionData({
                    abi: channelAbi,
                    functionName: 'setLogic',
                    args: [
                        action.logicContract as Address,
                        encodeDynamicLogicInputs(action.creatorLogic),
                        encodeDynamicLogicInputs(action.minterLogic),
                    ]
                })
            )
        }
    }

    return setupActions as Hex[];


}