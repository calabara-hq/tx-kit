import { resetBlockchainState } from '../forkUtils.js'
import { beforeEach } from 'vitest'

beforeEach(async () => {
    await resetBlockchainState();
})
