# Electron 应用打包指南

## 📋 概述

本文档详细说明了如何将 Vue 应用打包成 Electron 桌面应用，包括开发、构建、打包和分发的完整流程。

## 🛠️ 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- macOS (用于构建 macOS 应用)
- Windows (用于构建 Windows 应用)
- Linux (用于构建 Linux 应用)

## 📁 项目结构

```
ruoyi-element-ai/
├── electron/                    # Electron 相关文件
│   ├── main.ts                  # 主进程入口 (TypeScript)
│   ├── main.cjs                 # 主进程入口 (CommonJS)
│   ├── preload.ts               # 预加载脚本 (TypeScript)
│   └── preload.cjs              # 预加载脚本 (CommonJS)
├── dist-electron/               # Electron 构建输出目录
│   ├── main.js                  # 编译后的主进程文件
│   ├── preload.js               # 编译后的预加载脚本
│   ├── index.html               # 渲染进程页面
│   └── assets/                  # 静态资源
├── release/                     # 打包输出目录
│   ├── ruoyi-element-ai-0.0.0.dmg    # macOS 安装包
│   ├── ruoyi-element-ai Setup 0.0.0.exe  # Windows 安装包
│   └── ruoyi-element-ai-0.0.0.AppImage  # Linux 应用包
└── package.json                 # 项目配置
```

## 🚀 开发模式

### 启动开发服务器

```bash
# 启动 Electron 开发模式
pnpm run app:dev

# 或者分步执行
pnpm run electron:dev    # 启动 Vite 开发服务器
pnpm run electron:serve  # 启动 Electron 应用
```

### 开发模式特点

- 支持热重载
- 自动打开开发者工具
- 实时查看代码变更
- 调试方便

## 🔨 构建流程

### 1. 构建 Electron 应用

```bash
# 构建 Electron 版本的应用
pnpm run electron:build

# 或者使用别名
pnpm run app:dist
```

**构建过程：**
1. TypeScript 类型检查 (`vue-tsc -b`)
2. 构建 Vue 应用 (`vite build --mode electron`)
3. 构建 Electron 主进程 (`electron/main.ts` → `dist-electron/main.js`)
4. 构建预加载脚本 (`electron/preload.ts` → `dist-electron/preload.js`)

**输出目录：** `dist-electron/`

### 2. 验证构建结果

#### 步骤 1：检查文件是否存在
```bash
# 检查生成的文件
ls -la dist-electron/

# 应该包含以下文件：
# - main.js (主进程)
# - preload.js (预加载脚本)
# - index.html (渲染进程页面)
# - assets/ (静态资源)
```

#### 步骤 2：验证文件内容
```bash
# 检查主进程文件大小（应该约 3KB）
ls -lh dist-electron/main.js

# 检查预加载脚本文件大小（应该约 0.3KB）
ls -lh dist-electron/preload.js

# 检查 HTML 文件
head -5 dist-electron/index.html
```

#### 步骤 3：测试构建后的应用
```bash
# 运行构建后的应用
pnpm run electron:serve

# 或者直接运行
electron electron/main.cjs
```

**✅ 成功标志：**
- 应用正常启动，显示 Vue 应用界面
- 没有 "Application not built properly" 错误
- 开发者工具可以正常打开（F12）

**❌ 失败标志：**
- 显示 "Application not built properly" 错误
- 应用无法启动
- 控制台有路径相关错误

## 📦 打包流程

### 1. 打包成安装包

```bash
# 打包所有平台
npx electron-builder

# 或者只打包当前平台
npx electron-builder --mac
npx electron-builder --win
npx electron-builder --linux
```

### 2. 验证打包结果

#### 步骤 1：检查 release 目录
```bash
# 检查打包输出目录
ls -la release/

# 应该包含以下文件（根据平台）：
# macOS: ruoyi-element-ai-0.0.0.dmg
# Windows: ruoyi-element-ai Setup 0.0.0.exe
# Linux: ruoyi-element-ai-0.0.0.AppImage
```

#### 步骤 2：检查文件大小
```bash
# 检查安装包大小
ls -lh release/*.dmg      # macOS
ls -lh release/*.exe      # Windows
ls -lh release/*.AppImage # Linux

# 正常大小范围：
# macOS: 150-200MB
# Windows: 150-200MB
# Linux: 150-200MB
```

#### 步骤 3：测试安装包
```bash
# macOS - 挂载 DMG 并测试
open release/ruoyi-element-ai-0.0.0.dmg

# Linux - 运行 AppImage
chmod +x release/ruoyi-element-ai-0.0.0.AppImage
./release/ruoyi-element-ai-0.0.0.AppImage

# Windows - 运行安装程序
./release/ruoyi-element-ai\ Setup\ 0.0.0.exe
```

**✅ 成功标志：**
- release 目录存在且包含安装包文件
- 安装包文件大小正常（150-200MB）
- 可以正常安装和运行应用
- 应用界面正常显示

**❌ 失败标志：**
- release 目录不存在或为空
- 安装包文件损坏或无法打开
- 安装后应用无法启动
- 应用界面显示错误

### 2. 打包特定架构

```bash
# macOS - 只打包 x64
npx electron-builder --mac --x64

# macOS - 只打包 arm64 (Apple Silicon)
npx electron-builder --mac --arm64

# Windows - 只打包 x64
npx electron-builder --win --x64

# Linux - 只打包 x64
npx electron-builder --linux --x64
```

### 3. 打包配置

在 `package.json` 中的 `build` 字段配置：

```json
{
  "build": {
    "appId": "com.ruoyi-element-ai.app",
    "productName": "ruoyi-element-ai",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist-electron/**/*"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        }
      ]
    }
  }
}
```

## 🎯 完整操作流程

### 完整流程步骤

#### 1. 开发阶段
```bash
# 启动开发模式
pnpm run app:dev

# 验证开发环境正常
# ✅ 应用正常启动，支持热重载
```

#### 2. 构建阶段
```bash
# 构建 Electron 应用
pnpm run electron:build

# 验证构建结果
ls -la dist-electron/
# ✅ 应该包含：main.js, preload.js, index.html, assets/

# 测试构建后的应用
pnpm run electron:serve
# ✅ 应用正常启动，无错误信息
```

#### 3. 打包阶段
```bash
# 打包成安装包
npx electron-builder

# 验证打包结果
ls -la release/
# ✅ 应该包含：ruoyi-element-ai-0.0.0.dmg

# 测试安装包
open release/ruoyi-element-ai-0.0.0.dmg
# ✅ 可以正常安装和运行
```

### 一键打包脚本

```bash
#!/bin/bash
# 完整打包流程

echo "🚀 开始 Electron 应用打包..."

# 1. 清理之前的构建
echo "🧹 清理构建目录..."
rm -rf dist-electron
rm -rf release

# 2. 构建应用
echo "🔨 构建 Electron 应用..."
pnpm run electron:build

# 3. 验证构建结果
if [ ! -f "dist-electron/main.js" ]; then
    echo "❌ 构建失败：缺少 main.js 文件"
    exit 1
fi

if [ ! -f "dist-electron/preload.js" ]; then
    echo "❌ 构建失败：缺少 preload.js 文件"
    exit 1
fi

echo "✅ 构建成功！"

# 4. 打包安装包
echo "📦 开始打包安装包..."
npx electron-builder

# 5. 检查打包结果
if [ -d "release" ]; then
    echo "🎉 打包完成！"
    echo "📁 输出目录：release/"
    ls -la release/
else
    echo "❌ 打包失败"
    exit 1
fi
```

### 使用打包脚本

```bash
# 保存为 build.sh 并添加执行权限
chmod +x build.sh

# 运行打包脚本
./build.sh
```

## 🔧 常见问题解决

### 1. 构建失败 - 缺少 main.js

**错误信息：**
```
Application entry file "dist-electron/main.js" was not found
```

**解决方案：**
1. 检查 Vite 配置中是否包含 `vite-plugin-electron` 插件
2. 确保 `electron/main.ts` 文件存在
3. 重新运行 `pnpm run electron:build`

### 2. 应用启动失败 - "Application not built properly"

**错误信息：**
```
Application not built properly
Please run pnpm build first
```

**原因分析：**
- Electron 主进程中的路径配置错误
- `process.env.DIST` 指向了错误的目录

**解决方案：**
1. 检查 `electron/main.cjs` 和 `electron/main.ts` 中的路径配置
2. 确保 `process.env.DIST` 指向 `../dist-electron` 而不是 `../dist`
3. 修复后的配置：
   ```javascript
   process.env.DIST = path.join(__dirname, '../dist-electron')
   ```
4. 重新构建应用：`pnpm run electron:build`
5. 测试运行：`pnpm run electron:serve`

**验证修复：**
- 运行 `pnpm run electron:serve` 应该能正常启动应用
- 不再显示 "Application not built properly" 错误

### 3. 网络问题 - 下载 Electron 失败

**错误信息：**
```
Get "https://github.com/electron/electron/releases/download/...": proxyconnect tcp: dial tcp :0: connect: can't assign requested address
```

**解决方案：**
1. 检查网络连接
2. 配置代理（如果需要）
3. 只构建当前平台：`npx electron-builder --mac --x64`

### 4. 代码签名问题

**错误信息：**
```
skipped macOS application code signing reason=cannot find valid "Developer ID Application" identity
```

**解决方案：**
1. 这是警告，不是错误，应用仍可正常运行
2. 如需代码签名，需要 Apple Developer 证书
3. 对于分发，建议进行代码签名

### 5. 文件过大警告

**警告信息：**
```
Some chunks are larger than 500 kB after minification
```

**解决方案：**
1. 这是性能优化建议，不影响功能
2. 可以考虑代码分割优化
3. 调整 `build.chunkSizeWarningLimit` 配置

## 📊 构建产物说明

### dist-electron/ 目录

| 文件 | 说明 | 大小 |
|------|------|------|
| `main.js` | Electron 主进程 | ~3KB |
| `preload.js` | 预加载脚本 | ~0.3KB |
| `index.html` | 渲染进程页面 | ~0.4KB |
| `assets/` | 静态资源 | ~50MB |

### release/ 目录

| 平台 | 文件格式 | 说明 |
|------|----------|------|
| macOS | `.dmg` | 磁盘镜像，双击安装 |
| Windows | `.exe` | 可执行安装包 |
| Linux | `.AppImage` | 便携式应用包 |

## 🚀 分发部署

### 1. 本地测试

```bash
# 运行打包后的应用
open release/mac/ruoyi-element-ai.app  # macOS
./release/ruoyi-element-ai-0.0.0.AppImage  # Linux
```

### 2. 分发方式

1. **直接分发**：将安装包发送给用户
2. **在线分发**：上传到应用商店或官网
3. **自动更新**：集成 electron-updater

### 3. 版本管理

```bash
# 更新版本号
npm version patch  # 0.0.0 -> 0.0.1
npm version minor  # 0.0.1 -> 0.1.0
npm version major  # 0.1.0 -> 1.0.0

# 重新打包
pnpm run electron:build
npx electron-builder
```

## 📝 最佳实践

### 1. 开发流程

1. 使用 `pnpm run app:dev` 进行开发
2. 定期测试 `pnpm run electron:build` 构建
3. 发布前完整测试打包流程

### 2. 性能优化

1. 启用代码分割
2. 优化资源加载
3. 使用 CDN 加速（如果需要）

### 3. 安全考虑

1. 启用上下文隔离
2. 禁用 Node.js 集成（在渲染进程中）
3. 使用 CSP 策略

### 4. 用户体验

1. 添加应用图标
2. 配置窗口大小和位置
3. 实现自动更新机制

## 🔗 相关链接

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Vite 插件文档](https://vitejs.dev/plugins/)
- [electron-builder 文档](https://www.electron.build/)
- [Vue 3 文档](https://vuejs.org/)

## 🔍 故障排除检查清单

### 开发阶段问题
- [ ] Node.js 版本 >= 18.0.0
- [ ] pnpm 版本 >= 8.0.0
- [ ] 依赖安装完整：`pnpm install`
- [ ] 开发服务器正常启动：`pnpm run app:dev`

### 构建阶段问题
- [ ] TypeScript 编译无错误
- [ ] Vite 构建成功完成
- [ ] `dist-electron/` 目录存在
- [ ] `main.js` 和 `preload.js` 文件存在
- [ ] 文件大小正常（main.js ~3KB, preload.js ~0.3KB）

### 运行阶段问题
- [ ] 路径配置正确：`process.env.DIST` 指向 `../dist-electron`
- [ ] 应用正常启动：`pnpm run electron:serve`
- [ ] 无 "Application not built properly" 错误
- [ ] Vue 应用界面正常显示

### 打包阶段问题
- [ ] electron-builder 配置正确
- [ ] `files` 配置只包含 `dist-electron/**/*`
- [ ] 网络连接正常（下载 Electron）
- [ ] `release/` 目录生成
- [ ] 安装包文件大小正常（150-200MB）

## 📞 技术支持

如果遇到问题，请检查：

1. Node.js 和 pnpm 版本
2. 网络连接状态
3. 构建日志输出
4. 文件权限设置
5. 使用上述检查清单逐项排查

---

**最后更新：** 2024年9月10日
**版本：** 1.1.0
**维护者：** 开发团队

## 📝 更新日志

### v1.1.0 (2024-09-10)
- ✅ 添加了 "Application not built properly" 错误解决方案
- ✅ 增加了详细的步骤验证说明
- ✅ 添加了完整的操作流程指南
- ✅ 增加了故障排除检查清单
- ✅ 优化了文档结构和可读性

### v1.0.0 (2024-09-10)
- 🎉 初始版本发布
- 📚 完整的 Electron 打包指南
- 🛠️ 常见问题解决方案
- 📦 一键打包脚本
