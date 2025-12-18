import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Убеждаемся что CSS правильно обрабатывается
    cssCodeSplit: false,
  },
})
