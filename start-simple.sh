#!/bin/bash

set -e  # 遇到错误立即退出

echo "🚀 启动 ruoyi-element-ai Electron 应用（简化版）"

# 检查是否安装了 electron
if ! command -v electron &> /dev/null; then
  echo "📥 正在安装 Electron..."
  npm install -g electron
fi

# 构建应用
echo "📦 构建应用..."
pnpm build --mode electron

# 检查构建是否成功
if [ ! -f "dist-electron/index.html" ]; then
  echo "❌ 构建失败，dist-electron/index.html 不存在"
  exit 1
fi

echo "✅ 启动 Electron 应用..."
echo "💡 提示：按 F12 打开开发者工具"

# 使用 main.cjs 启动
electron electron/main.cjs