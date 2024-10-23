import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Increase chunk size limit for tldraw
    chunkSizeWarningLimit: 2000,
    // Split chunks more aggressively
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@tldraw')) {
            return 'tldraw-vendor'
          }
          // Group react and related packages
          if (id.includes('react')) {
            return 'react-vendor'
          }
        }
      }
    }
  }
})