<template>
  <view class="container">
    <view class="login-card">
      <view class="logo-section">
        <image src="/static/images/logo.png" mode="aspectFit" class="logo"></image>
        <text class="title">欢迎登录</text>
      </view>
      
      <view class="form-section">
        <u-form :model="formData" ref="form">
          <u-form-item label="账号" prop="username">
            <u-input
              v-model="formData.username"
              placeholder="请输入账号"
              :border="true"
            />
          </u-form-item>
          
          <u-form-item label="密码" prop="password">
            <u-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              :border="true"
            />
          </u-form-item>
        </u-form>
        
        <view class="button-group">
          <u-button type="primary" @click="handleLogin" :loading="loading">登录</u-button>
          <view class="register-link" @click="goToRegister">还没有账号？立即注册</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';

export default {
  setup() {
    const authStore = useAuthStore();
    const form = ref(null);
    const loading = ref(false);
    
    const formData = reactive({
      username: '',
      password: ''
    });
    
    const rules = {
      username: [{
        required: true,
        message: '请输入账号',
        trigger: ['blur', 'change']
      }],
      password: [{
        required: true,
        message: '请输入密码',
        trigger: ['blur', 'change']
      }]
    };
    
    const handleLogin = async () => {
      try {
        loading.value = true;
        await form.value.validate();
        await authStore.login(formData);
      } catch (error) {
        if (error.errors) return; // 表单验证错误
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };
    
    const goToRegister = () => {
      uni.navigateTo({
        url: '/pages/register/register'
      });
    };
    
    return {
      formData,
      rules,
      form,
      loading,
      handleLogin,
      goToRegister
    };
  }
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40rpx;
}

.login-card {
  width: 100%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.logo-section {
  text-align: center;
  margin-bottom: 40rpx;
  
  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 20rpx;
  }
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #303133;
  }
}

.form-section {
  .button-group {
    margin-top: 40rpx;
    
    .register-link {
      text-align: center;
      margin-top: 20rpx;
      color: #409EFF;
      font-size: 28rpx;
    }
  }
}
</style>