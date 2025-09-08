# ruoyi-element-ai

<div align="center">

  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/element-plus-x/ruoyi-element-ai/blob/main/LICENSE)&emsp;[![Vue 3.5](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)&emsp;[![Vite 6](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)&emsp;[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)&emsp;[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron)](https://www.electronjs.org/)&emsp;[![GitHub Stars](https://img.shields.io/github/stars/element-plus-x/ruoyi-element-ai?style=social)](https://github.com/element-plus-x/ruoyi-element-ai)&emsp;

</div>

<div align="center">
<img src="https://cdn.element-plus-x.com/chat/1.webp" />
</div>

<div align="center">

本项目 CDN 加速及安全防护由 Tencent EdgeOne 赞助

[亚洲最佳CDN、边缘和安全解决方案 - Tencent EdgeOne](https://edgeone.ai/zh?from=github)

<img src="readme/edgeone.png"/>

</div>

## 🚀 项目亮点

**ruoyi-element-ai** 是基于 **Vue3.5** + **Element-Plus-X** + **hook-fetch** + **TypeScript** + **Eslint9** 开发的企业级AI应用模板，搭配 **ruoyi-ai** 后端，快速构建仿豆包/通义的全栈AI项目。

**新增支持 Electron 桌面应用**：一套代码同时支持 Web 和桌面端，提供更丰富的部署选择！

## 💡 核心优势
- 最新技术栈：Vue3.5+/Vite6/Pinia3/TypeScript5
- 流式交互：Hook-Fetch支持Server-Sent Events，插件化写法优雅的一批
- 企业级规范：ESLint/Stylelint/husky/commitlint全链路校验
- 全栈项目：集成 ruoyi-ai 后端服务，快速开发
- 开箱即用：内置动态路由、状态管理、组件库封装、hooks封装
- 双端支持：Web + Electron 桌面应用，一套代码多端运行

## 🎯 开发文档

帮助你快速熟悉项目

<div align="center">
<img src="https://cdn.element-plus-x.com/chat/docs1.webp" />
</div>

## 🔗 关键链接

| 功能模块         | 说明                          | 链接                                                                 |
|------------------|-------------------------------|----------------------------------------------------------------------|
| 🚀 前端仓库 | Gitee/GitHub 代码仓库(感谢 star🥰爱你爱你😘) | [Gitee](https://gitee.com/he-jiayue/ruoyi-element-ai) <br> [GitHub](https://github.com/element-plus-x/ruoyi-element-ai) |
| 🛠️ 后端仓库 | Java服务，功能丰富强大      |   [Gitee](https://gitee.com/ageerle/ruoyi-ai) <br> [GitHub](https://github.com/ageerle/ruoyi-ai)    |
| 📚 前端文档 | 开发指南/项目说明              | [快速了解项目](https://chat-docs.element-plus-x.com)       |
| 📡 在线演示 | 实时交互体验                    | [在线预览](https://chat.element-plus-x.com)                          |

## 🧰 核心功能

- 使用 Vue3.5+ 各种新特性的支持，让开发更有效率
- 采用 Vite6.3+ 作为项目开发、打包工具
- 使用 Pinia3.0+ 作为全局状态管理库，轻量、优雅、易用，集成 Pinia 持久化插件
- 使用 TypeScript5.8+ 增强项目的代码规范和可读性
- 使用 Unocss 预设样式，更快书写简单的样式
- 弃用 Axios (不支持流式请求) 改用 Hook-Fetch (支持流模式，插件化封装，写法极度优雅) 进行全局的请求封装
- 使用 VueRouter 配置动态路由权限拦截、路由懒加载
- 使用 KeepAlive 对页面进行缓存
- 封装了一些好用的组件和Hooks，增强用户交互体验
- 使用   ESLint9+、Stylelint16+ 代码校验规范、同时统一保存格式化代码
- 使用 husky、lint-staged、commitlint、cz-git 规范提交信息

### 🖥️ Electron 桌面应用特性
- **智能路由适配**：Electron环境自动使用Hash路由，避免404问题
- **API环境适配**：自动检测运行环境，选择合适的API调用方式
- **原生桌面体验**：支持窗口控制、菜单栏、快捷键等原生功能
- **一键启动**：简化的启动脚本，自动处理构建和依赖检查

## 📦 安装与运行

### Web 版本

```bash
# 克隆项目
# Gitee
git clone https://gitee.com/he-jiayue/ruoyi-element-ai.git
# GitHub
git clone https://github.com/element-plus-x/ruoyi-element-ai.git
cd ruoyi-element-ai

# 安装依赖（推荐pnpm 避免幻影依赖）
pnpm install

# 开发模式
pnpm run dev

# 生产构建
pnpm build

# 代码校验
pnpm lint          # ESLint检测
pnpm lint:stylelint # 样式格式化
pnpm cz            # 规范提交（自动执行lint）
```

### 🖥️ Electron 桌面应用

```bash
# 构建 Electron 版本
pnpm build --mode electron

# 一键启动 Electron 应用（自动构建和依赖检查）
./start.sh

# 或者手动启动
electron electron/main.cjs
```

> **提示**：Electron 应用启动后，按 `F12` 可打开开发者工具进行调试

## 🧸 功能进度 （含 ruoyi-ai 接口联调）
- [x] 会话管理
- [x] 发送消息
- [x] 登录注册
- [x] Electron 桌面应用支持
- [x] 流式响应处理
- [x] 智能路由适配
- [ ] md 渲染
- [ ] 编辑输入框
- [ ] 文件上传
- [ ] 自动更新
- [ ] 其他...

## 🏗️ 技术架构

### 前端技术栈
- **Vue 3.5+** - 渐进式JavaScript框架
- **TypeScript 5.8+** - JavaScript的超集
- **Vite 6.0+** - 新一代前端构建工具
- **Element Plus X** - 基于Element Plus的组件库
- **Pinia 3.0+** - Vue状态管理库
- **Vue Router 4+** - Vue官方路由
- **UnoCSS** - 原子化CSS引擎
- **Hook-Fetch** - 支持SSE的HTTP客户端

### Electron 桌面应用
- **Electron** - 跨平台桌面应用框架
- **CommonJS** - 主进程模块系统
- **IPC通信** - 进程间通信
- **Hash路由** - 桌面端路由方案
- **环境适配** - 自动检测运行环境

### 开发工具
- **ESLint 9+** - JavaScript代码检查工具
- **Stylelint 16+** - CSS样式检查工具
- **Husky** - Git hooks工具
- **Commitlint** - 提交信息规范
- **lint-staged** - 暂存区检查
