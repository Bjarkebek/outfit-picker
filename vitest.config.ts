import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['app/tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['app/tests/e2e/**', '**/*.e2e.*'],
    environment: 'jsdom',
    setupFiles: ['app/tests/setupTests.ts'],
    css: false,
    coverage: { reporter: ['text', 'lcov'] }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname)
    }
  }
});
