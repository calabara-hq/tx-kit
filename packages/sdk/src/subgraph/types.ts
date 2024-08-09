import { Address } from "viem"

type Scalars = {
    ID: string
    String: string
    Boolean: boolean
    Int: number
}

export type GqlVariables = {
    [key: string]: string | number | boolean | undefined | string[] | object
}

export type Filters = {
    filters?: {
        where?: GqlVariables
        orderBy?: string
        orderDirection?: string
        pageSize?: number
        skip?: number
    }
}

export type GetChannelQuery = {
    channelAddress: string
    includeTokens?: boolean
}

export type GetAllChannelsQuery = {
    includeTokens?: boolean
} & Filters

export type GetTokensQuery = {
    channelAddress: string
} & Filters

export type GetChannelUpgradesQuery = {
    address: string
}

export type GqlBlockInfo = {
    blockNumber: Scalars['String']
    blockTimestamp: Scalars['String']
}

export type IBlockInfo = {
    blockNumber?: bigint
    blockTimestamp?: bigint
}

export type GqlInfiniteTransportConfig = {
    __typename: 'InfiniteTransportConfig'
    id: Scalars['ID']
    saleDuration: Scalars['String'] // TODO bigint
}

export type GqlFiniteTransportConfig = {
    __typename: 'FiniteTransportConfig'
    id: Scalars['ID']
    createStart: Scalars['String']
    mintStart: Scalars['String']
    mintEnd: Scalars['String']
    ranks: Scalars['Int'][]
    allocations: Scalars['String'][]
    totalAllocation: Scalars['String']
    token: Scalars['String']
    settled: Scalars['Boolean']
    settledBy: Scalars['String']
    settledAt: Scalars['String']
}

export type GqlTransportLayer = {
    __typename: 'TransportLayer'
    type: 'infinite' | 'finite'
    id: Scalars['ID']
    finiteTransportConfig: GqlFiniteTransportConfig
    infiniteTransportConfig: GqlInfiniteTransportConfig
} & GqlBlockInfo

export type GqlDynamicLogic = {
    __typename: 'DynamicLogic'
    id: Scalars['ID']
    targets: Scalars['String'][]
    signatures: Scalars['String'][]
    datas: Scalars['String'][]
    operators: Scalars['String'][]
    literalOperands: Scalars['String'][]
    interactionPowerTypes: Scalars['String'][]
    interactionPowers: Scalars['String'][]
}

export type GqlLogicConfig = {
    __typename: 'LogicConfig'
    id: Scalars['ID']
    type: "dynamicLogic"
    updatedBy: Scalars['String']
    logicContract: Scalars['String']
    dynamicLogic: GqlDynamicLogic
}

export type GqlCustomFees = {
    __typename: 'CustomFees'
    id: Scalars['ID']
    channelTreasury: Scalars['String']
    uplinkBps: Scalars['String']
    channelBps: Scalars['String']
    creatorBps: Scalars['String']
    mintReferralBps: Scalars['String']
    sponsorBps: Scalars['String']
    ethMintPrice: Scalars['String']
    erc20MintPrice: Scalars['String']
    erc20Contract: Scalars['String']
}

export type GqlFeeConfig = {
    __typename: 'FeeConfig'
    id: Scalars['ID']
    type: 'customFees'
    updatedBy: Scalars['String']
    feeContract: Scalars['String']
    customFees: GqlCustomFees
}

export type GqlUser = {
    __typename: 'User'
    id: Scalars['ID']
    createdTokens: GqlToken[]
    sponsoredTokens: GqlToken[]
    collectedTokens: GqlTokenHolder[]
    mints: GqlMint[]
    mintReferrals: GqlMint[]
}

export type GqlTokenHolder = {
    __typename: 'TokenHolder'
    id: Scalars['ID']
    user: GqlUser
    token: GqlToken
    balance: Scalars['String']
}

export type GqlToken = {
    __typename: 'Token'
    id: Scalars['ID']
    tokenId: Scalars['String']
    author: GqlUser
    sponsor: GqlUser
    uri: Scalars['String']
    metadata: GqlTokenMetadata
    totalMinted: Scalars['String']
    maxSupply: Scalars['String']

    holders: GqlTokenHolder[]
    channel: GqlChannel

} & GqlBlockInfo

export type GqlTokenMetadata = {
    id: Scalars['ID']
    name: Scalars['String']
    description: Scalars['String']
    image: Scalars['String']
    animation: Scalars['String']
    type: Scalars['String']
}

export type GqlMint = {
    __typename: 'Mint'
    id: Scalars['ID']
    token: GqlToken
    amount: Scalars['String']
    minter: GqlUser
    referral: GqlUser
    data: Scalars['String']

    channel: GqlChannel
} & GqlBlockInfo

export type GqlChannel = {
    __typename: 'Channel'
    id: Scalars['ID']
    uri: Scalars['String']
    name: Scalars['String']
    admin: GqlUser
    managers: GqlUser[]
    transportLayer: GqlTransportLayer
    creatorLogic?: GqlLogicConfig
    minterLogic?: GqlLogicConfig
    fees?: GqlFeeConfig
    tokens?: GqlToken[]
} & GqlBlockInfo


export type GqlUpgradePath = {
    __typename: 'ChannelUpgradeRegisteredEvent'
    id: Scalars['ID']
    baseImpl: Scalars['String']
    upgradeImpl: Scalars['String']
} & GqlBlockInfo

export type IUpgradePath = {
    id: string
    baseImpl: Address
    upgradeImpl: Address
} & IBlockInfo


export type ITransportLayer = {
    id?: string
    type?: 'infinite' | 'finite'
    transportConfig?: IInfiniteTransportConfig | IFiniteTransportConfig
} & IBlockInfo

export type IInfiniteTransportConfig = {
    id: string
    saleDuration: string
}

export type IFiniteTransportConfig = {
    id: string
    createStart: string
    mintStart: string
    mintEnd: string
    ranks: number[]
    allocations: bigint[]
    totalAllocation: bigint
    token: Address
    settled: boolean
    settledBy: Address
    settledAt: string
}

export type ILogicConfig = {
    id: string
    type: "dynamicLogic"
    updatedBy: Address
    logicContract: Address
    logic: IDynamicLogic
}

export type InteractionPowerTypes = "uniform" | "weighted"

export type IDynamicLogic = {
    id: string
    targets: Address[]
    signatures: string[]
    datas: string[]
    operators: string[]
    literalOperands: string[]
    interactionPowerTypes: InteractionPowerTypes[]
    interactionPowers: string[]
}

export type IFeeConfig = {
    id: string
    type: 'customFees'
    updatedBy: Address
    feeContract: Address
    fees: ICustomFees
}

export type ICustomFees = {
    id: string
    channelTreasury: Address
    uplinkPercentage: number
    channelPercentage: number
    creatorPercentage: number
    mintReferralPercentage: number
    sponsorPercentage: number
    ethMintPrice: bigint
    erc20MintPrice: bigint
    erc20Contract: Address
}

export type IMint = {
    id: string
    token: IToken
    amount: bigint
    minter: IUser
    referral: IUser
    data: string

    channel: IChannel

} & IBlockInfo

export type IUser = {
    id: string
    createdTokens: IToken[]
    sponsoredTokens: IToken[]
    collectedTokens: ITokenHolder[]
    mints: IMint[]
    mintReferrals: IMint[]
}

export type ITokenHolder = {
    id: string
    user: Address
    token: IToken
    balance: bigint
}

export type IToken = {
    id: string
    channelAddress: Address
    tokenId: bigint
    author: Address
    sponsor: Address
    uri: string
    metadata: ITokenMetadata | null
    totalMinted: bigint
    maxSupply: bigint
} & IBlockInfo

export type ITokenMetadata = {
    id: string
    name: string
    description: string
    image: string
    animation: string
    type: string
}


export type IChannel = {
    id: Address
    uri: string
    name: string
    admin: Address
    managers: Address[]
    transportLayer: ITransportLayer
    creatorLogic: ILogicConfig | null
    minterLogic: ILogicConfig | null
    fees: IFeeConfig | null
    tokens: IToken[]
} & IBlockInfo