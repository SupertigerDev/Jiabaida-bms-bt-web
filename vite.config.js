import { defineConfig } from "vite";
import nested from 'postcss-nested';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        nested
      ]
    }
  }
});