"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownlinkClient = void 0;
const viem_1 = require("viem");
const errors_js_1 = require("../errors.js");
const index_js_1 = require("../subgraph/index.js");
const utils_js_1 = require("../subgraph/utils.js");
class DownlinkClient {
    constructor({ publicClient, apiConfig, ensPublicClient, includeEnsNames = false, }) {
        Object.defineProperty(this, "_ensPublicClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_publicClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_graphqlClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_includeEnsNames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (includeEnsNames && !publicClient && !ensPublicClient)
            throw new errors_js_1.InvalidConfigError('Must include a mainnet public client if includeEnsNames is set to true');
        this._ensPublicClient = ensPublicClient ?? publicClient;
        this._publicClient = publicClient;
        this._includeEnsNames = includeEnsNames;
        this._graphqlClient = (0, index_js_1.getGraphqlClient)(apiConfig);
    }
    _requirePublicClient() {
        if (!this._publicClient)
            throw new errors_js_1.MissingPublicClientError('Public client required to perform this action, please update your call to the constructor');
    }
    async _makeGqlRequest(query, variables) {
        if (!this._graphqlClient) {
            throw new errors_js_1.UnsupportedSubgraphChainIdError();
        }
        const response = await this._graphqlClient
            .query(query, {
            ...variables,
        })
            .toPromise();
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async _loadChannel(inputs) {
        const result = await this._makeGqlRequest(index_js_1._channelQuery, {
            id: inputs.channelAddress.toLowerCase(),
            includeTokens: inputs.includeTokens ?? false
        });
        if (!result.channel)
            return;
        return result.channel;
    }
    async _loadChannels(inputs) {
        const result = await this._makeGqlRequest(index_js_1._allChannelsQuery, {
            includeTokens: inputs?.includeTokens ?? false,
            where: inputs?.filters?.where ?? {},
            pageSize: inputs?.filters?.pageSize ?? 1000,
            skip: inputs?.filters?.skip ?? 0,
            orderBy: inputs?.filters?.orderBy ?? 'blockTimestamp',
            orderDirection: inputs?.filters?.orderDirection ?? 'asc'
        });
        return result.channels;
    }
    async _loadChannelTokenPage(inputs) {
        const result = await this._makeGqlRequest(index_js_1._paginatedChannelTokensQuery, {
            id: inputs.channelAddress.toLowerCase(),
            where: inputs?.filters?.where ?? {},
            pageSize: inputs?.filters?.pageSize ?? 1000,
            skip: inputs?.filters?.skip ?? 0,
            orderBy: inputs?.filters?.orderBy ?? 'blockTimestamp',
            orderDirection: inputs?.filters?.orderDirection ?? 'desc'
        });
        return result?.channel?.tokens ?? [];
    }
    async _loadChannelUpgradeEvents(inputs) {
        const result = await this._makeGqlRequest(index_js_1._channelUpgradeEventsQuery, {
            where: {
                baseImpl_contains: inputs.address.toLowerCase(),
            },
            orderBy: 'blockNumber',
            orderDirection: 'desc',
        });
        return result?.channelUpgradeRegisteredEvents ?? [];
    }
    async getChannel(inputs) {
        const response = await this._loadChannel(inputs);
        if (!response)
            throw new Error('Channel not found');
        return (0, utils_js_1.formatGqlChannel)(response);
    }
    async getAllChannels(inputs) {
        const response = await this._loadChannels(inputs);
        let result = [];
        if (response.length > 0) {
            result = response.map(utils_js_1.formatGqlChannel);
        }
        return result;
    }
    async getChannelTokenPage(inputs) {
        const response = await this._loadChannelTokenPage(inputs);
        return (0, utils_js_1.formatGqlTokens)(response);
    }
    async customQuery(query, variables) {
        return this._makeGqlRequest(query, variables);
    }
    async getOptimalUpgradePath(inputs) {
        const erc1967StorageSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        this._requirePublicClient();
        const data = await this._publicClient?.getStorageAt({
            address: inputs.address,
            slot: erc1967StorageSlot
        });
        inputs.address = (0, viem_1.getAddress)('0x' + data?.slice(26));
        const upgradePaths = await this._loadChannelUpgradeEvents(inputs);
        return (0, utils_js_1.formatGqlUpgradePath)(upgradePaths[0]);
    }
}
exports.DownlinkClient = DownlinkClient;
//# sourceMappingURL=downlink.js.map