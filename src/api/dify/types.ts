// Dify API 类型定义

// 发送对话消息请求
export interface ChatMessagesRequest {
  // 用户输入参数，包含多组键值对
  inputs: Record<string, any>;

  // 用户输入文本内容
  query: string;

  // 步骤
  step?: string;

  // 响应模式
  response_mode: 'streaming' | 'blocking';

  // 会话ID（选填）
  conversation_id?: string;

  // 用户标识，需保证唯一性
  user: string;

  // 文件列表（选填）
  files?: ChatMessageFile[];

  // 自动生成标题（选填，默认true）
  auto_generate_name?: boolean;
}

// 文件信息
export interface ChatMessageFile {
  // 传递方式
  transfer_method: 'local_file' | 'remote_url' | 'upload_file_id';

  // 文件类型
  type: 'document' | 'image' | 'audio' | 'video' | 'custom';

  // 文件URL或ID
  url?: string;
  upload_file_id?: string;
}

// 发送对话消息响应
export interface ChatMessagesResponse {
  code: number;
  data: {
    id: string;
    conversation_id: string;
    message_id: string;
    mode: 'chat';
    answer: string;
    metadata: {
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    };
    created_at: string;
  };
  message: string;
}

// 文件上传请求
export interface FileUploadRequest {
  // 要上传的文件
  file: File;

  // 用户标识
  user: string;
}

// 文件上传响应
export interface FileUploadResponse {
  code: number;
  data: {
    id: string;
    name: string;
    size: number;
    extension: string;
    mime_type: string;
    created_at: string;
    url: string;
  };
  message: string;
}

// 获取会话列表查询参数
export interface ConversationsQueryParams {
  // 用户标识
  user: string;

  // 当前页最后面一条记录的ID（选填）
  last_id?: string;

  // 一次请求返回多少条记录（选填，默认20，最大100，最小1）
  limit?: number;

  // 排序字段（选填，默认 -updated_at）
  sort_by?: string;
}

// 获取会话列表响应
export interface ConversationsResponse {
  has_more: boolean;
  limit: number;
  data: ConversationItem[];
}

// 会话项
export interface ConversationItem {
  id: string;
  name: string;
  inputs: Record<string, any>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// 获取会话历史消息查询参数
export interface ConversationMessagesQueryParams {
  // 会话ID
  conversation_id: string;

  // 用户标识
  user: string;

  // 当前页第一条聊天记录的ID（选填）
  first_id?: string;

  // 一次请求返回多少条记录（选填，默认20）
  limit?: number;
}

// 获取会话历史消息响应
export interface ConversationMessagesResponse {
  code: number;
  data: {
    has_more: boolean;
    limit: number;
    first_id?: string;
    data: ChatMessageItem[];
  };
  message: string;
}

// 聊天消息项
export interface ChatMessageItem {
  id: string;
  conversation_id: string;
  query: string;
  answer: string;
  message_files?: FileItem[];
  created_at: string;
  feedback?: 'like' | 'dislike' | null;
}

// 文件项
export interface FileItem {
  id: string;
  type: string;
  transfer_method: string;
  url: string;
}

// 删除会话查询参数
export interface DeleteConversationQueryParams {
  user: string;
}

// 删除会话响应
export interface DeleteConversationResponse {
  code: number;
  data: null;
  message: string;
}

// 重命名会话请求
export interface RenameConversationRequest {
  // 名称（选填）
  name?: string;

  // 自动生成标题（选填，默认false）
  auto_generate?: boolean;

  // 用户标识
  user: string;
}

// 重命名会话响应
export interface RenameConversationResponse {
  code: number;
  data: {
    id: string;
    name: string;
    created_at: string;
  };
  message: string;
}

// 停止响应请求
export interface StopMessageRequest {
  // 用户标识
  user: string;
}

// 停止响应响应
export interface StopMessageResponse {
  code: number;
  data: {
    result: string;
  };
  message: string;
}
