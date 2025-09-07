<!-- 步骤选择器 -->
<script setup lang="ts">
import Popover from '@/components/Popover/index.vue';

// 定义步骤类型
interface StepItem {
  id: string;
  name: string;
  description?: string;
}

// 固定的步骤选项
const stepList: StepItem[] = [
  {
    id: '1',
    name: '岗位筛选',
    description: '根据岗位要求进行初步筛选'
  },
  {
    id: '2',
    name: '机考',
    description: '进行机考测试评估'
  },
  {
    id: '3',
    name: '材料收集',
    description: '收集相关材料和文档'
  },
  {
    id: '4',
    name: '名词解释',
    description: '对专业术语进行解释说明'
  }
];

// 当前选中的步骤
const currentStep = ref<StepItem>(stepList[0]);

// 当前步骤名称
const currentStepName = computed(() => currentStep.value?.name);

/* 弹出面板 开始 */
const popoverStyle = ref({
  width: '200px',
  padding: '4px',
  height: 'fit-content',
  background: 'var(--el-bg-color, #fff)',
  border: '1px solid var(--el-border-color-light)',
  borderRadius: '8px',
  boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
});
const popoverRef = ref();

// 显示
function showPopover() {
  // 可以在这里添加显示时的逻辑
}

// 点击选择步骤
function handleClick(item: StepItem) {
  currentStep.value = item;
  popoverRef.value?.hide?.();

  // 触发自定义事件，通知父组件步骤变化
  emit('change', item);
}

// 定义事件
const emit = defineEmits<{
  change: [step: StepItem]
}>();

// 定义组件实例类型
export interface StepSelectInstance {
  getCurrentStep: () => StepItem | undefined;
  setCurrentStep: (step: string) => void;
}

// 暴露方法给父组件
defineExpose({
  getCurrentStep: () => currentStep.value,
  setCurrentStep: (step: string) => {
    currentStep.value = stepList.find(item => item.name === step) || stepList[0];
  }
});
</script>

<template>
  <div class="step-select">
    <Popover
      ref="popoverRef"
      placement="top-start"
      :offset="[4, 0]"
      popover-class="popover-content"
      :popover-style="popoverStyle"
      trigger="clickTarget"
      @show="showPopover"
    >
      <!-- 触发元素插槽 -->
      <template #trigger>
        <div
          class="step-select-box select-none flex items-center gap-4px p-10px rounded-10px cursor-pointer font-size-14px border-[rgba()]"
        >
          <!-- <div class="step-select-box-icon">
            <SvgIcon name="list" size="12" />
          </div> -->
          <div class="step-select-box-text font-size-12px">
            {{ currentStepName }}
          </div>
        </div>
      </template>

      <div class="popover-content-box">
        <div
          v-for="item in stepList"
          :key="item.id"
          class="popover-content-box-items w-full rounded-8px select-none transition-all transition-duration-300 flex items-center hover:cursor-pointer hover:bg-[rgba(0,0,0,.04)]"
        >
          <Popover
            trigger-class="popover-trigger-item-text"
            popover-class="rounded-tooltip"
            placement="right"
            trigger="hover"
            :offset="[12, 0]"
          >
            <template #trigger>
              <div
                class="popover-content-box-item p-4px font-size-14px text-overflow line-height-16px"
                :class="{ 'bg-[rgba(0,0,0,.04)] is-select': item.name === currentStepName }"
                @click="handleClick(item)"
              >
                {{ item.name }}
              </div>
            </template>
            <div
              class="popover-content-box-item-text text-wrap max-w-200px rounded-lg p-8px font-size-14px line-height-tight"
            >
              {{ item.description }}
            </div>
          </Popover>
        </div>
      </div>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.step-select-box {
  color: var(--el-color-success, #67c23a);
  background: var(--el-color-success-light-9, rgb(240 249 235));
  border: 1px solid var(--el-color-success, #67c23a);
  border-radius: 10px;
}
.popover-content-box-item.is-select {
  font-weight: 700;
  color: var(--el-color-success, #67c23a);
}
.popover-content-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden auto;
  .popover-content-box-items {
    :deep() {
      .popover-trigger-item-text {
        width: 100%;
      }
    }
  }
  .popover-content-box-item-text {
    color: white;
    background-color: black;
  }

  // 滚动条样式
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #f5f5f5;
  }
  &::-webkit-scrollbar-thumb {
    background: #cccccc;
    border-radius: 4px;
  }
}
</style>
