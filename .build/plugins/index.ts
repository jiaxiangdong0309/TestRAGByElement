import type { ConfigEnv, PluginOption } from 'vite';
import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import envTyped from 'vite-plugin-env-typed';
import { codeInspectorPlugin } from '@neurora/code-inspector-plugin';
// import { viteSingleFile } from 'vite-plugin-singlefile'; // 移除单文件插件
import createSvgIcon from './svg-icon';

const root = path.resolve(__dirname, '../../');

function plugins({ mode, command }: ConfigEnv): PluginOption[] {
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

  // 只在开发模式下启用 code-inspector-plugin
  if (command === 'serve') {
    basePlugins.push(
      codeInspectorPlugin({
        // 指定 bundler 类型
        bundler: 'vite',
        // 禁用自动打开编辑器
        editor: null,
        // 快捷键配置
        hotKeys: ['ctrl-shift-c'],
        // 显示模式配置
        showSwitch: true,
        // 显示文件路径
        showPath: true,
        // 禁用自动打开
        autoOpen: false,
      })
    );
  }

  // 移除单文件插件，使用正常的分离文件构建
  // if (command === 'build') {
  //   basePlugins.push(viteSingleFile());
  // }

  return basePlugins;
}

export default plugins;
