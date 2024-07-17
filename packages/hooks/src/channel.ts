import { Address, decodeEventLog } from 'viem'
import { useCallback, useContext, useState } from 'react'
import { ContractExecutionStatus, RequestError } from './types'
import {
  channelFactoryAbi,
  CreateInfiniteChannelConfig,
  UpdateChannelMetadataConfig,
  channelAbi,
  SetChannelFeeConfig,
  infiniteChannelAbi,
  UpdateInfiniteChannelTransportLayerConfig,
} from '@tx-kit/sdk'
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
