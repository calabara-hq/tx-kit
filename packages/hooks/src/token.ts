import { Address, decodeEventLog } from 'viem'
import { useCallback, useContext, useState } from 'react'
import { ContractExecutionStatus, RequestError } from './types'
import {
  CreateTokenConfig,
  DeferredTokenIntentWithSignature,
  MintTokenBatchConfig,
  SponsorTokenConfig,
} from '@tx-kit/sdk'
import {
  channelAbi,
  channelFactoryAbi,
  infiniteChannelAbi,
  finiteChannelAbi,
} from '@tx-kit/sdk/abi'

import { TransmissionsContext } from './context'
import { getTransmissionsClient } from './utils'

export const useCreateToken = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [tokenId, setTokenId] = useState<BigInt>()
  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const createToken = useCallback(
    async (args: CreateTokenConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setTokenId(undefined)
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitCreateTokenTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.tokenCreated,
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

        const tokenId =
          decodedLog?.eventName === 'TokenCreated'
            ? decodedLog.args.tokenId
            : undefined

        setTokenId(tokenId)
        setStatus('complete')
        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { createToken, tokenId, status, txHash, error }
}

export const useCreateTokenIntent = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [signedIntent, setSignedIntent] =
    useState<DeferredTokenIntentWithSignature>()
  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [error, setError] = useState<RequestError>()

  const createTokenIntent = useCallback(
    async (args: CreateTokenConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setSignedIntent(undefined)
        setError(undefined)

        const data = transmissionsClient.createDeferredTokenIntent(args)
        const _signedIntent =
          await transmissionsClient.signDeferredTokenIntent(data)

        setSignedIntent(_signedIntent)
        setStatus('complete')

        return _signedIntent
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { createTokenIntent, signedIntent, status, error }
}

export const useMintTokenBatchWithETH = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const mintTokenBatchWithETH = useCallback(
    async (args: MintTokenBatchConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitMintTokenBatchWithETHTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.tokenMinted,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
              abi: [...infiniteChannelAbi, ...finiteChannelAbi],
              data: event.data,
              topics: event.topics,
            })
          : undefined

        if (decodedLog?.eventName === 'TokenMinted') {
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

  return { mintTokenBatchWithETH, status, txHash, error }
}

export const useSponsorTokenWithETH = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [tokenId, setTokenId] = useState<bigint>()
  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const sponsorTokenWithETH = useCallback(
    async (args: SponsorTokenConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitSponsorTokenWithETHTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.tokenMinted,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
              abi: [...infiniteChannelAbi, ...finiteChannelAbi],
              data: event.data,
              topics: event.topics,
            })
          : undefined

        const _tokenId =
          decodedLog?.eventName === 'TokenMinted'
            ? decodedLog.args.tokenIds[0]
            : undefined

        setTokenId(_tokenId)
        setStatus('complete')
        return { tokenId: _tokenId, events }
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { sponsorTokenWithETH, tokenId, status, txHash, error }
}

export const useMintTokenBatchWithERC20 = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const mintTokenBatchWithERC20 = useCallback(
    async (args: MintTokenBatchConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitMintTokenBatchWithERC20Transaction(
            args,
          )
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.tokenMinted,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
              abi: [...infiniteChannelAbi, ...finiteChannelAbi],
              data: event.data,
              topics: event.topics,
            })
          : undefined

        if (decodedLog?.eventName === 'TokenMinted') {
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

  return { mintTokenBatchWithERC20, status, txHash, error }
}
export const useSponsorTokenWithERC20 = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [tokenId, setTokenId] = useState<bigint>()
  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const sponsorTokenWithERC20 = useCallback(
    async (args: SponsorTokenConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitSponsorTokenWithERC20Transaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.tokenMinted,
        })

        const event = events?.[0]

        // use the txHash from the event if it exists in order to accomodate cb smart wallet
        if (event.transactionHash) setTxHash(event.transactionHash)

        const decodedLog = event
          ? decodeEventLog({
              abi: [...infiniteChannelAbi, ...finiteChannelAbi],
              data: event.data,
              topics: event.topics,
            })
          : undefined

        const _tokenId =
          decodedLog?.eventName === 'TokenMinted'
            ? decodedLog.args.tokenIds[0]
            : undefined

        setTokenId(_tokenId)
        setStatus('complete')
        return { tokenId: _tokenId, events }
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { sponsorTokenWithERC20, tokenId, status, txHash, error }
}
