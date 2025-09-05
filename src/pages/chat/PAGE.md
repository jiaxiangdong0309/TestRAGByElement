# 聊天页面文档

## 页面概述

`src/pages/chat/index.vue` 是项目的主要聊天页面，作为整个应用的入口页面。它根据路由参数动态显示不同的聊天布局。

## 页面结构

### 组件架构
- **主容器**: `chat-container` - 居中布局的聊天容器
- **子组件**: 根据路由参数动态加载
  - `ChatDefaul` - 默认聊天页面（无会话ID时）
  - `ChatWithId` - 具体会话聊天页面（有会话ID时）

### 路由逻辑
```typescript
const route = useRoute();
const sessionId = computed(() => route.params?.id);
```

- 当 `sessionId` 为空时，显示默认聊天页面
- 当 `sessionId` 存在时，显示对应会话的聊天页面

## 样式设计

### 布局特性
- **响应式设计**: 宽度自适应 `calc(100% - 32px)`
- **居中对齐**: 使用 flexbox 居中布局
- **溢出处理**: `overflow-anchor: none` 防止滚动锚定
- **内边距**: 左右各 16px 内边距

### 样式代码
```scss
.chat-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100% - 32px);
  height: 100%;
  padding: 0 16px;
  overflow-anchor: none;
}
```

## 功能特性

### 动态路由处理
- 监听路由参数变化
- 自动切换聊天界面模式
- 保持用户会话状态

### 页面切换
- 无缝切换默认聊天和会话聊天
- 保持组件状态和数据

## 相关组件

### ChatDefaul 组件
- **路径**: `src/pages/chat/layouts/chatDefaul/index.vue`
- **功能**: 默认聊天界面，用于开始新会话

### ChatWithId 组件
- **路径**: `src/pages/chat/layouts/chatWithId/index.vue`
- **功能**: 具体会话的聊天界面，包含历史消息和实时对话

## 技术栈

- **Vue 3.5+**: 使用组合式 API
- **TypeScript**: 完整类型支持
- **Vue Router**: 路由管理
- **Element Plus X**: UI 组件库

## 注意事项

1. **路由参数**: 页面依赖路由参数 `id` 来确定显示模式
2. **组件生命周期**: 子组件的挂载和卸载由路由变化触发
3. **状态管理**: 聊天状态通过 Pinia store 管理
4. **响应式**: 页面布局完全响应式，适配不同屏幕尺寸

## 扩展功能

- 可以添加更多聊天布局模式
- 支持多种路由参数配置
- 可扩展为多标签页聊天界面