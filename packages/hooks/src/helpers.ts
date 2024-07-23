import { decodeEventLog, erc20Abi } from 'viem'
import { useCallback, useContext, useState } from 'react'
import { ContractExecutionStatus, RequestError } from './types'
import { ApproveERC20Config } from '@tx-kit/sdk'

import { TransmissionsContext } from './context'
import { getTransmissionsClient } from './utils'

export const useApproveERC20 = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const approveERC20 = useCallback(
    async (args: ApproveERC20Config) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitApproveERC20Transaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: transmissionsClient.eventTopics.tokenCreated,
        })

        const event = events?.[0]
        const decodedLog = event
          ? decodeEventLog({
              abi: erc20Abi,
              data: event.data,
              topics: event.topics,
            })
          : undefined

        if (decodedLog?.eventName === 'Approval') {
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

  return { approveERC20, status, txHash, error }
}
