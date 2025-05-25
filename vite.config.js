import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@framework': path.resolve(__dirname, 'live2d/framework/src')
    }
  }
});
