import { SUPPORTED_CHAIN_IDS } from './constants.js';
export class TransactionFailedError extends Error {
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
export class InvalidConfigError extends Error {
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
export class UnsupportedChainIdError extends Error {
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
export class UnsupportedSubgraphChainIdError extends Error {
    constructor() {
        super(`Unsupported subgraph chain. Supported subgraph chains are: ${SUPPORTED_CHAIN_IDS}`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnsupportedSubgraphChainIdError'
        });
        Object.setPrototypeOf(this, UnsupportedSubgraphChainIdError.prototype);
    }
}
export class MissingPublicClientError extends Error {
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
export class MissingWalletClientError extends Error {
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
export class InvalidArgumentError extends Error {
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
export class InvalidPaymasterError extends Error {
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
//# sourceMappingURL=errors.js.map