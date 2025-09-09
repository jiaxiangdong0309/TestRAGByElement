#!/bin/bash

set -e  # 遇到错误立即退出

echo "🚀 ruoyi-element-ai 开发模式启动器"
echo "=================================="

# 检查依赖
if ! command -v pnpm &> /dev/null; then
    echo "❌ 请先安装 pnpm"
    exit 1
fi

if ! command -v electron &> /dev/null; then
    echo "📥 正在安装 Electron..."
    npm install -g electron
fi

echo ""
echo "📋 启动选项："
echo "1) Web 开发模式 (推荐用于 Vue 组件开发)"
echo "2) Electron 开发模式 (推荐用于 Electron 功能测试)"
echo "3) 完整开发模式 (同时启动开发服务器和 Electron)"
echo ""

read -p "请选择启动模式 (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 启动 Web 开发模式..."
        echo "💡 访问 http://localhost:5173 查看应用"
        echo "💡 修改 Vue 组件后会自动刷新"
        pnpm run dev
        ;;
    2)
        echo ""
        echo "🖥️ 启动 Electron 开发模式..."
        echo "📦 构建应用..."
        pnpm build --mode electron
        echo "💡 启动 Electron 应用..."
        echo "💡 按 F12 打开开发者工具"
        electron electron/main.cjs
        ;;
    3)
        echo ""
        echo "🔄 启动完整开发模式..."
        echo "💡 这将同时启动开发服务器和 Electron 应用"
        echo "💡 修改 Vue 组件后会自动刷新"
        echo "💡 修改主进程代码后需要重启 Electron"
        pnpm run app:dev
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac