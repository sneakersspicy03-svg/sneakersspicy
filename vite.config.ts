import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Al usar './' los assets se cargan de forma relativa al index.html, 
  // solucionando el error 404 en GitHub Pages sin importar el nombre del repo.
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
  },
  define: {
    // Permite que el código acceda a process.env.API_KEY como requiere el SDK de Gemini
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});