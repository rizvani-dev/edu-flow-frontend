import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'



export default defineConfig({
plugins: [
  react(),
  compression(),
   visualizer({
    open: true
  }),
],
  
 build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {

          if (id.includes('node_modules')) {

            if (id.includes('react')) {
              return 'react-vendor'
            }

            if (id.includes('recharts')) {
              return 'charts'
            }

            if (id.includes('socket.io-client')) {
              return 'socket'
            }

            if (
              id.includes('react-icons') ||
              id.includes('react-toastify')
            ) {
              return 'ui'
            }

            return 'vendor'
          }
        }
      }
    }
  }
})