<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

// 表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'jobseeker' // 默认为求职者
});

// 错误信息
const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
});

const loading = ref(false);

// 验证邮箱格式
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证表单
const validateForm = () => {
  let isValid = true;
  
  // 清除所有错误
  errors.username = '';
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';
  errors.role = '';
  
  // 验证用户名
  if (!registerForm.username.trim()) {
    errors.username = '请输入用户名';
    isValid = false;
  } else if (registerForm.username.length < 3) {
    errors.username = '用户名长度至少为3个字符';
    isValid = false;
  }
  
  // 验证邮箱
  if (!registerForm.email.trim()) {
    errors.email = '请输入邮箱';
    isValid = false;
  } else if (!validateEmail(registerForm.email)) {
    errors.email = '请输入正确的邮箱格式';
    isValid = false;
  }
  
  // 验证密码
  if (!registerForm.password) {
    errors.password = '请输入密码';
    isValid = false;
  } else if (registerForm.password.length < 6) {
    errors.password = '密码长度至少为6个字符';
    isValid = false;
  }
  
  // 验证确认密码
  if (!registerForm.confirmPassword) {
    errors.confirmPassword = '请确认密码';
    isValid = false;
  } else if (registerForm.confirmPassword !== registerForm.password) {
    errors.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  }
  
  // 验证角色
  if (!registerForm.role) {
    errors.role = '请选择注册角色';
    isValid = false;
  }
  
  return isValid;
};

// 注册方法
const handleRegister = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  
  // 模拟注册过程
  setTimeout(() => {
    // 模拟注册成功
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    });
    
    // 模拟跳转到登录页面
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/auth/login'
      });
    }, 1500);
    
    loading.value = false;
  }, 1000);
};

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  });
};
</script>

<template>
  <view class="register-container">
    <view class="register-box">
      <view class="register-header">
        <text class="register-title">招聘系统</text>
        <text class="register-subtitle">创建新账户</text>
      </view>
      
      <view class="form-container">
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input
            class="form-input"
            v-model="registerForm.username"
            placeholder="请输入用户名"
            type="text"
          />
          <text v-if="errors.username" class="error-message">{{ errors.username }}</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input
            class="form-input"
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            type="text"
          />
          <text v-if="errors.email" class="error-message">{{ errors.email }}</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">密码</text>
          <input
            class="form-input"
            v-model="registerForm.password"
            placeholder="请输入密码"
            password
            type="text"
          />
          <text v-if="errors.password" class="error-message">{{ errors.password }}</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">确认密码</text>
          <input
            class="form-input"
            v-model="registerForm.confirmPassword"
            placeholder="请确认密码"
            password
            type="text"
          />
          <text v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">注册角色</text>
          <view class="radio-group">
            <view class="radio-item" @click="registerForm.role = 'jobseeker'">
              <view class="radio-dot" :class="{ active: registerForm.role === 'jobseeker' }"></view>
              <text class="radio-label">求职者</text>
            </view>
            <view class="radio-item" @click="registerForm.role = 'company'">
              <view class="radio-dot" :class="{ active: registerForm.role === 'company' }"></view>
              <text class="radio-label">企业</text>
            </view>
          </view>
          <text v-if="errors.role" class="error-message">{{ errors.role }}</text>
        </view>
        
        <view class="form-actions">
          <button
            class="register-button"
            :loading="loading"
            @click="handleRegister"
          >注册</button>
          
          <view class="login-link">
            <text>已有账号？</text>
            <text class="link" @click="goToLogin">立即登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  padding: 30rpx;
  background-color: #f5f5f5;
  
  .register-box {
    padding: 40rpx;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }
  
  .register-header {
    text-align: center;
    margin-bottom: 40rpx;
    
    .register-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 16rpx;
    }
    
    .register-subtitle {
      font-size: 28rpx;
      color: #666;
    }
  }
  
  .form-container {
    .form-item {
      margin-bottom: 30rpx;
      
      .form-label {
        display: block;
        margin-bottom: 12rpx;
        font-size: 28rpx;
        color: #606266;
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
      
      .error-message {
        display: block;
        margin-top: 8rpx;
        font-size: 24rpx;
        color: #fa3534;
      }
    }
  }
  
  .form-actions {
    margin-top: 50rpx;
    
    .register-button {
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
  }
  
  .login-link {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    margin-top: 24rpx;
    
    .link {
      color: #2979ff;
      margin-left: 8rpx;
    }
  }
  
  .radio-group {
    display: flex;
    justify-content: space-around;
    margin-top: 16rpx;
    
    .radio-item {
      display: flex;
      align-items: center;
      
      .radio-dot {
        display: inline-block;
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        border: 2rpx solid #dcdfe6;
        margin-right: 12rpx;
        position: relative;
        
        &.active {
          border-color: #2979ff;
          
          &:after {
            content: '';
            position: absolute;
            width: 24rpx;
            height: 24rpx;
            background-color: #2979ff;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
      }
      
      .radio-label {
        font-size: 28rpx;
        color: #606266;
      }
    }
  }
}
</style>