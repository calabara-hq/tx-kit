import { Address } from 'viem';
export declare const FACTORY_PROXY_BASE_SEPOLIA = "0x080D84B7D76350e19B277946e9eA7d5660F04e49";
export declare const CUSTOM_FEES_BASE_SEPOLIA = "0x3f0f9C18aF122c6E8afF209473d99e9C88621fEc";
export declare const DYNAMIC_LOGIC_BASE_SEPOLIA = "0x24f2a673f89462811BDd688aD1699Ace09Bc84cD";
export declare const FACTORY_PROXY_BASE_MAINNET = "0x25196Db9772e46F58A56B4E51B69709B483F4bEc";
export declare const CUSTOM_FEES_BASE_MAINNET = "0x59A10Cf3D703FE4c2C4dea9Dad39940fb7162e02";
export declare const DYNAMIC_LOGIC_BASE_MAINNET = "0x2383FcF6F4596ba26f002EB4cA8540bEB460aB8D";
export declare const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export declare const MULTICALL_3_ADDRESS = "0xca11bde05977b3631167028862be2a173976ca11";
export declare const BASE_SEPOLIA_SUBGRAPH_URL = "https://api.goldsky.com/api/public/project_clx10qkniqc3w01ypaz560vm1/subgraphs/transmissions-baseSepolia/0.0.8/gn";
export declare const BASE_MAINNET_SUBGRAPH_URL = "https://api.goldsky.com/api/public/project_clx10qkniqc3w01ypaz560vm1/subgraphs/transmissions-baseMainnet/0.0.3/gn";
export declare const INTENT_DURATION: bigint;
export declare const MAX_PRECISION_DECIMALS = 2;
export declare const PERCENTAGE_SCALE: bigint;
export declare enum ChainId {
    BASE = 8453,
    BASE_TESTNET = 84532
}
export declare const BASE_CHAIN_IDS: ChainId[];
export declare const BASE_TESTNET_CHAIN_IDS: ChainId[];
export declare const SUPPORTED_CHAIN_IDS: ChainId[];
export declare const getSubgraphUrl: (chainId: number) => string;
export declare const getChannelFactoryAddress: (chainId: number) => Address;
export declare const getCustomFeesAddress: (chainId: number) => Address;
export declare const getDynamicLogicAddress: (chainId: number) => Address;
export declare enum TransactionType {
    Transaction = "Transaction",
    CallData = "CallData",
    GasEstimate = "GasEstimate",
    Signature = "Signature"
}
export declare const BIGINT_ZERO: bigint;
export declare const BIGINT_ONE: bigint;
export declare const BIGINT_TWO: bigint;
//# sourceMappingURL=constants.d.ts.map