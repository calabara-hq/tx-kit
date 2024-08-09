"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIGINT_TWO = exports.BIGINT_ONE = exports.BIGINT_ZERO = exports.TransactionType = exports.getDynamicLogicAddress = exports.getCustomFeesAddress = exports.getChannelFactoryAddress = exports.getSubgraphUrl = exports.SUPPORTED_CHAIN_IDS = exports.BASE_TESTNET_CHAIN_IDS = exports.BASE_CHAIN_IDS = exports.ChainId = exports.PERCENTAGE_SCALE = exports.MAX_PRECISION_DECIMALS = exports.INTENT_DURATION = exports.BASE_MAINNET_SUBGRAPH_URL = exports.BASE_SEPOLIA_SUBGRAPH_URL = exports.MULTICALL_3_ADDRESS = exports.NATIVE_TOKEN = exports.DYNAMIC_LOGIC_BASE_MAINNET = exports.CUSTOM_FEES_BASE_MAINNET = exports.FACTORY_PROXY_BASE_MAINNET = exports.DYNAMIC_LOGIC_BASE_SEPOLIA = exports.CUSTOM_FEES_BASE_SEPOLIA = exports.FACTORY_PROXY_BASE_SEPOLIA = void 0;
exports.FACTORY_PROXY_BASE_SEPOLIA = '0x080D84B7D76350e19B277946e9eA7d5660F04e49';
exports.CUSTOM_FEES_BASE_SEPOLIA = '0x3f0f9C18aF122c6E8afF209473d99e9C88621fEc';
exports.DYNAMIC_LOGIC_BASE_SEPOLIA = '0x24f2a673f89462811BDd688aD1699Ace09Bc84cD';
exports.FACTORY_PROXY_BASE_MAINNET = '0x25196Db9772e46F58A56B4E51B69709B483F4bEc';
exports.CUSTOM_FEES_BASE_MAINNET = '0x59A10Cf3D703FE4c2C4dea9Dad39940fb7162e02';
exports.DYNAMIC_LOGIC_BASE_MAINNET = '0x2383FcF6F4596ba26f002EB4cA8540bEB460aB8D';
exports.NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
exports.MULTICALL_3_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11';
exports.BASE_SEPOLIA_SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_clx10qkniqc3w01ypaz560vm1/subgraphs/transmissions-baseSepolia/0.0.7/gn';
exports.BASE_MAINNET_SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_clx10qkniqc3w01ypaz560vm1/subgraphs/transmissions-baseMainnet/0.0.2/gn';
exports.INTENT_DURATION = BigInt(60 * 60 * 24 * 7);
exports.MAX_PRECISION_DECIMALS = 2;
exports.PERCENTAGE_SCALE = BigInt(1e4);
var ChainId;
(function (ChainId) {
    ChainId[ChainId["BASE"] = 8453] = "BASE";
    ChainId[ChainId["BASE_TESTNET"] = 84532] = "BASE_TESTNET";
})(ChainId || (exports.ChainId = ChainId = {}));
exports.BASE_CHAIN_IDS = [ChainId.BASE];
exports.BASE_TESTNET_CHAIN_IDS = [ChainId.BASE_TESTNET];
exports.SUPPORTED_CHAIN_IDS = [
    ...exports.BASE_CHAIN_IDS,
    ...exports.BASE_TESTNET_CHAIN_IDS,
];
const getSubgraphUrl = (chainId) => {
    switch (chainId) {
        case ChainId.BASE:
            return exports.BASE_MAINNET_SUBGRAPH_URL;
        case ChainId.BASE_TESTNET:
            return exports.BASE_SEPOLIA_SUBGRAPH_URL;
        default:
            throw new Error(`Unsupported chain: ${chainId}`);
    }
};
exports.getSubgraphUrl = getSubgraphUrl;
const getChannelFactoryAddress = (chainId) => {
    switch (chainId) {
        case ChainId.BASE:
            return exports.FACTORY_PROXY_BASE_MAINNET;
        case ChainId.BASE_TESTNET:
            return exports.FACTORY_PROXY_BASE_SEPOLIA;
        default:
            throw new Error(`Unsupported chain: ${chainId}`);
    }
};
exports.getChannelFactoryAddress = getChannelFactoryAddress;
const getCustomFeesAddress = (chainId) => {
    switch (chainId) {
        case ChainId.BASE:
            return exports.CUSTOM_FEES_BASE_MAINNET;
        case ChainId.BASE_TESTNET:
            return exports.CUSTOM_FEES_BASE_SEPOLIA;
        default:
            throw new Error(`Unsupported chain: ${chainId}`);
    }
};
exports.getCustomFeesAddress = getCustomFeesAddress;
const getDynamicLogicAddress = (chainId) => {
    switch (chainId) {
        case ChainId.BASE:
            return exports.DYNAMIC_LOGIC_BASE_MAINNET;
        case ChainId.BASE_TESTNET:
            return exports.DYNAMIC_LOGIC_BASE_SEPOLIA;
        default:
            throw new Error(`Unsupported chain: ${chainId}`);
    }
};
exports.getDynamicLogicAddress = getDynamicLogicAddress;
var TransactionType;
(function (TransactionType) {
    TransactionType["Transaction"] = "Transaction";
    TransactionType["CallData"] = "CallData";
    TransactionType["GasEstimate"] = "GasEstimate";
    TransactionType["Signature"] = "Signature";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
exports.BIGINT_ZERO = BigInt(0);
exports.BIGINT_ONE = BigInt(1);
exports.BIGINT_TWO = BigInt(2);
//# sourceMappingURL=constants.js.map