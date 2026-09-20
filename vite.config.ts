import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project-site path for sibainugameing/Ediput-editor.
  base: '/Ediput-editor/',
});
