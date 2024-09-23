import { Address, decodeEventLog, erc20Abi } from 'viem'
import { useCallback, useContext, useState } from 'react'
import { ContractExecutionStatus, RequestError } from './types.js'
import {
  CreateInfiniteChannelConfig,
  UpdateChannelMetadataConfig,
  SetChannelFeeConfig,
  UpdateInfiniteChannelTransportLayerConfig,
  UpgradeChannelImplConfig,
  CreateFiniteChannelConfig,
  NATIVE_TOKEN,
  getChannelFactoryAddress,
} from '@tx-kit/sdk'
import {
  channelAbi,
  channelFactoryAbi,
  finiteChannelAbi,
  infiniteChannelAbi,
} from '@tx-kit/sdk/abi'
import { TransmissionsContext } from './context.js'
import { getTransmissionsClient } from './utils.js'

export const useCreateInfiniteChannel = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [channelAddress, setChannelAddress] = useState<Address>()
  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const createInfiniteChannel = useCallback(
    async (args: CreateInfiniteChannelConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setChannelAddress(undefined)
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitCreateInfiniteChannelTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.createInfiniteChannel,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
            abi: channelFactoryAbi,
            data: event.data,
            topics: event.topics,
          })
          : undefined

        const contractAddress =
          decodedLog?.eventName === 'SetupNewContract'
            ? decodedLog.args.contractAddress
            : undefined

        setChannelAddress(contractAddress)
        setStatus('complete')
        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { createInfiniteChannel, channelAddress, status, txHash, error }
}

export const useCreateFiniteChannel = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [channelAddress, setChannelAddress] = useState<Address>()
  const [status, setStatus] = useState<
    ContractExecutionStatus | 'erc20ApprovalInProgress'
  >()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const createFiniteChannel = useCallback(
    async (args: CreateFiniteChannelConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setChannelAddress(undefined)
        setError(undefined)
        setTxHash(undefined)

        if (args.transportLayer.rewards.token !== NATIVE_TOKEN) {
          /// erc20 token. need to check approvals

          const channelFactoryAddress = getChannelFactoryAddress(transmissionsClient._chainId)

          // read the users current allowance for the token

          const allowance = await transmissionsClient._publicClient!.readContract(
            {
              address: args.transportLayer.rewards.token as Address,
              abi: erc20Abi,
              functionName: 'allowance',
              args: [channelFactoryAddress, args.defaultAdmin as Address],
            },
          )

          if (allowance < args.transportLayer.rewards.totalAllocation) {
            setStatus('erc20ApprovalInProgress')
            const { txHash: hash } =
              await transmissionsClient.submitApproveERC20Transaction({
                erc20Contract: args.transportLayer.rewards.token,
                spender: channelFactoryAddress,
                amount: args.transportLayer.rewards.totalAllocation
              })

            const events = await transmissionsClient.getTransactionEvents({
              txHash: hash,
              eventTopics: transmissionsClient.eventTopics.erc20Approved,
            })

            const event = events?.[0]
            const decodedLog = event
              ? decodeEventLog({
                abi: erc20Abi,
                data: event.data,
                // @ts-ignore
                topics: event.topics,
              })
              : undefined

            // @ts-ignore
            if (decodedLog?.eventName !== 'Approval') {
              setStatus('error')
              throw new Error('Approval failed')
            }
          }
        }


        const { txHash: hash } =
          await transmissionsClient.submitCreateFiniteChannelTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.createFiniteChannel,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
            abi: channelFactoryAbi,
            data: event.data,
            topics: event.topics,
          })
          : undefined

        const contractAddress =
          decodedLog?.eventName === 'SetupNewContract'
            ? decodedLog.args.contractAddress
            : undefined

        setChannelAddress(contractAddress)
        setStatus('complete')
        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { createFiniteChannel, channelAddress, status, txHash, error }
}

export const useUpdateMetadata = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [uri, setUri] = useState<string>()
  const [name, setName] = useState<string>()
  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const updateChannelMetadata = useCallback(
    async (args: UpdateChannelMetadataConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setUri(undefined)
        setName(undefined)
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitUpdateChannelMetadataTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.channelMetadataUpdated,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
            abi: channelAbi,
            data: event.data,
            topics: event.topics,
          })
          : undefined

        const updatedData =
          decodedLog?.eventName === 'ChannelMetadataUpdated'
            ? { uri: decodedLog.args.uri, name: decodedLog.args.channelName }
            : undefined

        setUri(updatedData?.uri ?? undefined)
        setName(updatedData?.name ?? undefined)
        setStatus('complete')
        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { updateChannelMetadata, uri, name, status, txHash, error }
}

export const useUpdateChannelFees = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const updateChannelFees = useCallback(
    async (args: SetChannelFeeConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitUpdateChannelFeesTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.configUpdated,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
            abi: channelAbi,
            data: event.data,
            topics: event.topics,
          })
          : undefined

        if (decodedLog?.eventName === 'ConfigUpdated') {
          setStatus('complete')
        }

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { updateChannelFees, status, txHash, error }
}

export const useUpdateInfiniteChannelTransportLayer = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const updateInfiniteChannelTransportLayer = useCallback(
    async (args: UpdateInfiniteChannelTransportLayerConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitUpdateInfiniteChannelTransportLayerTransaction(
            args,
          )
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics:
            transmissionsClient.eventTopics.infiniteTransportConfigSet,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
            abi: infiniteChannelAbi,
            data: event.data,
            topics: event.topics,
          })
          : undefined

        if (decodedLog?.eventName === 'InfiniteTransportConfigSet') {
          setStatus('complete')
        }

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { updateInfiniteChannelTransportLayer, status, txHash, error }
}

export const useUpgradeChannel = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const upgradeChannel = useCallback(
    async (args: UpgradeChannelImplConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitUpgradeChannelTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.upgraded,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
            abi: channelAbi,
            data: event.data,
            topics: event.topics,
          })
          : undefined

        if (decodedLog?.eventName === 'Upgraded') {
          setStatus('complete')
        }

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { upgradeChannel, status, txHash, error }
}

export const useSettleFiniteChannel = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const settle = useCallback(
    async (args: { channelAddress: Address }) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitSettleFiniteChannelTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.settled,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
            abi: finiteChannelAbi,
            data: event.data,
            topics: event.topics,
          })
          : undefined

        if (decodedLog?.eventName === 'Settled') {
          setStatus('complete')
        }

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { settle, status, txHash, error }
}
