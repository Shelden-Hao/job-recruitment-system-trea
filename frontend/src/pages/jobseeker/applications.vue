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
    // 显示加载状态
    uni.showLoading({
      title: '加载中...'
    });
    
    // 从本地存储获取申请记录
    const existingApplications = uni.getStorageSync('applications');
    if (existingApplications) {
      const allApplications = JSON.parse(existingApplications);
      // 如果传入了userId参数，过滤出该用户的申请记录
      if (userId.value) {
        applications.value = allApplications.filter(app => app.userId == userId.value);
      } else {
        applications.value = allApplications;
      }
      
      // 对申请记录按时间排序，最新的在前面
      applications.value.sort((a, b) => new Date(b.apply_date) - new Date(a.apply_date));
    } else {
      applications.value = [];
    }
    
    // 可选：模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 如果没有找到申请记录，可以尝试API请求获取
    if (applications.value.length === 0 && userId.value) {
      try {
        const result = await resumeAPI.getApplications(userId.value);
        if (result.data && result.data.data) {
          applications.value = result.data.data;
          // 将API获取的数据也保存到本地存储
          uni.setStorageSync('applications', JSON.stringify(applications.value));
        }
      } catch (apiError) {
        console.error('API获取申请列表失败:', apiError);
        // API失败也不影响展示本地数据
      }
    }
  } catch (error) {
    console.error('获取申请列表失败:', error);
    uni.showToast({
      title: '获取申请列表失败',
      icon: 'none'
    });
  } finally {
    // 隐藏加载状态
    uni.hideLoading();
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
          // 显示加载状态
          uni.showLoading({
            title: '处理中...'
          });
          
          // 查找本地应用记录
          const existingApplications = uni.getStorageSync('applications');
          if (existingApplications) {
            let allApplications = JSON.parse(existingApplications);
            
            // 找到并更新该申请记录的状态
            const applicationIndex = allApplications.findIndex(app => app.id === applicationId);
            if (applicationIndex !== -1) {
              allApplications[applicationIndex].status = 'cancelled';
              
              // 更新本地存储
              uni.setStorageSync('applications', JSON.stringify(allApplications));
              
              // 更新视图
              const appIndex = applications.value.findIndex(app => app.id === applicationId);
              if (appIndex !== -1) {
                applications.value[appIndex].status = 'cancelled';
              }
              
              // 模拟API请求延迟
              await new Promise(resolve => setTimeout(resolve, 500));
              
              uni.showToast({
                title: '已撤销申请',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: '未找到申请记录',
                icon: 'none'
              });
            }
          } else {
            uni.showToast({
              title: '未找到申请记录',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('撤销申请失败:', error);
          uni.showToast({
            title: '操作失败',
            icon: 'none'
          });
        } finally {
          // 隐藏加载状态
          uni.hideLoading();
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
  try {
    // 查找对应的申请记录
    const application = applications.value.find(app => app.id === applicationId);
    
    if (application && application.jobId) {
      // 跳转到职位详情页
      uni.navigateTo({
        url: `/pages/jobs/detail?id=${application.jobId}`
      });
    } else if (application && application.Job && application.Job.id) {
      // 替代方案：如果申请记录中包含完整的Job对象
      uni.navigateTo({
        url: `/pages/jobs/detail?id=${application.Job.id}`
      });
    } else {
      uni.showToast({
        title: '未找到职位信息',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('跳转职位详情失败:', error);
    uni.showToast({
      title: '跳转失败',
      icon: 'none'
    });
  }
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
