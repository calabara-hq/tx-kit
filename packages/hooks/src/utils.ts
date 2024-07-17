import { TransmissionsClient } from '@tx-kit/sdk'
import { TxReactSdkContext } from './context'

export const getTransmissionsClient = (
  context: TxReactSdkContext | undefined,
): TransmissionsClient => {
  if (context === undefined) {
    throw new Error('Make sure to include <TransmissionsProvider>')
  }
  if (context.transmissionsClient === undefined) {
    throw new Error(
      'Make sure to initialize your config with useTransmissionsClient',
    )
  }

  return context.transmissionsClient
}
