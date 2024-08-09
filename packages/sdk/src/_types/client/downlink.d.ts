import { DocumentNode } from 'graphql';
import { Chain, PublicClient, Transport } from 'viem';
import { DownlinkClientConfig } from '../types.js';
import { GetAllChannelsQuery, GetChannelQuery, GetChannelUpgradesQuery, GetTokensQuery, GqlChannel, GqlToken, GqlUpgradePath, IChannel, IToken, IUpgradePath } from '../subgraph/types.js';
import { GqlVariables } from '../subgraph/types.js';
export declare class DownlinkClient {
    readonly _ensPublicClient: PublicClient<Transport, Chain> | undefined;
    readonly _publicClient: PublicClient<Transport, Chain> | undefined;
    private readonly _graphqlClient;
    readonly _includeEnsNames: boolean;
    constructor({ publicClient, apiConfig, ensPublicClient, includeEnsNames, }: DownlinkClientConfig);
    protected _requirePublicClient(): void;
    protected _makeGqlRequest<ResponseType>(query: DocumentNode, variables?: GqlVariables): Promise<ResponseType>;
    protected _loadChannel(inputs: GetChannelQuery): Promise<GqlChannel | undefined>;
    protected _loadChannels(inputs?: GetAllChannelsQuery): Promise<GqlChannel[]>;
    protected _loadChannelTokenPage(inputs: GetTokensQuery): Promise<GqlToken[]>;
    protected _loadChannelUpgradeEvents(inputs: GetChannelUpgradesQuery): Promise<GqlUpgradePath[]>;
    getChannel(inputs: GetChannelQuery): Promise<IChannel | undefined>;
    getAllChannels(inputs?: GetAllChannelsQuery): Promise<IChannel[]>;
    getChannelTokenPage(inputs: GetTokensQuery): Promise<IToken[]>;
    customQuery(query: DocumentNode, variables?: GqlVariables): Promise<any>;
    getOptimalUpgradePath(inputs: GetChannelUpgradesQuery): Promise<IUpgradePath | null>;
}
//# sourceMappingURL=downlink.d.ts.map