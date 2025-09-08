#!/bin/bash

echo "=== 启动 ruoyi-element-ai Electron 应用 ==="

# 检查是否已构建 Electron 版本
if [ ! -f "dist/index.html" ] || [ ! "$(grep -c "assets/index-.*.js" dist/index.html)" -gt 0 ]; then
  echo "📦 正在构建 Electron 版本的 Vue 应用..."
  pnpm build --mode electron
  if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
  fi
fi

echo "✅ Vue 应用已构建完成"

# 检查是否有 Electron
if ! command -v electron &> /dev/null; then
  echo "📥 正在安装 Electron..."
  npm install -g electron
  if [ $? -ne 0 ]; then
    echo "❌ Electron 安装失败！"
    exit 1
  fi
fi

echo "🚀 启动 Electron 应用..."
echo "提示：按 F12 打开开发者工具"
echo "现在使用 Hash 路由，不会再有 404 问题了！"

# 直接运行 CommonJS 版本的 Electron 主进程
electron electron/main.cjs