import { TransmissionsClient, TransmissionsClientConfig } from '@tx-kit/sdk'
import { useContext, useEffect } from 'react'
import { TransmissionsContext } from './context'

export const useTransmissionsClient = (
  config?: TransmissionsClientConfig,
): TransmissionsClient => {
  const context = useContext(TransmissionsContext)
  if (context === undefined) {
    throw new Error('Make sure to include <TransmissionsProvider>')
  }

  const chainId =
    config && 'chainId' in config
      ? config.chainId
      : context.transmissionsClient._chainId
  const publicClient =
    config && 'publicClient' in config
      ? config.publicClient
      : context.transmissionsClient._publicClient
  const walletClient =
    config && 'walletClient' in config
      ? config.walletClient
      : context.transmissionsClient._walletClient
  const includeEnsNames =
    config && 'includeEnsNames' in config
      ? config.includeEnsNames
      : context.transmissionsClient._includeEnsNames
  const ensPublicClient =
    config && 'ensPublicClient' in config
      ? config.ensPublicClient
      : context.transmissionsClient._ensPublicClient
  const paymasterConfig =
    config && 'paymasterConfig' in config
      ? config.paymasterConfig
      : context.transmissionsClient._paymasterConfig

  useEffect(() => {
    context.initClient({
      chainId: chainId!,
      publicClient,
      walletClient,
      includeEnsNames,
      ensPublicClient,
      paymasterConfig,
    })
  }, [
    chainId,
    publicClient,
    walletClient,
    includeEnsNames,
    ensPublicClient,
    paymasterConfig,
  ])

  return context.transmissionsClient as TransmissionsClient
}
