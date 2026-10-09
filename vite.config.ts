import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:3000', '/health': 'http://127.0.0.1:3000' },
  },
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: { entryFileNames: isSsrBuild ? '[name].mjs' : 'assets/[name]-[hash].mjs' },
    },
  },
}));
