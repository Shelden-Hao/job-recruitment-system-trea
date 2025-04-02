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

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择注册角色', trigger: 'change' }
  ]
};

const formRef = ref(null);
const loading = ref(false);

// 注册方法
const handleRegister = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (valid) {
      loading.value = true;
      
      try {
        await authStore.register({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          role: registerForm.role
        });
        
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('注册失败:', error);
        uni.showToast({
          title: error.response?.data?.message || '注册失败，请稍后重试',
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
      
      <u-form
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        labelPosition="top"
      >
        <u-form-item label="用户名" prop="username">
          <u-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            border="bottom"
            clearable
          />
        </u-form-item>
        
        <u-form-item label="邮箱" prop="email">
          <u-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            border="bottom"
            clearable
          />
        </u-form-item>
        
        <u-form-item label="密码" prop="password">
          <u-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            border="bottom"
            clearable
          />
        </u-form-item>
        
        <u-form-item label="确认密码" prop="confirmPassword">
          <u-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            border="bottom"
            clearable
          />
        </u-form-item>
        
        <u-form-item label="注册角色" prop="role">
          <u-radio-group v-model="registerForm.role">
            <u-radio label="求职者" name="jobseeker"></u-radio>
            <u-radio label="企业" name="company"></u-radio>
          </u-radio-group>
        </u-form-item>
        
        <view class="form-actions">
          <u-button
            type="primary"
            :loading="loading"
            @click="handleRegister"
          >注册</u-button>
          
          <view class="login-link">
            <text>已有账号？</text>
            <text class="link" @click="goToLogin">立即登录</text>
          </view>
        </view>
      </u-form>
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
  
  .form-actions {
    margin-top: 40rpx;
    
    .u-button {
      width: 100%;
      margin-bottom: 24rpx;
    }
  }
  
  .login-link {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    
    .link {
      color: #2979ff;
      margin-left: 8rpx;
    }
  }
  
  .u-radio-group {
    display: flex;
    justify-content: space-around;
    margin-top: 16rpx;
  }
}
</style>