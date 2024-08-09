import type {
  AccessList,
  Account,
  Address,
  Chain,
  Hash,
  Hex,
  PublicClient,
  Transport,
  WalletClient,
  zeroAddress,
} from 'viem'

import { TransactionType } from './constants.js'

export type ApiConfig = {
  serverUrl?: string
}

export type PaymasterConfig = {
  paymasterUrl?: string
}

export type DownlinkClientConfig = {
  publicClient?: PublicClient<Transport, Chain>
  includeEnsNames?: boolean
  apiConfig?: ApiConfig
  // ensPublicClient can be used to fetch ens names when publicClient is not on mainnet (reverseRecords
  // only works on mainnet).
  ensPublicClient?: PublicClient<Transport, Chain>
}

export type TransmissionsClientConfig = {
  chainId: number
  publicClient?: PublicClient<Transport, Chain>
  walletClient?: WalletClient<Transport, Chain, Account>
  apiConfig?: ApiConfig
  includeEnsNames?: boolean
  // ensPublicClient can be used to fetch ens names when publicClient is not on mainnet (reverseRecords
  // only works on mainnet).
  ensPublicClient?: PublicClient<Transport, Chain>
  paymasterConfig?: PaymasterConfig
}

export type TransactionOverrides = {
  accessList?: AccessList
  gas?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
  nonce?: number
  value?: bigint
}

export type TransactionConfig = {
  transactionType: TransactionType
}

export type CallData = {
  address: string
  data: Hex
}

export type TransactionFormat = Hash | bigint | CallData

export interface TransactionOverridesDict {
  transactionOverrides?: TransactionOverrides
}

export type MulticallConfig = {
  channelAddress: string
  calls: CallData[]
} & TransactionOverridesDict

export type CreateInfiniteChannelConfig = {
  uri: string
  name: string
  defaultAdmin: string
  managers: string[]
  setupActions: SetupAction[]
  transportLayer: InfiniteTransportLayer
} & TransactionOverridesDict

export type CreateFiniteChannelConfig = {
  uri: string
  name: string
  defaultAdmin: string
  managers: string[]
  setupActions: SetupAction[]
  transportLayer: FiniteTransportLayer
} & TransactionOverridesDict

/// transport layers

export type InfiniteTransportLayer = {
  saleDurationInSeconds: number
}

export type FiniteTransportLayer = {
  createStartInSeconds: number
  mintStartInSeconds: number
  mintEndInSeconds: number
  rewards: {
    ranks: number[]
    allocations: bigint[]
    totalAllocation: bigint
    token: string
  }
}

export type UpdateInfiniteChannelTransportLayerConfig = {
  channelAddress: string
} & InfiniteTransportLayer &
  TransactionOverridesDict

// setup actions

export type SetupAction = ChannelFeeArguments | ChannelLogicArguments

export const isChannelFeeArguments = (
  action: SetupAction,
): action is ChannelFeeArguments => {
  return 'feeContract' in action
}

export const isChannelLogicArguments = (
  action: SetupAction,
): action is ChannelLogicArguments => {
  return 'logicContract' in action
}

/// fees & logic

export type CustomFeeInputs = {
  channelTreasury: string
  uplinkPercentage: number
  channelPercentage: number
  creatorPercentage: number
  mintReferralPercentage: number
  sponsorPercentage: number
  ethMintPrice: bigint
  erc20MintPrice: bigint
  erc20Contract: string
} | null

export type ChannelFeeArguments =
  | {
      feeContract: string
      feeArgs: CustomFeeInputs
    }
  | { feeContract: typeof zeroAddress; feeArgs: null }

export type ChannelLogicArguments = {
  logicContract: string | typeof zeroAddress
  creatorLogic: DynamicLogicInputs[]
  minterLogic: DynamicLogicInputs[]
}

export type SetChannelFeeConfig = {
  channelAddress: string
} & ChannelFeeArguments &
  TransactionOverridesDict

export type SetChannelLogicConfig = {
  channelAddress: string
} & ChannelLogicArguments &
  TransactionOverridesDict

export enum LogicOperators {
  lt,
  gt,
  eq,
}

export enum LogicInteractionPowerTypes {
  uniform,
  weighted,
}

export type DynamicLogicInputs = {
  target: string
  signature: string
  data: string
  operator: LogicOperators
  literalOperand: Hex
  interactionPowerType: LogicInteractionPowerTypes
  interactionPower: bigint
}

/// channel metadata

export type UpdateChannelMetadataConfig = {
  channelAddress: string
  uri: string
  name: string
} & TransactionOverridesDict

/// token creation

export type CreateTokenConfig = {
  channelAddress: string
  uri: string
  maxSupply: bigint
} & TransactionOverridesDict

/// token mints

export type MintTokenConfig = {
  channelAddress: string
  to: string
  tokenId: bigint
  amount: number
  mintReferral: string
  data: string
} & TransactionOverridesDict

export type MintTokenBatchConfig = {
  channelAddress: string
  to: string
  tokenIds: bigint[]
  amounts: number[]
  mintReferral: string
  data: string
} & TransactionOverridesDict

export type DeferredTokenIntent = {
  author: Address
  intent: {
    domain: {
      name: 'Transmissions'
      version: '1'
      chainId: number
      verifyingContract: Address
    }
    types: {
      DeferredTokenPermission: [
        { name: 'uri'; type: 'string' },
        { name: 'maxSupply'; type: 'uint256' },
        { name: 'deadline'; type: 'uint256' },
        { name: 'nonce'; type: 'bytes32' },
      ]
    }
    primaryType: 'DeferredTokenPermission'
    message: {
      uri: string
      maxSupply: bigint
      deadline: bigint
      nonce: Hex
    }
  }
}

export type DeferredTokenIntentWithSignature = {
  signature: Hex
} & DeferredTokenIntent

export type SponsorTokenConfig = {
  channelAddress: string
  sponsoredToken: DeferredTokenIntentWithSignature
  to: string
  amount: number
  mintReferral: string
  data: string
} & TransactionOverridesDict

/// finite admin withdrawals

export type WithdrawRewardsConfig = {
  channelAddress: string
  token: string
  to: string
  amount: bigint
} & TransactionOverridesDict

/// utils

export type ApproveERC20Config = {
  erc20Contract: string
  spender: string
  amount: bigint
} & TransactionOverridesDict

export type UpgradeChannelImplConfig = {
  channelAddress: string
  newImplementation: string
} & TransactionOverridesDict
