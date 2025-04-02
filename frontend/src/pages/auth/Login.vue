<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { onShow } from '@dcloudio/uni-app';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ]
};

const formRef = ref(null);
const loading = ref(false);

// 登录方法
const handleLogin = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (valid) {
      loading.value = true;
      
      try {
        await authStore.login(loginForm);
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('登录失败:', error);
        uni.showToast({
          title: error.response?.data?.message || '登录失败，请检查用户名和密码',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    }
  } catch (error) {
    console.log('表单验证失败');
  }
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
  if (formRef.value) {
    formRef.value.resetFields();
  }
});
</script>

<template>
  <view class="login-container">
    <view class="login-box">
      <view class="login-header">
        <text class="login-title">招聘系统</text>
        <text class="login-subtitle">登录您的账户</text>
      </view>
      
      <u-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        labelPosition="top"
        @keyup.enter="handleLogin"
      >
        <u-form-item label="用户名/邮箱" prop="username">
          <u-input
            v-model="loginForm.username"
            placeholder="请输入用户名或邮箱"
            border="bottom"
            clearable
          />
        </u-form-item>
        
        <u-form-item label="密码" prop="password">
          <u-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            border="bottom"
            clearable
            password
          />
        </u-form-item>
        
        <view class="button-group">
          <u-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            text="登录"
            block
            customStyle="margin-top: 40rpx"
          />
        </view>
      </u-form>
      
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

.button-group {
  margin-top: 40rpx;
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
</style>