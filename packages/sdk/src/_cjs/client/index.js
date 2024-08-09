"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransmissionsClient = void 0;
const downlink_js_1 = require("./downlink.js");
const uplink_js_1 = require("./uplink.js");
const constants_js_1 = require("../constants.js");
const base_js_1 = require("./base.js");
class TransmissionsClient extends base_js_1.BaseTransactions {
    constructor({ chainId, publicClient, walletClient, apiConfig, includeEnsNames = false, ensPublicClient, paymasterConfig }) {
        super({
            transactionType: constants_js_1.TransactionType.Transaction,
            chainId,
            publicClient,
            walletClient,
            includeEnsNames,
            ensPublicClient,
            paymasterConfig
        });
        Object.defineProperty(this, "downlinkClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "uplinkClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.uplinkClient = new uplink_js_1.UplinkClient({
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
            paymasterConfig
        });
        this.downlinkClient = new downlink_js_1.DownlinkClient({
            publicClient,
            apiConfig,
            ensPublicClient,
            includeEnsNames
        });
    }
}
exports.TransmissionsClient = TransmissionsClient;
//# sourceMappingURL=index.js.map