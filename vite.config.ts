import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';

export default defineConfig(({ mode }: { mode: string }): UserConfig => {
  const isProduction: boolean = mode === 'production';

  return {
    base: './',
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction,
      target: 'es2022',
    },
  };
});
