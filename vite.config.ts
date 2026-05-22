import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:8080',
      '/actuator': 'http://localhost:8080'
    }
  },
  preview: {
    port: 4173,
    strictPort: true
  },
  build: {
    sourcemap: false,
    target: 'es2022',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
});
