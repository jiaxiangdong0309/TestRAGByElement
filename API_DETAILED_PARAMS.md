# Dify工作流API接口详细参数文档

## 接口概览

本文档详细描述了Dify工作流编排对话型应用的20个API接口，包含完整的TypeScript类型定义、参数结构、响应格式和SSE流式响应格式。

### 基础信息
- **基础URL**: `http://dify-contest.hewa.cn/v1`
- **认证方式**: `Authorization: Bearer {API_KEY}`
- **响应格式**: 统一JSON格式，code为0表示成功

## 1. 发送对话消息

### 接口信息
- **路径**: `POST /chat-messages`
- **功能**: 发送对话消息，支持流式和阻塞两种响应模式

### 请求参数

```typescript
interface ChatMessagesRequest {
  // 用户输入参数，包含多组键值对
  inputs: Record<string, any>;
  
  // 用户输入文本内容
  query: string;
  
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

interface ChatMessageFile {
  // 传递方式
  transfer_method: 'local_file' | 'remote_url' | 'upload_file_id';
  
  // 文件类型
  type: 'document' | 'image' | 'audio' | 'video' | 'custom';
  
  // 文件URL或ID
  url?: string;
  upload_file_id?: string;
}
```

### 响应参数

#### Blocking模式响应
```typescript
interface ChatMessagesResponse {
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
```

#### SSE流式响应格式
```
data: {"event": "message", "message_id": "string", "conversation_id": "string", "mode": "chat", "answer": "partial content", "created_at": "2024-01-01T00:00:00Z"}

data: {"event": "message_file", "message_id": "string", "conversation_id": "string", "mode": "chat", "answer": "content", "created_at": "2024-01-01T00:00:00Z"}

data: {"event": "message_replace", "message_id": "string", "conversation_id": "string", "mode": "chat", "answer": "replaced content", "created_at": "2024-01-01T00:00:00Z"}

data: {"event": "tts_message", "message_id": "string", "conversation_id": "string", "mode": "chat", "audio": "base64_encoded_audio", "created_at": "2024-01-01T00:00:00Z"}

data: {"event": "message_end", "message_id": "string", "conversation_id": "string", "metadata": {"usage": {"prompt_tokens": 150, "completion_tokens": 80, "total_tokens": 230}}, "created_at": "2024-01-01T00:00:00Z"}

data: [DONE]
```

### 错误码
- `400 invalid_param`: 传入参数异常

## 2. 上传文件

### 接口信息
- **路径**: `POST /files/upload`
- **功能**: 上传文件并在发送消息时使用
- **请求方式**: `multipart/form-data`

### 请求参数
```typescript
interface FileUploadRequest {
  // 要上传的文件
  file: File;
  
  // 用户标识
  user: string;
}
```

### 响应参数
```typescript
interface FileUploadResponse {
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
```

### 错误码
- `413 file_too_large`: 文件过大
- `415 unsupported_file_type`: 不支持的文件类型
- `500 provider_not_support_upload_file`: 模型供应商不支持文件上传
- `500 upload_file_count_exceeded`: 上传文件数量超过限制
- `503 s3_permission_denied`: 无权限上传文件到S3

## 3. 停止响应

### 接口信息
- **路径**: `POST /chat-messages/:task_id/stop`
- **功能**: 停止正在进行的响应

### 路径参数
```typescript
interface StopResponsePathParams {
  task_id: string;
}
```

### 请求参数
```typescript
interface StopResponseRequest {
  user: string;
}
```

### 响应参数
```typescript
interface StopResponseResponse {
  code: number;
  data: null;
  message: string;
}
```

## 4. 消息反馈（点赞）

### 接口信息
- **路径**: `POST /messages/:message_id/feedbacks`
- **功能**: 消息终端用户反馈、点赞

### 路径参数
```typescript
interface MessageFeedbackPathParams {
  message_id: string;
}
```

### 请求参数
```typescript
interface MessageFeedbackRequest {
  // 点赞 like, 点踩 dislike, 撤销点赞 null
  rating: 'like' | 'dislike' | null;
  
  // 用户标识
  user: string;
  
  // 消息反馈的具体信息
  content?: string;
}
```

### 响应参数
```typescript
interface MessageFeedbackResponse {
  code: number;
  data: null;
  message: string;
}
```

## 5. 获取下一轮建议问题列表

### 接口信息
- **路径**: `GET /messages/:message_id/suggested`
- **功能**: 获取下一轮建议问题列表

### 路径参数
```typescript
interface SuggestedQuestionsPathParams {
  message_id: string;
}
```

### 查询参数
```typescript
interface SuggestedQuestionsQueryParams {
  user: string;
}
```

### 响应参数
```typescript
interface SuggestedQuestionsResponse {
  code: number;
  data: string[];
  message: string;
}
```

## 6. 获取会话历史消息

### 接口信息
- **路径**: `GET /messages`
- **功能**: 滚动加载形式返回历史聊天记录

### 查询参数
```typescript
interface ConversationMessagesQueryParams {
  // 会话ID
  conversation_id: string;
  
  // 用户标识
  user: string;
  
  // 当前页第一条聊天记录的ID（选填）
  first_id?: string;
  
  // 一次请求返回多少条记录（选填，默认20）
  limit?: number;
}
```

### 响应参数
```typescript
interface ConversationMessagesResponse {
  code: number;
  data: {
    has_more: boolean;
    limit: number;
    first_id?: string;
    data: ChatMessageItem[];
  };
  message: string;
}

interface ChatMessageItem {
  id: string;
  conversation_id: string;
  query: string;
  answer: string;
  message_files?: FileItem[];
  created_at: string;
  feedback?: 'like' | 'dislike' | null;
}

interface FileItem {
  id: string;
  type: string;
  transfer_method: string;
  url: string;
}
```

## 7. 获取会话列表

### 接口信息
- **路径**: `GET /conversations`
- **功能**: 获取当前用户的会话列表

### 查询参数
```typescript
interface ConversationsQueryParams {
  // 用户标识
  user: string;
  
  // 当前页最后面一条记录的ID（选填）
  last_id?: string;
  
  // 一次请求返回多少条记录（选填，默认20，最大100，最小1）
  limit?: number;
  
  // 排序字段（选填，默认 -updated_at）
  sort_by?: string;
}
```

### 响应参数
```typescript
interface ConversationsResponse {
  code: number;
  data: {
    has_more: boolean;
    limit: number;
    data: ConversationItem[];
  };
  message: string;
}

interface ConversationItem {
  id: string;
  name: string;
  inputs: Record<string, any>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
```

## 8. 删除会话

### 接口信息
- **路径**: `DELETE /conversations/:conversation_id`
- **功能**: 删除会话

### 路径参数
```typescript
interface DeleteConversationPathParams {
  conversation_id: string;
}
```

### 查询参数
```typescript
interface DeleteConversationQueryParams {
  user: string;
}
```

### 响应参数
```typescript
interface DeleteConversationResponse {
  code: number;
  data: null;
  message: string;
}
```

## 9. 会话重命名

### 接口信息
- **路径**: `POST /conversations/:conversation_id/name`
- **功能**: 会话重命名

### 路径参数
```typescript
interface RenameConversationPathParams {
  conversation_id: string;
}
```

### 请求参数
```typescript
interface RenameConversationRequest {
  // 名称（选填）
  name?: string;
  
  // 自动生成标题（选填，默认false）
  auto_generate?: boolean;
  
  // 用户标识
  user: string;
}
```

### 响应参数
```typescript
interface RenameConversationResponse {
  code: number;
  data: {
    id: string;
    name: string;
    created_at: string;
  };
  message: string;
}
```

## 10. 语音转文字

### 接口信息
- **路径**: `POST /audio-to-text`
- **功能**: 语音转文字
- **请求方式**: `multipart/form-data`

### 请求参数
```typescript
interface AudioToTextRequest {
  // 要转换的音频文件
  file: File;
  
  // 用户标识
  user: string;
}
```

### 响应参数
```typescript
interface AudioToTextResponse {
  code: number;
  data: {
    text: string;
  };
  message: string;
}
```

## 11. 文字转语音

### 接口信息
- **路径**: `POST /text-to-audio`
- **功能**: 文字转语音

### 请求参数
```typescript
interface TextToAudioRequest {
  // 消息ID（优先使用）
  message_id?: string;
  
  // 语音生成内容
  text?: string;
  
  // 用户标识
  user: string;
}
```

### 响应参数
```typescript
interface TextToAudioResponse {
  code: number;
  data: {
    audio_file: string; // base64编码的音频文件
    content_type: string; // 音频文件类型
  };
  message: string;
}
```

## 12. 获取应用基本信息

### 接口信息
- **路径**: `GET /info`
- **功能**: 获取应用基本信息

### 查询参数
```typescript
interface AppInfoQueryParams {
  user: string;
}
```

### 响应参数
```typescript
interface AppInfoResponse {
  code: number;
  data: {
    app_id: string;
    name: string;
    description: string;
    icon: string;
    icon_background: string;
    mode: 'chat' | 'workflow';
    enable_site: boolean;
    enable_api: boolean;
    api_rpm: number;
    api_rph: number;
    created_at: string;
  };
  message: string;
}
```

## 13. 获取应用参数

### 接口信息
- **路径**: `GET /parameters`
- **功能**: 获取功能开关、输入参数名称、类型及默认值等

### 查询参数
```typescript
interface AppParametersQueryParams {
  user: string;
}
```

### 响应参数
```typescript
interface AppParametersResponse {
  code: number;
  data: {
    // 用户输入表单
    user_input_form: UserInputFormItem[];
    
    // 系统参数
    system_parameters: Record<string, any>;
    
    // 文件上传配置
    file_upload: {
      image: {
        enabled: boolean;
        supported_types: string[];
        supported_mime_types: string[];
      };
    };
  };
  message: string;
}

interface UserInputFormItem {
  // 参数名称
  name: string;
  
  // 显示名称
  label: string;
  
  // 类型
  type: 'text' | 'number' | 'select' | 'textarea';
  
  // 是否必填
  required: boolean;
  
  // 默认值
  default?: any;
  
  // 选项（当类型为select时）
  options?: Array<{
    label: string;
    value: any;
  }>;
}
```

## 14. 获取应用Meta信息

### 授口信息
- **路径**: `GET /meta`
- **功能**: 获取应用Meta信息

### 查询参数
```typescript
interface AppMetaQueryParams {
  user: string;
}
```

### 响应参数
```typescript
interface AppMetaResponse {
  code: number;
  data: {
    // 功能特性
    features: {
      opening_statement: boolean;
      suggested_questions: boolean;
      text_to_speech: boolean;
      speech_to_text: boolean;
      moderation: boolean;
    };
    
    // 配置参数
    parameters: {
      // 可配置参数
      configurable_params: ConfigurableParam[];
    };
  };
  message: string;
}

interface ConfigurableParam {
  name: string;
  type: string;
  label: string;
  required: boolean;
  default?: any;
}
```

## 15. 获取标注列表

### 接口信息
- **路径**: `GET /annotations`
- **功能**: 获取标注列表

### 查询参数
```typescript
interface AnnotationsQueryParams {
  conversation_id: string;
  user: string;
}
```

### 响应参数
```typescript
interface AnnotationsResponse {
  code: number;
  data: AnnotationItem[];
  message: string;
}

interface AnnotationItem {
  id: string;
  conversation_id: string;
  message_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

## 16. 创建标注

### 接口信息
- **路径**: `POST /annotations`
- **功能**: 创建标注

### 请求参数
```typescript
interface CreateAnnotationRequest {
  conversation_id: string;
  message_id: string;
  content: string;
  user: string;
}
```

### 响应参数
```typescript
interface CreateAnnotationResponse {
  code: number;
  data: {
    id: string;
    conversation_id: string;
    message_id: string;
    content: string;
    created_at: string;
  };
  message: string;
}
```

## 17. 更新标注

### 接口信息
- **路径**: `PUT /annotations/:annotation_id`
- **功能**: 更新标注

### 路径参数
```typescript
interface UpdateAnnotationPathParams {
  annotation_id: string;
}
```

### 请求参数
```typescript
interface UpdateAnnotationRequest {
  content: string;
  user: string;
}
```

### 响应参数
```typescript
interface UpdateAnnotationResponse {
  code: number;
  data: {
    id: string;
    content: string;
    updated_at: string;
  };
  message: string;
}
```

## 18. 删除标注

### 接口信息
- **路径**: `DELETE /annotations/:annotation_id`
- **功能**: 删除标注

### 路径参数
```typescript
interface DeleteAnnotationPathParams {
  annotation_id: string;
}
```

### 查询参数
```typescript
interface DeleteAnnotationQueryParams {
  user: string;
}
```

### 响应参数
```typescript
interface DeleteAnnotationResponse {
  code: number;
  data: null;
  message: string;
}
```

## 19. 标注回复初始设置

### 接口信息
- **路径**: `POST /annotation-reply/config`
- **功能**: 标注回复初始设置

### 请求参数
```typescript
interface AnnotationReplyConfigRequest {
  annotation_reply_config: {
    enabled: boolean;
    score_threshold?: number;
    max_results?: number;
  };
  user: string;
}
```

### 响应参数
```typescript
interface AnnotationReplyConfigResponse {
  code: number;
  data: {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
  message: string;
}
```

## 20. 查询标注回复初始设置任务状态

### 接口信息
- **路径**: `GET /annotation-reply/config/job/:job_id`
- **功能**: 查询标注回复初始设置任务状态

### 路径参数
```typescript
interface AnnotationReplyJobStatusPathParams {
  job_id: string;
}
```

### 查询参数
```typescript
interface AnnotationReplyJobStatusQueryParams {
  user: string;
}
```

### 响应参数
```typescript
interface AnnotationReplyJobStatusResponse {
  code: number;
  data: {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    error?: string;
    created_at: string;
    updated_at: string;
  };
  message: string;
}
```

## 通用响应格式

### 成功响应
```typescript
interface SuccessResponse<T = any> {
  code: 0;
  data: T;
  message: 'success';
}
```

### 错误响应
```typescript
interface ErrorResponse {
  code: number; // 非0值
  message: string;
  data?: any;
}
```

## SSE流式响应详细格式

### 事件类型详解

#### 1. message事件
```typescript
interface SSEMessageEvent {
  event: 'message';
  message_id: string;
  conversation_id: string;
  mode: 'chat' | 'workflow';
  answer: string; // 部分或完整回复内容
  created_at: string;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}
```

#### 2. message_file事件
```typescript
interface SSEMessageFileEvent {
  event: 'message_file';
  message_id: string;
  conversation_id: string;
  mode: 'chat' | 'workflow';
  answer: string;
  message_files: FileItem[];
  created_at: string;
}
```

#### 3. message_replace事件
```typescript
interface SSEMessageReplaceEvent {
  event: 'message_replace';
  message_id: string;
  conversation_id: string;
  mode: 'chat' | 'workflow';
  answer: string; // 替换后的内容
  created_at: string;
}
```

#### 4. tts_message事件
```typescript
interface SSETtsMessageEvent {
  event: 'tts_message';
  message_id: string;
  conversation_id: string;
  mode: 'chat' | 'workflow';
  audio: string; // base64编码的MP3音频
  created_at: string;
}
```

#### 5. error事件
```typescript
interface SSEErrorEvent {
  event: 'error';
  message_id?: string;
  conversation_id?: string;
  data: {
    code: string;
    message: string;
  };
  created_at: string;
}
```

#### 6. message_end事件
```typescript
interface SSEMessageEndEvent {
  event: 'message_end';
  message_id: string;
  conversation_id: string;
  metadata: {
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  created_at: string;
}
```

#### 7. workflow_finished事件
```typescript
interface SSEWorkflowFinishedEvent {
  event: 'workflow_finished';
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    workflow_run_id: string;
    status: 'succeeded' | 'failed';
    outputs: Record<string, any>;
    error?: {
      code: string;
      message: string;
    };
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: string;
    finished_at: string;
  };
}
```

#### 8. node_finished事件
```typescript
interface SSENodeFinishedEvent {
  event: 'node_finished';
  task_id: string;
  workflow_run_id: string;
  data: {
    node_id: string;
    node_type: string;
    title: string;
    index: number;
    predecessor_node_id?: string;
    inputs: Record<string, any>;
    process_data: Record<string, any>;
    outputs: Record<string, any>;
    status: 'succeeded' | 'failed';
    error?: {
      code: string;
      message: string;
    };
    elapsed_time: number;
    execution_metadata: {
      total_tokens: number;
      total_steps: number;
    };
    created_at: string;
    finished_at: string;
  };
}
```

#### 9. workflow_started事件
```typescript
interface SSEWorkflowStartedEvent {
  event: 'workflow_started';
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    workflow_run_id: string;
    status: 'running';
    created_at: string;
  };
}
```

#### 10. message_chunk事件
```typescript
interface SSEMessageChunkEvent {
  event: 'message_chunk';
  message_id: string;
  conversation_id: string;
  chunk_id: string;
  content: string;
  created_at: string;
}
```

#### 11. ping事件
```typescript
interface SSEPingEvent {
  event: 'ping';
  timestamp: string;
}
```

## 文件类型支持

### 文档类型 (document)
- **格式**: TXT, MD, MARKDOWN, PDF, HTML, XLSX, XLS, DOCX, CSV, EML, MSG, PPTX, PPT, XML, EPUB

### 图片类型 (image)
- **格式**: JPG, JPEG, PNG, GIF, WEBP, SVG

### 音频类型 (audio)
- **格式**: MP3, M4A, WAV, WEBM, AMR

### 视频类型 (video)
- **格式**: MP4, MOV, MPEG, MPGA

### 自定义类型 (custom)
- **格式**: 其他文件类型

## 注意事项

1. **API Key安全**: 务必在后端存储API Key，不要在前端暴露
2. **用户标识**: 确保user参数在同一应用内唯一
3. **流式响应**: 推荐使用streaming模式获得更好的用户体验
4. **文件上传**: 注意文件大小和类型限制
5. **会话管理**: 合理使用会话ID来维护对话上下文
6. **错误处理**: 建议实现完整的错误处理机制
7. **SSE连接**: 流式响应需要保持SSE连接稳定
8. **并发控制**: 注意API调用频率限制

## 最佳实践

### 1. 请求优化
- 使用连接池管理HTTP连接
- 合理设置超时时间
- 批量处理请求

### 2. 错误处理
- 实现重试机制
- 记录错误日志
- 用户友好的错误提示

### 3. 性能优化
- 缓存常用数据
- 懒加载非必要资源
- 压缩传输数据

### 4. 安全考虑
- 使用HTTPS加密传输
- 实现请求频率限制
- 验证用户权限

本文档提供了Dify工作流API的完整接口规范，包含所有20个接口的详细参数定义、响应格式和SSE流式响应格式。