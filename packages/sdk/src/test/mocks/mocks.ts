import { vitest } from 'vitest'
export const uplinkActions = {
    createInfiniteChannel: vitest.fn(),
    createFiniteChannel: vitest.fn(),
    updateChannelFees: vitest.fn(),
    updateChannelLogic: vitest.fn(),
    updateInfiniteChannelTransportLayer: vitest.fn(),
    createToken: vitest.fn(),
    sponsorWithETH: vitest.fn()

}

export const downlinkActions = {
    //
}