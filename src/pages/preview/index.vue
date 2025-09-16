<!-- 网页预览页面 -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { usePreviewStore } from '@/stores/modules/preview';
import { send_message_stream_preview } from '@/api/dify';
import type { PreviewRequest } from '@/api/dify/types';
// import type { DifyResponse } from '@/stores/modules/preview';
import { useHookFetch } from 'hook-fetch/vue';
// import aiAvatar from '@/assets/images/ai_avatar.png';
// import userAvatar from '@/assets/images/user_avatar.png';


const previewStore = usePreviewStore();
const route = useRoute();

// 使用computed获取预览数据
const previewData = computed(() => previewStore.getPreviewData());

// 加载状态
const isLoading = ref(false);

// 当前预览ID
let currentPreviewId: string | null = null;

// 流式响应相关
const generatedContent = ref('');
const isLoadingContent = ref(false);
const { stream } = useHookFetch({
  request: send_message_stream_preview,
  onError: (err) => {
    console.error('流式请求错误:', err);
    ElMessage.error('流式请求失败');
  },
});

// 调用预览接口的函数
const callPreviewApi = async () => {
  if (!previewData.value) {
    ElMessage.warning('没有预览数据可以发送');
    return;
  }

  try {
    console.log('🚀 [开始调用预览接口]', {
      previewData: previewData.value,
      timestamp: new Date().toISOString()
    });

    isLoading.value = true;
    ElMessage.info('正在调用预览接口...');

    // 构建 API 请求数据
    const requestData: PreviewRequest = {
      inputs: {
        sourceContent: previewData.value.content || '你好'
        // sourceContent: '你好'
      },
      user: 'preview_user'
    };

    console.log('📤 [发送预览请求]', {
      requestData,
      fullRequest: JSON.stringify(requestData, null, 2),
      timestamp: new Date().toISOString()
    });

    // 清空之前的内容
    generatedContent.value = '';
    isLoadingContent.value = true;

    console.log('🔄 [开始流式请求]');

    // 开始流式请求
    let chunkCount = 0;
    for await (const chunk of stream(requestData)) {
      chunkCount++;
      console.log(`📦 [接收到第${chunkCount}个数据块]`,
      chunk.result?.data?.text  || '');

      handleStreamChunk(chunk.result as any);
    }

    console.log('✅ [流式请求完成]', {
      totalChunks: chunkCount,
      contentLength: generatedContent.value.length
    });

    ElMessage.success('预览接口调用成功');
  } catch (error) {
    console.error('❌ [调用预览接口失败]', {
      error,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    ElMessage.error('调用预览接口失败');

    // 重置加载状态
    isLoadingContent.value = false;
  } finally {
    console.log('🏁 [请求结束]', {
      isLoading: isLoading.value,
      finalState: {
        content: generatedContent.value.substring(0, 100) + (generatedContent.value.length > 100 ? '...' : ''),
        loading: isLoadingContent.value
      }
    });

    isLoading.value = false;

    // 停止加载状态
    isLoadingContent.value = false;
  }
};

// 处理流式数据块
function handleStreamChunk(chunk: any) {
  try {
    const event = chunk.event;

    if (event === 'text_chunk') {
      // 处理文本块事件 - 预览API的实际事件类型
      const content = chunk.data?.text || '';
      if (content) {
        generatedContent.value += content;
        console.log('text_chunk内容:', generatedContent.value);
      }
    } else if (event === 'message' && chunk.answer) {
      // 处理消息内容 - 与聊天页面保持一致（兼容性）
      generatedContent.value += chunk.answer;
      console.log('message追加内容:', chunk.answer);
    } else if (event === 'message_end') {
      // 消息结束处理
      console.log('message_end - 最终内容:', generatedContent.value);
      isLoadingContent.value = false;
    } else if (event === 'node_finished') {
      // 节点完成事件 - 也可能包含内容
      const nodeContent = chunk.data?.text || '';
      if (nodeContent) {
        generatedContent.value += nodeContent;
        console.log('node_finished内容:', nodeContent);
      }
    } else if (event === 'workflow_started') {
      // 工作流开始
      console.log('🚀 [工作流开始]', chunk.data);
    } else if (event === 'workflow_finished') {
      // 工作流完成
      console.log('✅ [工作流完成]', chunk.data);

      // 工作流完成时，确保最终内容正确显示
      const finalContent = chunk.data?.text || '';
      if (finalContent) {
        generatedContent.value += finalContent;
        isLoadingContent.value = false;
        console.log('workflow_finished最终内容:', finalContent);
      }

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

  } catch (error) {
    console.error('❌ [处理流式数据块失败]', {
      error,
      chunk,
      stack: error.stack
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

onMounted(() => {
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
          id: previewData.id,
          content: previewData.content,
          role: 'ai',
          avatar: '',
          key: previewId,
        });
      } else {
        console.warn('未找到对应的预览数据，可能已过期');
        ElMessage.warning('预览数据已过期，请重新生成');
      }
    } catch (error) {
      console.error('解析预览数据失败:', error);
      ElMessage.error('数据解析失败');
    }
  } else if (!previewData.value) {
    console.warn('未找到预览数据，可能是直接访问了预览页面');
    // 如果没有数据，可以跳转回聊天页面
    // router.push('/');
  } else {
    console.log('预览页面接收到的数据:', previewData.value);
  }
});

onUnmounted(() => {
  // 页面卸载时清理当前预览数据
  cleanupCurrentPreviewData();
});


// 监听页面关闭事件
window.addEventListener('beforeunload', cleanupCurrentPreviewData);
</script>

<template>
  <div class="preview-container">
    <div class="preview-header">
      <h1>网页预览</h1>
      <p>这里将显示生成的网页内容</p>

      <!-- 添加调用预览接口的按钮 -->
      <div class="preview-actions">
        <el-button
          type="primary"
          :loading="isLoading"
          :disabled="!previewData"
          @click="callPreviewApi"
        >
          {{ isLoading ? '调用中...' : '调用预览接口' }}
        </el-button>
      </div>
    </div>

    <div class="preview-content">
      <!-- 显示原始预览数据 -->
      <div v-if="previewData" class="data-display">
        <h2>原始内容：</h2>
        <div class="content-display">
          {{ previewData.content }}
        </div>
      </div>

      <!-- 生成内容区域 - 流式展示 -->
      <div class="generated-content-container">
        <h2>生成的内容：</h2>
        <div class="generated-content">
          <div v-if="generatedContent || isLoadingContent"
               class="ai-content-wrapper">
            <div v-if="isLoadingContent" class="loading-indicator">
              <el-icon class="is-loading"><Loading /></el-icon>
              生成中...
            </div>
            <iframe
              :srcdoc="generatedContent"
              class="html-content-frame"
              frameborder="0"
              sandbox="allow-same-origin allow-scripts"
            ></iframe>
          </div>
          <div v-else class="placeholder-content">
            点击上方按钮开始生成内容...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .preview-header {
    text-align: center;
    margin-bottom: 30px;

    h1 {
      color: #333;
      margin-bottom: 10px;
    }

    p {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .preview-actions {
      margin-top: 20px;
    }
  }

  .preview-content {
  .data-display {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #ddd;
    margin-bottom: 20px;

    h2 {
      margin-bottom: 15px;
      color: #333;
    }

    .content-display {
      background: #fff;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      line-height: 1.6;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
    }
  }

  .stream-chat-container {
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;

    h2 {
      margin-bottom: 15px;
      color: #334155;
    }

    .chat-messages {
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      max-height: 400px;
      overflow-y: auto;
      padding: 20px;
    }
  }

  .api-response {
    background: #f0f9ff;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #3b82f6;

    h2 {
      margin-bottom: 15px;
      color: #1e40af;
    }

    .generated-content {
      background: #fff;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      line-height: 1.6;
      white-space: pre-wrap;
      margin-bottom: 20px;
      max-height: 300px;
      overflow-y: auto;
    }

    .api-info {
      background: #f8fafc;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;

      h3 {
        margin-bottom: 10px;
        color: #334155;
      }

      .info-item {
        margin-bottom: 8px;
        font-size: 14px;

        strong {
          color: #475569;
          margin-right: 8px;
        }
      }
    }
  }

  .no-api-data {
    text-align: center;
    padding: 40px;
    background: #fef3c7;
    border-radius: 8px;
    border: 1px solid #f59e0b;
    color: #92400e;
  }

  .no-data {
    text-align: center;
    padding: 40px;
    color: #999;
  }
}

// AI内容样式
.ai-content-wrapper {
  width: 100%;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content p {
  margin-bottom: 8px;
}

.markdown-content strong {
  font-weight: 600;
  color: #333;
}

.markdown-content em {
  font-style: italic;
  color: #555;
}

.markdown-content code {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #e83e8c;
}

// 用户内容样式
.user-content {
  white-space: pre-wrap;
  line-height: 1.6;
  word-break: break-word;
}

// 生成内容容器样式
.generated-content-container {
  background: #f0f9ff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #3b82f6;
  margin-bottom: 20px;

  h2 {
    margin-bottom: 15px;
    color: #1e40af;
  }

  .generated-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    min-height: 100px;
    max-height: 400px;
    overflow-y: auto;

    .placeholder-content {
      color: #64748b;
      text-align: center;
      padding: 40px 20px;
      font-style: italic;
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #3b82f6;
      margin-top: 12px;
      font-size: 14px;

      .el-icon {
        font-size: 16px;
      }
    }

    .html-content-frame {
      width: 100%;
      height: 400px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: #fff;
    }
  }
}
}
</style>
