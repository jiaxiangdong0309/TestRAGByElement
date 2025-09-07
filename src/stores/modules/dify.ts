import type {ConversationsQueryParams, ChatMessagesRequest, ConversationItem } from '@/api/dify/types';
import { ChatLineRound } from '@element-plus/icons-vue';
import { defineStore } from 'pinia';
import { markRaw, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  send_message as api_send_message,
  get_conversations,
  get_conversation_messages,
  delete_conversation,
  update_dify_session,
} from '@/api';
import { useUserStore } from './user';

export const useDifyStore = defineStore('dify', () => {
  const router = useRouter();
  const userStore = useUserStore();

  // 当前选中的会话信息
  const currentSession = ref<ConversationItem | null>(null);
  // 设置当前会话
  const setCurrentSession = (session: ConversationItem | null) => {
    currentSession.value = session;
  };

  // 当前会话ID管理
  const currentConversationId = ref<string | null>(null);
  const isNewConversation = ref(false); // 标识是否为新创建的会话

  // 设置当前会话ID
  const setCurrentConversationId = (id: string | null, isNew: boolean = false) => {
    currentConversationId.value = id;
    isNewConversation.value = isNew;
  };

  // 获取当前会话ID
  const getCurrentConversationId = () => currentConversationId.value;

  // 会话列表核心状态
  const sessionList = ref<ConversationItem[]>([]); // 会话数据列表
  const lastId = ref<string | undefined>(undefined); // 当前页最后一条记录的ID
  const pageSize = ref(25); // 每页显示数量
  const hasMore = ref(true); // 是否还有更多数据
  const isLoading = ref(false); // 全局加载状态（初始加载/刷新）
  const isLoadingMore = ref(false); // 加载更多状态（区分初始加载）

  // 创建新对话（按钮点击）
  const createSessionBtn = async () => {
    try {
      // 清空当前选中会话信息
      setCurrentSession(null);
      setCurrentConversationId(null, true);
      router.replace({ name: 'chat' });
    }
    catch (error) {
      console.error('createSessionBtn错误:', error);
    }
  };

  // 获取会话列表（核心分页方法）
  const requestSessionList = async (isLoadMore: boolean = false, force: boolean = false) => {
    // 如果没有token就直接清空
    if (!userStore.token) {
      sessionList.value = [];
      return;
    }

    if (!force && (isLoadMore && !hasMore.value) || isLoading.value || isLoadingMore.value)
      return;

    isLoading.value = !isLoadMore; // 非加载更多时标记为全局加载
    isLoadingMore.value = isLoadMore; // 加载更多时标记为加载更多

    try {
      const userParam = String(userStore.userInfo?.userId || userStore.userInfo?.username || '');

      const params: ConversationsQueryParams = {
        user: userParam,
        limit: pageSize.value,
        sort_by: '-created_at',
        ...(isLoadMore && lastId.value ? { last_id: lastId.value } : {}),
      };

      const resArr = await get_conversations(params);

      // 检查响应是否成功
      if (!resArr || !resArr.data) {
        console.error('API 响应格式错误:', resArr);
        sessionList.value = [];
        return;
      }

      // 预处理会话分组 并添加前缀图标
      const res = processSessions(resArr.data);

      if (isLoadMore) {
        // 加载更多：追加到列表末尾
        sessionList.value = [...sessionList.value, ...res];
      } else {
        // 初始加载或刷新：替换整个列表
        sessionList.value = res;
      }

      // 更新 lastId 为当前页最后一条记录的ID
      if (res.length > 0) {
        lastId.value = res[res.length - 1].id;
      }

      // 判断是否还有更多数据
      if (!force)
        hasMore.value = resArr.has_more;
    }
    catch (error) {
      console.error('requestSessionList错误:', error);
    }
    finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  };

  // 发送消息后创建新会话
  const send_message = async (data: Omit<ChatMessagesRequest, 'id'>) => {
    if (!userStore.token) {
      router.replace({
        name: 'chatWithId',
        params: {
          id: 'not_login',
        },
      });
      return;
    }

    try {
      const res = await api_send_message(data);
      // 创建会话后立刻刷新列表（新会话会出现在第一页）
      await requestSessionList(false, true);
      // 并将当前勾选信息设置为新增的会话信息
      // const newSessionRes = await get_conversation_messages({ conversation_id: `${res.data}` });
      // setCurrentSession(newSessionRes.data);

      // 跳转聊天页
      router.replace({
        name: 'chatWithId',
        params: { id: `${res.data}` },
      });
    }
    catch (error) {
      console.error('createSessionList错误:', error);
    }
  };

  // 加载更多会话（供组件调用）
  const loadMoreSessions = async () => {
    if (hasMore.value)
      await requestSessionList(true);
  };

  // 更新会话（供组件调用）
  const updateSession = async (item: ConversationItem) => {
    try {
      await update_dify_session(item.id, {
        name: item.name,
        user: String(userStore.userInfo?.userId || userStore.userInfo?.username || ''),
      });
      // 更新会话后刷新列表
      await requestSessionList(false, true);
    }
    catch (error) {
      console.error('updateSession错误:', error);
    }
  };

  // 删除会话（供组件调用）
  const deleteSessions = async (ids: string[]) => {
    try {
      await delete_conversation(ids[0], { user: String(userStore.userInfo?.userId || userStore.userInfo?.username || '') });
      // 删除会话后刷新列表
      await requestSessionList(false, true);
    }
    catch (error) {
      console.error('deleteSessions错误:', error);
    }
  };

  // 获取会话历史记录（供组件调用）
  const getConversationHistory = async (conversationId: string, firstId?: string, limit?: number) => {
    try {
      const params = {
        conversation_id: conversationId,
        user: String(userStore.userInfo?.userId || userStore.userInfo?.username || ''),
        ...(firstId && { first_id: firstId }),
        ...(limit && { limit }),
      };
      const res = await get_conversation_messages(params);
      return res;
    }
    catch (error) {
      console.error('❌ [getConversationHistory错误]:', error);
      return null;
    }
  };

  // 在获取会话列表后添加预处理逻辑（示例）
  function processSessions(sessions: ConversationItem[]) {
    const currentDate = new Date();

    return sessions.map((session) => {
      // created_at 是 Unix 时间戳（秒），需要转换为毫秒
      const createDate = new Date(session.created_at * 1000);
      const diffDays = Math.floor(
        (currentDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // 生成原始分组键（用于排序和分组）
      let group: string;
      if (diffDays < 7) {
        group = '7 天内'; // 用数字前缀确保排序正确
      }
      else if (diffDays < 30) {
        group = '30 天内';
      }
      else {
        const year = createDate.getFullYear();
        const month = String(createDate.getMonth() + 1).padStart(2, '0');
        group = `${year}-${month}`; // 格式：2025-05
      }

      return {
        ...session,
        group, // 新增分组键字段
        prefixIcon: markRaw(ChatLineRound), // 图标为静态组件，使用 markRaw 标记为静态组件
      };
    });
  }

  return {
    // 当前选中的会话
    currentSession,
    // 设置当前会话
    setCurrentSession,
    // 当前会话ID管理
    currentConversationId,
    isNewConversation,
    setCurrentConversationId,
    getCurrentConversationId,
    // 列表状态
    sessionList,
    lastId,
    pageSize,
    hasMore,
    isLoading,
    isLoadingMore,
    // 列表方法
    createSessionBtn,
    send_message,
    requestSessionList,
    loadMoreSessions,
    updateSession,
    deleteSessions,
    getConversationHistory,
  };
});
