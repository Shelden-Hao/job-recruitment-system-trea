<script>
export default {
  onLaunch: function() {
    // 初始化uView
    uni.$u.config.unit = 'rpx'
    
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<template>
</template>

<style lang="scss">
@import "uview-plus/index.scss";
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
