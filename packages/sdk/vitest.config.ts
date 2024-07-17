import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: 'packages/sdk/src/test/vitest/setup',
    },
})
