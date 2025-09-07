# Dify API 接口文档

## 基础信息

- **基础URL**: `http://dify-contest.hewa.cn/v1`

## 鉴权方式

Service API 使用 `API-Key` 进行鉴权。为了安全起见，建议开发者将 `API-Key` 存储在后端，避免在客户端或公开分享，以防止 `API-Key` 泄露导致财产损失。

### 鉴权方式说明

- **请求头**：`Authorization`
- **格式**：`Bearer {API_KEY}`
- **示例**：
  ```http
  Authorization: Bearer your_api_key_here
  ```

---

## 接口列表

### 1. 发送对话消息

#### 接口信息
- **接口地址**: `/chat-messages`
- **请求方式**: `POST`
- **接口描述**: 创建会话消息，支持流式和阻塞两种响应模式

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| query | string | 是 | 用户输入/提问内容 |
| inputs | object | 否 | 允许传入 App 定义的各变量值。inputs 参数包含了多组键值对（Key/Value pairs），每组的键对应一个特定变量，每组的值则是该变量的具体值。如果变量是文件类型，请指定一个包含以下 files 中所述键的对象。默认 {} |
| response_mode | string | 是 | 响应模式：<br/>- `streaming`: 流式模式（推荐）。基于 SSE（Server-Sent Events）实现类似打字机输出方式的流式返回<br/>- `blocking`: 阻塞模式，等待执行完毕后返回结果。（请求若流程较长可能会被中断）。由于 Cloudflare 限制，请求会在 100 秒超时无返回后中断 |
| user | string | 是 | 用户标识，用于定义终端用户的身份，方便检索、统计。由开发者定义规则，需保证用户标识在应用内唯一 |
| conversation_id | string | 否 | 会话 ID，需要基于之前的聊天记录继续对话，必须传之前消息的 conversation_id |
| files | array[object] | 否 | 文件列表，适用于传入文件结合文本理解并回答问题，仅当模型支持 Vision 能力时可用 |
| auto_generate_name | bool | 否 | 自动生成标题，默认 true。若设置为 false，则可通过调用会话重命名接口并设置 auto_generate 为 true 实现异步生成标题 |

#### files 参数详细说明

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| type | string | 是 | 支持类型：<br/>- `document`: 文档类型（TXT, MD, MARKDOWN, PDF, HTML, XLSX, XLS, DOCX, CSV, EML, MSG, PPTX, PPT, XML, EPUB）<br/>- `image`: 图片类型（JPG, JPEG, PNG, GIF, WEBP, SVG）<br/>- `audio`: 音频类型（MP3, M4A, WAV, WEBM, AMR）<br/>- `video`: 视频类型（MP4, MOV, MPEG, MPGA）<br/>- `custom`: 其他文件类型 |
| transfer_method | string | 是 | 传递方式：<br/>- `remote_url`: 图片地址<br/>- `local_file`: 上传文件 |
| url | string | 否 | 图片地址。（仅当传递方式为 remote_url 时） |
| upload_file_id | string | 否 | 上传文件 ID。（仅当传递方式为 local_file 时） |

#### 响应参数

##### 阻塞模式响应 (response_mode: blocking)

返回 `ChatCompletionResponse` 对象，Content-Type 为 `application/json`

| 参数名 | 类型 | 描述 |
|--------|------|------|
| event | string | 事件类型，固定为 message |
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| id | string | 唯一ID |
| message_id | string | 消息唯一 ID |
| conversation_id | string | 会话 ID |
| mode | string | App 模式，固定为 chat |
| answer | string | 完整回复内容 |
| metadata | object | 元数据 |
| usage | Usage | 模型用量信息 |
| retriever_resources | array[RetrieverResource] | 引用和归属分段列表 |
| created_at | int | 消息创建时间戳，如：1705395332 |

##### 流式模式响应 (response_mode: streaming) - SSE接口

返回 `ChunkChatCompletionResponse` 流式序列，Content-Type 为 `text/event-stream`

**SSE 数据格式说明**：
- 每个流式块均为 `data:` 开头
- 块之间以 `\n\n` 即两个换行符分隔
- 示例：`data: {"event": "message", "task_id": "900bbd43-dc0b-4383-a372-aa6e6c414227", "id": "663c5084-a254-4040-8ad3-51f2a3c1a77c", "answer": "Hi", "created_at": 1705398420}\n\n`

**流式事件类型**：

###### 1. message 事件
LLM 返回文本块事件，即：完整的文本以分块的方式输出

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| message_id | string | 消息唯一 ID |
| conversation_id | string | 会话 ID |
| answer | string | LLM 返回文本块内容 |
| created_at | int | 创建时间戳，如：1705395332 |

###### 2. message_file 事件
文件事件，表示有新文件需要展示

| 参数名 | 类型 | 描述 |
|--------|------|------|
| id | string | 文件唯一ID |
| type | string | 文件类型，目前仅为image |
| belongs_to | string | 文件归属，user或assistant，该接口返回仅为 assistant |
| url | string | 文件访问地址 |
| conversation_id | string | 会话ID |

###### 3. message_end 事件
消息结束事件，收到此事件则代表流式返回结束

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| message_id | string | 消息唯一 ID |
| conversation_id | string | 会话 ID |
| metadata | object | 元数据 |
| usage | Usage | 模型用量信息 |
| retriever_resources | array[RetrieverResource] | 引用和归属分段列表 |

###### 4. tts_message 事件
TTS 音频流事件，即：语音合成输出。内容是Mp3格式的音频块，使用 base64 编码后的字符串，播放的时候直接解码即可。(开启自动播放才有此消息)

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| message_id | string | 消息唯一 ID |
| audio | string | 语音合成之后的音频块使用 Base64 编码之后的文本内容，播放的时候直接 base64 解码送入播放器即可 |
| created_at | int | 创建时间戳，如：1705395332 |

###### 5. tts_message_end 事件
TTS 音频流结束事件，收到这个事件表示音频流返回结束

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| message_id | string | 消息唯一 ID |
| audio | string | 结束事件是没有音频的，所以这里是空字符串 |
| created_at | int | 创建时间戳，如：1705395332 |

###### 6. message_replace 事件
消息内容替换事件。开启内容审查和审查输出内容时，若命中了审查条件，则会通过此事件替换消息内容为预设回复

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| message_id | string | 消息唯一 ID |
| conversation_id | string | 会话 ID |
| answer | string | 替换内容（直接替换 LLM 所有回复文本） |
| created_at | int | 创建时间戳，如：1705395332 |

###### 7. workflow_started 事件
workflow 开始执行

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| workflow_run_id | string | workflow 执行 ID |
| event | string | 固定为 workflow_started |
| data | object | 详细内容，包含：<br/>- id: workflow 执行 ID<br/>- workflow_id: 关联 Workflow ID<br/>- sequence_number: 自增序号，App 内自增，从 1 开始<br/>- created_at: 开始时间 |

###### 8. node_started 事件
node 开始执行

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| workflow_run_id | string | workflow 执行 ID |
| event | string | 固定为 node_started |
| data | object | 详细内容，包含：<br/>- id: workflow 执行 ID<br/>- node_id: 节点 ID<br/>- node_type: 节点类型<br/>- title: 节点名称<br/>- index: 执行序号，用于展示 Tracing Node 顺序<br/>- predecessor_node_id: 前置节点 ID，用于画布展示执行路径<br/>- inputs: 节点中所有使用到的前置节点变量内容<br/>- created_at: 开始时间 |

###### 9. node_finished 事件
node 执行结束，成功失败同一事件中不同状态

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| workflow_run_id | string | workflow 执行 ID |
| event | string | 固定为 node_finished |
| data | object | 详细内容，包含：<br/>- id: node 执行 ID<br/>- node_id: 节点 ID<br/>- index: 执行序号，用于展示 Tracing Node 顺序<br/>- predecessor_node_id: 前置节点 ID，用于画布展示执行路径<br/>- inputs: 节点中所有使用到的前置节点变量内容<br/>- process_data: 节点过程数据<br/>- outputs: 输出内容<br/>- status: 执行状态 running / succeeded / failed / stopped<br/>- error: 错误原因<br/>- elapsed_time: 耗时(s)<br/>- execution_metadata: 元数据<br/>- total_tokens: 总使用 tokens<br/>- total_price: 总费用<br/>- currency: 货币，如 USD / RMB<br/>- created_at: 开始时间 |

###### 10. workflow_finished 事件
workflow 执行结束，成功失败同一事件中不同状态

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| workflow_run_id | string | workflow 执行 ID |
| event | string | 固定为 workflow_finished |
| data | object | 详细内容，包含：<br/>- id: workflow 执行 ID<br/>- workflow_id: 关联 Workflow ID<br/>- status: 执行状态 running / succeeded / failed / stopped<br/>- outputs: 输出内容<br/>- error: 错误原因<br/>- elapsed_time: 耗时(s)<br/>- total_tokens: 总使用 tokens<br/>- total_steps: 总步数（冗余），默认 0<br/>- created_at: 开始时间<br/>- finished_at: 结束时间 |

###### 11. error 事件
流式输出过程中出现的异常会以 stream event 形式输出，收到异常事件后即结束

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task_id | string | 任务 ID，用于请求跟踪和下方的停止响应接口 |
| message_id | string | 消息唯一 ID |
| status | int | HTTP 状态码 |
| code | string | 错误码 |
| message | string | 错误消息 |

###### 12. ping 事件
每 10s 一次的 ping 事件，保持连接存活

#### SSE 使用示例

**JavaScript 前端接收 SSE 数据示例**：

```javascript
// 建立 SSE 连接
const eventSource = new EventSource('/v1/chat-messages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: '你好',
    response_mode: 'streaming',
    user: 'user123'
  })
});

// 监听不同类型的事件
eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);

  switch(data.event) {
    case 'message':
      // 处理文本块
      console.log('收到文本块:', data.answer);
      break;
    case 'message_end':
      // 消息结束
      console.log('消息结束');
      eventSource.close();
      break;
    case 'error':
      // 处理错误
      console.error('错误:', data.message);
      eventSource.close();
      break;
    case 'ping':
      // 保持连接
      console.log('ping');
      break;
  }
};

// 错误处理
eventSource.onerror = function(event) {
  console.error('SSE 连接错误:', event);
  eventSource.close();
};
```

#### 错误码说明

| HTTP状态码 | 错误码 | 描述 |
|------------|--------|------|
| 404 | - | 对话不存在 |
| 400 | invalid_param | 传入参数异常 |
| 400 | app_unavailable | App 配置不可用 |
| 400 | provider_not_initialize | 无可用模型凭据配置 |
| 400 | provider_quota_exceeded | 模型调用额度不足 |
| 400 | model_currently_not_support | 当前模型不可用 |
| 400 | completion_request_error | 文本生成失败 |
| 500 | - | 服务内部异常 |

#### 请求示例

```bash
curl -X POST "http://dify-contest.hewa.cn/v1/chat-messages" \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "你好，请介绍一下自己",
    "response_mode": "streaming",
    "user": "user123",
    "conversation_id": "optional_conversation_id"
  }'
```

---

### 2. 上传文件

#### 接口信息
- **接口地址**: `/files/upload`
- **请求方式**: `POST`
- **接口描述**: 上传文件并在发送消息时使用，可实现图文多模态理解。支持您的应用程序所支持的所有格式。上传的文件仅供当前终端用户使用

#### 请求参数

**Content-Type**: `multipart/form-data`

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| file | file | 是 | 要上传的文件 |
| user | string | 是 | 用户标识，用于定义终端用户的身份，必须和发送消息接口传入 user 保持一致 |

#### 响应参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| id | uuid | 文件ID |
| name | string | 文件名 |
| size | int | 文件大小（byte） |
| extension | string | 文件后缀 |
| mime_type | string | 文件 mime-type |
| created_by | uuid | 上传人 ID |
| created_at | timestamp | 上传时间 |

#### 错误码说明

| HTTP状态码 | 错误码 | 描述 |
|------------|--------|------|
| 400 | no_file_uploaded | 必须提供文件 |
| 400 | too_many_files | 目前只接受一个文件 |
| 400 | unsupported_preview | 该文件不支持预览 |
| 400 | unsupported_estimate | 该文件不支持估算 |
| 413 | file_too_large | 文件太大 |
| 415 | unsupported_file_type | 不支持的扩展名，当前只接受文档类文件 |
| 503 | s3_connection_failed | 无法连接到 S3 服务 |
| 503 | s3_permission_denied | 无权限上传文件到 S3 |
| 503 | s3_file_too_large | 文件超出 S3 大小限制 |

#### 请求示例

```bash
curl -X POST 'http://dify-contest.hewa.cn/v1/files/upload' \
  --header 'Authorization: Bearer {api_key}' \
  --form 'file=@localfile;type=image/[png|jpeg|jpg|webp|gif]' \
  --form 'user=abc-123'
```

#### 响应示例

```json
{
  "id": "72fa9618-8f89-4a37-9b33-7e1178a24a67",
  "name": "example.png",
  "size": 1024,
  "extension": "png",
  "mime_type": "image/png",
  "created_by": 123,
  "created_at": 1577836800
}
```

---

### 3. 停止响应

#### 接口信息
- **接口地址**: `/chat-messages/:task_id/stop`
- **请求方式**: `POST`
- **接口描述**: 停止流式响应，仅支持流式模式

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| task_id | string | 是 | 任务 ID，可在流式返回 Chunk 中获取 |

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| user | string | 是 | 用户标识，用于定义终端用户的身份，必须和发送消息接口传入 user 保持一致 |

#### 响应参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| result | string | 固定返回 success |

#### 请求示例

```bash
curl -X POST 'http://dify-contest.hewa.cn/v1/chat-messages/:task_id/stop' \
  -H 'Authorization: Bearer {api_key}' \
  -H 'Content-Type: application/json' \
  --data-raw '{ "user": "abc-123"}'
```

#### 响应示例

```json
{
  "result": "success"
}
```

---

### 4. 消息反馈（点赞）

#### 接口信息
- **接口地址**: `/messages/:message_id/feedbacks`
- **请求方式**: `POST`
- **接口描述**: 消息终端用户反馈、点赞，方便应用开发者优化输出预期

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| message_id | string | 是 | 消息 ID |

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| rating | string | 是 | 点赞 like, 点踩 dislike, 撤销点赞 null |
| user | string | 是 | 用户标识，由开发者定义规则，需保证用户标识在应用内唯一 |
| content | string | 否 | 消息反馈的具体信息 |

#### 响应参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| result | string | 固定返回 success |

#### 请求示例

```bash
curl -X POST 'http://dify-contest.hewa.cn/v1/messages/:message_id/feedbacks' \
  --header 'Authorization: Bearer {api_key}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "rating": "like",
    "user": "abc-123",
    "content": "message feedback information"
  }'
```

#### 响应示例

```json
{
  "result": "success"
}
```

---

### 5. 获取下一轮建议问题列表

#### 接口信息
- **接口地址**: `/messages/{message_id}/suggested`
- **请求方式**: `GET`
- **接口描述**: 获取下一轮建议问题列表

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| message_id | string | 是 | Message ID |

#### 查询参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| user | string | 是 | 用户标识，由开发者定义规则，需保证用户标识在应用内唯一 |

#### 响应参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| result | string | 固定返回 success |
| data | array[string] | 建议问题列表 |

#### 请求示例

```bash
curl --location --request GET 'http://dify-contest.hewa.cn/v1/messages/{message_id}/suggested?user=abc-123' \
  --header 'Authorization: Bearer ENTER-YOUR-SECRET-KEY' \
  --header 'Content-Type: application/json'
```

#### 响应示例

```json
{
  "result": "success",
  "data": [
    "a",
    "b",
    "c"
  ]
}
```

---

### 6. 获取会话历史消息

#### 接口信息
- **接口地址**: `/messages`
- **请求方式**: `GET`
- **接口描述**: 滚动加载形式返回历史聊天记录，第一页返回最新 limit 条，即：倒序返回

#### 查询参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| conversation_id | string | 是 | 会话 ID |
| user | string | 是 | 用户标识，由开发者定义规则，需保证用户标识在应用内唯一 |
| first_id | string | 否 | 当前页第一条聊天记录的 ID，默认 null |
| limit | int | 否 | 一次请求返回多少条聊天记录，默认 20 条 |

#### 响应参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| data | array[object] | 消息列表 |
| has_more | bool | 是否存在下一页 |
| limit | int | 返回条数，若传入超过系统限制，返回系统限制数量 |

#### data 数组中每个消息对象包含：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| id | string | 消息 ID |
| conversation_id | string | 会话 ID |
| inputs | object | 用户输入参数 |
| query | string | 用户输入 / 提问内容 |
| message_files | array[object] | 消息文件 |
| answer | string | 回答消息内容 |
| created_at | timestamp | 创建时间 |
| feedback | object | 反馈信息 |
| retriever_resources | array[RetrieverResource] | 引用和归属分段列表 |

#### message_files 数组中每个文件对象包含：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| id | string | 文件ID |
| type | string | 文件类型，image 图片 |
| url | string | 预览图片地址 |
| belongs_to | string | 文件归属方，user 或 assistant |

#### feedback 对象包含：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| rating | string | 点赞 like / 点踩 dislike |

#### 请求示例

```bash
curl -X GET 'http://dify-contest.hewa.cn/v1/messages?user=abc-123&conversation_id=' \
  --header 'Authorization: Bearer {api_key}'
```

#### 响应示例

```json
{
  "limit": 20,
  "has_more": false,
  "data": [
    {
      "id": "a076a87f-31e5-48dc-b452-0061adbbc922",
      "conversation_id": "cd78daf6-f9e4-4463-9ff2-54257230a0ce",
      "inputs": {
        "name": "dify"
      },
      "query": "iphone 13 pro",
      "answer": "The iPhone 13 Pro, released on September 24, 2021, features a 6.1-inch display with a resolution of 1170 x 2532. It is equipped with a Hexa-core (2x3.23 GHz Avalanche + 4x1.82 GHz Blizzard) processor, 6 GB of RAM, and offers storage options of 128 GB, 256 GB, 512 GB, and 1 TB. The camera is 12 MP, the battery capacity is 3095 mAh, and it runs on iOS 15.",
      "message_files": [],
      "feedback": null,
      "retriever_resources": [
        {
          "position": 1,
          "dataset_id": "101b4c97-fc2e-463c-90b1-5261a4cdcafb",
          "dataset_name": "iPhone",
          "document_id": "8dd1ad74-0b5f-4175-b735-7d98bbbb4e00",
          "document_name": "iPhone List",
          "segment_id": "ed599c7f-2766-4294-9d1d-e5235a61270a",
          "score": 0.98457545,
          "content": "\"Model\",\"Release Date\",\"Display Size\",\"Resolution\",\"Processor\",\"RAM\",\"Storage\",\"Camera\",\"Battery\",\"Operating System\"\n\"iPhone 13 Pro Max\",\"September 24, 2021\",\"6.7 inch\",\"1284 x 2778\",\"Hexa-core (2x3.23 GHz Avalanche + 4x1.82 GHz Blizzard)\",\"6 GB\",\"128, 256, 512 GB, 1TB\",\"12 MP\",\"4352 mAh\",\"iOS 15\""
        }
      ],
      "created_at": 1705569239
    }
  ]
}
```

#### 智能助手响应示例（包含生成的文件）

```json
{
  "limit": 20,
  "has_more": false,
  "data": [
    {
      "id": "d35e006c-7c4d-458f-9142-be4930abdf94",
      "conversation_id": "957c068b-f258-4f89-ba10-6e8a0361c457",
      "inputs": {},
      "query": "draw a cat",
      "answer": "I have generated an image of a cat for you. Please check your messages to view the image.",
      "message_files": [
        {
          "id": "976990d2-5294-47e6-8f14-7356ba9d2d76",
          "type": "image",
          "url": "http://127.0.0.1:5001/files/tools/976990d2-5294-47e6-8f14-7356ba9d2d76.png?timestamp=1705988524&nonce=55df3f9f7311a9acd91bf074cd524092&sign=z43nMSO1L2HBvoqADLkRxr7Biz0fkjeDstnJiCK1zh8=",
          "belongs_to": "assistant"
        }
      ],
      "feedback": null,
      "retriever_resources": [],
      "created_at": 1705988187
    }
  ]
}
```

---

### 7. 获取会话列表

#### 接口信息
- **接口地址**: `/conversations`
- **请求方式**: `GET`
- **接口描述**: 获取当前用户的会话列表，默认返回最近的 20 条

#### 查询参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| user | string | 是 | 用户标识，由开发者定义规则，需保证用户标识在应用内唯一 |
| last_id | string | 否 | 当前页最后面一条记录的 ID，默认 null |
| limit | int | 否 | 一次请求返回多少条记录，默认 20 条，最大 100 条，最小 1 条 |
| sort_by | string | 否 | 排序字段，默认 -updated_at(按更新时间倒序排列)<br/>可选值：created_at, -created_at, updated_at, -updated_at<br/>字段前面的符号代表顺序或倒序，-代表倒序 |

#### 响应参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| data | array[object] | 会话列表 |
| has_more | bool | 是否存在下一页 |
| limit | int | 返回条数，若传入超过系统限制，返回系统限制数量 |

#### data 数组中每个会话对象包含：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| id | string | 会话 ID |
| name | string | 会话名称，默认由大语言模型生成 |
| inputs | object | 用户输入参数 |
| status | string | 会话状态 |
| introduction | string | 开场白 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

#### 请求示例

```bash
curl -X GET 'http://dify-contest.hewa.cn/v1/conversations?user=abc-123&last_id=&limit=20' \
  --header 'Authorization: Bearer {api_key}'
```

#### 响应示例

```json
{
  "limit": 20,
  "has_more": false,
  "data": [
    {
      "id": "10799fb8-64f7-4296-bbf7-b42bfbe0ae54",
      "name": "New chat",
      "inputs": {
        "book": "book",
        "myName": "Lucy"
      },
      "status": "normal",
      "created_at": 1679667915,
      "updated_at": 1679667915
    },
    {
      "id": "hSIhXBhNe8X1d8Et"
    }
  ]
}
```

---

### 8. 删除会话

#### 接口信息
- **接口地址**: `/conversations/:conversation_id`
- **请求方式**: `DELETE`
- **接口描述**: 删除会话

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| conversation_id | string | 是 | 会话 ID |

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| user | string | 是 | 用户标识，由开发者定义规则，需保证用户标识在应用内唯一 |

#### 响应参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| result | string | 固定返回 success |

#### 请求示例

```bash
curl -X DELETE 'http://dify-contest.hewa.cn/v1/conversations/:conversation_id' \
  --header 'Authorization: Bearer {api_key}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "user": "abc-123"
  }'
```

#### 响应示例

```json
{
  "result": "success"
}
```

---

### 9. 会话重命名

#### 接口信息
- **接口地址**: `/conversations/:conversation_id/name`
- **请求方式**: `POST`
- **接口描述**: 对会话进行重命名，会话名称用于显示在支持多会话的客户端上

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| conversation_id | string | 是 | 会话 ID |

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| name | string | 否 | 名称，若 auto_generate 为 true 时，该参数可不传 |
| auto_generate | bool | 否 | 自动生成标题，默认 false |
| user | string | 是 | 用户标识，由开发者定义规则，需保证用户标识在应用内唯一 |

#### 响应参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| id | string | 会话 ID |
| name | string | 会话名称 |
| inputs | object | 用户输入参数 |
| status | string | 会话状态 |
| introduction | string | 开场白 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

#### 请求示例

```bash
curl -X POST 'http://dify-contest.hewa.cn/v1/conversations/:conversation_id/name' \
  --header 'Authorization: Bearer {api_key}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "name": "",
    "auto_generate": true,
    "user": "abc-123"
  }'
```

#### 响应示例

```json
{
  "id": "34d511d5-56de-4f16-a997-57b379508443",
  "name": "hello",
  "inputs": {},
  "status": "normal",
  "introduction": "",
  "created_at": 1732731141,
  "updated_at": 1732734510
}
```

---

### 10. 语音转文字

#### 接口信息
- **接口地址**: `/audio-to-text`
- **请求方式**: `POST`
- **接口描述**: 语音转文字

#### 请求参数

**Content-Type**: `multipart/form-data`

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| file | file | 是 | 语音文件。支持格式：['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'] 文件大小限制：15MB |
| user | string | 是 | 用户标识，由开发者定义规则，需保证用户标识在应用内唯一 |

#### 响应参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| text | string | 输出文字 |

#### 请求示例

```bash
curl -X POST 'http://dify-contest.hewa.cn/v1/audio-to-text' \
  --header 'Authorization: Bearer {api_key}' \
  --form 'file=@audio.mp3' \
  --form 'user=abc-123'
```

#### 响应示例

```json
{
  "text": "转换后的文字内容"
}
```
