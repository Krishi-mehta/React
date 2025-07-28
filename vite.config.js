import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import workerImport from 'vite-plugin-worker-import';

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.worker.min.js'],
  },
  plugins: [react(),
    tailwindcss(),
  ],
})
