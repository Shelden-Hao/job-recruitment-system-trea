<template>
  <view class="container">
    <view class="application-list">
      <view v-for="application in applications" :key="application.id" class="application-card">
        <view class="application-header">
          <text class="job-title">{{ application.jobTitle }}</text>
          <text class="application-status" :class="application.status">{{ getStatusText(application.status) }}</text>
        </view>
        
        <view class="company-info">
          <image :src="application.companyLogo" mode="aspectFit" class="company-logo"></image>
          <view class="company-detail">
            <text class="company-name">{{ application.companyName }}</text>
            <text class="job-salary">{{ application.salary }}</text>
          </view>
        </view>
        
        <view class="application-info">
          <view class="info-item">
            <text class="label">申请时间：</text>
            <text class="value">{{ application.applyTime }}</text>
          </view>
          <view class="info-item">
            <text class="label">工作地点：</text>
            <text class="value">{{ application.location }}</text>
          </view>
          <view v-if="application.interviewTime" class="info-item">
            <text class="label">面试时间：</text>
            <text class="value">{{ application.interviewTime }}</text>
          </view>
        </view>
        
        <view class="actions">
          <u-button v-if="application.status === 'pending'" type="warning" size="mini" @click="handleCancel(application.id)">撤销申请</u-button>
          <u-button v-if="application.status === 'interview'" type="primary" size="mini" @click="handleViewInterview(application.id)">查看面试</u-button>
          <u-button type="info" size="mini" @click="handleViewDetail(application.id)">查看详情</u-button>
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
        companyLogo: '/static/company-logo.png',
        companyName: '科技有限公司',
        salary: '15k-25k',
        applyTime: '2024-01-15 10:30',
        location: '深圳',
        interviewTime: null
      },
      {
        id: 2,
        jobTitle: '后端开发工程师',
        status: 'interview',
        companyLogo: '/static/company-logo.png',
        companyName: '网络科技有限公司',
        salary: '20k-35k',
        applyTime: '2024-01-14 15:20',
        location: '广州',
        interviewTime: '2024-01-20 14:30'
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
    rejected: '已拒绝',
    interview: '待面试',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};

const handleCancel = async (applicationId) => {
  uni.showModal({
    title: '提示',
    content: '确定要撤销这个申请吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // TODO: 实现撤销申请的API调用
          const application = applications.value.find(item => item.id === applicationId);
          if (application) {
            application.status = 'cancelled';
            uni.showToast({
              title: '已撤销申请',
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

const handleViewDetail = (applicationId) => {
  uni.navigateTo({
    url: `/pages/jobs/detail?id=${applicationId}`
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
        
        &.rejected {
          color: #f56c6c;
          background: rgba(245, 108, 108, 0.1);
        }
        
        &.interview {
          color: #409eff;
          background: rgba(64, 158, 255, 0.1);
        }
        
        &.completed {
          color: #67c23a;
          background: rgba(103, 194, 58, 0.1);
        }
        
        &.cancelled {
          color: #909399;
          background: rgba(144, 147, 153, 0.1);
        }
      }
    }
    
    .company-info {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .company-logo {
        width: 80rpx;
        height: 80rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
      }
      
      .company-detail {
        .company-name {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .job-salary {
          font-size: 24rpx;
          color: #409eff;
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