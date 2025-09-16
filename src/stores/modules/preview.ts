import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { BubbleProps } from 'vue-element-plus-x/types/Bubble';
import type { ThinkingStatus } from 'vue-element-plus-x/types/Thinking';

export type MessageItem = BubbleProps & {
  key: string;
  role: 'ai' | 'user' | 'system';
  avatar: string;
  thinkingStatus?: ThinkingStatus;
  thinlCollapse?: boolean;
  reasoning_content?: string;
};

// 新的接口响应格式
export interface DifyResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: {
      text: string;
    };
    error: any;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

export const usePreviewStore = defineStore('preview', () => {
  // 预览数据
  const previewData = ref<MessageItem | null>(null);
  
  // API响应数据
  const difyResponse = ref<DifyResponse | null>(null);

  // 设置预览数据
  const setPreviewData = (data: MessageItem) => {
    previewData.value = data;
  };

  // 设置API响应数据
  const setDifyResponse = (data: DifyResponse) => {
    difyResponse.value = data;
  };

  // 清除预览数据
  const clearPreviewData = () => {
    previewData.value = null;
    difyResponse.value = null;
  };

  // 获取预览数据
  const getPreviewData = () => {
    return previewData.value;
  };

  // 获取API响应数据
  const getDifyResponse = () => {
    return difyResponse.value;
  };

  // 获取保存的workflow_run_id和task_id
  const getSavedIds = () => {
    if (difyResponse.value) {
      return {
        workflow_run_id: difyResponse.value.workflow_run_id,
        task_id: difyResponse.value.task_id
      };
    }
    return null;
  };

  return {
    previewData,
    difyResponse,
    setPreviewData,
    setDifyResponse,
    clearPreviewData,
    getPreviewData,
    getDifyResponse,
    getSavedIds,
  };
});
