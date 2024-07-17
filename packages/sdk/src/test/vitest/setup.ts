import { FORK_BLOCK_NUMBER, FORK_URL, pool, resetBlockchainState, testClient } from '../forkUtils'
import { fetchLogs } from '@viem/anvil'
import { afterEach, beforeEach } from 'vitest'

beforeEach(async () => {
    await resetBlockchainState();
})
