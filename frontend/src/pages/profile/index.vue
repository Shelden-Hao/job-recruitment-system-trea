<template>
  <view class="container">
    <view class="profile-card">
      <view class="avatar-section">
        <image :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill" class="avatar"></image>
        <text class="username">{{ userInfo.username }}</text>
        <text class="role">{{ userInfo.role === 'jobseeker' ? '求职者' : '企业' }}</text>
      </view>

      <view class="info-section">
        <button type="primary" class="btn" @click="goToEditProfile">资料详情</button>
        <button type="default" class="btn" v-if="isJobSeeker" @click="goToResume">我的简历</button>
        <button type="default" class="btn" v-if="isJobSeeker" @click="goToApplications">我的申请</button>
        <button type="warn" class="btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import {authAPI} from "../../services/api";

const authStore = useAuthStore();
const userInfo = ref({
  username: 'John Doe',
  role: 'jobseeker',
  avatar: '/static/images/default-avatar.png'
});

// 根据角色计算属性
const isJobSeeker = computed(() => userInfo.value.role === 'jobseeker');
const isCompany = computed(() => userInfo.value.role === 'company');

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 实际项目中，应该调用 authStore.fetchCurrentUser()
    // 模拟获取用户数据
    // setTimeout(() => {
    //   userInfo.value = {
    //     username: 'John Doe',
    //     role: 'jobseeker', // 可以设置为'jobseeker'或'company'测试不同角色
    //     avatar: '/static/images/default-avatar.png'
    //   };
    // }, 300);
    const result = await authAPI.getCurrentUser({
      id: uni.getStorageSync('user').id
    })
    console.log("result", result);
    userInfo.value = result.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    });
  }
};

// 跳转到编辑个人资料页面
const goToEditProfile = () => {
  uni.navigateTo({
    url: '/pages/profile/edit'
  });
};

// 跳转到简历页面
const goToResume = () => {
  uni.navigateTo({
    url: '/pages/jobseeker/resume'
  });
};

// 跳转到我的申请页面
const goToApplications = () => {
  uni.navigateTo({
    url: '/pages/jobseeker/applications'
  });
}

// 处理退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 调用auth store的logout方法
        // authStore.logout();
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }
    }
  });
};

onLoad(() => {
  fetchUserInfo();
});
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
}

.profile-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;

  .avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    margin-bottom: 20rpx;
  }

  .username {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }

  .role {
    font-size: 26rpx;
    color: #666;
  }
}

.info-section {
  margin: 30rpx 0;

  .btn {
    margin-bottom: 20rpx;
  }
}
</style>
