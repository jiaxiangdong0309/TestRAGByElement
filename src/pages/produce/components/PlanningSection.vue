<template>
  <div class="planning-section">
    <div class="section-header">
      <div class="icon-container">
        <!-- List 图标占位符 -->
      </div>
      <h3 class="section-title">组件规划</h3>
    </div>

    <div class="components-list">
      <div
        v-for="(component, index) in components"
        :key="component.id"
        class="component-item"
        :class="{ 'active': index <= currentStep }"
      >
        <div class="component-info">
          <div class="component-name">{{ component.name }}</div>
          <div class="component-description">{{ component.description }}</div>
        </div>
        <div class="component-badge">
          {{ component.badge }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Component {
  id: string
  name: string
  description: string
  badge: string
}

const components: Component[] = [
  {
    id: 'header',
    name: 'Header',
    description: 'Main navigation with logo and menu',
    badge: 'Navigation'
  },
  {
    id: 'hero',
    name: 'Hero',
    description: 'Eye-catching hero section with CTA',
    badge: 'Banner'
  },
  {
    id: 'features',
    name: 'Features',
    description: 'Feature showcase grid',
    badge: 'Content'
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Footer with links and contact info',
    badge: 'Navigation'
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
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid var(--el-border-color-light);
  margin-bottom: 24px;
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

.components-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.component-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &.active {
    .component-name {
      color: var(--el-color-primary);
    }
  }
}

.component-info {
  flex: 1;
  padding-left: 12px;
}

.component-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.component-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.component-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
</style>