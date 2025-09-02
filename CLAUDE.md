# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 语言偏好

在此代码库中工作时，请使用中文进行交流。

## 项目概述

这是一个基于 Vue 3.5 + TypeScript 的 AI 聊天应用模板，使用 Element Plus X 构建，设计用于配合 ruoyi-ai 后端。项目使用了现代化工具链，包括 Vite 6、Pinia 3 和支持 Server-Sent Events (SSE) 的 Hook-Fetch API 请求库。

## 常用命令

```bash
# 安装依赖（推荐使用 pnpm 以避免幻影依赖）
pnpm install

# 开发服务器
pnpm run dev

# 生产构建（先运行 TypeScript 编译）
pnpm build

# 预览构建
pnpm preview

# 代码检查
pnpm lint          # ESLint 检查
pnpm fix           # ESLint 自动修复
pnpm lint:stylelint # Stylelint 检查

# 使用约定式提交
pnpm cz            # 提交前会运行 lint
```

## 架构概览

### 技术栈
- **前端框架**: Vue 3.5+ 组合式 API
- **构建工具**: Vite 6.0 自定义插件配置
- **状态管理**: Pinia 3 持久化插件
- **路由**: Vue Router 4 动态路由和 KeepAlive
- **UI 库**: Element Plus + 自定义 Element Plus X 组件
- **样式**: UnoCSS + SCSS 全局变量
- **HTTP 客户端**: Hook-Fetch（替代 Axios）插件架构
- **图标**: Element Plus 图标 + 自定义 SVG 图标
- **TypeScript**: 完整 TS 支持自动生成类型

### 项目结构

```
src/
├── api/              # API 模块（认证、聊天、模型、会话）
├── assets/icons/     # 按分类组织的 SVG 图标
├── components/      # 可复用 Vue 组件
├── config/          # 应用配置（暗黑模式、设计令牌）
├── constants/       # 枚举和常量
├── hooks/           # 组合式 API 钩子
├── layouts/         # 布局组件
├── routers/         # 路由配置（静态 + 动态）
├── stores/          # Pinia 存储（认证、聊天、设计、用户等）
├── styles/          # 全局样式和 SCSS 变量
├── utils/           # 工具函数（请求等）
├── views/           # 页面组件
└── main.ts          # 应用入口点
```

### 核心特性

1. **Hook-Fetch 集成**: 自定义 HTTP 客户端，支持插件：
   - JWT 令牌管理
   - SSE 流式响应
   - 自动错误处理（401/403 重定向）
   - 请求/响应拦截器

2. **动态路由**: 静态和动态路由结合：
   - 基于权限的路由过滤
   - KeepAlive 页面缓存
   - 401/403 错误处理

3. **状态管理**: 带持久化的 Pinia 存储：
   - 用户认证和会话
   - 聊天对话和消息
   - UI 主题和设计偏好
   - 文件上传和模型设置

4. **组件自动导入**: 使用 unplugin-vue-components：
   - Element Plus 组件解析器
   - 自动生成类型定义
   - Tree-shaking 优化

5. **图标系统**: 双图标支持：
   - Element Plus 图标（全局注册）
   - 自定义 SVG 图标（vite-plugin-svg-icons）

### 请求处理

项目使用 Hook-Fetch 替代 Axios，配置在 `src/utils/request.ts`：
- 基础 URL 来自环境变量
- 自动 JWT 令牌注入
- SSE 流式响应支持
- 集中式错误处理和重定向
- 插件架构便于扩展

### 环境配置

- `.env.development`: 开发环境设置
- `.env.production`: 生产环境设置
- 环境类型自动生成在 `types/import_meta.d.ts`

### 样式架构

- SCSS 全局变量在 `src/styles/var.scss`
- UnoCSS 工具类
- Element Plus 主题定制
- Stylelint 保持代码风格一致

### 开发工作流

1. Husky pre-commit 钩子运行 ESLint
2. 通过 commitlint 强制约定式提交
3. 组件和 API 自动导入减少样板代码
4. TypeScript 严格模式
5. 保存时自动格式化（ESLint + Prettier）

### 重要说明

- 项目使用 pnpm 作为包管理器
- 所有 API 请求期望标准响应格式：`code`、`data`、`msg`、`rows` 字段
- 动态路由根据用户权限加载
- UI 支持暗黑模式并持久化偏好设置
- 聊天功能包含会话管理和消息流式传输