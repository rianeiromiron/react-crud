import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // En desarrollo, Vite reenvía /api a la API en Go (igual que hará NGINX en Docker).
    proxy: { '/api': 'http://localhost:8082' },
  },
  test: {
    environment: 'jsdom', // navegador simulado en memoria
    setupFiles: './src/test/setup.ts',
  },
})
