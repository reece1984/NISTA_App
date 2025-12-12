import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/webhook': {
        target: 'https://n8n-reeceai-u56804.vm.elestio.app',
        changeOrigin: true,
        secure: false,
      },
      '/webhook-test': {
        target: 'https://n8n-reeceai-u56804.vm.elestio.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
