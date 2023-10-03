import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

import path from 'path'

// https://vitejs.dev/config/
export default ({ mode }) => {
  console.log(
    'pre-extension FIREBASE_APP_ID',
    process.env.FIREBASE_APP_ID?.length
  )
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  console.log(
    'post-extension VITE_FIREBASE_APP_ID',
    process.env.VITE_FIREBASE_APP_ID?.length
  )
  console.log(
    'post-extension FIREBASE_APP_ID',
    process.env.FIREBASE_APP_ID?.length
  )

  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://0.0.0.0:3000',
          secure: false
        }
      }
    }
  })
}
