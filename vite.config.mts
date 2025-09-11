import path from 'node:path';
import { defineConfig } from 'vite';
import plugins from './.build/plugins';

// https://vite.dev/config/
export default defineConfig((cnf) => {
  return {
    base: '/xiaoshitou/',
    plugins: plugins(cnf),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      global: 'globalThis',
    },
    css: {
      // css全局变量使用，@/styles/variable.scss文件
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/var.scss" as *;',
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://dify-contest.hewa.cn/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          // 优化代码分割
          manualChunks: {
            // 将Vue相关库分离
            vue: ['vue', 'vue-router', 'pinia'],
            // 将Element Plus分离
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            // 将工具库分离
            utils: ['@vueuse/core', '@vueuse/integrations', 'radash'],
            // 将其他第三方库分离
            vendor: ['nprogress', 'qrcode', 'hook-fetch'],
          },
          // 设置chunk文件名格式
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) {
              return `assets/[name]-[hash].[ext]`;
            }
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(css)$/.test(assetInfo.name)) {
              return `css/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg)$/.test(assetInfo.name)) {
              return `images/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
      },
      target: 'es2015',
      minify: 'terser',
      // 启用CSS代码分割
      cssCodeSplit: true,
      // 设置chunk大小警告限制
      chunkSizeWarningLimit: 1000,
    },
  };
});
