<script setup lang="ts">
import ChatDefaul from '@/pages/chat/layouts/chatDefaul/index.vue';
import ChatWithId from '@/pages/chat/layouts/chatWithId/index.vue';
import { useDifyStore } from '@/stores/modules/dify';

const difyStore = useDifyStore();
const currentConversationId = computed(() => difyStore.getCurrentConversationId());
</script>

<template>
  <div class="chat-container">
    <!-- 默认聊天页面 -->
    <ChatDefaul v-if="!currentConversationId" />
    <!-- 带id的聊天页面 -->
    <ChatWithId v-else />
  </div>
</template>

<style lang="scss" scoped>
.chat-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100% - 32px);
  height: 100%;
  padding: 0 16px;
  overflow-anchor: none;
}
</style>
