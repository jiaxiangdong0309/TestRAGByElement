<template>
  <div class="web-generation-container">
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
  min-height: 100vh;
  background: var(--el-bg-color);
  padding: 24px;
}

.main-content {
  display: flex;
  gap: 24px;
  margin-top: 24px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-section {
  flex: 1;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .left-section,
  .right-section {
    flex: 100%;
  }
}
</style>