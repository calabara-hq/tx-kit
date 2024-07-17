import { useCallback, useContext, useState } from 'react'
import { ContractExecutionStatus, RequestError } from './types'
import { MulticallConfig } from '@tx-kit/sdk'
import { TransmissionsContext } from './context'
import { getTransmissionsClient } from './utils'

export const useMulticall = () => {
  const context = useContext(TransmissionsContext)
  const transmissionsClient = getTransmissionsClient(context).uplinkClient

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const multicall = useCallback(
    async (args: MulticallConfig) => {
      if (!transmissionsClient) throw new Error('Invalid transmissions client')
      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { txHash: hash } =
          await transmissionsClient.submitMulticallTransaction(args)
        setStatus('txInProgress')
        setTxHash(hash)

        const events = await transmissionsClient.getTransactionEvents({
          txHash: hash,
          eventTopics: [],
          includeAll: true,
        })

        setStatus('complete')
        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [transmissionsClient],
  )

  return { multicall, status, txHash, error }
}
