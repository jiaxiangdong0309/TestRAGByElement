# 默认聊天页面文档

## 页面概述

`src/pages/chat/layouts/chatDefaul/index.vue` 是默认聊天页面，用户在没有选择具体会话时看到的欢迎界面。主要用于开始新的对话会话。

## 页面结构

### 主要组件
- **WelecomeText**: 欢迎文本组件，显示应用介绍和快捷操作
- **Sender**: 消息发送器组件，用于输入和发送消息
- **FilesSelect**: 文件选择组件
- **ModelSelect**: 模型选择组件

### 布局设计
```scss
.chat-defaul-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  min-height: 450px;
}
```

## 核心功能

### 1. 会话创建
```typescript
async function handleSend() {
  localStorage.setItem('chatContent', senderValue.value);
  await sessionStore.createSessionList({
    userId: userStore.userInfo?.userId as number,
    sessionContent: senderValue.value,
    sessionTitle: senderValue.value.slice(0, 10),
    remark: senderValue.value.slice(0, 10),
  });
}
```

**功能说明**:
- 将用户输入的消息内容保存到 localStorage
- 调用会话创建接口创建新会话
- 自动生成会话标题（截取前10个字符）
- 会话创建成功后跳转到具体会话页面

### 2. 文件附件管理
```typescript
function handleDeleteCard(_item: FilesCardProps, index: number) {
  filesStore.deleteFileByIndex(index);
}
```

**功能说明**:
- 支持删除已选择的文件附件
- 实时更新文件列表显示状态

### 3. 动态UI交互
```typescript
watch(
  () => filesStore.filesList.length,
  (val) => {
    if (val > 0) {
      nextTick(() => {
        senderRef.value.openHeader();
      });
    }
    else {
      nextTick(() => {
        senderRef.value.closeHeader();
      });
    }
  },
);
```

**功能说明**:
- 监听文件列表变化
- 有文件时自动打开发送器的头部区域
- 无文件时自动关闭发送器的头部区域

## 组件配置

### Sender 组件配置
```typescript
<Sender
  ref="senderRef"
  v-model="senderValue"
  class="chat-defaul-sender"
  :auto-size="{
    maxRows: 9,
    minRows: 3,
  }"
  variant="updown"
  clearable
  allow-speech
  @submit="handleSend"
>
```

**配置说明**:
- `auto-size`: 自适应高度，最多9行，最少3行
- `variant="updown"`: 上下变体样式
- `clearable`: 可清空输入
- `allow-speech`: 支持语音输入
- `@submit`: 提交事件绑定到 `handleSend` 函数

### 附件显示组件
```typescript
<Attachments
  :items="filesStore.filesList"
  :hide-upload="true"
  @delete-card="handleDeleteCard"
>
```

**配置说明**:
- 绑定文件store中的文件列表
- 隐藏上传按钮（通过FilesSelect组件管理）
- 支持删除文件卡片

## API接口调用

### 创建会话接口
- **接口**: `sessionStore.createSessionList()`
- **参数**:
  - `userId`: 用户ID
  - `sessionContent`: 会话内容
  - `sessionTitle`: 会话标题
  - `remark`: 会话备注

## 状态管理

### 使用到的Store
- **userStore**: 用户信息管理
- **sessionStore**: 会话管理
- **filesStore**: 文件管理

### 数据流
1. 用户输入消息
2. 消息暂存到localStorage
3. 调用创建会话API
4. 创建成功后跳转到会话页面
5. 从localStorage读取消息并发送

## 样式特性

### 响应式设计
- 最大宽度800px，保持良好的阅读体验
- 最小高度450px，确保界面不会过于紧凑
- 完全居中对齐的布局

### 交互优化
- 自动适应输入框高度
- 平滑的文件列表显示/隐藏动画
- 清晰的视觉层次结构

## 注意事项

1. **消息缓存**: 使用localStorage临时存储用户输入，确保页面跳转后不丢失
2. **标题生成**: 自动截取前10个字符作为会话标题，需要考虑特殊字符处理
3. **权限检查**: 创建会话前需要确保用户已登录
4. **错误处理**: 需要处理会话创建失败的情况

## 扩展功能

- 添加更多快捷操作按钮
- 支持预设提示词模板
- 添加历史会话快速访问
- 支持拖拽文件上传