// 引入ElementPlus所有图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createApp } from 'vue';
import ElementPlusX from 'vue-element-plus-x';
import App from './App.vue';
import router from './routers';
import store from './stores';
import './styles/index.scss';
import 'virtual:uno.css';
import 'element-plus/dist/index.css';
// SVG插件配置
import 'virtual:svg-icons-register';

const app = createApp(App);

// 开发模式下启用 Vue DevTools
if (import.meta.env.DEV) {
  // 在开发模式下，Vue 会自动启用 DevTools 支持
  // 确保组件名正确显示
  app.config.compilerOptions.isCustomElement = () => false;

  // 为组件添加调试信息
  app.config.performance = true;

  // 全局错误处理，便于调试
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err);
    console.error('Component instance:', instance);
    console.error('Error info:', info);
  };
}

app.use(router);
app.use(ElMessage);
app.use(ElMessageBox);
app.use(ElementPlusX);
// 注册ElementPlus所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(store);

app.mount('#app');
