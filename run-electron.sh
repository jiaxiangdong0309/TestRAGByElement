#!/bin/bash

# 等待前端服务器启动
echo "等待前端服务器启动在 http://localhost:5173..."
while ! nc -z localhost 5173; do
  sleep 1
done

echo "前端服务器已启动，启动 Electron 应用..."

# 尝试使用系统中的 Electron
if command -v electron &> /dev/null; then
  electron dist-electron/main.js
elif [ -d "/Applications/MyElectron.app" ]; then
  # 使用现有的 Electron 应用
  /Applications/MyElectron.app/Contents/MacOS/Electron dist-electron/main.js
else
  echo "错误: 未找到 Electron，请先安装 Electron"
  exit 1
fi