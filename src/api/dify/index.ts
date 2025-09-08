import type {
  ChatMessagesRequest,
  ChatMessagesResponse,
  FileUploadRequest,
  FileUploadResponse,
  ConversationsQueryParams,
  ConversationsResponse,
  ConversationMessagesQueryParams,
  ConversationMessagesResponse,
  DeleteConversationQueryParams,
  DeleteConversationResponse,
  RenameConversationRequest,
  RenameConversationResponse,
  StopMessageRequest,
  StopMessageResponse,
} from './types';
import hookFetch from 'hook-fetch';
import { sseTextDecoderPlugin } from 'hook-fetch/plugins';
import { useUserStore } from '@/stores';
import { API_URL } from '@/config/localConfig';

// 创建动态设置 Authorization header 的插件
function difyAuthPlugin() {
  return {
    name: 'dify-auth',
    beforeRequest: async (config: any) => {
      const userStore = useUserStore();
      config.headers = new Headers(config.headers);
      if (userStore.token) {
        config.headers.set('Authorization', `Bearer ${userStore.token}`);
      }
      return config;
    },
  };
}

// 根据环境选择baseURL
const getBaseURL = () => {
  // 检测是否在Electron环境中
  const isElectron = window.navigator.userAgent.includes('Electron');
  
  // Electron环境直接使用API_URL
  if (isElectron) {
    return API_URL;
  }
  
  // 开发环境使用代理避免CORS问题
  if (import.meta.env.DEV) {
    return '/api'; // 使用vite代理
  }
  
  // 生产环境使用API_URL
  return API_URL;
};

// 创建专门用于 Dify API 的请求实例
const difyRequest = hookFetch.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  plugins: [
    difyAuthPlugin(),
    sseTextDecoderPlugin({ json: true, prefix: 'data:' })
  ],
});

// 发送对话消息（阻塞模式）
export function send_message(data: ChatMessagesRequest) {
  console.log('jxd 开始请求对话接口', data);

  return difyRequest.post<ChatMessagesResponse>('/chat-messages', data).json();
}

// 发送对话消息（流式模式）
export function send_message_stream(data: Omit<ChatMessagesRequest, 'response_mode'>) {
  console.log('jxd 开始请求流式对话接口', data);

  // 确保使用流式模式
  const requestData: ChatMessagesRequest = {
    ...data,
    response_mode: 'streaming' as const
  };

  // 使用 difyRequest 确保 Authorization header 正确
  return difyRequest.post('/chat-messages', requestData);
}

// 上传文件
export function upload_file(data: FileUploadRequest) {
  return difyRequest.post<FileUploadResponse>('/files/upload', data).json();
}

// 获取会话列表
export function get_conversations(params: ConversationsQueryParams) {
  return difyRequest.get<ConversationsResponse>('/conversations', params).json();
}

// 获取会话历史消息
export function get_conversation_messages(params: ConversationMessagesQueryParams) {
  return difyRequest.get<ConversationMessagesResponse>('/messages', params).json();
}

// 删除会话
export async function delete_conversation(conversation_id: string, data: DeleteConversationQueryParams): Promise<DeleteConversationResponse> {
  const userStore = useUserStore();
  
  // 根据环境选择baseURL
  const getBaseURL = () => {
    // 检测是否在Electron环境中
    const isElectron = window.navigator.userAgent.includes('Electron');
    
    // Electron环境直接使用API_URL
    if (isElectron) {
      return API_URL;
    }
    
    // 开发环境使用代理避免CORS问题
    if (import.meta.env.DEV) {
      return '/api'; // 使用vite代理
    }
    
    // 生产环境使用API_URL
    return API_URL;
  };

  const response = await fetch(`${getBaseURL()}/conversations/${conversation_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(userStore.token ? { 'Authorization': `Bearer ${userStore.token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// 重命名会话
export function rename_conversation(conversation_id: string, data: RenameConversationRequest) {
  return difyRequest.post<RenameConversationResponse>(`/conversations/${conversation_id}/name`, data).json();
}

// 更新会话（重命名会话的别名）
export function update_dify_session(conversation_id: string, data: RenameConversationRequest) {
  return difyRequest.post<RenameConversationResponse>(`/conversations/${conversation_id}/name`, data).json();
}

// 停止响应
export function stop_message(task_id: string, data: StopMessageRequest) {
  return difyRequest.post<StopMessageResponse>(`/chat-messages/${task_id}/stop`, data).json();
}
