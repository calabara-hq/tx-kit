import { Address, decodeEventLog } from 'viem'
import { useCallback, useContext, useState } from 'react'
import { ContractExecutionStatus, RequestError } from './types'
import {
  CreateInfiniteChannelConfig,
  UpdateChannelMetadataConfig,
  SetChannelFeeConfig,
  UpdateInfiniteChannelTransportLayerConfig,
  UpgradeChannelImplConfig,
} from '@tx-kit/sdk'
import {
  channelAbi,
  channelFactoryAbi,
  infiniteChannelAbi,
} from '@tx-kit/sdk/abi'
import { TransmissionsContext } from './context'
import { getTransmissionsClient } from './utils'

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
