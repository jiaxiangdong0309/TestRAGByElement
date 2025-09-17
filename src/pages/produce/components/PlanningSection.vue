<template>
  <div class="planning-section">
    <div class="section-header">
      <el-icon class="section-icon">
        <List />
      </el-icon>
      <h3 class="section-title">组件规划</h3>
    </div>

    <div class="components-list">
      <div
        v-for="(component, index) in components"
        :key="component.id"
        class="component-item"
        :class="{ 'active': index <= currentStep }"
      >
        <div class="component-number">{{ index + 1 }}</div>
        <div class="component-info">
          <h4 class="component-name">{{ component.name }}</h4>
          <p class="component-description">{{ component.description }}</p>
        </div>
        <el-icon
          v-if="index <= currentStep"
          class="check-icon"
        >
          <Check />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { List, Check } from '@element-plus/icons-vue'

interface Component {
  id: string
  name: string
  description: string
}

const components: Component[] = [
  {
    id: 'header',
    name: 'Header',
    description: 'Navigation'
  },
  {
    id: 'hero',
    name: 'Hero',
    description: 'Banner'
  },
  {
    id: 'features',
    name: 'Features',
    description: 'Content'
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Navigation'
  }
]

const currentStep = ref(0)

onMounted(() => {
  // 模拟组件按顺序执行
  const animateSteps = () => {
    components.forEach((_, index) => {
      setTimeout(() => {
        currentStep.value = index
      }, index * 800)
    })
  }

  animateSteps()
})
</script>

<style scoped lang="scss">
.planning-section {
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

.components-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &.active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}

.component-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--el-fill-color-blank);
  border: 2px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;

  .component-item.active & {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: white;
  }
}

.component-info {
  flex: 1;
}

.component-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0 0 4px 0;
}

.component-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.check-icon {
  font-size: 20px;
  color: var(--el-color-success);
  flex-shrink: 0;
}
</style>