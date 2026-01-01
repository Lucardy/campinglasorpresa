import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    define: {
      'process.env': env
    },
    server: {
      port: 5173,
      host: 'localhost',
      proxy: {
        '/api': {
          target: isProduction ? 'https://www.campinglasorpresa.com' : 'http://localhost/campinglasorpresa',
          changeOrigin: true,
          secure: isProduction
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction,
      // Forzar nombres únicos para evitar cache
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            const timestamp = Date.now()
            
            if (/\.(mp4|webm|ogg)$/.test(assetInfo.name)) {
              return `assets/videos/[name]-[hash]-${timestamp}.[ext]`
            }
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash]-${timestamp}.[ext]`
            }
            return `assets/[name]-[hash]-${timestamp}.[ext]`
          }
        }
      }
    },
    assetsInclude: ['**/*.mp4', '**/*.webm', '**/*.ogg'],
    // Deshabilitar cache de Vite
    clearScreen: false,
    cacheDir: null
  }
})
