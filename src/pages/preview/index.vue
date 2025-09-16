<!-- 网页预览页面 -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { usePreviewStore } from '@/stores/modules/preview';
import { send_message_stream_preview } from '@/api/dify';
import { useHookFetch } from 'hook-fetch/vue';
import { Sender } from 'vue-element-plus-x';
import { Document, Loading } from '@element-plus/icons-vue';
import type { PreviewRequest } from '@/api/dify/types';


const previewStore = usePreviewStore();
const route = useRoute();

// 使用computed获取预览数据
const previewData = computed(() => previewStore.getPreviewData());

// 输入框相关
const inputValue = ref('');
const inputLoading = ref(false);

// 加载状态
const isLoading = ref(false);

// 当前预览ID
let currentPreviewId: string | null = null;

// 流式响应相关
const generatedContent = ref('');
const isLoadingContent = ref(false);

// 瀑布流弹窗相关
const showMatrixOverlay = ref(false);
const matrixText = ref('');
const isFirstRequest = ref(true);
const hasContent = ref(false);

// 瀑布流自动滚动
const matrixRainRef = ref<HTMLElement | null>(null);

// 滚动到底部
const scrollToBottom = () => {
  if (matrixRainRef.value) {
    matrixRainRef.value.scrollTop = matrixRainRef.value.scrollHeight;
  }
};

// 监听matrixText变化，自动滚动
watch(matrixText, () => {
  nextTick(() => {
    scrollToBottom();
  });
});
const { stream } = useHookFetch({
  request: send_message_stream_preview,
  onError: (err: any) => {
    console.error('流式请求错误:', err);
    ElMessage.error('流式请求失败');
  },
});

// 调用预览接口的函数
const callPreviewApi = async (userInput?: string) => {
  if (!previewData.value) {
    ElMessage.warning('没有预览数据可以发送');
    return;
  }

  try {
    console.log('🚀 [开始调用预览接口]', {
      previewData: previewData.value,
      userInput,
      timestamp: new Date().toISOString()
    });

    isLoading.value = true;

    // 清空瀑布流文本并显示弹窗
    matrixText.value = '';
    showMatrixOverlay.value = true;

    isLoadingContent.value = true;

    // 判断是首次请求还是用户修改请求
    let sourceContent: string;
    let updateContext: string;
    let isUpdate: number;

    if (isFirstRequest.value) {
      // 首次请求：源数据转HTML
      sourceContent = previewData.value.content || '';
      updateContext = '';
      isUpdate = 0;
      console.log('🔍 [首次请求]', {
        previewDataContent: previewData.value.content,
        sourceContent,
        updateContext
      });
    } else {
      // 用户修改请求：基于瀑布流内容进行修改
      sourceContent = generatedContent.value;
      updateContext = userInput || '';
      isUpdate = 1;
      console.log('🔍 [用户修改请求]', { userInput, updateContext });
    }

    // 构建 API 请求数据
    const requestData: PreviewRequest = {
      inputs: {
        sourceContent,
        updateContext,
        isUpdate
      },
      sourceContent,
      updateContext,
      isUpdate,
      user: 'preview_user'
    };

    console.log('📤 [发送预览请求]', {
      requestData,
      fullRequest: JSON.stringify(requestData, null, 2),
      timestamp: new Date().toISOString()
    });

    console.log('🔄 [开始流式请求]');

    // 开始流式请求
    let chunkCount = 0;
    for await (const chunk of stream(requestData)) {
      chunkCount++;
      console.log(`📦 [接收到第${chunkCount}个数据块]`,
      (chunk.result as any)?.data?.text  || '');

      handleStreamChunk(chunk.result as any);
    }

    console.log('✅ [流式请求完成]', {
      totalChunks: chunkCount,
      contentLength: generatedContent.value.length
    });

    ElMessage.success('预览接口调用成功');
  } catch (error: any) {
    console.error('❌ [调用预览接口失败]', {
      error,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });

    ElMessage.error('调用预览接口失败');
  } finally {
    console.log('🏁 [请求结束]', {
      isLoading: isLoading.value,
      finalState: {
        content: generatedContent.value.substring(0, 100) + (generatedContent.value.length > 100 ? '...' : ''),
        loading: isLoadingContent.value
      }
    });

    isLoading.value = false;
    isLoadingContent.value = false;

    // 隐藏瀑布流弹窗
    setTimeout(() => {
      showMatrixOverlay.value = false;
      matrixText.value = '';

      // 标记已有内容
      if (generatedContent.value) {
        hasContent.value = true;
      }
    }, 1000); // 延迟1秒隐藏，让用户看到完整效果

    // 不再是首次请求
    isFirstRequest.value = false;
  }
};

// 处理流式数据块
function handleStreamChunk(chunk: any) {
  try {
    const event = chunk.event;

    const chunkText = chunk.data?.text || chunk.answer || '';
    if (chunkText) {
      // 添加到瀑布流文本
      matrixText.value += chunkText;
    }

    // 只在瀑布流完成时处理最终内容，中间过程不处理 generatedContent
    if (event === 'workflow_started') {
      // 工作流开始
      console.log('🚀 [工作流开始]', chunk.data);
    } else if (event === 'workflow_finished') {
      // 工作流完成
      console.log('✅ [工作流完成]', chunk.data);

      // 工作流完成时，将瀑布流内容赋值给 generatedContent
      generatedContent.value = matrixText.value;
      isLoadingContent.value = false;
      console.log('workflow_finished最终内容:', generatedContent.value);

      // 更新store中的响应数据 - 修复数据路径
      if (chunk.data) {
        console.log('💾 [保存到store]', {
          workflow_run_id: chunk.data.workflow_run_id,
          task_id: chunk.data.task_id,
          outputs: chunk.data.outputs,
          fullData: chunk.data
        });

        previewStore.setDifyResponse({
          workflow_run_id: chunk.data.workflow_run_id || '',
          task_id: chunk.data.task_id || '',
          data: {
            id: chunk.data.id || '',
            workflow_id: chunk.data.workflow_id || '',
            status: chunk.data.status || 'finished',
            outputs: {
              text: chunk.data.text || ''
            },
            error: null,
            elapsed_time: chunk.data.elapsed_time || 0,
            total_tokens: chunk.data.total_tokens || 0,
            total_steps: chunk.data.total_steps || 0,
            created_at: chunk.data.created_at || 0,
            finished_at: chunk.data.finished_at || 0
          }
        });
      }
    } else if (event === 'error') {
      // 处理错误事件
      console.error('❌ [工作流错误]', chunk.data);
      ElMessage.error('工作流执行失败');

      // 重置状态并显示错误信息
      generatedContent.value = '生成失败，请重试';
      isLoadingContent.value = false;
    } else {
      // 处理其他未知事件
      console.log('❓ [未知事件]', {
        event,
        chunk
      });
    }

  } catch (error: any) {
    console.error('❌ [处理流式数据块失败]', {
      error,
      chunk,
      stack: error?.stack
    });
  }
}

// 清理过期的预览数据
function cleanupExpiredPreviewData() {
  try {
    const now = Date.now();
    const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24小时过期

    // 遍历所有localStorage键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('preview_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          if (data.timestamp && now - data.timestamp > EXPIRY_TIME) {
            localStorage.removeItem(key);
            console.log('清理过期的预览数据:', key);
          }
        } catch {
          // 如果解析失败，也删除
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('清理过期数据失败:', error);
  }
}

// 页面关闭时清理当前预览数据
function cleanupCurrentPreviewData() {
  if (currentPreviewId) {
    try {
      localStorage.removeItem(currentPreviewId);
      console.log('页面关闭，清理预览数据:', currentPreviewId);
    } catch (error) {
      console.error('清理预览数据失败:', error);
    }
  }
}

// 输入框提交处理
const handleInputSubmit = async (value: string) => {
  if (!value.trim()) {
    ElMessage.warning('请输入内容');
    return;
  }

  try {
    inputLoading.value = true;

    // 更新预览数据到store
    previewStore.setPreviewData({
      content: value.trim(),
      role: 'user',
      avatar: '',
      key: `preview_${Date.now()}`,
    });

    // 调用预览接口，传递用户输入作为修改要求
    await callPreviewApi(value.trim());

    // 清空输入框
    inputValue.value = '';
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交失败');
  } finally {
    inputLoading.value = false;
  }
};

onMounted(async () => {
  // 清理过期数据
  cleanupExpiredPreviewData();

  // 从URL参数中获取预览ID
  const previewId = route.query.id as string;
  if (previewId) {
    try {
      const storedData = localStorage.getItem(previewId);
      if (storedData) {
        const previewData = JSON.parse(storedData);
        console.log('从localStorage获取的预览数据:', previewData);

        // 保存当前预览ID，用于页面关闭时清理
        currentPreviewId = previewId;

        // 将数据设置到store中
        previewStore.setPreviewData({
          content: previewData.content,
          role: 'ai',
          avatar: '',
          key: previewId,
        });

        // 自动调用预览接口
        // await callPreviewApi();
      } else {
        console.warn('未找到对应的预览数据，可能已过期');
        ElMessage.warning('预览数据已过期，请重新生成');
      }
    } catch (error) {
      console.error('解析预览数据失败:', error);
      ElMessage.error('数据解析失败');
    }
  } else if (previewData.value) {
    console.log('预览页面接收到的数据:', previewData.value);
    // 如果已经有预览数据，也自动调用预览接口
    // await callPreviewApi();
  } else {
    console.warn('未找到预览数据，可能是直接访问了预览页面');
    // 显示提示，让用户输入内容
    ElMessage.info('请输入需要生成网页的内容');
  }
});

onUnmounted(() => {
  // 页面卸载时清理当前预览数据
  cleanupCurrentPreviewData();
});

const resetIsFirstRequest = () => {
  isFirstRequest.value = true;
  callPreviewApi()
}

// 监听页面关闭事件
window.addEventListener('beforeunload', cleanupCurrentPreviewData);
</script>

<template>
  <div class="preview-container">
    <!-- 上方预览窗口 -->
    <div class="preview-iframe-container">
      <div class="preview-header">
        <h1>网页预览</h1>
        <div class="preview-actions">
          <el-button
            type="primary"
            :loading="isLoading"
            :disabled="!previewData"
              @click="resetIsFirstRequest"
          >
            {{ isLoading ? '调用中...' : '调用预览接口' }}
          </el-button>
        </div>
      </div>

      <div class="iframe-wrapper">
        <!-- Element Plus 弹窗组件实现瀑布流效果 -->
        <el-dialog
          v-model="showMatrixOverlay"
          :close-on-click-modal="false"
          :close-on-press-escape="false"
          :show-close="false"
          class="matrix-dialog"
        >
          <div
            ref="matrixRainRef"
            class="matrix-rain"
          >
            <span
              v-for="(char, index) in matrixText"
              :key="index"
              class="matrix-char"
            >
              {{ char }}
            </span>
          </div>
        </el-dialog>

        <!-- iframe 内容区域 - 只在有内容且不显示瀑布流时显示 -->
        <div v-if="generatedContent && !showMatrixOverlay" class="ai-content-wrapper">
          <iframe
            :srcdoc="generatedContent"
            class="html-content-frame"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          ></iframe>
        </div>

        <!-- 占位符内容 - 没有内容且不在加载中时显示 -->
        <div v-else-if="!hasContent && !showMatrixOverlay && !isLoadingContent" class="placeholder-content">
          <div class="empty-state">
            <el-icon size="48"><Document /></el-icon>
            <p>输入内容并点击生成按钮开始预览</p>
          </div>
        </div>

        <!-- 加载状态 - 只在没有内容且首次请求时显示 -->
        <div v-else-if="!hasContent && !showMatrixOverlay && isLoadingContent && isFirstRequest" class="loading-container">
          <div class="loading-indicator">
            <el-icon class="is-loading"><Loading /></el-icon>
            正在生成网页内容...
          </div>
        </div>
      </div>
    </div>

    <!-- 下方输入框 -->
    <div class="preview-input-container">
      <Sender
        v-model="inputValue"
        class="preview-sender"
        :auto-size="{
          maxRows: 6,
          minRows: 2,
        }"
        variant="updown"
        clearable
        :loading="inputLoading"
        @submit="handleInputSubmit"
      >

      </Sender>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // 上方预览窗口
  .preview-iframe-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;

      h1 {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }

      .preview-actions {
        margin-left: auto;
      }
    }

    .iframe-wrapper {
      flex: 1;
      position: relative;
      overflow: hidden;

      // Element Plus 弹窗样式定制
      :deep(.el-dialog){
        background: #000;
      }
      :deep(.matrix-dialog) {
        height: 300px;
        width: 600px;
        .el-dialog__header {
          background: #000;
          height: 0px;
          padding: 0px !important;
        }

        .matrix-rain {
          max-height: 260px;
          overflow-y: auto;
          font-size: 12px;
          line-height: 1.4;
          letter-spacing: 1px;
          white-space: pre-wrap;
          word-break: break-all;
          box-sizing: border-box;
          font-family: 'Courier New', monospace;
          color: #00ff00;

          .matrix-char {
            display: inline;
            color: #00ff00;

            &:nth-child(odd) {
              color: #00cc00;
            }

            &:nth-child(even) {
              color: #00ff00;
            }
          }
        }
      }

      .ai-content-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .loading-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafbfc;

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          color: #3b82f6;
          font-size: 14px;

          .el-icon {
            font-size: 16px;
          }
        }
      }

      .loading-indicator {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        color: #3b82f6;
        font-size: 14px;

        .el-icon {
          font-size: 16px;
        }
      }

      .html-content-frame {
        width: 100%;
        height: 100%;
        border: none;
        background: #fff;
      }

      .placeholder-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: #fafbfc;

        .empty-state {
          text-align: center;
          color: #6b7280;

          .el-icon {
            margin-bottom: 12px;
            color: #d1d5db;
          }

          p {
            margin: 0;
            font-size: 14px;
          }
        }
      }
    }
  }

  // 下方输入框
  .preview-input-container {
    background: #fff;
    border-top: 1px solid #e5e7eb;
    padding: 16px 24px;

    .preview-sender {
      width: 100%;
      margin: 0;

      .input-hint {
        color: #9ca3af;
        font-size: 14px;
        white-space: nowrap;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .preview-container {
    .preview-iframe-container {
      .preview-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;

        .preview-actions {
          margin-left: 0;
          width: 100%;

          .el-button {
            width: 100%;
          }
        }
      }
    }

    .preview-input-container {
      padding: 12px 16px;
    }
  }
}

// 发光效果动画
@keyframes glow {
  0% {
    text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00;
  }
  100% {
    text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
  }
}
</style>
