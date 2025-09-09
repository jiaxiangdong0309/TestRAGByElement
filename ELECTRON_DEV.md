# Electron 开发指南

## 快速启动

### 方式一：使用优化启动脚本（推荐）

```bash
# 一键启动 Electron 应用
./start-optimized.sh
```

### 方式二：使用开发模式选择器

```bash
# 选择不同的开发模式
./dev.sh
```

### 方式三：手动启动

```bash
# 1. 构建 Electron 版本
pnpm build --mode electron

# 2. 启动 Electron 应用
electron electron/main.cjs
```

### 方式四：同时启动开发服务器和 Electron

```bash
# 同时启动开发服务器和 Electron（支持热重载）
pnpm run app:dev
```

## 开发模式说明

### Web 开发模式
```bash
pnpm run dev
```
- 适用场景：Vue 组件和页面开发
- 优势：支持热重载，开发体验最好
- 访问：http://localhost:5173

### Electron 开发模式
```bash
pnpm build --mode electron
electron electron/main.cjs
```
- 适用场景：Electron 功能测试
- 优势：直接测试桌面应用功能
- 注意：修改主进程代码后需要重启

### 完整开发模式
```bash
pnpm run app:dev
```
- 适用场景：需要同时测试 Web 和 Electron
- 优势：Vue 组件支持热重载
- 注意：主进程修改后需要手动重启

## 开发工作流

### 日常开发（95% 的情况）
1. 使用 `pnpm run dev` 进行 Vue 组件开发
2. 修改后自动刷新，无需重启
3. 需要 Electron 测试时使用 `./start-optimized.sh`

### Electron 功能开发（5% 的情况）
1. 修改 `electron/main.cjs` 主进程代码
2. 使用 `./start-optimized.sh` 重启应用测试
3. 主进程代码通常在项目初期配置好后很少修改

## 文件说明

- `electron/main.cjs` - Electron 主进程文件（CommonJS）
- `electron/main.ts` - Electron 主进程文件（TypeScript，备用）
- `vite.config.mts` - Vite 配置（已移除 electron 插件）
- `start-optimized.sh` - 优化的 Electron 启动脚本
- `dev.sh` - 开发模式选择器

## 故障排除

### 如果遇到 electron 包找不到的问题
```bash
# 全局安装 electron
npm install -g electron
```

### 如果构建失败
```bash
# 清理缓存并重新安装依赖
rm -rf node_modules dist dist-electron
pnpm install
```

### 如果端口被占用
```bash
# 杀死占用端口的进程
lsof -ti:5173 | xargs kill -9
```

## 提示和技巧

1. **开发优先使用 Web 模式**：热重载体验更好
2. **Electron 模式用于最终测试**：确保桌面应用功能正常
3. **主进程代码修改少**：主要集中在 Vue 组件开发
4. **使用 F12 打开开发者工具**：方便调试
5. **定期测试 Electron 模式**：确保桌面应用兼容性