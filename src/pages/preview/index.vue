<!-- 网页预览页面 -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { usePreviewStore } from "@/stores/modules/preview";
import { send_message_stream_preview } from "@/api/dify";
import { useHookFetch } from "hook-fetch/vue";
import { Sender } from "vue-element-plus-x";
// import { Document } from "@element-plus/icons-vue";
import type { PreviewRequest } from "@/api/dify/types";

const previewStore = usePreviewStore();
const route = useRoute();

// 使用computed获取预览数据
const previewData = computed(() => previewStore.getPreviewData());

// 输入框相关
const inputValue = ref("");
const inputLoading = ref(false);
// 是否按"修改网页"模式：选中=0，未选=1
const checked = ref<boolean>(false);

// 加载状态
const isLoading = ref(false);

// 当前预览ID
let currentPreviewId: string | null = null;

// 流式响应相关
const generatedContent = ref("");
const isLoadingContent = ref(false);

const matrixText = ref("");
const isFirstRequest = ref(true);
const hasContent = ref(false);

// 流式输出状态
const isStreaming = ref(false);

// 瀑布流自动滚动
const matrixRainRef = ref<HTMLElement | null>(null);

// 滚动到底部
const scrollToBottom = () => {
  if (matrixRainRef.value) {
    // 使用平滑滚动到底部
    matrixRainRef.value.scrollTo({
      top: matrixRainRef.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

// 强制滚动到底部（用于流式输出）
const forceScrollToBottom = () => {
  if (matrixRainRef.value) {
    matrixRainRef.value.scrollTop = matrixRainRef.value.scrollHeight;
  }
};

// 监听matrixText变化，自动滚动
watch(matrixText, () => {
  nextTick(() => {
    // 在流式输出时使用强制滚动，确保实时跟随
    if (isStreaming.value) {
      forceScrollToBottom();
    } else {
      scrollToBottom();
    }
  });
}, { immediate: true });


// 停止流式输出状态
const stopStreaming = () => {
  isStreaming.value = false;
};
const { stream } = useHookFetch({
  request: send_message_stream_preview,
  onError: (err: any) => {
    console.error("流式请求错误:", err);
    ElMessage.error("流式请求失败");
  },
});

// 调用预览接口的函数
const callPreviewApi = async (userInput?: string) => {
  if (!previewData.value) {
    ElMessage.warning("没有预览数据可以发送");
    return;
  }

  try {
    console.log("🚀 [开始调用预览接口]", {
      previewData: previewData.value,
      userInput,
      timestamp: new Date().toISOString(),
    });

    isLoading.value = true;

    // 清空瀑布流文本并显示弹窗
    matrixText.value = "";
    generatedContent.value = ""; // 清空预览内容

    isLoadingContent.value = true;
    isStreaming.value = true; // 开始流式输出



    // 判断是首次请求还是用户修改请求
    let sourceContent: string;
    let updateContext: string;
    let isUpdate: number;

    if (isFirstRequest.value) {
      // 首次请求：源数据转HTML
      sourceContent = previewData.value.content || "";
      updateContext = "";
      console.log("🔍 [首次请求]", {
        previewDataContent: previewData.value.content,
        sourceContent,
        updateContext,
      });
    } else {
      // 用户修改请求：基于瀑布流内容进行修改
      sourceContent = generatedContent.value;
      updateContext = userInput || "";
      console.log("🔍 [用户修改请求]", { userInput, updateContext });
    }

    // 根据复选框决定 isUpdate：选中=0，未选=1
    isUpdate = checked.value ? 1 : 0;
    const response_mode = checked.value ? "blocking" : "streaming";
    const model = "1";

    // 构建 API 请求数据
    const requestData: PreviewRequest = {
      inputs: {
        sourceContent,
        updateContext,
        isUpdate,
        model,
      },
      sourceContent,
      updateContext,
      isUpdate,
      response_mode,
      user: "preview_user",
    };

    console.log("📤 [发送预览请求]", {
      requestData,
      fullRequest: JSON.stringify(requestData, null, 2),
      timestamp: new Date().toISOString(),
    });

    console.log("🔄 [开始流式请求]");

    // 开始流式请求
    // let chunkCount = 0;
    for await (const chunk of stream(requestData)) {
      // chunkCount++;
      // console.log(
      //   `📦 [接收到第${chunkCount}个数据块]`,
      //   (chunk.result as any)?.data?.text || ""
      // );

      handleStreamChunk(chunk.result as any);
    }

    // console.log("✅ [流式请求完成]", {
    //   totalChunks: chunkCount,
    //   contentLength: generatedContent.value.length,
    // });

    // 流式请求完成，停止流式状态
    stopStreaming();

    // 确保最终内容被设置
    generatedContent.value = matrixText.value;

    ElMessage.success("预览接口调用成功");
  } catch (error: any) {
    console.error("❌ [调用预览接口失败]", {
      error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });

    ElMessage.error("调用预览接口失败");
  } finally {
    console.log("🏁 [请求结束]", {
      isLoading: isLoading.value,
      finalState: {
        content:
          generatedContent.value.substring(0, 100) +
          (generatedContent.value.length > 100 ? "..." : ""),
        loading: isLoadingContent.value,
      },
    });

    isLoading.value = false;
    isLoadingContent.value = false;
    isStreaming.value = false; // 停止流式输出状态

    // 隐藏瀑布流弹窗
    setTimeout(() => {
      matrixText.value = "";

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

    const chunkText = chunk.data?.text || chunk.answer || "";
    if (chunkText) {
      // 添加到瀑布流文本
      matrixText.value += chunkText;

      // 实时更新预览内容
      generatedContent.value = matrixText.value;
    }

    if (event === "workflow_started") {
      // 工作流开始
      console.log("🚀 [工作流开始]", chunk.data);
    } else if (event === "workflow_finished") {
      // 工作流完成
      console.log("✅ [工作流完成]", chunk.data);

      // 工作流完成时，确保最终内容被设置
      generatedContent.value = matrixText.value;
      isLoadingContent.value = false;
      console.log("workflow_finished最终内容:", generatedContent.value);

      // 更新store中的响应数据 - 修复数据路径
      if (chunk.data) {
        console.log("💾 [保存到store]", {
          workflow_run_id: chunk.data.workflow_run_id,
          task_id: chunk.data.task_id,
          outputs: chunk.data.outputs,
          fullData: chunk.data,
        });

        previewStore.setDifyResponse({
          workflow_run_id: chunk.data.workflow_run_id || "",
          task_id: chunk.data.task_id || "",
          data: {
            id: chunk.data.id || "",
            workflow_id: chunk.data.workflow_id || "",
            status: chunk.data.status || "finished",
            outputs: {
              text: chunk.data.text || "",
            },
            error: null,
            elapsed_time: chunk.data.elapsed_time || 0,
            total_tokens: chunk.data.total_tokens || 0,
            total_steps: chunk.data.total_steps || 0,
            created_at: chunk.data.created_at || 0,
            finished_at: chunk.data.finished_at || 0,
          },
        });
      }
    } else if (event === "error") {
      // 处理错误事件
      console.error("❌ [工作流错误]", chunk.data);
      ElMessage.error("工作流执行失败");

      // 重置状态并显示错误信息
      generatedContent.value = "生成失败，请重试";
      isLoadingContent.value = false;
    } else {
      // 处理其他未知事件
      // console.log("❓ [未知事件]", {
      //   event,
      //   chunk,
      // });
    }
  } catch (error: any) {
    console.error("❌ [处理流式数据块失败]", {
      error,
      chunk,
      stack: error?.stack,
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
      if (key && key.startsWith("preview_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "");
          if (data.timestamp && now - data.timestamp > EXPIRY_TIME) {
            localStorage.removeItem(key);
            console.log("清理过期的预览数据:", key);
          }
        } catch {
          // 如果解析失败，也删除
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error("清理过期数据失败:", error);
  }
}

// 页面关闭时清理当前预览数据
function cleanupCurrentPreviewData() {
  if (currentPreviewId) {
    try {
      localStorage.removeItem(currentPreviewId);
      console.log("页面关闭，清理预览数据:", currentPreviewId);
    } catch (error) {
      console.error("清理预览数据失败:", error);
    }
  }
}

// 输入框提交处理
const handleInputSubmit = async (value: string) => {
  if (!value.trim()) {
    ElMessage.warning("请输入内容");
    return;
  }

  try {
    inputLoading.value = true;

    // 更新预览数据到store
    previewStore.setPreviewData({
      content: value.trim(),
      role: "user",
      avatar: "",
      key: `preview_${Date.now()}`,
    });

    // 调用预览接口，传递用户输入作为修改要求
    await callPreviewApi(value.trim());

    // 清空输入框
    inputValue.value = "";
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("提交失败");
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
        console.log("从localStorage获取的预览数据:", previewData);

        // 保存当前预览ID，用于页面关闭时清理
        currentPreviewId = previewId;

        // 将数据设置到store中
        previewStore.setPreviewData({
          content: previewData.content,
          role: "ai",
          avatar: "",
          key: previewId,
        });
        inputValue.value = previewData.content;

        // 自动调用预览接口
        // await callPreviewApi();
      } else {
        console.warn("未找到对应的预览数据，可能已过期");
        ElMessage.warning("预览数据已过期，请重新生成");
      }
    } catch (error) {
      console.error("解析预览数据失败:", error);
      ElMessage.error("数据解析失败");
    }
  } else if (previewData.value) {
    console.log("预览页面接收到的数据:", previewData.value);
    // 如果已经有预览数据，也自动调用预览接口
    // await callPreviewApi();
  } else {
    console.warn("未找到预览数据，可能是直接访问了预览页面");
    // 显示提示，让用户输入内容
    ElMessage.info("请输入需要生成网页的内容");
  }
});

onUnmounted(() => {
  // 页面卸载时清理当前预览数据
  cleanupCurrentPreviewData();
});

// const resetIsFirstRequest = () => {
//   isFirstRequest.value = true;
//   callPreviewApi();
// };

// 监听页面关闭事件
window.addEventListener("beforeunload", cleanupCurrentPreviewData);
</script>

<template>
  <div class="preview-container">
    <!-- 上方预览窗口 -->
    <div class="preview-iframe-container">
      <div class="preview-header">
        <h1>网页预览</h1>
        <div class="preview-actions"></div>
      </div>

      <div class="iframe-wrapper">
        <!-- 内容区域 - 左右布局 -->
        <!-- 暂时一直展示 -->
        <div class="content-layout">
          <!-- 左侧：加载状态 - 只在没有内容且首次请求时显示 -->
          <!-- <div v-if="!hasContent && isLoadingContent && isFirstRequest" class="loading-container"> -->
          <div class="loading-container">
            <div class="code-card">
              <div class="code-card__header">
                <span class="code-badge">&lt;/&gt;</span>
                <span>生成的代码</span>
              </div>
              <div class="code-stream" ref="matrixRainRef">
                <pre class="code-pre">{{ matrixText }}</pre>
              </div>
            </div>
          </div>

          <!-- 右侧：iframe 内容区域 -->
          <!-- <div v-if="generatedContent" class="ai-content-wrapper"> -->
          <!-- 暂时一直展示 -->
          <div class="ai-content-wrapper">
            <div class="preview-card">
              <div class="preview-card__header">
                <span class="preview-badge">🌐</span>
                <span>网页预览</span>
              </div>
              <div class="preview-content">
                <iframe
                  :srcdoc="generatedContent"
                  class="html-content-frame"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                ></iframe>
              </div>
            </div>
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
          maxRows: 1,
          minRows: 1,
        }"
        variant="updown"
        clearable
        :loading="inputLoading"
        @submit="handleInputSubmit"
      >
        <template #prefix>
          <div
            class="flex-1 flex items-center gap-8px flex-none w-fit overflow-hidden"
          >
            <el-checkbox v-model="checked">修改</el-checkbox>
          </div>
        </template>
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
      :deep(.el-dialog) {
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
          font-family: "Courier New", monospace;
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
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .preview-card {
        @extend .card-style;
      }

      .preview-card__header {
        @extend .card-header-style;
        padding: 20px;
        border-bottom: 1px solid #e6e8f0;
        background: #f9fafb;
      }

      .preview-badge {
        @extend .badge-style;
      }

      .preview-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .content-layout {
        display: flex;
        height: 100%;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
        gap: 20px;
      }

      // 通用badge样式
      .badge-style {
        font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas,
          "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        background: #eef2ff;
        color: #3730a3;
        padding: 6px 6px;
        border: 1px solid #c7d2fe;
        border-radius: 6px;
      }

      // 通用card样式
      .card-style {
        width: 100%;
        height: 100%;
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      // 通用card header样式
      .card-header-style {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #111827;
        font-weight: 600;
      }

      .loading-container {
        height: 100%;
        width: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;

        .code-card {
          @extend .card-style;
          padding: 20px;
          min-height: 0;
          max-height: 100%;
          overflow: hidden;
        }
        .code-card__header {
          @extend .card-header-style;
          margin-bottom: 8px;
        }
        .code-badge {
          @extend .badge-style;
        }

        .code-stream {
          background: #ececf0;
          border-radius: 10px;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 12px 14px;
          margin-top: 20px;
          border: 1px solid #e6e8f0;
          scroll-behavior: smooth;
        }

        .code-pre {
          white-space: pre-wrap;
          word-break: break-word;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 14px;
          line-height: 24px;
          margin: 0;
          color: #717182;
          min-height: 100%;
          overflow: visible;
        }
      }


      .html-content-frame {
        width: 100%;
        height: 100%;
        border: none;
        background: #fff;
        flex: 1;
      }
    }
  }

  // 下方输入框
  .preview-input-container {
    background: #fff;
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
