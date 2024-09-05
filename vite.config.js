// vite.config.js

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'VueHijriPicker',
      fileName: (format) => `vue-hijri-picker.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn’t be bundled
      external: ['vue', 'moment-hijri', 'date-fns'],
      output: {
        globals: {
          vue: 'Vue',
          'moment-hijri': 'moment',
          'date-fns': 'dateFns'
        }
      }
    }
  }
});
