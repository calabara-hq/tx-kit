import { TransmissionsClientConfig } from '../types.js';
import { DownlinkClient } from './downlink.js';
import { UplinkClient } from './uplink.js';
import { BaseTransactions } from './base.js';
export declare class TransmissionsClient extends BaseTransactions {
    readonly downlinkClient: DownlinkClient;
    readonly uplinkClient: UplinkClient;
    constructor({ chainId, publicClient, walletClient, apiConfig, includeEnsNames, ensPublicClient, paymasterConfig }: TransmissionsClientConfig);
}
//# sourceMappingURL=index.d.ts.map