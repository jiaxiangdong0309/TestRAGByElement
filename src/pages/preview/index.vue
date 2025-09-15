<!-- 网页预览页面 -->
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePreviewStore } from '@/stores/modules/preview';
const previewStore = usePreviewStore();

// 使用computed获取预览数据
const previewData = computed(() => previewStore.getPreviewData());

onMounted(() => {
  // 检查是否有预览数据
  if (!previewData.value) {
    console.warn('未找到预览数据，可能是直接访问了预览页面');
    // 如果没有数据，可以跳转回聊天页面
    // router.push('/');
  } else {
    console.log('预览页面接收到的数据:', previewData.value);
  }
});
</script>

<template>
  <div class="preview-container">
    <div class="preview-header">
      <h1>网页预览</h1>
      <p>这里将显示生成的网页内容</p>
    </div>

    <div class="preview-content">
      <div v-if="previewData" class="data-display">
        <h2>接收到的数据：</h2>
        <pre>{{ JSON.stringify(previewData, null, 2) }}</pre>
      </div>
      <div v-else class="no-data">
        <p>暂无预览数据</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .preview-header {
    text-align: center;
    margin-bottom: 30px;

    h1 {
      color: #333;
      margin-bottom: 10px;
    }

    p {
      color: #666;
      font-size: 14px;
    }
  }

  .preview-content {
    .data-display {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;

      h2 {
        margin-bottom: 15px;
        color: #333;
      }

      pre {
        background: #fff;
        padding: 15px;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
        overflow-x: auto;
        font-size: 12px;
        line-height: 1.4;
      }
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  }
}
</style>
