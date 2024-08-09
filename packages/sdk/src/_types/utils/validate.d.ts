import { ApproveERC20Config, ChannelFeeArguments, CreateFiniteChannelConfig, CreateInfiniteChannelConfig, CreateTokenConfig, DynamicLogicInputs, FiniteTransportLayer, InfiniteTransportLayer, MintTokenBatchConfig, SetupAction, SponsorTokenConfig, WithdrawRewardsConfig } from "../types.js";
export declare const validateFeePercentage: (fee: number) => void;
export declare const validateAddress: (address: string) => void;
export declare const validateHex: (hex: string) => void;
export declare const validateSetFeeInputs: (args: ChannelFeeArguments) => void;
export declare const validateSetLogicInputs: (inputs: DynamicLogicInputs[]) => void;
export declare const validateInfiniteTransportLayer: (transportLayer: InfiniteTransportLayer) => void;
export declare const validateFiniteTransportLayer: (transportLayer: FiniteTransportLayer) => void;
export declare const validateSetupActions: (actions: SetupAction[]) => void;
export declare const validateInfiniteChannelInputs: (inputs: CreateInfiniteChannelConfig) => void;
export declare const validateFiniteChannelInputs: (inputs: CreateFiniteChannelConfig) => void;
export declare const validateCreateTokenInputs: (inputs: CreateTokenConfig) => void;
export declare const validateMintTokenBatchInputs: (inputs: MintTokenBatchConfig) => void;
export declare const validateSponsorTokenInputs: (inputs: SponsorTokenConfig) => Promise<void>;
export declare const validateWithdrawRewardsInputs: (inputs: WithdrawRewardsConfig) => void;
export declare const validateApproveERC20Inputs: (inputs: ApproveERC20Config) => void;
//# sourceMappingURL=validate.d.ts.map