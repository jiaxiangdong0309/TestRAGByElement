import type { HookFetchPlugin } from 'hook-fetch';
import { ElMessage } from 'element-plus';
import hookFetch from 'hook-fetch';
import { sseTextDecoderPlugin } from 'hook-fetch/plugins';
import router from '@/routers';
import { useUserStore } from '@/stores';
import { API_URL } from '@/config/localConfig';

interface BaseResponse {
  code: number;
  data: never;
  msg: string;
  rows: never;
}

// 根据环境选择baseURL
const getBaseURL = () => {
  // 开发环境使用代理，生产环境使用直接URL
  if (import.meta.env.DEV) {
    return '/api'; // 使用vite代理
  }
  return API_URL; // 生产环境直接使用API_URL
};

export const request = hookFetch.create<BaseResponse, 'data' | 'rows'>({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  plugins: [sseTextDecoderPlugin({ json: true, prefix: 'data:' })],
});

function jwtPlugin(): HookFetchPlugin<BaseResponse> {
  return {
    name: 'jwt',
    beforeRequest: async (config) => {
      const userStore = useUserStore();
      config.headers = new Headers(config.headers);
      config.headers.set('authorization', `Bearer ${userStore.token}`);
      return config;
    },
    afterResponse: async (response) => {
      // console.log(response);
      if (response.result?.code === 200) {
        return response;
      }
      // 处理403逻辑
      if (response.result?.code === 403) {
        // 跳转到403页面（确保路由已配置）
        router.replace({
          name: '403',
        });
        ElMessage.error(response.result?.msg);
        return Promise.reject(response);
      }
      // 处理401逻辑
      if (response.result?.code === 401) {
        // 如果没有权限，退出，且弹框提示登录
        const userStore = useUserStore();
        userStore.logout();
        userStore.openLoginDialog();
      }
      ElMessage.error(response.result?.msg);
      return Promise.reject(response);
    },
  };
}

request.use(jwtPlugin());

export const post = request.post;

export const get = request.get;

export const put = request.put;

export const del = request.delete;

export default request;
