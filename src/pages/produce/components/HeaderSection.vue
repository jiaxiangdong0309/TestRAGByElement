<template>
  <div class="header-section">
    <div class="title-area">
      <div class="title-with-icon">
        <div class="icon-container">
          <!-- MagicStick 图标占位符 -->
        </div>
        <h1 class="main-title">Figma Make 页面生成结果</h1>
      </div>
      <p class="subtitle">AI 驱动的页面生成完整展示</p>
    </div>

    <div class="progress-area">
      <div class="progress-card">
        <div class="progress-info">
          <div class="progress-left">
            <div class="icon-small">
              <!-- 小图标占位符 -->
            </div>
            <span class="progress-text">生成完成</span>
          </div>
          <span class="progress-percentage">100%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'HeaderSection'
})
</script>

<style scoped lang="scss">
.header-section {
  text-align: center;
  padding: 24px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
  margin-bottom: 24px;
}

.title-area {
  margin-bottom: 24px;
}

.title-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 16px;
}

.icon-container {
  width: 32px;
  height: 32px;
  background: var(--el-color-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.main-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.progress-area {
  max-width: 100%;
}

.progress-card {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-small {
  width: 24px;
  height: 24px;
  background: var(--el-color-primary);
  border-radius: 6px;
  flex-shrink: 0;
}

.progress-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.progress-percentage {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  width: 100%;
  height: 100%;
  background: var(--el-color-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>