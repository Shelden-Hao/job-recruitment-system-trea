<template>
  <view class="container">
    <view class="application-list">
      <view v-for="application in applications" :key="application.id" class="application-card">
        <view class="application-header">
          <text class="job-title">{{ application.jobTitle }}</text>
          <text class="application-status" :class="application.status">{{ getStatusText(application.status) }}</text>
        </view>
        
        <view class="applicant-info">
          <image :src="application.avatar" mode="aspectFit" class="avatar"></image>
          <view class="applicant-detail">
            <text class="applicant-name">{{ application.name }}</text>
            <text class="applicant-title">{{ application.currentTitle }}</text>
          </view>
        </view>
        
        <view class="application-info">
          <view class="info-item">
            <text class="label">申请时间：</text>
            <text class="value">{{ application.applyTime }}</text>
          </view>
          <view class="info-item">
            <text class="label">工作经验：</text>
            <text class="value">{{ application.experience }}年</text>
          </view>
          <view class="info-item">
            <text class="label">学历：</text>
            <text class="value">{{ application.education }}</text>
          </view>
        </view>
        
        <view class="actions">
          <u-button v-if="application.status === 'pending'" type="primary" size="mini" @click="handleInterview(application.id)">安排面试</u-button>
          <u-button v-if="application.status === 'pending'" type="warning" size="mini" @click="handleReject(application.id)">拒绝</u-button>
          <u-button v-if="application.status === 'interview'" type="info" size="mini" @click="handleViewInterview(application.id)">查看面试</u-button>
          <u-button type="info" size="mini" @click="handleViewResume(application.id)">查看简历</u-button>
        </view>
      </view>
    </view>
    
    <view v-if="applications.length === 0" class="empty-state">
      <u-empty mode="list" text="暂无申请记录"></u-empty>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';

const applications = ref([]);

const fetchApplications = async () => {
  try {
    // TODO: 实现获取申请列表的API调用
    applications.value = [
      {
        id: 1,
        jobTitle: '前端开发工程师',
        status: 'pending',
        avatar: '/static/avatar.png',
        name: '张三',
        currentTitle: '前端工程师',
        applyTime: '2024-01-15 10:30',
        experience: 3,
        education: '本科'
      },
      {
        id: 2,
        jobTitle: '后端开发工程师',
        status: 'interview',
        avatar: '/static/avatar.png',
        name: '李四',
        currentTitle: '后端工程师',
        applyTime: '2024-01-14 15:20',
        experience: 5,
        education: '硕士'
      }
    ];
  } catch (error) {
    console.error('获取申请列表失败:', error);
    uni.showToast({
      title: '获取申请列表失败',
      icon: 'none'
    });
  }
};

const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    interview: '已安排面试',
    rejected: '已拒绝',
    completed: '已完成'
  };
  return statusMap[status] || status;
};

const handleInterview = (applicationId) => {
  uni.navigateTo({
    url: `/pages/company/interview-arrange?id=${applicationId}`
  });
};

const handleReject = async (applicationId) => {
  uni.showModal({
    title: '提示',
    content: '确定要拒绝这个申请吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // TODO: 实现拒绝申请的API调用
          const application = applications.value.find(item => item.id === applicationId);
          if (application) {
            application.status = 'rejected';
            uni.showToast({
              title: '已拒绝申请',
              icon: 'success'
            });
          }
        } catch (error) {
          uni.showToast({
            title: '操作失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

const handleViewInterview = (applicationId) => {
  uni.navigateTo({
    url: `/pages/interviews/detail?id=${applicationId}`
  });
};

const handleViewResume = (applicationId) => {
  uni.navigateTo({
    url: `/pages/resume/detail?id=${applicationId}`
  });
};

onLoad(() => {
  fetchApplications();
});
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
}

.application-list {
  .application-card {
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    
    .application-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .job-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .application-status {
        font-size: 24rpx;
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        
        &.pending {
          color: #e6a23c;
          background: rgba(230, 162, 60, 0.1);
        }
        
        &.interview {
          color: #409eff;
          background: rgba(64, 158, 255, 0.1);
        }
        
        &.rejected {
          color: #f56c6c;
          background: rgba(245, 108, 108, 0.1);
        }
        
        &.completed {
          color: #67c23a;
          background: rgba(103, 194, 58, 0.1);
        }
      }
    }
    
    .applicant-info {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .avatar {
        width: 80rpx;
        height: 80rpx;
        margin-right: 20rpx;
        border-radius: 50%;
      }
      
      .applicant-detail {
        .applicant-name {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .applicant-title {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
    
    .application-info {
      margin-bottom: 20rpx;
      
      .info-item {
        display: flex;
        margin-bottom: 10rpx;
        
        .label {
          font-size: 28rpx;
          color: #666;
          margin-right: 10rpx;
        }
        
        .value {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
    
    .actions {
      display: flex;
      gap: 20rpx;
      justify-content: flex-end;
    }
  }
}

.empty-state {
  margin-top: 100rpx;
}
</style>