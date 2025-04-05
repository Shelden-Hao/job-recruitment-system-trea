<template>
  <view class="container">
    <view class="login-card">
      <view class="logo-section">
        <image src="/static/images/logo.jpg" mode="aspectFit" class="logo"></image>
      </view>

      <view class="form-section">
        <form @submit="handleLogin">
          <view class="form-item">
            <text class="form-label">账号</text>
            <input
              class="form-input"
              v-model="formData.username"
              placeholder="请输入账号"
              name="username"
            />
          </view>

          <view class="form-item">
            <text class="form-label">密码</text>
            <input
              class="form-input"
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              name="password"
            />
          </view>

          <view class="button-group">
            <button
              class="login-button"
              form-type="submit"
              :loading="loading"
            >登录</button>
            <view class="register-link" @click="goToRegister">还没有账号？立即注册</view>
          </view>
        </form>
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
    const loading = ref(false);

    const formData = reactive({
      username: '',
      password: ''
    });

    const validateForm = () => {
      if (!formData.username) {
        uni.showToast({
          title: '请输入账号',
          icon: 'none'
        });
        return false;
      }

      if (!formData.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        });
        return false;
      }

      return true;
    };

    const handleLogin = async () => {
      if (!validateForm()) return;

      try {
        loading.value = true;
        await authStore.login(formData);
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
      } catch (error) {
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
  form {
    width: 100%;
  }

  .form-item {
    margin-bottom: 20rpx;

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #303133;
      margin-bottom: 8rpx;
    }

    .form-input {
      width: 100%;
      height: 80rpx;
      border-bottom: 1px solid #dcdfe6;
      font-size: 28rpx;
      padding: 0 10rpx;
    }
  }

  .button-group {
    margin-top: 40rpx;

    .login-button {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      background-color: #409EFF;
      color: #ffffff;
      border-radius: 8rpx;
      font-size: 30rpx;
    }

    .register-link {
      text-align: center;
      margin-top: 20rpx;
      color: #409EFF;
      font-size: 28rpx;
    }
  }
}
</style>
