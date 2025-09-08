import path from 'node:path';
import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import plugins from './.build/plugins';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

// https://vite.dev/config/
export default defineConfig((cnf) => {
  const { mode } = cnf;
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_ENV } = env;
  
  const isElectron = mode === 'electron';
  
  return {
    base: mode === 'electron' ? './' : (VITE_APP_ENV === 'production' ? '/' : '/'),
    plugins: isElectron 
      ? [
          ...plugins(cnf),
          electron([
            {
              // Main-Process entry file of the Electron App.
              entry: 'electron/main.ts',
            },
            {
              entry: 'electron/preload.ts',
              onstart(options) {
                // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
                // instead of restarting the entire Electron App.
                options.reload();
              },
            },
          ]),
          renderer(),
        ]
      : plugins(cnf),
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
  };
});
