import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

/** Vercel often sets `Root Directory` = `frontend` — NEXT_PUBLIC_* must be exposed via envPrefix. */
export default defineConfig(({ mode }) => {
  const rootDir = path.resolve(__dirname, '..');
  const envRoot = loadEnv(mode, rootDir, '');
  const envLocal = loadEnv(mode, __dirname, '');
  const env = { ...envRoot, ...envLocal };

  const socketTarget =
    env.VITE_API_URL?.replace(/\/$/, '') ||
    env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';

  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/api': { target: socketTarget, changeOrigin: true },
        '/socket.io': { target: socketTarget, changeOrigin: true, ws: true },
      },
    },
  };
});
