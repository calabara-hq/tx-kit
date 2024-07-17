import { Client } from '@urql/core'
import { DocumentNode } from 'graphql'
import {
    Address,
    Chain,
    PublicClient,
    Transport,
    getAddress,
    zeroAddress,
} from 'viem'
import { InvalidConfigError, MissingPublicClientError, UnsupportedSubgraphChainIdError } from '../errors'
import { DownlinkClientConfig } from '../types'
import { GetAllChannelsQuery, GetChannelQuery, GetTokensQuery, GqlChannel, GqlToken, IChannel, IToken } from '../subgraph/types'
import { _allChannelsQuery, _channelQuery, _paginatedChannelTokensQuery, getGraphqlClient, GqlVariables } from '../subgraph'
import { formatGqlChannel, formatGqlTokens, formatGqlTransportLayer } from '../subgraph/utils'

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

}