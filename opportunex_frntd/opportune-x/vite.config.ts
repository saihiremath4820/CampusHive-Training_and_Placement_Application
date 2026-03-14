import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
// cacheDir moved outside OneDrive to avoid EPERM errors on Windows caused by OneDrive sync locking .vite/deps
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  cacheDir: 'C:/Temp/vite-cache/opportune-x',
})