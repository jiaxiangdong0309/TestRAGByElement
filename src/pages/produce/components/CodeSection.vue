<template>
  <div class="code-section">
    <div class="section-header">
      <div class="icon-container">
        <!-- Code 图标占位符 -->
      </div>
      <h3 class="section-title">生成的代码</h3>
    </div>

    <div class="code-container">
      <div class="code-content">
        <pre class="code-block"><code>{{ generatedCode }}</code></pre>
      </div>
      <div class="code-actions">
        <el-button
          type="primary"
          size="small"
          :icon="CopyDocument"
          @click="copyCode"
        >
          复制代码
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const generatedCode = ref(`import { motion } from 'motion/react';
import { Button } from './ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}`)

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
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid var(--el-border-color-light);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 40px;
}

.icon-container {
  width: 20px;
  height: 20px;
  background: var(--el-color-primary);
  border-radius: 6px;
  flex-shrink: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.code-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.code-content {
  flex: 1;
  overflow: hidden;
}

.code-block {
  margin: 0;
  padding: 16px;

  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-primary);
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.code-actions {
  padding: 12px 16px;
  background: var(--el-fill-color-lighter);
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
}

</style>