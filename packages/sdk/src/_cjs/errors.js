"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPaymasterError = exports.InvalidArgumentError = exports.MissingWalletClientError = exports.MissingPublicClientError = exports.UnsupportedSubgraphChainIdError = exports.UnsupportedChainIdError = exports.InvalidConfigError = exports.TransactionFailedError = void 0;
const constants_js_1 = require("./constants.js");
class TransactionFailedError extends Error {
    constructor(m) {
        super(m);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'TransactionFailedError'
        });
        Object.setPrototypeOf(this, TransactionFailedError.prototype);
    }
}
exports.TransactionFailedError = TransactionFailedError;
class InvalidConfigError extends Error {
    constructor(m) {
        super(m);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidConfigError'
        });
        Object.setPrototypeOf(this, InvalidConfigError.prototype);
    }
}
exports.InvalidConfigError = InvalidConfigError;
class UnsupportedChainIdError extends Error {
    constructor(invalidChainId, supportedChains) {
        super(`Unsupported chain: ${invalidChainId}. Supported chains are: ${supportedChains}`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnsupportedChainIdError'
        });
        Object.setPrototypeOf(this, UnsupportedChainIdError.prototype);
    }
}
exports.UnsupportedChainIdError = UnsupportedChainIdError;
class UnsupportedSubgraphChainIdError extends Error {
    constructor() {
        super(`Unsupported subgraph chain. Supported subgraph chains are: ${constants_js_1.SUPPORTED_CHAIN_IDS}`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnsupportedSubgraphChainIdError'
        });
        Object.setPrototypeOf(this, UnsupportedSubgraphChainIdError.prototype);
    }
}
exports.UnsupportedSubgraphChainIdError = UnsupportedSubgraphChainIdError;
class MissingPublicClientError extends Error {
    constructor(m) {
        super(m);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'MissingPublicClientError'
        });
        Object.setPrototypeOf(this, MissingPublicClientError.prototype);
    }
}
exports.MissingPublicClientError = MissingPublicClientError;
class MissingWalletClientError extends Error {
    constructor(m) {
        super(m);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'MissingWalletClientError'
        });
        Object.setPrototypeOf(this, MissingWalletClientError.prototype);
    }
}
exports.MissingWalletClientError = MissingWalletClientError;
class InvalidArgumentError extends Error {
    constructor(m) {
        super(m);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidArgumentError'
        });
        Object.setPrototypeOf(this, InvalidArgumentError.prototype);
    }
}
exports.InvalidArgumentError = InvalidArgumentError;
class InvalidPaymasterError extends Error {
    constructor(m) {
        super(m);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidPaymasterError'
        });
        Object.setPrototypeOf(this, InvalidPaymasterError.prototype);
    }
}
exports.InvalidPaymasterError = InvalidPaymasterError;
//# sourceMappingURL=errors.js.map