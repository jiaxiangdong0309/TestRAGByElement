<!-- 头像 -->
<script setup lang="ts">
import Popover from '@/components/Popover/index.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { useUserStore } from '@/stores';
import { useDifyStore } from '@/stores/modules/dify';
import { USER_AVATAR } from '@/config';
import { ref } from 'vue';

const userStore = useUserStore();
const difyStore = useDifyStore();
const src = computed(
  () => userStore.userInfo?.avatar ?? USER_AVATAR,
);

// 秘钥对话框相关
const showSecretKeyDialog = ref(false);
const secretKeyInput = ref('');

// 保存秘钥
function saveSecretKey() {
  if (secretKeyInput.value.trim()) {
    userStore.setSecretKey(secretKeyInput.value.trim());
    userStore.setToken(secretKeyInput.value.trim());
    ElMessage.success('秘钥保存成功');
    showSecretKeyDialog.value = false;
    secretKeyInput.value = '';
  } else {
    ElMessage.warning('请输入秘钥');
  }
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
]);

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
      showSecretKeyDialog.value = true;
      break;
    case '5':
      popoverRef.value?.hide?.();
      ElMessageBox.confirm('退出登录不会丢失任何数据，你仍可以登录此账号。', '确认退出登录？', {
        confirmButtonText: '确认退出',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        cancelButtonClass: 'el-button--info',
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
          // ElMessage({
          //   type: 'info',
          //   message: '取消',
          // });
        });
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
        <el-avatar :src="src" :size="28" fit="fit" shape="circle" />
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

  <!-- 秘钥设置对话框 -->
  <el-dialog
    v-model="showSecretKeyDialog"
    title="设置秘钥"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="secret-key-dialog">
      <div class="mb-16px">
        <label class="block text-sm font-medium text-gray-700 mb-8px">
          请输入您的秘钥
        </label>
        <el-input
          v-model="secretKeyInput"
          type="text"
          placeholder="请输入秘钥"
          :rows="3"
          resize="none"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showSecretKeyDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSecretKey">保存</el-button>
      </div>
    </template>
  </el-dialog>
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

.secret-key-dialog {
  /* 秘钥设置对话框样式 */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
