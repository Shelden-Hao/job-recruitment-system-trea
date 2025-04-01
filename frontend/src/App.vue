<script>
import { defineComponent } from 'vue';
import { useAuthStore } from './stores/auth';
import { initSocket, closeSocket } from './services/socket';

export default defineComponent({
  onLaunch: async function() {
    const authStore = useAuthStore();
    // 如果有token，获取当前用户信息
    if (authStore.token) {
      try {
        await authStore.fetchCurrentUser();
        // 初始化Socket连接
        initSocket();
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    }
  },
  onUnload: function() {
    closeSocket();
  }
});
</script>

<template>
  <view class="app-container">
    <page-meta>
      <navigation-bar />
    </page-meta>
    <!-- 页面内容区域 -->
    <view class="content">
      <slot></slot>
    </view>
  </view>
</template>

<style>
/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  background-color: #f5f7fa;
}

/* 通用样式 */
.container {
  padding: 30rpx;
}

.card {
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 12rpx 0 rgba(0, 0, 0, 0.1);
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 30rpx;
  color: #303133;
}

.text-center {
  text-align: center;
}

.mt-20 {
  margin-top: 40rpx;
}

.mb-20 {
  margin-bottom: 40rpx;
}
</style>
