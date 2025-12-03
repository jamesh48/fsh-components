import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Library build configuration
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(dirname, 'src/index.ts'),
      name: 'FshComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: (id) => {
        return (
          id === 'react' ||
          id === 'react-dom' ||
          id === 'react/jsx-runtime' ||
          id === 'react-if' ||
          id.startsWith('@mui/') ||
          id.startsWith('@emotion/') ||
          id.startsWith('@tanstack/')
        );
      },
      output: {
        // Global vars to use in UMD build for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
          '@mui/material': 'MaterialUI',
          '@emotion/react': 'emotionReact',
          '@emotion/styled': 'emotionStyled',
        },
      },
    },
    sourcemap: true,
    // Don't empty outDir - types are built first
    emptyOutDir: false,
    outDir: 'dist',
  },
});
