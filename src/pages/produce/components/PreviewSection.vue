<template>
  <div class="preview-section">
    <div class="section-header">
      <el-icon class="section-icon">
        <View />
      </el-icon>
      <h3 class="section-title">页面预览</h3>
    </div>

    <div class="preview-container">
      <div class="preview-header">
        <div class="preview-controls">
          <div class="browser-controls">
            <div class="browser-dot red"></div>
            <div class="browser-dot yellow"></div>
            <div class="browser-dot green"></div>
          </div>
          <div class="preview-url">
            <el-input
              v-model="previewUrl"
              size="small"
              readonly
              class="url-input"
            />
          </div>
        </div>
        <el-button
          size="small"
          :icon="FullScreen"
          @click="toggleFullscreen"
        >
          全屏预览
        </el-button>
      </div>

      <div class="preview-content">
        <div class="mock-page">
          <!-- Header 模拟 -->
          <div class="mock-header">
            <div class="mock-logo"></div>
            <div class="mock-nav">
              <div class="mock-nav-item"></div>
              <div class="mock-nav-item"></div>
              <div class="mock-nav-item"></div>
              <div class="mock-button"></div>
            </div>
          </div>

          <!-- Hero 模拟 -->
          <div class="mock-hero">
            <div class="mock-hero-content">
              <div class="mock-hero-title"></div>
              <div class="mock-hero-subtitle"></div>
              <div class="mock-hero-button"></div>
            </div>
          </div>

          <!-- Features 模拟 -->
          <div class="mock-features">
            <div class="mock-features-title"></div>
            <div class="mock-features-grid">
              <div class="mock-feature-card"></div>
              <div class="mock-feature-card"></div>
              <div class="mock-feature-card"></div>
            </div>
          </div>

          <!-- Footer 模拟 -->
          <div class="mock-footer">
            <div class="mock-footer-content"></div>
          </div>
        </div>
      </div>

      <!-- 生成完成提示 -->
      <div class="success-banner">
        <el-icon class="success-icon">
          <CircleCheck />
        </el-icon>
        <div class="success-text">
          <div class="success-title">生成完成！</div>
          <div class="success-description">您的网页已经成功生成，可以进行预览和导出</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { View, FullScreen, CircleCheck } from '@element-plus/icons-vue'

const previewUrl = ref('https://example.com/generated-page')

const toggleFullscreen = () => {
  // 全屏预览逻辑
  console.log('Toggle fullscreen preview')
}
</script>

<style scoped lang="scss">
.preview-section {
  background: var(--el-bg-color-page);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--el-box-shadow-light);
  height: 100%;
  display: flex;
  flex-direction: column;
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

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.browser-controls {
  display: flex;
  gap: 6px;
}

.browser-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;

  &.red {
    background: #ff5f56;
  }

  &.yellow {
    background: #ffbd2e;
  }

  &.green {
    background: #27ca3f;
  }
}

.url-input {
  width: 200px;
}

.preview-content {
  flex: 1;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.mock-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mock-header {
  height: 60px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.mock-logo {
  width: 32px;
  height: 32px;
  background: var(--el-color-primary);
  border-radius: 6px;
}

.mock-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mock-nav-item {
  width: 40px;
  height: 4px;
  background: #dee2e6;
  border-radius: 2px;
}

.mock-button {
  width: 60px;
  height: 32px;
  background: var(--el-color-primary);
  border-radius: 4px;
}

.mock-hero {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.mock-hero-content {
  text-align: center;
}

.mock-hero-title {
  width: 200px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  margin: 0 auto 16px;
}

.mock-hero-subtitle {
  width: 300px;
  height: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  margin: 0 auto 24px;
}

.mock-hero-button {
  width: 100px;
  height: 40px;
  background: white;
  border-radius: 20px;
  margin: 0 auto;
}

.mock-features {
  padding: 40px 20px;
  background: white;
}

.mock-features-title {
  width: 120px;
  height: 16px;
  background: #dee2e6;
  border-radius: 4px;
  margin: 0 auto 32px;
}

.mock-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.mock-feature-card {
  height: 120px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.mock-footer {
  height: 80px;
  background: #343a40;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-footer-content {
  width: 200px;
  height: 12px;
  background: #6c757d;
  border-radius: 4px;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-8);
  border-radius: 8px;
}

.success-icon {
  font-size: 24px;
  color: var(--el-color-success);
}

.success-text {
  flex: 1;
}

.success-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.success-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>