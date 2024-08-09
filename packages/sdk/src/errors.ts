import { SUPPORTED_CHAIN_IDS } from './constants.js'

export class TransactionFailedError extends Error {
  name = 'TransactionFailedError'

  constructor(m?: string) {
    super(m)
    Object.setPrototypeOf(this, TransactionFailedError.prototype)
  }
}

export class InvalidConfigError extends Error {
  name = 'InvalidConfigError'

  constructor(m?: string) {
    super(m)
    Object.setPrototypeOf(this, InvalidConfigError.prototype)
  }
}

export class UnsupportedChainIdError extends Error {
  name = 'UnsupportedChainIdError'

  constructor(invalidChainId: number, supportedChains: number[]) {
    super(
      `Unsupported chain: ${invalidChainId}. Supported chains are: ${supportedChains}`,
    )
    Object.setPrototypeOf(this, UnsupportedChainIdError.prototype)
  }
}

export class UnsupportedSubgraphChainIdError extends Error {
  name = 'UnsupportedSubgraphChainIdError'

  constructor() {
    super(
      `Unsupported subgraph chain. Supported subgraph chains are: ${SUPPORTED_CHAIN_IDS}`,
    )
    Object.setPrototypeOf(this, UnsupportedSubgraphChainIdError.prototype)
  }
}

export class MissingPublicClientError extends Error {
  name = 'MissingPublicClientError'

  constructor(m?: string) {
    super(m)
    Object.setPrototypeOf(this, MissingPublicClientError.prototype)
  }
}

export class MissingWalletClientError extends Error {
  name = 'MissingWalletClientError'

  constructor(m?: string) {
    super(m)
    Object.setPrototypeOf(this, MissingWalletClientError.prototype)
  }
}

export class InvalidArgumentError extends Error {
  name = 'InvalidArgumentError'

  constructor(m?: string) {
    super(m)
    Object.setPrototypeOf(this, InvalidArgumentError.prototype)
  }
}

export class InvalidPaymasterError extends Error {
  name = 'InvalidPaymasterError'

  constructor(m?: string) {
    super(m)
    Object.setPrototypeOf(this, InvalidPaymasterError.prototype)
  }
}
