import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import path from 'path';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

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
  });
};
