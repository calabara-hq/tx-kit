import { TransmissionsClientConfig } from '../types';
import { DownlinkClient } from './downlink';
import { UplinkClient } from './uplink';
import { TransactionType } from '../constants';
import { BaseTransactions } from './base';


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