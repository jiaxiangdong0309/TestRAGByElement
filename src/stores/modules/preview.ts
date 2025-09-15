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

export const usePreviewStore = defineStore('preview', () => {
  // 预览数据
  const previewData = ref<MessageItem | null>(null);

  // 设置预览数据
  const setPreviewData = (data: MessageItem) => {
    previewData.value = data;
  };

  // 清除预览数据
  const clearPreviewData = () => {
    previewData.value = null;
  };

  // 获取预览数据
  const getPreviewData = () => {
    return previewData.value;
  };

  return {
    previewData,
    setPreviewData,
    clearPreviewData,
    getPreviewData,
  };
});
