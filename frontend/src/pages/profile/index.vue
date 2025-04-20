<template>
  <view class="container">
    <view class="profile-card">
      <view class="avatar-section">
        <image :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill" class="avatar"></image>
        <text class="username">{{ userInfo.username }}</text>
        <text class="role">{{ userInfo.role === 'jobseeker' ? '求职者' : '企业' }}</text>
      </view>

      <view class="info-section">
        <button type="primary" class="btn" @click="goToEditProfile">编辑资料</button>
        <button type="default" class="btn" v-if="isJobSeeker" @click="goToResume">我的简历</button>
        <button type="default" class="btn" v-if="isJobSeeker" @click="goToApplications">我的申请</button>
        <button type="warn" class="btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
    
    <!-- 求职者简历摘要 -->
    <view class="resume-card" v-if="isJobSeeker && userInfo.jobseekerProfile">
      <view class="card-header">
        <text class="card-title">简历信息</text>
        <view class="header-actions">
          <button class="action-btn" @click="goToEditProfile">编辑简历</button>
          <button class="action-btn" @click="previewResume" v-if="hasResumeFile">查看简历</button>
        </view>
      </view>
      
      <view class="resume-summary">
        <view class="info-row" v-if="userInfo.jobseekerProfile.fullName">
          <text class="info-label">姓名</text>
          <text class="info-value">{{ userInfo.jobseekerProfile.fullName }}</text>
        </view>
        
        <view class="info-row" v-if="userInfo.jobseekerProfile.gender">
          <text class="info-label">性别</text>
          <text class="info-value">{{ userInfo.jobseekerProfile.gender }}</text>
        </view>
        
        <view class="info-row" v-if="userInfo.jobseekerProfile.expectedPosition">
          <text class="info-label">期望职位</text>
          <text class="info-value">{{ userInfo.jobseekerProfile.expectedPosition }}</text>
        </view>
        
        <view class="info-row" v-if="userInfo.jobseekerProfile.expectedSalary">
          <text class="info-label">期望薪资</text>
          <text class="info-value">{{ userInfo.jobseekerProfile.expectedSalary }}元/月</text>
        </view>
        
        <view class="info-row">
          <text class="info-label">简历文件</text>
          <text class="info-value" v-if="hasResumeFile">已上传</text>
          <text class="info-value empty" v-else>未上传</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { authAPI } from "../../services/api";

const authStore = useAuthStore();
const userInfo = ref({
  username: 'John Doe',
  role: 'jobseeker',
  avatar: '/static/images/default-avatar.png'
});

// 根据角色计算属性
const isJobSeeker = computed(() => userInfo.value.role === 'jobseeker');
const isCompany = computed(() => userInfo.value.role === 'company');
const hasResumeFile = computed(() => {
  return userInfo.value.jobseekerProfile?.resumeUrl && 
         userInfo.value.jobseekerProfile.resumeUrl.length > 0;
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const result = await authAPI.getCurrentUser({
      id: uni.getStorageSync('user').id
    });
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
    url: '/pages/jobseeker/resume',
    // 传递jobseekerId作为参数
    success: (res) => {
      res.eventChannel.emit('jobseekerId', userInfo.value.jobseekerProfile.id);
      res.eventChannel.emit('userId', userInfo.value.id);
    }
  });
};

// 跳转到我的申请页面
const goToApplications = () => {
  uni.navigateTo({
    url: '/pages/jobseeker/applications',
    // 传递userId作为参数
    success: (res) => {
      res.eventChannel.emit('userId', userInfo.value.id);
    }
  });
};

// 预览简历文件
const previewResume = () => {
  if (!hasResumeFile.value) {
    uni.showToast({
      title: '未上传简历文件',
      icon: 'none'
    });
    return;
  }
  
  const resumeUrl = userInfo.value.jobseekerProfile.resumeUrl;
  const fullUrl = `http://localhost:3000${resumeUrl}`;
  
  // 如果是PDF，可以使用系统预览
  if (resumeUrl.toLowerCase().endsWith('.pdf')) {
    uni.downloadFile({
      url: fullUrl,
      success: function (res) {
        uni.openDocument({
          filePath: res.tempFilePath,
          success: function (res) {
            console.log('打开文档成功');
          },
          fail: function(err) {
            console.error('打开文档失败', err);
            uni.showToast({
              title: '打开文档失败',
              icon: 'none'
            });
          }
        });
      },
      fail: function(err) {
        console.error('下载文档失败', err);
        uni.showToast({
          title: '下载文档失败',
          icon: 'none'
        });
      }
    });
  } else {
    // 非PDF文档，提供链接让用户下载
    uni.setClipboardData({
      data: fullUrl,
      success: function() {
        uni.showToast({
          title: '简历链接已复制到剪贴板',
          icon: 'none'
        });
      }
    });
  }
};

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

.profile-card, .resume-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 30rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1px solid #eee;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  font-size: 24rpx;
  margin: 0;
  padding: 6rpx 16rpx;
  line-height: 1.8;
  background-color: #409eff;
  color: #fff;
  border-radius: 6rpx;
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

.resume-summary {
  background-color: #f9f9f9;
  border-radius: 8rpx;
  padding: 20rpx;
}

.info-row {
  display: flex;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  
  &.empty {
    color: #999;
  }
}
</style>
