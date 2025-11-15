import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

const isDev = process.env.NODE_ENV !== 'production'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins: PluginOption[] = [vue(), vueJsx()]

  if (isDev) {
    const { default: VueDevTools } = await import('vite-plugin-vue-devtools')
    plugins.push(VueDevTools())
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/abstracts" as *;`,
        },
      },
    },
  }
})
