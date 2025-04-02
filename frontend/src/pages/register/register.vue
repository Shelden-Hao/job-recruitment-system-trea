<template>
  <view class="container">
    <view class="register-card">
      <view class="logo-section">
        <image src="/static/images/logo.png" mode="aspectFit" class="logo"></image>
        <text class="title">用户注册</text>
      </view>
      
      <view class="form-section">
        <u-form :model="formData" ref="form" :rules="rules">
          <u-form-item label="用户名" prop="username">
            <u-input
              v-model="formData.username"
              placeholder="请输入用户名"
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
          
          <u-form-item label="确认密码" prop="confirmPassword">
            <u-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :border="true"
            />
          </u-form-item>
          
          <u-form-item label="角色" prop="role">
            <u-radio-group v-model="formData.role">
              <u-radio label="求职者" name="jobseeker"></u-radio>
              <u-radio label="企业" name="company"></u-radio>
            </u-radio-group>
          </u-form-item>
          
          <u-form-item label="邮箱" prop="email">
            <u-input
              v-model="formData.email"
              placeholder="请输入邮箱"
              :border="true"
            />
          </u-form-item>
        </u-form>
        
        <view class="button-group">
          <u-button type="primary" @click="handleRegister" :loading="loading">注册</u-button>
          <view class="login-link" @click="goToLogin">已有账号？立即登录</view>
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
      password: '',
      confirmPassword: '',
      role: 'jobseeker',
      email: ''
    });
    
    const rules = {
      username: [{
        required: true,
        message: '请输入用户名',
        trigger: ['blur', 'change']
      }],
      password: [{
        required: true,
        message: '请输入密码',
        trigger: ['blur', 'change']
      }, {
        min: 6,
        message: '密码长度不能小于6位',
        trigger: ['blur', 'change']
      }],
      confirmPassword: [{
        required: true,
        message: '请再次输入密码',
        trigger: ['blur', 'change']
      }, {
        validator: (rule, value, callback) => {
          if (value !== formData.password) {
            callback(new Error('两次输入的密码不一致'));
          } else {
            callback();
          }
        },
        trigger: ['blur', 'change']
      }],
      role: [{
        required: true,
        message: '请选择角色',
        trigger: ['blur', 'change']
      }],
      email: [{
        required: true,
        message: '请输入邮箱',
        trigger: ['blur', 'change']
      }, {
        type: 'email',
        message: '请输入正确的邮箱格式',
        trigger: ['blur', 'change']
      }]
    };
    
    const handleRegister = async () => {
      try {
        loading.value = true;
        await form.value.validate();
        await authStore.register(formData);
      } catch (error) {
        if (error.errors) return; // 表单验证错误
        uni.showToast({
          title: error.message || '注册失败',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };
    
    const goToLogin = () => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    };
    
    return {
      formData,
      rules,
      form,
      loading,
      handleRegister,
      goToLogin
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

.register-card {
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
    
    .login-link {
      text-align: center;
      margin-top: 20rpx;
      color: #409EFF;
      font-size: 28rpx;
    }
  }
}
</style>