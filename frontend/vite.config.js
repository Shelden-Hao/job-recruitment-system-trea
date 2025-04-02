import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vite.dev/config/
export default defineConfig({
  plugins: [uni()],
})
