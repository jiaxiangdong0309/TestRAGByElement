#!/bin/bash

set -e  # 遇到错误立即退出

echo "🚀 启动 ruoyi-element-ai Electron 应用"

# 检查并构建
if [ ! -f "dist/index.html" ] || ! grep -q "assets/index-.*\.js" dist/index.html; then
  echo "📦 构建应用..."
  pnpm build --mode electron
fi

# 检查 Electron
if ! command -v electron &> /dev/null; then
  echo "📥 安装 Electron..."
  npm install -g electron
fi

echo "✅ 启动中... (F12 打开开发者工具)"
electron electron/main.cjs