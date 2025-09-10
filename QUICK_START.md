# Electron 快速打包指南

## 🚀 快速开始

### 开发模式
```bash
# 启动开发服务器
pnpm run app:dev
```

### 构建应用
```bash
# 构建 Electron 应用
pnpm run electron:build
```

### 打包安装包
```bash
# 打包当前平台
npx electron-builder

# 打包特定平台
npx electron-builder --mac
npx electron-builder --win
npx electron-builder --linux
```

## 📁 输出目录

- **`dist-electron/`** - 构建后的应用文件
- **`release/`** - 打包后的安装包

## ⚡ 一键打包脚本

```bash
#!/bin/bash
# 保存为 build.sh

echo "🚀 开始打包..."
rm -rf dist-electron release
pnpm run electron:build
npx electron-builder
echo "✅ 打包完成！"
```

## 🔧 常见问题

### 1. 缺少 main.js
```bash
# 重新构建
pnpm run electron:build
```

### 2. 网络问题
```bash
# 只构建当前平台
npx electron-builder --mac --x64
```

### 3. 文件过大警告
- 这是性能建议，不影响功能
- 可以忽略或优化代码分割

## 📋 检查清单

- [ ] 运行 `pnpm run electron:build` 成功
- [ ] 检查 `dist-electron/main.js` 存在
- [ ] 检查 `dist-electron/preload.js` 存在
- [ ] 运行 `npx electron-builder` 成功
- [ ] 检查 `release/` 目录有安装包

---

**详细文档：** 查看 `ELECTRON_PACKAGE_GUIDE.md`
