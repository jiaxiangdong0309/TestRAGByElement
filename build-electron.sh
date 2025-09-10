#!/bin/bash

# Electron 应用打包脚本
# 使用方法: ./build-electron.sh [platform]
# 平台选项: mac, win, linux, all (默认: all)

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 打印步骤标题
print_step() {
    echo ""
    print_message $BLUE "=========================================="
    print_message $BLUE "$1"
    print_message $BLUE "=========================================="
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_message $RED "❌ 错误: $1 命令未找到"
        exit 1
    fi
}

# 检查文件是否存在
check_file() {
    if [ ! -f "$1" ]; then
        print_message $RED "❌ 错误: 文件 $1 不存在"
        exit 1
    fi
}

# 检查目录是否存在
check_dir() {
    if [ ! -d "$1" ]; then
        print_message $RED "❌ 错误: 目录 $1 不存在"
        exit 1
    fi
}

# 主函数
main() {
    local platform=${1:-all}

    print_message $GREEN "🚀 Electron 应用打包脚本"
    print_message $YELLOW "目标平台: $platform"

    # 检查环境
    print_step "检查环境"
    check_command "node"
    check_command "pnpm"
    check_command "npx"

    # 检查项目文件
    check_file "package.json"
    check_file "electron/main.ts"
    check_file "electron/preload.ts"

    # 清理之前的构建
    print_step "清理构建目录"
    if [ -d "dist-electron" ]; then
        print_message $YELLOW "🧹 清理 dist-electron 目录..."
        rm -rf dist-electron
    fi

    if [ -d "release" ]; then
        print_message $YELLOW "🧹 清理 release 目录..."
        rm -rf release
    fi

    # 构建应用
    print_step "构建 Electron 应用"
    print_message $YELLOW "执行: pnpm run electron:build"
    pnpm run electron:build

    # 验证构建结果
    print_step "验证构建结果"
    check_file "dist-electron/main.js"
    check_file "dist-electron/preload.js"
    check_file "dist-electron/index.html"
    check_dir "dist-electron/assets"

    print_message $GREEN "✅ 构建成功！"

    # 显示构建文件大小
    print_message $YELLOW "📊 构建文件信息:"
    ls -lh dist-electron/ | grep -E "(main\.js|preload\.js|index\.html)"

    # 打包安装包
    print_step "打包安装包"

    case $platform in
        "mac")
            print_message $YELLOW "执行: npx electron-builder --mac"
            npx electron-builder --mac
            ;;
        "win")
            print_message $YELLOW "执行: npx electron-builder --win"
            npx electron-builder --win
            ;;
        "linux")
            print_message $YELLOW "执行: npx electron-builder --linux"
            npx electron-builder --linux
            ;;
        "all"|*)
            print_message $YELLOW "执行: npx electron-builder"
            npx electron-builder
            ;;
    esac

    # 检查打包结果
    print_step "检查打包结果"
    if [ -d "release" ]; then
        print_message $GREEN "🎉 打包完成！"
        print_message $YELLOW "📁 输出目录: release/"
        echo ""
        print_message $BLUE "生成的文件:"
        ls -lh release/ | grep -v "^total"

        # 显示文件大小统计
        echo ""
        print_message $BLUE "文件大小统计:"
        du -sh release/* 2>/dev/null | sort -hr

    else
        print_message $RED "❌ 打包失败: release 目录不存在"
        exit 1
    fi

    # 完成
    print_step "打包完成"
    print_message $GREEN "✅ 所有步骤完成！"
    print_message $YELLOW "💡 提示: 可以运行以下命令测试应用:"

    case $platform in
        "mac"|"all")
            if [ -d "release/mac" ]; then
                print_message $BLUE "   macOS: open release/mac/ruoyi-element-ai.app"
            fi
            ;;
    esac

    if [ -d "release" ]; then
        print_message $BLUE "   Linux: ./release/ruoyi-element-ai-*.AppImage"
        print_message $BLUE "   Windows: ./release/ruoyi-element-ai*.exe"
    fi
}

# 显示帮助信息
show_help() {
    echo "Electron 应用打包脚本"
    echo ""
    echo "使用方法:"
    echo "  ./build-electron.sh [platform]"
    echo ""
    echo "平台选项:"
    echo "  mac     - 只打包 macOS 版本"
    echo "  win     - 只打包 Windows 版本"
    echo "  linux   - 只打包 Linux 版本"
    echo "  all     - 打包所有平台 (默认)"
    echo ""
    echo "示例:"
    echo "  ./build-electron.sh        # 打包所有平台"
    echo "  ./build-electron.sh mac    # 只打包 macOS"
    echo "  ./build-electron.sh win    # 只打包 Windows"
    echo ""
}

# 处理命令行参数
case "${1:-}" in
    -h|--help|help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
