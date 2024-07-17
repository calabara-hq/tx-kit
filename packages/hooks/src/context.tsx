import React, { createContext, useState, useMemo } from 'react'
import { TransmissionsClient, TransmissionsClientConfig } from '@tx-kit/sdk'

export type TxReactSdkContext = {
  transmissionsClient: TransmissionsClient
  initClient: (config: TransmissionsClientConfig) => void
}

export const TransmissionsContext = createContext<
  TxReactSdkContext | undefined
>(undefined)

interface Props {
  config?: TransmissionsClientConfig
  children: React.ReactNode
}

export const TransmissionsProvider: React.FC<Props> = ({
  config = { chainId: 84532 },
  children,
}) => {
  const [transmissionsClient, setTransmissionsClient] =
    useState<TransmissionsClient>(() => new TransmissionsClient(config))
  const initClient = (config: TransmissionsClientConfig) => {
    setTransmissionsClient(new TransmissionsClient(config))
  }

  const contextValue = useMemo(
    () => ({ transmissionsClient, initClient }),
    [transmissionsClient],
  )

  return (
    <TransmissionsContext.Provider value={contextValue}>
      {children}
    </TransmissionsContext.Provider>
  )
}
