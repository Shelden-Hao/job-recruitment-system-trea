<template>
  <view class="container">
    <view class="interview-list">
      <view v-for="interview in interviews" :key="interview.id" class="interview-card">
        <view class="interview-header">
          <text class="job-title">{{ interview.jobTitle }}</text>
          <text class="interview-status" :class="interview.status">{{ getStatusText(interview.status) }}</text>
        </view>
        
        <view class="interview-info">
          <view class="info-item">
            <text class="label">面试时间：</text>
            <text class="value">{{ interview.scheduleTime }}</text>
          </view>
          <view class="info-item">
            <text class="label">面试地点：</text>
            <text class="value">{{ interview.location }}</text>
          </view>
          <view class="info-item">
            <text class="label">面试方式：</text>
            <text class="value">{{ interview.type }}</text>
          </view>
        </view>
        
        <view class="company-info">
          <image :src="interview.companyLogo" mode="aspectFit" class="company-logo"></image>
          <view class="company-detail">
            <text class="company-name">{{ interview.companyName }}</text>
            <text class="contact-person">联系人：{{ interview.contactPerson }}</text>
          </view>
        </view>
        
        <view class="actions">
          <u-button v-if="interview.status === 'pending'" type="primary" size="mini" @click="handleConfirm(interview.id)">确认参加</u-button>
          <u-button v-if="interview.status === 'pending'" type="warning" size="mini" @click="handleDecline(interview.id)">婉拒</u-button>
          <u-button v-if="interview.status === 'confirmed'" type="info" size="mini" @click="handleViewDetail(interview.id)">查看详情</u-button>
        </view>
      </view>
    </view>
    
    <view v-if="interviews.length === 0" class="empty-state">
      <u-empty mode="list" text="暂无面试"></u-empty>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';

const interviews = ref([]);

const fetchInterviews = async () => {
  try {
    // TODO: 实现获取面试列表的API调用
    interviews.value = [
      {
        id: 1,
        jobTitle: '前端开发工程师',
        status: 'pending',
        scheduleTime: '2024-01-20 14:30',
        location: '线上视频面试',
        type: '视频面试',
        companyLogo: '/static/company-logo.png',
        companyName: '科技有限公司',
        contactPerson: '张经理'
      },
      {
        id: 2,
        jobTitle: '后端开发工程师',
        status: 'confirmed',
        scheduleTime: '2024-01-22 10:00',
        location: '深圳市南山区科技园',
        type: '现场面试',
        companyLogo: '/static/company-logo.png',
        companyName: '网络科技有限公司',
        contactPerson: '李经理'
      }
    ];
  } catch (error) {
    console.error('获取面试列表失败:', error);
    uni.showToast({
      title: '获取面试列表失败',
      icon: 'none'
    });
  }
};

const getStatusText = (status) => {
  const statusMap = {
    pending: '待确认',
    confirmed: '已确认',
    declined: '已婉拒',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};

const handleConfirm = async (interviewId) => {
  try {
    // TODO: 实现确认面试的API调用
    const interview = interviews.value.find(item => item.id === interviewId);
    if (interview) {
      interview.status = 'confirmed';
      uni.showToast({
        title: '已确认面试',
        icon: 'success'
      });
    }
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
};

const handleDecline = async (interviewId) => {
  uni.showModal({
    title: '提示',
    content: '确定要婉拒这次面试吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // TODO: 实现婉拒面试的API调用
          const interview = interviews.value.find(item => item.id === interviewId);
          if (interview) {
            interview.status = 'declined';
            uni.showToast({
              title: '已婉拒面试',
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

const handleViewDetail = (interviewId) => {
  uni.navigateTo({
    url: `/pages/interviews/detail?id=${interviewId}`
  });
};

onLoad(() => {
  fetchInterviews();
});
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
}

.interview-list {
  .interview-card {
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    
    .interview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .job-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .interview-status {
        font-size: 24rpx;
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        
        &.pending {
          color: #e6a23c;
          background: rgba(230, 162, 60, 0.1);
        }
        
        &.confirmed {
          color: #67c23a;
          background: rgba(103, 194, 58, 0.1);
        }
        
        &.declined {
          color: #f56c6c;
          background: rgba(245, 108, 108, 0.1);
        }
        
        &.completed {
          color: #409eff;
          background: rgba(64, 158, 255, 0.1);
        }
        
        &.cancelled {
          color: #909399;
          background: rgba(144, 147, 153, 0.1);
        }
      }
    }
    
    .interview-info {
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
    
    .company-info {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      padding: 20rpx 0;
      border-top: 2rpx solid #eee;
      border-bottom: 2rpx solid #eee;
      
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
        
        .contact-person {
          font-size: 24rpx;
          color: #666;
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