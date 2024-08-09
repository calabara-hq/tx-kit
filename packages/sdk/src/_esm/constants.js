export const FACTORY_PROXY_BASE_SEPOLIA = '0x080D84B7D76350e19B277946e9eA7d5660F04e49';
export const CUSTOM_FEES_BASE_SEPOLIA = '0x3f0f9C18aF122c6E8afF209473d99e9C88621fEc';
export const DYNAMIC_LOGIC_BASE_SEPOLIA = '0x24f2a673f89462811BDd688aD1699Ace09Bc84cD';
export const FACTORY_PROXY_BASE_MAINNET = '0x25196Db9772e46F58A56B4E51B69709B483F4bEc';
export const CUSTOM_FEES_BASE_MAINNET = '0x59A10Cf3D703FE4c2C4dea9Dad39940fb7162e02';
export const DYNAMIC_LOGIC_BASE_MAINNET = '0x2383FcF6F4596ba26f002EB4cA8540bEB460aB8D';
export const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const MULTICALL_3_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11';
export const BASE_SEPOLIA_SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_clx10qkniqc3w01ypaz560vm1/subgraphs/transmissions-baseSepolia/0.0.7/gn';
export const BASE_MAINNET_SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_clx10qkniqc3w01ypaz560vm1/subgraphs/transmissions-baseMainnet/0.0.2/gn';
export const INTENT_DURATION = BigInt(60 * 60 * 24 * 7); // 1 week
export const MAX_PRECISION_DECIMALS = 2;
export const PERCENTAGE_SCALE = BigInt(1e4);
export var ChainId;
(function (ChainId) {
    ChainId[ChainId["BASE"] = 8453] = "BASE";
    ChainId[ChainId["BASE_TESTNET"] = 84532] = "BASE_TESTNET";
})(ChainId || (ChainId = {}));
export const BASE_CHAIN_IDS = [ChainId.BASE];
export const BASE_TESTNET_CHAIN_IDS = [ChainId.BASE_TESTNET];
export const SUPPORTED_CHAIN_IDS = [
    ...BASE_CHAIN_IDS,
    ...BASE_TESTNET_CHAIN_IDS,
];
export const getSubgraphUrl = (chainId) => {
    switch (chainId) {
        case ChainId.BASE:
            return BASE_MAINNET_SUBGRAPH_URL;
        case ChainId.BASE_TESTNET:
            return BASE_SEPOLIA_SUBGRAPH_URL;
        default:
            throw new Error(`Unsupported chain: ${chainId}`);
    }
};
export const getChannelFactoryAddress = (chainId) => {
    switch (chainId) {
        case ChainId.BASE:
            return FACTORY_PROXY_BASE_MAINNET;
        case ChainId.BASE_TESTNET:
            return FACTORY_PROXY_BASE_SEPOLIA;
        default:
            throw new Error(`Unsupported chain: ${chainId}`);
    }
};
export const getCustomFeesAddress = (chainId) => {
    switch (chainId) {
        case ChainId.BASE:
            return CUSTOM_FEES_BASE_MAINNET;
        case ChainId.BASE_TESTNET:
            return CUSTOM_FEES_BASE_SEPOLIA;
        default:
            throw new Error(`Unsupported chain: ${chainId}`);
    }
};
export const getDynamicLogicAddress = (chainId) => {
    switch (chainId) {
        case ChainId.BASE:
            return DYNAMIC_LOGIC_BASE_MAINNET;
        case ChainId.BASE_TESTNET:
            return DYNAMIC_LOGIC_BASE_SEPOLIA;
        default:
            throw new Error(`Unsupported chain: ${chainId}`);
    }
};
export var TransactionType;
(function (TransactionType) {
    TransactionType["Transaction"] = "Transaction";
    TransactionType["CallData"] = "CallData";
    TransactionType["GasEstimate"] = "GasEstimate";
    TransactionType["Signature"] = "Signature";
})(TransactionType || (TransactionType = {}));
export const BIGINT_ZERO = BigInt(0);
export const BIGINT_ONE = BigInt(1);
export const BIGINT_TWO = BigInt(2);
//# sourceMappingURL=constants.js.map