import type { ConfigEnv, PluginOption } from 'vite';
import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import envTyped from 'vite-plugin-env-typed';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import createSvgIcon from './svg-icon';

const root = path.resolve(__dirname, '../../');

function plugins({ mode, command }: ConfigEnv): PluginOption[] {
  const isElectron = mode === 'electron';

  const basePlugins: PluginOption[] = [
    UnoCSS(),
    envTyped({
      mode,
      envDir: root,
      envPrefix: 'VITE_',
      filePath: path.join(root, 'types', 'import_meta.d.ts'),
    }),
    vue({
      // 启用 Vue DevTools 支持
      template: {
        compilerOptions: {
          // 开发模式下启用组件名显示
          isCustomElement: () => false,
        },
      },
    }),
    AutoImport({
      imports: ['vue'],
      eslintrc: {
        enabled: true,
      },
      resolvers: [ElementPlusResolver()],
      dts: path.join(root, 'types', 'auto-imports.d.ts'),
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: path.join(root, 'types', 'components.d.ts'),
    }),
    createSvgIcon(command === 'build'),
  ];

  // 如果是 Electron 模式，添加 Electron 相关插件
  if (isElectron) {
    basePlugins.push(
      electron([
        {
          // 主进程入口文件
          entry: 'electron/main.ts',
          onstart(options) {
            // 通知渲染进程重新加载页面
            options.reload();
          },
        },
        {
          // 预加载脚本入口文件
          entry: 'electron/preload.ts',
        },
      ]),
      renderer()
    );
  }

  return basePlugins;
}

export default plugins;
