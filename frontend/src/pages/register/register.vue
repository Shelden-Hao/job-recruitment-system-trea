<template>
  <view class="container">
    <view class="register-card">
      <view class="logo-section">
        <image src="/static/images/logo.jpg" mode="aspectFit" class="logo"></image>
      </view>

      <view class="form-section">
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input
            class="form-input"
            v-model="formData.username"
            placeholder="请输入用户名"
            @blur="validateField('username')"
          />
          <text class="error-message" v-if="errors.username">{{errors.username}}</text>
        </view>

        <view class="form-item">
          <text class="form-label">密码</text>
          <input
            class="form-input"
            v-model="formData.password"
            password
            placeholder="请输入密码"
            @blur="validateField('password')"
          />
          <text class="error-message" v-if="errors.password">{{errors.password}}</text>
        </view>

        <view class="form-item">
          <text class="form-label">确认密码</text>
          <input
            class="form-input"
            v-model="formData.confirmPassword"
            password
            placeholder="请再次输入密码"
            @blur="validateField('confirmPassword')"
          />
          <text class="error-message" v-if="errors.confirmPassword">{{errors.confirmPassword}}</text>
        </view>

        <view class="form-item">
          <text class="form-label">角色</text>
          <view class="radio-group">
            <view class="radio-item" @click="formData.role = 'jobseeker'">
              <radio :checked="formData.role === 'jobseeker'" color="#409EFF" />
              <text class="radio-text">求职者</text>
            </view>
            <view class="radio-item" @click="formData.role = 'company'">
              <radio :checked="formData.role === 'company'" color="#409EFF" />
              <text class="radio-text">企业</text>
            </view>
          </view>
          <text class="error-message" v-if="errors.role">{{errors.role}}</text>
        </view>

        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input
            class="form-input"
            v-model="formData.email"
            placeholder="请输入邮箱"
            @blur="validateField('email')"
          />
          <text class="error-message" v-if="errors.email">{{errors.email}}</text>
        </view>

        <view class="button-group">
          <button class="register-btn" type="primary" @click="handleRegister" :loading="loading">注册</button>
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
    const loading = ref(false);

    const formData = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'jobseeker',
      email: ''
    });

    const errors = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      email: ''
    });

    // 验证单个字段
    const validateField = (field) => {
      errors[field] = '';

      switch(field) {
        case 'username':
          if (!formData.username.trim()) {
            errors.username = '请输入用户名';
          }
          break;
        case 'password':
          if (!formData.password) {
            errors.password = '请输入密码';
          } else if (formData.password.length < 6) {
            errors.password = '密码长度不能小于6位';
          }
          break;
        case 'confirmPassword':
          if (!formData.confirmPassword) {
            errors.confirmPassword = '请再次输入密码';
          } else if (formData.confirmPassword !== formData.password) {
            errors.confirmPassword = '两次输入的密码不一致';
          }
          break;
        case 'role':
          if (!formData.role) {
            errors.role = '请选择角色';
          }
          break;
        case 'email':
          if (!formData.email.trim()) {
            errors.email = '请输入邮箱';
          } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(formData.email)) {
            errors.email = '请输入正确的邮箱格式';
          }
          break;
      }
    };

    // 验证所有字段
    const validateForm = () => {
      // 清空所有错误消息
      Object.keys(errors).forEach(key => {
        errors[key] = '';
      });

      // 验证各字段
      validateField('username');
      validateField('password');
      validateField('confirmPassword');
      validateField('role');
      validateField('email');

      // 检查是否有错误
      return !Object.values(errors).some(value => value !== '');
    };

    const handleRegister = async () => {
      try {
        if (!validateForm()) return;

        loading.value = true;
        // 模拟注册过程
        setTimeout(() => {
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          });

          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/login/login'
            });
          }, 1500);

          loading.value = false;
        }, 1000);
      } catch (error) {
        uni.showToast({
          title: error.message || '注册失败',
          icon: 'none'
        });
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
      errors,
      loading,
      validateField,
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
  .form-item {
    margin-bottom: 30rpx;

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #606266;
      margin-bottom: 10rpx;
    }

    .form-input {
      width: 100%;
      height: 80rpx;
      border: 1px solid #dcdfe6;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      color: #303133;
      background-color: #fff;
    }

    .error-message {
      font-size: 24rpx;
      color: #f56c6c;
      margin-top: 6rpx;
    }

    .radio-group {
      display: flex;
      flex-direction: row;
      margin-top: 10rpx;

      .radio-item {
        display: flex;
        align-items: center;
        margin-right: 40rpx;

        .radio-text {
          margin-left: 10rpx;
          font-size: 28rpx;
          color: #303133;
        }
      }
    }
  }

  .button-group {
    margin-top: 40rpx;

    .register-btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      background-color: #409EFF;
      color: #fff;
      font-size: 30rpx;
      border-radius: 8rpx;
    }

    .login-link {
      text-align: center;
      margin-top: 20rpx;
      color: #409EFF;
      font-size: 28rpx;
    }
  }
}
</style>
