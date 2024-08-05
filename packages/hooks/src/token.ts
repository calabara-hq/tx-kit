import { Address, decodeEventLog, erc20Abi, Hash, Hex, zeroAddress } from 'viem'
import { useCallback, useContext, useMemo, useState } from 'react'
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
import { walletActionsEip5792 } from 'viem/experimental'

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

export const useSponsorTokenWithERC20 = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [tokenId, setTokenId] = useState<bigint>()
  const [status, setStatus] = useState<
    ContractExecutionStatus | 'erc20ApprovalInProgress'
  >()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const eip5792WalletClient = useMemo(() => {
    if (transmissionsClient._walletClient)
      return transmissionsClient._walletClient.extend(walletActionsEip5792())
  }, [transmissionsClient._walletClient])

  const isAtomicBatchSupported: Promise<boolean> = useMemo(async () => {
    try {
      if (!eip5792WalletClient) return false
      const capabilities = await eip5792WalletClient.getCapabilities()
      return (
        capabilities?.[transmissionsClient._chainId]?.atomicBatch?.supported ??
        false
      )
    } catch (e) {
      return false
    }
  }, [transmissionsClient, eip5792WalletClient])

  const verifyClientParameters = useCallback(() => {
    if (!transmissionsClient) throw new Error('Invalid transmissions client')
    if (!transmissionsClient._walletClient)
      throw new Error('Wallet client required')
    if (!transmissionsClient._publicClient)
      throw new Error('Public client required')
  }, [transmissionsClient])

  const fetchAllowance = useCallback(
    async (erc20Contract: Address, channelAddress: Address, user: Address) => {
      return transmissionsClient._publicClient!.readContract({
        address: erc20Contract,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [user, channelAddress as Address],
      })
    },
    [transmissionsClient],
  )

  const decodeSponsorLogs = async (txHash: Hash) => {
    const events = await transmissionsClient.getTransactionEvents({
      txHash,
      eventTopics: transmissionsClient.eventTopics.tokenMinted,
    })

    const event = events?.[0]

    if (event.transactionHash) setTxHash(event.transactionHash)

    const decodedLog = event
      ? decodeEventLog({
          abi: [...infiniteChannelAbi, ...finiteChannelAbi],
          data: event.data,
          // @ts-ignore
          topics: event.topics,
        })
      : undefined

    const _tokenId =
      // @ts-ignore
      decodedLog?.eventName === 'TokenMinted'
        ? // @ts-ignore
          decodedLog.args.tokenIds[0]
        : undefined
    setTokenId(_tokenId)
    setStatus('complete')
    return { tokenId: _tokenId, events }
  }

  const sponsorTokenWithERC20_smartWallet = useCallback(
    async (
      args: SponsorTokenConfig,
      erc20Contract: Address,
      erc20AmountRequired: bigint,
    ) => {
      verifyClientParameters()

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        // read the users current allowance for the token

        const allowance = await fetchAllowance(
          erc20Contract,
          args.channelAddress as Address,
          args.to as Address,
        )
        // if the allowance is less than the mint price, send an approval request

        if (allowance < erc20AmountRequired) {
          setStatus('txInProgress')

          const id = await eip5792WalletClient!.writeContracts({
            contracts: [
              {
                address: erc20Contract,
                abi: erc20Abi,
                functionName: 'approve',
                args: [
                  args.channelAddress as Address,
                  erc20AmountRequired * BigInt(20),
                ],
              },
              // todo: do some validation / checks here from sdk
              {
                address: args.channelAddress as Address,
                abi: [...infiniteChannelAbi, ...finiteChannelAbi],
                functionName: 'sponsorWithERC20',
                args: [
                  args.sponsoredToken.intent.message,
                  args.sponsoredToken.author,
                  args.sponsoredToken.signature,
                  args.to as Address,
                  BigInt(args.amount),
                  (args.mintReferral as Address) || zeroAddress,
                  args.data as Hex,
                ],
              },
            ],

            capabilities: {
              paymasterService: {
                url: transmissionsClient._paymasterConfig?.paymasterUrl ?? '',
              },
            },
          })

          return decodeSponsorLogs(id as Hash)
        } else {
          // mint the token

          setStatus('txInProgress')

          const { txHash } =
            await transmissionsClient.submitSponsorTokenWithERC20Transaction(
              args,
            )

          return decodeSponsorLogs(txHash)
        }
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  const sponsorTokenWithERC20_EoaTwoStep = useCallback(
    async (
      args: SponsorTokenConfig,
      erc20Contract: Address,
      erc20AmountRequired: bigint,
    ) => {
      verifyClientParameters()

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        // read the users current allowance for the token

        const allowance = await fetchAllowance(
          erc20Contract,
          args.channelAddress as Address,
          args.to as Address,
        )

        // if the allowance is less than the mint price, send an approval request

        if (allowance < erc20AmountRequired) {
          setStatus('erc20ApprovalInProgress')

          const { txHash: hash } =
            await transmissionsClient.submitApproveERC20Transaction({
              erc20Contract,
              spender: args.channelAddress as Address,
              amount: erc20AmountRequired * BigInt(20), // 20x the amount required for better UX on future mints
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

        // mint the token

        setStatus('txInProgress')

        const { txHash } =
          await transmissionsClient.submitSponsorTokenWithERC20Transaction(args)

        setTxHash(txHash)
        return decodeSponsorLogs(txHash)
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return {
    sponsorTokenWithERC20: async (
      args: SponsorTokenConfig,
      erc20Contract: Address,
      erc20AmountRequired: bigint,
    ) => {
      return (await isAtomicBatchSupported)
        ? sponsorTokenWithERC20_smartWallet(
            args,
            erc20Contract,
            erc20AmountRequired,
          )
        : sponsorTokenWithERC20_EoaTwoStep(
            args,
            erc20Contract,
            erc20AmountRequired,
          )
    },
    tokenId,
    status,
    txHash,
    error,
  }
}

export const useMintTokenBatchWithERC20 = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [status, setStatus] = useState<
    ContractExecutionStatus | 'erc20ApprovalInProgress'
  >()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const eip5792WalletClient = useMemo(() => {
    if (transmissionsClient._walletClient)
      return transmissionsClient._walletClient.extend(walletActionsEip5792())
  }, [transmissionsClient._walletClient])

  const isAtomicBatchSupported: Promise<boolean> = useMemo(async () => {
    try {
      if (!eip5792WalletClient) return false
      const capabilities = await eip5792WalletClient.getCapabilities()
      return (
        capabilities?.[transmissionsClient._chainId]?.atomicBatch?.supported ??
        false
      )
    } catch (e) {
      return false
    }
  }, [transmissionsClient, eip5792WalletClient])

  const verifyClientParameters = useCallback(() => {
    if (!transmissionsClient) throw new Error('Invalid transmissions client')
    if (!transmissionsClient._walletClient)
      throw new Error('Wallet client required')
    if (!transmissionsClient._publicClient)
      throw new Error('Public client required')
  }, [transmissionsClient])

  const fetchAllowance = useCallback(
    async (erc20Contract: Address, channelAddress: Address, user: Address) => {
      return transmissionsClient._publicClient!.readContract({
        address: erc20Contract,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [user, channelAddress as Address],
      })
    },
    [transmissionsClient],
  )

  const decodeMintLogs = async (txHash: Hash) => {
    const events = await transmissionsClient.getTransactionEvents({
      txHash,
      eventTopics: transmissionsClient.eventTopics.tokenMinted,
    })

    const event = events?.[0]

    // set txHash to the actual txHash of desired event
    if (event.transactionHash) setTxHash(event.transactionHash)

    const decodedLog = event
      ? decodeEventLog({
          abi: [...infiniteChannelAbi, ...finiteChannelAbi],
          data: event.data,
          // @ts-ignore
          topics: event.topics,
        })
      : undefined

    // @ts-ignore
    if (decodedLog?.eventName === 'TokenMinted') {
      setStatus('complete')
    }
  }

  const mintTokenBatchWithERC20_smartWallet = useCallback(
    async (
      args: MintTokenBatchConfig,
      erc20Contract: Address,
      erc20AmountRequired: bigint,
    ) => {
      verifyClientParameters()

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        // read the users current allowance for the token

        const allowance = await fetchAllowance(
          erc20Contract,
          args.channelAddress as Address,
          args.to as Address,
        )
        // if the allowance is less than the mint price, send an approval request

        if (allowance < erc20AmountRequired) {
          setStatus('txInProgress')

          const id = await eip5792WalletClient!.writeContracts({
            contracts: [
              {
                address: erc20Contract,
                abi: erc20Abi,
                functionName: 'approve',
                args: [
                  args.channelAddress as Address,
                  erc20AmountRequired * BigInt(20),
                ],
              },

              {
                address: args.channelAddress as Address,
                abi: [...infiniteChannelAbi, ...finiteChannelAbi],
                functionName: 'mintBatchWithERC20',
                args: [
                  args.to as Address,
                  args.tokenIds,
                  args.amounts.map((a) => BigInt(a)),
                  (args.mintReferral as Address) || zeroAddress,
                  args.data as Hex,
                ],
              },
            ],

            capabilities: {
              paymasterService: {
                url: transmissionsClient._paymasterConfig?.paymasterUrl ?? '',
              },
            },
          })

          setTxHash(id)
          decodeMintLogs(id as Hash)
        } else {
          // mint the token directly

          setStatus('txInProgress')

          const { txHash } =
            await transmissionsClient.submitMintTokenBatchWithERC20Transaction(
              args,
            )

          setTxHash(txHash)
          decodeMintLogs(txHash)
        }
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  const mintTokenBatchWithERC20_EoaTwoStep = useCallback(
    async (
      args: MintTokenBatchConfig,
      erc20Contract: Address,
      erc20AmountRequired: bigint,
    ) => {
      verifyClientParameters()

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        // read the users current allowance for the token

        const allowance = await fetchAllowance(
          erc20Contract,
          args.channelAddress as Address,
          args.to as Address,
        )

        // if the allowance is less than the mint price, send an approval request

        if (allowance < erc20AmountRequired) {
          setStatus('erc20ApprovalInProgress')
          const { txHash: hash } =
            await transmissionsClient.submitApproveERC20Transaction({
              erc20Contract,
              spender: args.channelAddress as Address,
              amount: erc20AmountRequired * BigInt(20), // 20x the amount required for better UX on future mints
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

        // mint the token

        setStatus('txInProgress')
        const { txHash } =
          await transmissionsClient.submitMintTokenBatchWithERC20Transaction(
            args,
          )

        setTxHash(txHash)
        decodeMintLogs(txHash)
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return {
    mintTokenBatchWithERC20: async (
      args: MintTokenBatchConfig,
      erc20Contract: Address,
      erc20AmountRequired: bigint,
    ) =>
      (await isAtomicBatchSupported)
        ? mintTokenBatchWithERC20_smartWallet(
            args,
            erc20Contract,
            erc20AmountRequired,
          )
        : mintTokenBatchWithERC20_EoaTwoStep(
            args,
            erc20Contract,
            erc20AmountRequired,
          ),
    status,
    txHash,
    error,
  }
}
