import { Client } from '@urql/core'
import { DocumentNode } from 'graphql'
import {
    Address,
    Chain,
    PublicClient,
    Transport,
    getAddress,
} from 'viem'
import { InvalidConfigError, MissingPublicClientError, UnsupportedSubgraphChainIdError } from '../errors.js'
import { DownlinkClientConfig } from '../types.js'
import { GetAllChannelsQuery, GetChannelQuery, GetChannelUpgradesQuery, GetTokensQuery, GqlChannel, GqlToken, GqlUpgradePath, IChannel, IToken, IUpgradePath } from '../subgraph/types.js'
import { _allChannelsQuery, _channelQuery, _channelUpgradeEventsQuery, _paginatedChannelTokensQuery, getGraphqlClient } from '../subgraph/index.js'
import {GqlVariables} from '../subgraph/types.js'
import { formatGqlChannel, formatGqlTokens, formatGqlUpgradePath } from '../subgraph/utils.js'

export class DownlinkClient {
    readonly _ensPublicClient: PublicClient<Transport, Chain> | undefined
    readonly _publicClient: PublicClient<Transport, Chain> | undefined
    private readonly _graphqlClient: Client | undefined
    readonly _includeEnsNames: boolean

    constructor({
        publicClient,
        apiConfig,
        ensPublicClient,
        includeEnsNames = false,
    }: DownlinkClientConfig) {
        if (includeEnsNames && !publicClient && !ensPublicClient)
            throw new InvalidConfigError(
                'Must include a mainnet public client if includeEnsNames is set to true',
            )

        this._ensPublicClient = ensPublicClient ?? publicClient
        this._publicClient = publicClient
        this._includeEnsNames = includeEnsNames

        this._graphqlClient = getGraphqlClient(apiConfig)
    }


    protected _requirePublicClient() {
        if (!this._publicClient)
            throw new MissingPublicClientError(
                'Public client required to perform this action, please update your call to the constructor',
            )
    }


    protected async _makeGqlRequest<ResponseType>(
        query: DocumentNode,
        variables?: GqlVariables,
    ): Promise<ResponseType> {
        if (!this._graphqlClient) {
            throw new UnsupportedSubgraphChainIdError()
        }

        const response = await this._graphqlClient
            .query(query, {
                ...variables,

            })
            .toPromise()
        if (response.error) {
            throw response.error
        }

        return response.data
    }

    protected async _loadChannel(inputs: GetChannelQuery): Promise<GqlChannel | undefined> {
        const result = await this._makeGqlRequest<{
            channel: GqlChannel
        }>(_channelQuery, {
            id: inputs.channelAddress.toLowerCase(),
            includeTokens: inputs.includeTokens ?? false
        })

        if (!result.channel) return;

        return result.channel
    }

    protected async _loadChannels(inputs?: GetAllChannelsQuery): Promise<GqlChannel[]> {
        const result = await this._makeGqlRequest<{
            channels: GqlChannel[]
        }>(_allChannelsQuery, {
            includeTokens: inputs?.includeTokens ?? false,
            where: inputs?.filters?.where ?? {},
            pageSize: inputs?.filters?.pageSize ?? 1000,
            skip: inputs?.filters?.skip ?? 0,
            orderBy: inputs?.filters?.orderBy ?? 'blockTimestamp',
            orderDirection: inputs?.filters?.orderDirection ?? 'asc'
        })

        return result.channels
    }

    protected async _loadChannelTokenPage(inputs: GetTokensQuery): Promise<GqlToken[]> {
        const result = await this._makeGqlRequest<{
            channel: GqlChannel
        }>(_paginatedChannelTokensQuery, {
            id: inputs.channelAddress.toLowerCase(),
            where: inputs?.filters?.where ?? {},
            pageSize: inputs?.filters?.pageSize ?? 1000,
            skip: inputs?.filters?.skip ?? 0,
            orderBy: inputs?.filters?.orderBy ?? 'blockTimestamp',
            orderDirection: inputs?.filters?.orderDirection ?? 'desc'
        })

        return result?.channel?.tokens ?? []
    }

    protected async _loadChannelUpgradeEvents(inputs: GetChannelUpgradesQuery): Promise<GqlUpgradePath[]> {
        const result = await this._makeGqlRequest<{
            channelUpgradeRegisteredEvents: GqlUpgradePath[]
        }>(_channelUpgradeEventsQuery, {
            where: {
                baseImpl_contains: inputs.address.toLowerCase(),
            },
            orderBy: 'blockNumber',
            orderDirection: 'desc',
        })

        return result?.channelUpgradeRegisteredEvents ?? []
    }

    /// client methods

    async getChannel(inputs: GetChannelQuery): Promise<IChannel | undefined> {

        const response = await this._loadChannel(inputs)
        if (!response) throw new Error('Channel not found');

        return formatGqlChannel(response)
    }

    async getAllChannels(inputs?: GetAllChannelsQuery): Promise<IChannel[]> {
        const response = await this._loadChannels(inputs)

        let result: IChannel[] = []

        if (response.length > 0) {
            result = response.map(formatGqlChannel)
        }

        return result
    }

    async getChannelTokenPage(inputs: GetTokensQuery): Promise<IToken[]> {
        const response = await this._loadChannelTokenPage(inputs)
        return formatGqlTokens(response)
    }

    async customQuery(query: DocumentNode, variables?: GqlVariables): Promise<any> {
        return this._makeGqlRequest(query, variables)
    }

    async getOptimalUpgradePath(inputs: GetChannelUpgradesQuery): Promise<IUpgradePath | null> {

        /// get base impl from channel address

        const erc1967StorageSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"

        this._requirePublicClient();

        const data = await this._publicClient?.getStorageAt({
            address: inputs.address as Address,
            slot: erc1967StorageSlot
        })

        inputs.address = getAddress('0x' + data?.slice(26))

        const upgradePaths = await this._loadChannelUpgradeEvents(inputs)

        // pluck the first element from the upgrade paths

        return formatGqlUpgradePath(upgradePaths[0])
    }

}