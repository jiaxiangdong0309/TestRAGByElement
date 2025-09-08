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

# 重新构建 Electron 文件
echo "🔨 构建 Electron 文件..."
pnpm electron:dev
if [ $? -ne 0 ]; then
  echo "❌ Electron 构建失败！"
  exit 1
fi

echo "🚀 启动 Electron 应用..."

# 尝试不同的方式启动 Electron
if command -v electron &> /dev/null; then
  echo "使用全局 electron 启动..."
  electron dist-electron/main.js
elif [ -d "/Applications/MyElectron.app" ]; then
  echo "使用 MyElectron.app 启动..."
  /Applications/MyElectron.app/Contents/MacOS/Electron dist-electron/main.js
elif [ -f "node_modules/.pnpm/electron@*/node_modules/electron" ]; then
  echo "使用项目内的 electron 启动..."
  node_modules/.pnpm/electron@*/node_modules/.bin/electron dist-electron/main.js
else
  echo "❌ 未找到 Electron，正在安装..."
  npm install -g electron
  if [ $? -eq 0 ]; then
    echo "✅ Electron 安装成功，重新启动..."
    exec "$0" "$@"
  else
    echo "❌ Electron 安装失败！"
    echo "请手动安装：npm install -g electron"
    exit 1
  fi
fi