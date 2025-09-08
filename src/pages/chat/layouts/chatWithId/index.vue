<!-- 每个回话对应的聊天内容 -->
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { AnyObject } from 'typescript-api-pro';
import type { BubbleProps } from 'vue-element-plus-x/types/Bubble';
import type { BubbleListInstance } from 'vue-element-plus-x/types/BubbleList';
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import type { ThinkingStatus } from 'vue-element-plus-x/types/Thinking';
import { useHookFetch } from 'hook-fetch/vue';
import { Sender } from 'vue-element-plus-x';
import { send_message_stream } from '@/api/dify';
import FilesSelect from '@/components/FilesSelect/index.vue';
import { useFilesStore } from '@/stores/modules/files';
import { useUserStore } from '@/stores/modules/user';
import { useDifyStore } from '@/stores/modules/dify';

type MessageItem = BubbleProps & {
  key: string;
  role: 'ai' | 'user' | 'system';
  avatar: string;
  thinkingStatus?: ThinkingStatus;
  thinlCollapse?: boolean;
  reasoning_content?: string;
};

const filesStore = useFilesStore();
const userStore = useUserStore();
const difyStore = useDifyStore();

// 用户头像
const avatar = computed(() => {
  const userInfo = userStore.userInfo;
  return userInfo?.avatar || 'https://avatars.githubusercontent.com/u/76239030?v=4';
});

const inputValue = ref('');
const senderRef = ref<InstanceType<typeof Sender> | null>(null);
const bubbleItems = ref<MessageItem[]>([]);
const bubbleListRef = ref<BubbleListInstance | null>(null);

// 防止重复请求的标志
let isLoadingHistory = false;
// SSE流进行中的标志
let isSSEStreaming = false;

const { stream, loading: isLoading, cancel } = useHookFetch({
  request: send_message_stream,
  onError: (err) => {
    console.warn('测试错误拦截', err);
  },
});
// 记录进入思考中
let isThinking = false;

// 监听 store 中的会话ID变化
watch(
  () => difyStore.getCurrentConversationId(),
  async (newId, oldId) => {
    // 防止重复调用：如果ID没有实际变化，则不执行
    if (newId === oldId) {
      return;
    }

    // 防止重复调用：如果正在加载中，则跳过
    if (isLoadingHistory) {
      return;
    }

    if (newId) {
      // 判断是否需要更新对话列表
      if (newId !== 'newChat') {
        // 从历史会话切换，需要更新对话列表
        // 但如果SSE流正在进行中，则跳过加载历史记录
        if (!isSSEStreaming) {
          await loadConversationHistory(newId);
        } else {
          console.log('🔍 [DEBUG] SSE流进行中，跳过加载历史记录');
        }
      } else if (newId === 'newChat') {
        // 开始新会话，清空当前消息
        bubbleItems.value = [];
      }

      // 如果本地有发送内容，则直接发送
      const chatContentStr = localStorage.getItem('chatContent');
      if (chatContentStr) {
        let chatData;
        try {
          chatData = JSON.parse(chatContentStr);
        } catch {
          // 如果解析失败，按原文本处理
          chatData = { query: chatContentStr };
        }

        // 如果是newChat，调用difyStore的send_message方法
        if (newId === 'newChat') {
          setTimeout(async () => {
            startSSE(chatData.query);
          }, 500);
        }
        localStorage.removeItem('chatContent');
      }
    }
  },
  { immediate: true },
);

// 解析历史消息中的思考内容
function parseHistoryMessageContent(answer: string) {
  const thinkStart = answer.includes('<think>');
  const thinkEnd = answer.includes('</think>');

  let reasoning_content = '';
  let content = answer;
  let thinkingStatus: ThinkingStatus = 'end';
  let thinlCollapse = false;

  if (thinkStart && thinkEnd) {
    // 包含完整的思考标签，需要分离思考内容和回答内容
    const thinkMatch = answer.match(/<think>(.*?)<\/think>/s);
    if (thinkMatch) {
      reasoning_content = thinkMatch[1].trim();
      content = answer.replace(/<think>.*?<\/think>/s, '').trim();
      thinkingStatus = 'end';
      thinlCollapse = reasoning_content.length > 0; // 如果有思考内容，默认展开
    }
  } else if (thinkStart) {
    // 只有开始标签，可能是不完整的思考内容
    const thinkMatch = answer.match(/<think>(.*)/s);
    if (thinkMatch) {
      reasoning_content = thinkMatch[1].trim();
      content = answer.replace(/<think>.*/s, '').trim();
      thinkingStatus = 'end';
      thinlCollapse = reasoning_content.length > 0;
    }
  }

  return {
    reasoning_content,
    content,
    thinkingStatus,
    thinlCollapse
  };
}

// 加载会话历史记录
async function loadConversationHistory(conversationId: string) {
  // 防止重复请求
  if (isLoadingHistory) {
    return;
  }

  isLoadingHistory = true;

  try {
    // 请求聊天记录
    const res = await difyStore.getConversationHistory(conversationId);
    if (res && res.data && res.data) {
      // 处理Dify API返回的消息格式
      // 每个item包含完整的对话轮次（用户消息+AI回复），需要拆分成两条UI消息
      const messages: MessageItem[] = [];

      res.data.forEach((item: any) => {
        // 添加用户消息
        if (item.query) {
          messages.push({
            key: `${item.id}_user`,
            avatar: avatar.value,
            avatarSize: '32px' as const,
            role: 'user',
            placement: 'end',
            isMarkdown: false,
            loading: false,
            content: item.query,
            reasoning_content: '',
            thinkingStatus: 'end' as const,
            thinlCollapse: false,
            typing: false,
          });
        }

        // 添加AI回复消息
        if (item.answer) {
          // 解析AI回复中的思考内容
          const parsedContent = parseHistoryMessageContent(item.answer);

          messages.push({
            key: `${item.id}_assistant`,
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            avatarSize: '32px' as const,
            role: 'system',
            placement: 'start',
            isMarkdown: true,
            loading: false,
            content: parsedContent.content,
            reasoning_content: parsedContent.reasoning_content,
            thinkingStatus: parsedContent.thinkingStatus,
            thinlCollapse: parsedContent.thinlCollapse,
            typing: false,
          });
        }
      });

      // 赋值回显
      bubbleItems.value = messages;
    }

  // 滚动到底部
  setTimeout(() => {
    try {
      if (bubbleListRef.value && typeof bubbleListRef.value.scrollToBottom === 'function') {
        bubbleListRef.value.scrollToBottom();
      }
    } catch (error) {
      console.error('❌ [scrollToBottom错误]', error);
    }
  }, 350);
  } catch (error) {
    console.error('❌ [loadConversationHistory错误]', error);
  } finally {
    isLoadingHistory = false;
  }
}

// 封装数据处理逻辑
function handleDataChunk(chunk: AnyObject) {
  try {

    // 确保 bubbleItems.value 是数组
    if (!bubbleItems.value) {
      bubbleItems.value = [];
    }

    // 处理 Dify API 的 SSE 响应格式
    const event = chunk.event;
    const answer = chunk.answer;
    const conversationId = chunk.conversation_id;

    // 如果获取到新的 conversation_id，更新 store
    if (conversationId && difyStore.getCurrentConversationId() === 'newChat') {
      console.log('获取到新的 conversation_id:', conversationId);
      // 更新 store 中的会话ID，但不触发历史记录加载
      // 等到SSE流结束后再加载历史记录
      difyStore.setCurrentConversationId(conversationId, false);
    }

    if (event === 'message' && answer) {
      // 打印每次获取到的AI回复内容
      console.log('🤖 [AI回复内容]', {
        event,
        answer,
        answerLength: answer.length,
        timestamp: new Date().toISOString()
      });

      // 检查是否包含思考标签
      const thinkStart = answer.includes('<think>');
      const thinkEnd = answer.includes('</think>');

      console.log('🤔 [思考状态检测]', {
        answer,
        thinkStart,
        thinkEnd,
        isThinking,
        timestamp: new Date().toISOString()
      });

      if (thinkStart) {
        isThinking = true;
        console.log('🧠 [开始思考]');
      }
      if (thinkEnd) {
        isThinking = false;
        console.log('💡 [结束思考]');
      }

      // 处理消息内容
      if (bubbleItems.value.length) {
        const lastMessage = bubbleItems.value[bubbleItems.value.length - 1];

        if (isThinking) {
          // 思考阶段：显示思考内容
          lastMessage.thinkingStatus = 'thinking';
          lastMessage.loading = false;
          lastMessage.thinlCollapse = true;
          lastMessage.reasoning_content += answer
            .replace('<think>', '')
            .replace('</think>', '');
        } else {
          // 回答阶段：显示最终内容
          lastMessage.content += answer;
          lastMessage.thinkingStatus = 'end';
          lastMessage.loading = false;
        }
      }
    } else if (event === 'message_end') {
      // 消息结束
      console.log('✅ [消息结束]', {
        event,
        timestamp: new Date().toISOString(),
        totalMessages: bubbleItems.value.length
      });

      if (bubbleItems.value.length) {
        bubbleItems.value[bubbleItems.value.length - 1].thinkingStatus = 'end';
        bubbleItems.value[bubbleItems.value.length - 1].loading = false;
        bubbleItems.value[bubbleItems.value.length - 1].typing = false;
      }
    } else if (event === 'error') {
      // 处理错误
      console.error('❌ [Dify API 错误]', {
        event,
        chunk,
        timestamp: new Date().toISOString()
      });
    }

    // 保留原有的思考链处理逻辑（如果API支持的话）
    const reasoningChunk = chunk.choices?.[0]?.delta?.reasoning_content;
    if (reasoningChunk && bubbleItems.value.length) {
      bubbleItems.value[bubbleItems.value.length - 1].thinkingStatus = 'thinking';
      bubbleItems.value[bubbleItems.value.length - 1].loading = true;
      bubbleItems.value[bubbleItems.value.length - 1].thinlCollapse = true;
      bubbleItems.value[bubbleItems.value.length - 1].reasoning_content += reasoningChunk;
    }

  }
  catch (err) {
    console.error('解析数据时出错:', err);
  }
}

// 封装错误处理逻辑
function handleError(err: any) {
  console.error('Fetch error:', err);
}

function submitMessage() {
  const chatContent = inputValue.value;
  startSSE(chatContent);
}


async function startSSE(chatContent: string) {
  // 判断是否登录
  if (!userStore.token || !userStore.userInfo) {
    // 未登录，打开登录弹框
    userStore.openLoginDialog();
    return;
  }
  console.log('jxd chatContent', chatContent);

  try {
    // 设置SSE流进行中标志
    isSSEStreaming = true;

    // 添加用户输入的消息
    // 清空输入框
    inputValue.value = '';
    addMessage(chatContent, true);
    addMessage('', false);


    // 这里有必要调用一下 BubbleList 组件的滚动到底部 手动触发 自动滚动
    bubbleListRef.value?.scrollToBottom();

    const data = {
      inputs: {
      },
      query: chatContent,
      conversation_id: (difyStore.getCurrentConversationId() !== 'newChat' && difyStore.getCurrentConversationId() !== null) ? difyStore.getCurrentConversationId()! : undefined,
      user: String(userStore.userInfo?.username || ""),
      auto_generate_name: difyStore.getCurrentConversationId() === 'newChat',
    };

    console.log('jxd data', data);
    for await (const chunk of stream(data)) {
      handleDataChunk(chunk.result as AnyObject);
    }
  }
  catch (err) {
    handleError(err);
  }
  finally {
    console.log('数据接收完毕');
    // 清除SSE流进行中标志
    isSSEStreaming = false;

    // 停止打字器状态
    if (bubbleItems.value && bubbleItems.value.length) {
      bubbleItems.value[bubbleItems.value.length - 1].typing = false;
    }

    // 如果是新创建的会话，刷新侧边栏列表
    const currentId = difyStore.getCurrentConversationId();
    if (currentId && currentId !== 'newChat') {
      try {
        // 刷新会话列表，让新创建的会话出现在侧边栏
        await difyStore.requestSessionList(false, true);

        // 设置当前选中的会话
        const newSession = difyStore.sessionList.find(session => session.id === currentId);
        if (newSession) {
          difyStore.setCurrentSession(newSession);
        }
      } catch (error) {
        console.error('刷新侧边栏会话列表失败:', error);
      }
    }
  }
}

// 中断请求
async function cancelSSE() {
  cancel();
  // 清除SSE流进行中标志
  isSSEStreaming = false;

  // 结束最后一条消息打字状态
  if (bubbleItems.value && bubbleItems.value.length) {
    bubbleItems.value[bubbleItems.value.length - 1].typing = false;
  }
}

// 添加消息 - 维护聊天记录
function addMessage(message: string, isUser: boolean) {
  // 确保 bubbleItems.value 是数组
  if (!bubbleItems.value) {
    bubbleItems.value = [];
  }
  const timestamp = Date.now();
  const obj: MessageItem = {
    key: `${timestamp}_${isUser ? 'user' : 'assistant'}`,
    avatar: isUser
      ? avatar.value
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '32px',
    role: isUser ? 'user' : 'system',
    placement: isUser ? 'end' : 'start',
    isMarkdown: !isUser,
    loading: !isUser,
    content: message || '',
    reasoning_content: '',
    thinkingStatus: 'start',
    thinlCollapse: false,
    noStyle: !isUser,
  };
  bubbleItems.value.push(obj);
}

// 展开收起 事件展示
function handleChange(payload: { value: boolean; status: ThinkingStatus }) {
  console.log('value', payload.value, 'status', payload.status);
}

function handleDeleteCard(_item: FilesCardProps, index: number) {
  filesStore.deleteFileByIndex(index);
}

watch(
  () => filesStore.filesList.length,
  (val) => {
    if (val > 0) {
      nextTick(() => {
        senderRef.value?.openHeader();
      });
    }
    else {
      nextTick(() => {
        senderRef.value?.closeHeader();
      });
    }
  },
);
</script>

<template>
  <div class="chat-with-id-container">
    <div class="chat-warp">
      <BubbleList ref="bubbleListRef" :list="bubbleItems" max-height="calc(100vh - 240px)">
        <template #loading>
          <div>loading...</div>
        </template>
        <template #header="{ item }">

          <Thinking
            v-if="item.reasoning_content" v-model="item.thinlCollapse" :content="item.reasoning_content"
            :status="item.thinkingStatus" class="thinking-chain-warp" @change="handleChange"
          />
        </template>

        <template #content="{ item }">
          <!-- chat 内容走 markdown -->
          <XMarkdown v-if="item.content && item.role === 'system'" :markdown="item.content" class="markdown-body" :themes="{ light: 'github-light', dark: 'github-dark' }" default-theme-mode="dark" />
          <!-- user 内容 纯文本 -->
          <div v-if="item.content && item.role === 'user'" class="user-content">
            {{ item.content }}
          </div>
        </template>
      </BubbleList>

      <Sender
        ref="senderRef" v-model="inputValue" class="chat-defaul-sender" :auto-size="{
          maxRows: 6,
          minRows: 2,
        }" variant="updown" clearable allow-speech :loading="isLoading" @submit="submitMessage" @cancel="cancelSSE"
      >
        <template #header>
          <div class="sender-header p-12px pt-6px pb-0px">
            <Attachments :items="filesStore.filesList" :hide-upload="true" @delete-card="handleDeleteCard">
              <template #prev-button="{ show, onScrollLeft }">
                <div
                  v-if="show"
                  class="prev-next-btn left-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
                  @click="onScrollLeft"
                >
                  <el-icon>
                    <ArrowLeftBold />
                  </el-icon>
                </div>
              </template>

              <template #next-button="{ show, onScrollRight }">
                <div
                  v-if="show"
                  class="prev-next-btn right-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
                  @click="onScrollRight"
                >
                  <el-icon>
                    <ArrowRightBold />
                  </el-icon>
                </div>
              </template>
            </Attachments>
          </div>
        </template>
        <template #prefix>
          <div class="flex-1 flex items-center gap-8px flex-none w-fit overflow-hidden">
            <FilesSelect />
          </div>
        </template>
      </Sender>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-with-id-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  height: 100%;
  .chat-warp {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: calc(100vh - 60px);
    .thinking-chain-warp {
      margin-bottom: 12px;
    }
  }
  :deep() {
    .el-bubble-list {
      padding-top: 24px;
    }
    .el-bubble {
      padding: 0 12px;
      padding-bottom: 24px;
    }
    .el-typewriter {
      overflow: hidden;
      border-radius: 12px;
    }
    .user-content {
      // 换行
      white-space: pre-wrap;
    }
    .markdown-body {
      background-color: transparent;
    }
    .markdown-elxLanguage-header-div {
      top: -25px !important;
    }

    // xmarkdown 样式
    .elx-xmarkdown-container {
      padding: 8px 4px;
    }
  }
  .chat-defaul-sender {
    width: 100%;
    margin-bottom: 22px;
  }
}
</style>
