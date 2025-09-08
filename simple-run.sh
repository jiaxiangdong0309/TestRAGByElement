#!/bin/bash

echo "=== 启动 ruoyi-element-ai Electron 应用 ==="

# 检查是否已构建
if [ ! -f "dist/index.html" ]; then
  echo "❌ 未找到构建文件，正在构建..."
  pnpm build
  if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
  fi
fi

echo "✅ 构建文件已就绪"

# 检查是否有 Electron
if ! command -v electron &> /dev/null; then
  echo "❌ 未找到 Electron，正在安装..."
  npm install -g electron
  if [ $? -ne 0 ]; then
    echo "❌ Electron 安装失败！"
    echo "请手动安装：npm install -g electron"
    exit 1
  fi
fi

echo "🚀 启动 Electron 应用..."

# 直接运行编译后的 main.js
electron dist-electron/main.js