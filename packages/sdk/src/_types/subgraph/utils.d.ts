import { GqlChannel, GqlCustomFees, GqlDynamicLogic, GqlFeeConfig, GqlLogicConfig, GqlToken, GqlTokenMetadata, GqlTransportLayer, GqlUpgradePath, IChannel, ICustomFees, IDynamicLogic, IFeeConfig, ILogicConfig, IToken, ITokenMetadata, ITransportLayer, IUpgradePath } from "./types.js";
export declare const formatGqlTransportLayer: (transportLayer: GqlTransportLayer) => ITransportLayer;
export declare const formatGqlDynamicLogic: (dynamicLogic: GqlDynamicLogic) => IDynamicLogic;
export declare const formatGqlLogicConfig: (logicConfig: GqlLogicConfig) => ILogicConfig | undefined;
export declare const formatGqlCustomFees: (fees: GqlCustomFees) => ICustomFees;
export declare const formatGqlFeeConfig: (feeConfig: GqlFeeConfig) => IFeeConfig | undefined;
export declare const formatGqlTokenMetadata: (metadata: GqlTokenMetadata) => ITokenMetadata | null;
export declare const formatGqlTokens: (tokens: GqlToken[]) => IToken[];
export declare const formatGqlChannel: (channel: GqlChannel) => IChannel;
export declare const formatGqlUpgradePath: (upgradePath?: GqlUpgradePath) => IUpgradePath | null;
//# sourceMappingURL=utils.d.ts.map