import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/app/services/**/*.ts'],
      exclude: ['src/app/services/**/*.spec.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
      },
    },
  },
});
