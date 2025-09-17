<template>
  <div class="header-section">
    <div class="title-area">
      <div class="title-with-icon">
        <el-icon class="title-icon">
          <MagicStick />
        </el-icon>
        <h1 class="main-title">Figma Make 页面生成结果</h1>
      </div>
      <p class="subtitle">AI 驱动的页面生成完整展示</p>
    </div>

    <div class="progress-area">
      <div class="progress-info">
        <span class="progress-text">生成完成</span>
        <span class="progress-percentage">100%</span>
      </div>
      <el-progress
        :percentage="100"
        :show-text="false"
        :stroke-width="8"
        class="progress-bar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MagicStick } from '@element-plus/icons-vue'

defineOptions({
  name: 'HeaderSection'
})
</script>

<style scoped lang="scss">
.header-section {
  text-align: center;
  padding: 32px 0;
  background: var(--el-bg-color-page);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}

.title-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.title-icon {
  font-size: 32px;
  color: var(--el-color-primary);
}

.main-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.subtitle {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0 0 32px 0;
}

.progress-area {
  max-width: 400px;
  margin: 0 auto;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.progress-percentage {
  font-size: 14px;
  color: var(--el-color-primary);
  font-weight: 600;
}

.progress-bar {
  :deep(.el-progress-bar__outer) {
    background-color: var(--el-fill-color-light);
  }
}
</style>