import { DownlinkClient } from './downlink.js';
import { UplinkClient } from './uplink.js';
import { TransactionType } from '../constants.js';
import { BaseTransactions } from './base.js';
export class TransmissionsClient extends BaseTransactions {
    constructor({ chainId, publicClient, walletClient, apiConfig, includeEnsNames = false, ensPublicClient, paymasterConfig }) {
        super({
            transactionType: TransactionType.Transaction,
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
        this.uplinkClient = new UplinkClient({
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
            paymasterConfig
        });
        this.downlinkClient = new DownlinkClient({
            publicClient,
            apiConfig,
            ensPublicClient,
            includeEnsNames
        });
    }
}
//# sourceMappingURL=index.js.map