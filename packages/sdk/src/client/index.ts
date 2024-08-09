import { TransmissionsClientConfig } from '../types.js';
import { DownlinkClient } from './downlink.js';
import { UplinkClient } from './uplink.js';
import { TransactionType } from '../constants.js';
import { BaseTransactions } from './base.js';


export class TransmissionsClient extends BaseTransactions {
    readonly downlinkClient: DownlinkClient
    readonly uplinkClient: UplinkClient

    constructor({
        chainId,
        publicClient,
        walletClient,
        apiConfig,
        includeEnsNames = false,
        ensPublicClient,
        paymasterConfig
    }: TransmissionsClientConfig) {

        super({
            transactionType: TransactionType.Transaction,
            chainId,
            publicClient,
            walletClient,
            includeEnsNames,
            ensPublicClient,
            paymasterConfig
        })

        this.uplinkClient = new UplinkClient({
            chainId,
            publicClient,
            ensPublicClient,
            walletClient,
            includeEnsNames,
            paymasterConfig
        })

        this.downlinkClient = new DownlinkClient({
            publicClient,
            apiConfig,
            ensPublicClient,
            includeEnsNames
        });

    }
}