import { defineConfig } from "vite";
import nested from 'postcss-nested';

export default defineConfig({
  build: {
    sourcemap: true,
  },
  css: {
    postcss: {
      plugins: [
        nested
      ]
    }
  }
});