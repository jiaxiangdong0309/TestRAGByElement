<template>
  <div class="preview-section">
    <div class="preview-header">
      <div class="section-header">
        <div class="icon-container">
          <!-- View 图标占位符 -->
        </div>
        <h3 class="section-title">生成的页面预览</h3>
      </div>
    </div>

    <div class="preview-container">
      <div class="preview-content">
        <div class="mock-browser">
          <div class="mock-page">
            <!-- Header 模拟 -->
            <div class="mock-header">
              <div class="mock-logo">Logo</div>
              <div class="mock-nav">
                <div class="nav-item">首页</div>
                <div class="nav-item">关于</div>
                <div class="nav-item">联系</div>
              </div>
            </div>

            <!-- Hero 模拟 -->
            <div class="mock-hero">
              <div class="hero-content">
                <div class="hero-title">欢迎使用 AI 生成页面</div>
                <div class="hero-subtitle">快速、智能、美观的页面生成体验</div>
                <div class="hero-button">立即开始</div>
              </div>
            </div>

            <!-- Features 模拟 -->
            <div class="mock-features">
              <div class="features-title">核心特性</div>
              <div class="features-grid">
                <div class="feature-card">
                  <div class="feature-text">智能生成</div>
                </div>
                <div class="feature-card">
                  <div class="feature-text">响应式设计</div>
                </div>
                <div class="feature-card">
                  <div class="feature-text">组件化</div>
                </div>
                <div class="feature-card">
                  <div class="feature-text">高性能</div>
                </div>
              </div>
            </div>

            <!-- Footer 模拟 -->
            <div class="mock-footer">
              <div class="footer-text">© 2024 Figma Make. All rights reserved.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成完成提示 -->
    <div class="success-banner">
      <div class="success-icon">
        <!-- CircleCheck 图标占位符 -->
      </div>
      <div class="success-content">
        <div class="success-title">生成完成！</div>
        <div class="success-description">您的页面已经成功生成，展示了完整的设计和功能实现</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PreviewSection'
})
</script>

<style scoped lang="scss">
.preview-section {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid var(--el-border-color-light);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
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

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-content {
  flex: 1;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.mock-browser {
  min-height: 100%;
  background: white;
}

.mock-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.mock-header {
  height: 56px;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.mock-logo {
  font-size: 14px;
  font-weight: 500;
}

.mock-nav {
  display: flex;
  gap: 16px;
}

.nav-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.mock-hero {
  padding: 32px;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 424px;
  margin: 0 auto;
}

.hero-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 14px;
  margin-bottom: 24px;
  opacity: 0.9;
}

.hero-button {
  display: inline-block;
  padding: 8px 16px;
  background: white;
  color: var(--el-color-primary);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  margin: 0 auto;
}

.mock-features {
  padding: 32px;
  background: white;
  flex: 1;
}

.features-title {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32px;
  color: var(--el-text-color-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 424px;
  margin: 0 auto;
}

.feature-card {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.feature-text {
  font-size: 12px;
  text-align: center;
  color: var(--el-text-color-primary);
}

.mock-footer {
  padding: 16px;
  background: var(--el-fill-color);
  border-top: 1px solid var(--el-border-color-light);
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.success-banner {
  text-align: center;
  padding: 32px 0;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: var(--el-color-success);
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-content {
  max-width: 540px;
  margin: 0 auto;
}

.success-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
}

.success-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
</style>