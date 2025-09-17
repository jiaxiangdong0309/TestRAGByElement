<template>
  <div class="code-section">
    <div class="section-header">
      <!-- <el-icon class="section-icon">
        <Code />
      </el-icon> -->
      <h3 class="section-title">生成的代码</h3>
    </div>

    <div class="code-container">
      <div class="code-header">
        <span class="code-language">React</span>
        <el-button
          type="primary"
          size="small"
          :icon="CopyDocument"
          @click="copyCode"
        >
          复制代码
        </el-button>
      </div>

      <div class="code-content">
        <pre><code>{{ generatedCode }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
// import { Code } from '@element-plus/icons-vue' // 图标不存在，暂时注释
import { ElMessage } from 'element-plus'

const generatedCode = ref(`import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              </motion.div>
              <span className="text-xl font-bold text-gray-900">Logo</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">首页</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">产品</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">关于</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">联系</a>
            </div>
            <Button>开始使用</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-gray-900 mb-6"
          >
            欢迎使用我们的产品
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8"
          >
            强大的功能，优雅的设计，为您的业务赋能
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button size="lg">立即开始</Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心特性</h2>
            <p className="text-xl text-gray-600">为您的业务提供全方位支持</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">高性能</h3>
              <p className="text-gray-600">优化的性能，提供流畅的用户体验</p>
            </motion.div>
            {/* 更多特性... */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p>&copy; 2024 公司名称. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage`)

const copyCode = async () => {
  try {
    await window.navigator.clipboard.writeText(generatedCode.value)
    ElMessage.success('代码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.code-section {
  background: var(--el-bg-color-page);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--el-box-shadow-light);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.section-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.code-container {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);
}

.code-language {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.code-content {
  max-height: 400px;
  overflow-y: auto;
  background: var(--el-fill-color-blank);

  pre {
    margin: 0;
    padding: 16px;
  }

  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    color: var(--el-text-color-primary);
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.code-content::-webkit-scrollbar {
  width: 6px;
}

.code-content::-webkit-scrollbar-track {
  background: var(--el-fill-color-light);
}

.code-content::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 3px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}
</style>