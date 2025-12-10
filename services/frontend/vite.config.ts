import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

const isDev = process.env.NODE_ENV !== 'production'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins: PluginOption[] = [
    vue({
      template: { transformAssetUrls },
    }),
    vueJsx(),
    quasar({
      sassVariables: '@/assets/styles/quasar-variables.scss',
    }),
  ]

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
