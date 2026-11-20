import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue({ features: { vapor: true } })],
  resolve: { dedupe: ['vue'] },
  build: {
    lib: {
      entry: 'lib-entry.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    rolldownOptions: {
      external: (id) => id === 'vue' || id.startsWith('vue/') || id.startsWith('@vue/'),
    },
  },
})
