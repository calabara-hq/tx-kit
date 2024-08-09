import { resetBlockchainState } from '../forkUtils'
import { beforeEach } from 'vitest'

beforeEach(async () => {
    await resetBlockchainState();
})
