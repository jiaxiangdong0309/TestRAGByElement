<template>
  <div class="web-generation-container">
    <div class="content-wrapper">
      <header-section />

      <div class="main-content">
        <div class="left-section">
          <planning-section />
          <code-section />
        </div>

        <div class="right-section">
          <preview-section />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HeaderSection from './components/HeaderSection.vue'
import PlanningSection from './components/PlanningSection.vue'
import CodeSection from './components/CodeSection.vue'
import PreviewSection from './components/PreviewSection.vue'

defineOptions({
  name: 'WebGeneration'
})

const generateData = ref('')

onMounted(() => {
  // 从localStorage获取生成数据
  const storedData = localStorage.getItem('webGenerateData')
  if (storedData) {
    try {
      const data = JSON.parse(storedData)
      generateData.value = data.content
      console.log('获取到生成数据:', generateData.value)
    } catch (error) {
      console.error('解析生成数据失败:', error)
    }
  }
})
</script>

<style scoped lang="scss">
.web-generation-container {
  background: var(--el-bg-color-page);
  padding: 0;
  height: 100vh;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1152px;
  margin: 0 auto;
  padding: 24px;
}

.main-content {
  display: grid;
  grid-template-columns: 540px 540px;
  gap: 24px;
  margin-top: 0;
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 1152px) {
  .content-wrapper {
    padding: 16px;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 12px;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

// 页面滚动条样式
:deep(.web-generation-container) {
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-darker);
    border-radius: 4px;

    &:hover {
      background: var(--el-border-color-dark);
    }
  }
}
</style>