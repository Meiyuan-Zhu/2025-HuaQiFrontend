import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'

// Element UI 自动导入支持
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '')
    const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:6020'

    return {
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        })],
    server: {
        port: 5570,   //设定前端运行的端口
        open: true,
        proxy: {
            '/api': {
                target: apiBaseUrl,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    base: './'
    }
})
