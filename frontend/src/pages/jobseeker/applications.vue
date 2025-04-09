<template>
  <view class="container">
    <view class="application-list">
      <view v-for="application in applications" :key="application.id" class="application-card">
        <view class="application-header">
          <text class="job-title">{{ application?.Job?.title }}</text>
          <text class="application-status" :class="application.status">{{ getStatusText(application?.status) }}</text>
        </view>

        <view class="company-info">
          <image :src="application.companyLogo || '/static/images/company-logo.png'" mode="aspectFit" class="company-logo"></image>
          <view class="company-detail">
            <text class="company-name">{{ application.companyName || '科技有限公司' }}</text>
            <text class="job-salary">{{ application?.Job?.salary_range }}</text>
          </view>
        </view>

        <view class="application-info">
          <view class="info-item">
            <text class="label">申请时间：</text>
            <text class="value">{{ application?.apply_date }}</text>
          </view>
          <view class="info-item">
            <text class="label">工作地点：</text>
            <text class="value">{{ application?.Job?.location }}</text>
          </view>
          <view v-if="application.interview_time" class="info-item">
            <text class="label">面试时间：</text>
            <text class="value">{{ application?.interview_time }}</text>
          </view>
        </view>

        <view class="actions">
          <button v-if="application.status === 'pending'" class="action-button warning-button" size="mini" @click="handleCancel(application.id)">撤销申请</button>
          <button v-if="application.status === 'interview'" class="action-button primary-button" size="mini" @click="handleViewInterview(application.id)">查看面试</button>
          <button class="action-button info-button" size="mini" @click="handleViewDetail(application.id)">查看详情</button>
        </view>
      </view>
    </view>

    <view v-if="applications.length === 0" class="empty-state">
      <image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
      <text class="empty-text">暂无申请记录</text>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';
import {resumeAPI} from "../../services/api";

const applications = ref([]);
const userId = ref('');

const fetchApplications = async () => {
  try {
    // applications.value = [
    //   {
    //     id: 1,
    //     jobTitle: '前端开发工程师',
    //     status: 'pending',
    //     companyLogo: '/static/company-logo.png',
    //     companyName: '科技有限公司',
    //     salary: '15k-25k',
    //     applyTime: '2024-01-15 10:30',
    //     location: '深圳',
    //     interviewTime: null
    //   },
    //   {
    //     id: 2,
    //     jobTitle: '后端开发工程师',
    //     status: 'interview',
    //     companyLogo: '/static/company-logo.png',
    //     companyName: '网络科技有限公司',
    //     salary: '20k-35k',
    //     applyTime: '2024-01-14 15:20',
    //     location: '广州',
    //     interviewTime: '2024-01-20 14:30'
    //   }
    // ];
    const result = await resumeAPI.getApplications(userId.value);
    console.log("=>(applications.vue:83) result", result);
    applications.value = result.data.data;
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
    // url: `/pages/interview/index?id=${applicationId}` // 先用假数据
    url: `/pages/interview/index`
  });
};

const handleViewDetail = (applicationId) => {
  uni.navigateTo({
    url: `/pages/jobs/detail?id=${applicationId}`
  });
};

onLoad(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const eventChannel = currentPage.getOpenerEventChannel();
  eventChannel.on('userId', (params) => {
    userId.value = params;
    fetchApplications();
  });
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

      .action-button {
        margin: 0;
        font-size: 24rpx;
        line-height: 1.8;

        &.primary-button {
          background-color: #409eff;
          color: #fff;
        }

        &.warning-button {
          background-color: #e6a23c;
          color: #fff;
        }

        &.info-button {
          background-color: #909399;
          color: #fff;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;

  .empty-image {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
