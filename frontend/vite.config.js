import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const analyze = process.env.ANALYZE === 'true';

/** Route-aware vendor splits — keeps homepage initial JS small and cacheable. */
function manualChunks(id) {
  if (!id.includes('node_modules')) return;
  if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
    return 'vendor-react';
  }
  if (id.includes('react-router')) return 'vendor-router';
  if (id.includes('@reduxjs/toolkit') || id.includes('/redux/') || id.includes('react-redux')) {
    return 'vendor-redux';
  }
  if (id.includes('axios')) return 'vendor-http';
  if (id.includes('react-helmet-async')) return 'vendor-helmet';
  if (id.includes('lucide-react')) return 'vendor-icons';
  if (id.includes('react-hot-toast')) return 'vendor-toast';
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [],
      },
    }),
    analyze &&
      visualizer({
        filename: 'dist/bundle-stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
  ].filter(Boolean),
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
  build: {
    target: ['es2020', 'safari13'],
    sourcemap: false,
    modulePreload: { polyfill: false },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks,
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
