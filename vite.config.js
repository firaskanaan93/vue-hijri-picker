import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/components/DatePicker.vue', import.meta.url)),
      name: 'VueHijriPicker',
      fileName: (format) => `vue-hijri-picker.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'moment', 'moment-hijri', 'date-fns'],
      output: {
        globals: {
          vue: 'Vue',
          moment: 'moment',
          'moment-hijri': 'momentHijri',
          'date-fns': 'dateFns',
        },
      },
    },
  },
})
