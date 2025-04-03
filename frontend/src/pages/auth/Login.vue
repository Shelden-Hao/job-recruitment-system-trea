<script setup>
import { ref, reactive } from 'vue';
import { onShow } from '@dcloudio/uni-app';

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 错误提示
const errors = reactive({
  username: '',
  password: ''
});

const loading = ref(false);

// 验证表单
const validateForm = () => {
  let isValid = true;
  
  // 清除所有错误
  errors.username = '';
  errors.password = '';
  
  // 验证用户名
  if (!loginForm.username.trim()) {
    errors.username = '请输入用户名或邮箱';
    isValid = false;
  }
  
  // 验证密码
  if (!loginForm.password) {
    errors.password = '请输入密码';
    isValid = false;
  } else if (loginForm.password.length < 6) {
    errors.password = '密码长度至少为6个字符';
    isValid = false;
  }
  
  return isValid;
};

// 登录方法
const handleLogin = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  
  // 模拟登录过程
  setTimeout(() => {
    // 模拟登录成功
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    });
    
    // 模拟跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
    
    loading.value = false;
  }, 1000);
};

// 跳转到注册页面
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/auth/register'
  });
};

// 页面显示时执行
onShow(() => {
  // 重置表单
  loginForm.username = '';
  loginForm.password = '';
  errors.username = '';
  errors.password = '';
});
</script>

<template>
  <view class="login-container">
    <view class="login-box">
      <view class="login-header">
        <text class="login-title">招聘系统</text>
        <text class="login-subtitle">登录您的账户</text>
      </view>
      
      <view class="form-container">
        <view class="form-item">
          <text class="form-label">用户名/邮箱</text>
          <input
            class="form-input"
            v-model="loginForm.username"
            placeholder="请输入用户名或邮箱"
            type="text"
          />
          <text v-if="errors.username" class="error-message">{{ errors.username }}</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">密码</text>
          <input
            class="form-input"
            v-model="loginForm.password"
            placeholder="请输入密码"
            password
            type="text"
          />
          <text v-if="errors.password" class="error-message">{{ errors.password }}</text>
        </view>
        
        <view class="button-group">
          <button
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >登录</button>
        </view>
      </view>
      
      <view class="login-footer">
        <text class="register-text">还没有账户？</text>
        <text class="register-link" @click="goToRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx;
}

.login-box {
  width: 100%;
  max-width: 600rpx;
  padding: 40rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .login-title {
    font-size: 48rpx;
    font-weight: bold;
    color: #2979ff;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .login-subtitle {
    font-size: 28rpx;
    color: #909399;
    display: block;
  }
}

.form-container {
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #606266;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #303133;
  border: none;
  border-bottom: 1px solid #dcdfe6;
  background-color: transparent;
  box-sizing: border-box;
}

.button-group {
  margin-top: 60rpx;
}

.login-button {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #2979ff;
  color: #ffffff;
  border: none;
  border-radius: 8rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.login-footer {
  margin-top: 40rpx;
  text-align: center;
  
  .register-text {
    font-size: 28rpx;
    color: #909399;
  }
  
  .register-link {
    font-size: 28rpx;
    color: #2979ff;
    margin-left: 10rpx;
  }
}

.error-message {
  display: block;
  font-size: 24rpx;
  color: #fa3534;
  margin-top: 8rpx;
}
</style>