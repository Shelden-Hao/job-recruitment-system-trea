<template>
  <view class="container">
    <view class="job-detail-card">
      <view class="job-header">
        <text class="job-title">{{ jobDetail.title }}</text>
        <text class="job-salary">{{ jobDetail.salary_range }}</text>
      </view>

      <view class="company-info">
        <image :src="jobDetail.companyLogo ? jobDetail.companyLogo : '/static/images/company-logo.png'" mode="aspectFit" class="company-logo"></image>
        <view class="company-detail">
          <text class="company-location">📍 {{ jobDetail.location }}</text>
        </view>
      </view>

      <view class="divider"></view>

      <view class="job-tags">
        <text class="tag" v-for="(tag, index) in (jobDetail.tags ? jobDetail.tags.split(',') : [])" :key="index">{{ tag.trim() }}</text>
      </view>

      <view class="job-requirements">
        <view class="section-title">基本信息</view>
        <view class="requirement-list">
          <view class="requirement-item">
            <text class="requirement-label">📅 发布时间</text>
            <text class="requirement-value">{{ formatDate(jobDetail.publish_date) }}</text>
          </view>
          <view class="requirement-item">
            <text class="requirement-label">👨‍💼 经验要求</text>
            <text class="requirement-value">{{ jobDetail.experience || '不限' }}</text>
          </view>
          <view class="requirement-item">
            <text class="requirement-label">🎓 学历要求</text>
            <text class="requirement-value">{{ jobDetail.education || '不限' }}</text>
          </view>
          <view class="requirement-item">
            <text class="requirement-label">📍 工作地点</text>
            <text class="requirement-value">{{ jobDetail.location }}</text>
          </view>
        </view>
      </view>

      <view class="divider"></view>

      <view class="job-description">
        <view class="section-title">职位描述</view>
        <view class="description-content">
          <text>{{ jobDetail.description }}</text>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <button
        class="share-button"
        type="default"
        @click="handleShare"
      >
        分享
      </button>
      <button
        class="apply-button"
        type="primary"
        @click="handleApply"
        :loading="loading"
        :disabled="hasApplied"
      >
        {{ hasApplied ? '已申请' : '立即申请' }}
      </button>
    </view>
  </view>
</template>

<script>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import {jobAPI} from "../../services/api";

export default {
  setup() {
    const authStore = useAuthStore();
    const jobDetail = ref({});
    const loading = ref(false);
    const hasApplied = ref(false);

    const fetchJobDetail = async () => {
      try {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const jobId = currentPage.options.id;

        const result = await jobAPI.getJobById(jobId);
        jobDetail.value = result.data.data;

        // 检查是否已申请
        checkApplicationStatus(jobId);
      } catch (error) {
        console.error('获取职位详情失败:', error);
        uni.showToast({
          title: '获取职位详情失败',
          icon: 'none'
        });
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };

    const checkApplicationStatus = async (jobId) => {
      try {
        // TODO: 实现检查申请状态的API调用
        hasApplied.value = false;
      } catch (error) {
        console.error('检查申请状态失败:', error);
      }
    };

    const handleApply = async () => {
      // if (!authStore.isAuthenticated) {
      //   uni.navigateTo({
      //     url: '/pages/login/login'
      //   });
      //   return;
      // }

      try {
        loading.value = true;
        // TODO: 实现申请职位的API调用
        await new Promise(resolve => setTimeout(resolve, 1000));

        hasApplied.value = true;
        uni.showToast({
          title: '申请成功',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: error.message || '申请失败',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };
    
    const handleShare = () => {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      });
    };

    onLoad(() => {
      fetchJobDetail();
    });

    return {
      jobDetail,
      loading,
      hasApplied,
      handleApply,
      handleShare,
      formatDate
    };
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  padding-bottom: 120rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.job-detail-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30rpx;

    .job-title {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      line-height: 1.4;
      max-width: 70%;
    }

    .job-salary {
      font-size: 36rpx;
      color: #ff6b6b;
      font-weight: bold;
      background-color: rgba(255, 107, 107, 0.08);
      padding: 6rpx 20rpx;
      border-radius: 8rpx;
    }
  }

  .company-info {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;

    .company-logo {
      width: 120rpx;
      height: 120rpx;
      margin-right: 30rpx;
      border-radius: 16rpx;
      background-color: #f5f7fa;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    }

    .company-detail {
      .company-location {
        font-size: 30rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
  
  .divider {
    height: 1rpx;
    background-color: #eaeaea;
    margin: 30rpx 0;
  }

  .job-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 40rpx;

    .tag {
      font-size: 26rpx;
      color: #5c6bc0;
      background: rgba(92, 107, 192, 0.1);
      padding: 12rpx 24rpx;
      border-radius: 50rpx;
      border: 1rpx solid rgba(92, 107, 192, 0.2);
    }
  }

  .section-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
    position: relative;
    padding-left: 24rpx;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10rpx;
      height: 32rpx;
      width: 8rpx;
      background-color: #5c6bc0;
      border-radius: 4rpx;
    }
  }

  .job-requirements {
    margin-bottom: 40rpx;

    .requirement-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30rpx;
      
      .requirement-item {
        display: flex;
        flex-direction: column;
        
        .requirement-label {
          font-size: 28rpx;
          color: #888;
          margin-bottom: 10rpx;
        }
        
        .requirement-value {
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }

  .job-description {
    .description-content {
      font-size: 30rpx;
      color: #555;
      line-height: 1.8;
      
      text {
        white-space: pre-wrap;
      }
    }
  }
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 24rpx 40rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 20rpx;

  .share-button {
    width: 220rpx;
    height: 88rpx;
    font-size: 32rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    color: #666;
    border: 1rpx solid #e0e0e0;
  }

  .apply-button {
    flex: 1;
    height: 88rpx;
    font-size: 32rpx;
    background-color: #5c6bc0;
    border-radius: 12rpx;
    color: #fff;
    font-weight: 500;
    box-shadow: 0 6rpx 16rpx rgba(92, 107, 192, 0.3);

    &[disabled] {
      background-color: #a0b0e1;
      box-shadow: none;
    }
  }
}
</style>
