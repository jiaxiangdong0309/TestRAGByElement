#!/bin/bash

# 设置NODE_PATH环境变量
export NODE_PATH="/Users/mac/hewa/ruoyi-element-ai/node_modules/.pnpm/electron@38.0.0/node_modules/electron/node_modules:/Users/mac/hewa/ruoyi-element-ai/node_modules/.pnpm/electron@38.0.0/node_modules:/Users/mac/hewa/ruoyi-element-ai/node_modules/.pnpm/node_modules"

# 使用完整的electron路径
exec /Users/mac/hewa/ruoyi-element-ai/node_modules/.pnpm/electron@38.0.0/node_modules/electron/cli.js electron/main.cjs "$@"