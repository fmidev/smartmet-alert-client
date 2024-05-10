import { defineConfig } from 'vite';
export default defineConfig({
    test: {
      includeSource: ['test/snapshot.test.ts']
    },
});
