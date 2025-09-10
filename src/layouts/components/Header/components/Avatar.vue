<!-- 头像 -->
<script setup lang="ts">
import Popover from '@/components/Popover/index.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { useUserStore } from '@/stores';
import { useDifyStore } from '@/stores/modules/dify';
import userAvatar from '@/assets/images/user_avatar.png';

import { ref } from 'vue';

const userStore = useUserStore();
const difyStore = useDifyStore();

// 秘钥对话框相关
const secretKeyInput = ref('');

// 保存秘钥
function saveSecretKey() {
  if (secretKeyInput.value.trim()) {
    userStore.setSecretKey(secretKeyInput.value.trim());
    userStore.setToken(secretKeyInput.value.trim());
    ElMessage.success('秘钥保存成功');
    secretKeyInput.value = '';
  } else {
    ElMessage.warning('请输入秘钥');
  }
}

// 显示设置秘钥对话框
function showSecretKeyDialog() {
  ElMessageBox.prompt('请输入您的秘钥 保存后刷新页面即可', '设置秘钥', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputType: 'text',
    inputPlaceholder: '请输入秘钥',
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return '请输入秘钥';
      }
      return true;
    },
    inputErrorMessage: '请输入有效的秘钥',
    roundButton: true,
    autofocus: false,
  })
    .then(({ value }) => {
      secretKeyInput.value = value;
      saveSecretKey();
    })
    .catch(() => {
      // 用户取消操作
    });
}

// 显示退出登录对话框
function showLogoutDialog() {
  ElMessageBox.confirm('退出登录不会丢失任何数据，你仍可以登录此账号。', '确认退出登录？', {
    confirmButtonText: '确认退出',
    cancelButtonText: '取消',
    roundButton: true,
    autofocus: false,
  })
    .then(async () => {
      // 在这里执行退出方法
      await userStore.logout();
      // 清空会话列表并回到默认页
      await difyStore.requestSessionList(false, true);
      await difyStore.createSessionBtn();
      ElMessage({
        type: 'success',
        message: '退出成功',
      });
    })
    .catch(() => {
      // 用户取消操作
    });
}

/* 弹出面板 开始 */
const popoverStyle = ref({
  width: '200px',
  padding: '4px',
  height: 'fit-content',
});
const popoverRef = ref();

// 弹出面板内容
const popoverList = ref([
  // {
  //   key: '1',
  //   title: '收藏夹',
  //   icon: 'book-mark-fill',
  // },
  // {
  //   key: '2',
  //   title: '设置',
  //   icon: 'settings-4-fill',
  // },
  {
    key: '3',
    title: '设置秘钥',
    icon: 'key-2-fill',
  },
  // {
  //   key: '4',
  //   divider: true,
  // },
  {
    key: '5',
    title: '退出登录',
    icon: 'logout-box-r-line',
  },
] as Array<{
  key: string;
  title: string;
  icon: string;
  divider?: boolean;
}>);

// 点击
function handleClick(item: any) {
  switch (item.key) {
    case '1':
      ElMessage.warning('暂未开放');
      console.log('点击了收藏夹');
      break;
    case '2':
      ElMessage.warning('暂未开放');
      console.log('点击了设置');
      break;
    case '3':
      popoverRef.value?.hide?.();
      showSecretKeyDialog();
      break;
    case '5':
      popoverRef.value?.hide?.();
      showLogoutDialog();
      break;
    default:
      break;
  }
}

/* 弹出面板 结束 */
</script>

<template>
  <div class="avatar-container">
    <Popover
      ref="popoverRef"
      placement="bottom-end"
      trigger="clickTarget"
      :trigger-style="{ cursor: 'pointer' }"
      popover-class="popover-content"
      :popover-style="popoverStyle"
    >
      <!-- 触发元素插槽 -->
      <template #trigger>
        <!-- <el-avatar :src="src" :size="28" fit="fit" shape="circle" /> -->
        <el-avatar :src="userAvatar" :size="28" fit="fit" shape="circle" />
      </template>

      <div class="popover-content-box shadow-lg">
        <div v-for="item in popoverList" :key="item.key" class="popover-content-box-items h-full">
          <div
            v-if="!item.divider"
            class="popover-content-box-item flex items-center h-full gap-8px p-8px pl-10px pr-12px rounded-lg hover:cursor-pointer hover:bg-[rgba(0,0,0,.04)]"
            @click="handleClick(item)"
          >
            <SvgIcon :name="item.icon!" size="16" class-name="flex-none" />
            <div class="popover-content-box-item-text font-size-14px text-overflow max-h-120px">
              {{ item.title }}
            </div>
          </div>

          <div v-if="item.divider" class="divder h-1px bg-gray-200 my-4px" />
        </div>
      </div>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.popover-content {
  width: 520px;
  height: 520px;
}
.popover-content-box {
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
}

</style>
