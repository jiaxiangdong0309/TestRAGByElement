#!/bin/bash

set -e  # 遇到错误立即退出

echo "🚀 启动 ruoyi-element-ai Electron 应用（优化版）"

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 请先安装 pnpm"
    exit 1
fi

# 检查 electron
if ! command -v electron &> /dev/null; then
    echo "📥 正在安装 Electron..."
    npm install -g electron
fi

# 清理缓存
echo "🧹 清理构建缓存..."
rm -rf dist-electron/
rm -rf node_modules/.vite/

# 构建应用
echo "📦 构建应用..."
pnpm build --mode electron

# 检查构建是否成功
if [ ! -f "dist-electron/index.html" ]; then
    echo "❌ 构建失败，dist-electron/index.html 不存在"
    exit 1
fi

echo "✅ 启动 Electron 应用..."
echo "💡 提示："
echo "   - 按 F12 打开开发者工具"
echo "   - 按 Ctrl+C 或 Cmd+C 退出应用"
echo "   - 修改 Vue 组件后会自动刷新"
echo "   - 修改主进程代码后需要重启应用"

# 使用 main.cjs 启动
electron electron/main.cjs