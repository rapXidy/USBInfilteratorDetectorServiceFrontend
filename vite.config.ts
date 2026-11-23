import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite config: React plugin + "@/" alias pointing at src/.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // The API CORS policy allows http://localhost:5173 — keep this port fixed.
    port: 5173,
    strictPort: true,
  },
})


