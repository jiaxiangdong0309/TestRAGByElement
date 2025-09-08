#!/bin/bash

echo "启动 ruoyi-element-ai Electron 应用..."

# 检查是否有前端服务器在运行
if ! nc -z localhost 5173; then
  echo "启动前端开发服务器..."
  pnpm dev &
  FRONTEND_PID=$!
  echo "前端服务器 PID: $FRONTEND_PID"
  
  # 等待前端服务器启动
  echo "等待前端服务器启动..."
  while ! nc -z localhost 5173; do
    sleep 1
  done
  echo "前端服务器已启动!"
fi

# 构建 Electron 文件
echo "构建 Electron 文件..."
pnpm electron:dev

echo "启动 Electron 应用..."
# 尝试不同的 Electron 启动方式
if [ -d "/Applications/MyElectron.app" ]; then
  echo "使用 MyElectron.app 启动..."
  /Applications/MyElectron.app/Contents/MacOS/Electron dist-electron/main.js
elif command -v electron &> /dev/null; then
  echo "使用命令行 electron 启动..."
  electron dist-electron/main.js
else
  echo "错误: 未找到 Electron"
  echo "请使用以下命令之一安装 Electron:"
  echo "  brew install --cask electron"
  echo "  npm install -g electron"
fi