<template>
  <view class="container">
    <view class="job-detail-card">
      <view class="job-header">
        <text class="job-title">{{ jobDetail.title }}</text>
        <text class="job-salary">{{ jobDetail.salary }}</text>
      </view>

      <view class="company-info">
        <image :src="jobDetail.companyLogo" mode="aspectFit" class="company-logo"></image>
        <view class="company-detail">
          <text class="company-name">{{ jobDetail.company }}</text>
          <text class="company-location">{{ jobDetail.location }}</text>
        </view>
      </view>

      <view class="job-tags">
        <text v-for="(tag, index) in jobDetail.tags" :key="index" class="tag">{{ tag }}</text>
      </view>

      <view class="job-requirements">
        <view class="section-title">职位要求</view>
        <view class="requirement-list">
          <text class="requirement-item">经验要求：{{ jobDetail.experience }}</text>
          <text class="requirement-item">学历要求：{{ jobDetail.education }}</text>
          <text class="requirement-item">工作地点：{{ jobDetail.location }}</text>
        </view>
      </view>

      <view class="job-description">
        <view class="section-title">职位描述</view>
        <text class="description-content">{{ jobDetail.description }}</text>
      </view>
    </view>

    <view class="action-bar">
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

        // TODO: 实现获取职位详情的API调用
        jobDetail.value = {
          id: jobId,
          title: '前端开发工程师',
          company: '科技有限公司',
          companyLogo: '/static/images/company-logo.png',
          location: '深圳',
          salary: '15k-25k',
          tags: ['React', 'Vue', '前端开发'],
          experience: '3-5年',
          education: '本科及以上',
          description: '1. 负责公司前端项目的开发和维护\n2. 与产品、设计和后端团队紧密协作\n3. 优化前端性能，提升用户体验\n4. 参与技术方案设计和评审'
        };

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

    onLoad(() => {
      fetchJobDetail();
    });

    return {
      jobDetail,
      loading,
      hasApplied,
      handleApply
    };
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  padding-bottom: 120rpx;
}

.job-detail-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .job-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }

    .job-salary {
      font-size: 32rpx;
      color: #f56c6c;
      font-weight: bold;
    }
  }

  .company-info {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .company-logo {
      width: 100rpx;
      height: 100rpx;
      margin-right: 20rpx;
      border-radius: 8rpx;
    }

    .company-detail {
      .company-name {
        font-size: 30rpx;
        color: #333;
        margin-bottom: 10rpx;
      }

      .company-location {
        font-size: 26rpx;
        color: #666;
      }
    }
  }

  .job-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 30rpx;

    .tag {
      font-size: 24rpx;
      color: #409EFF;
      background: rgba(64, 158, 255, 0.1);
      padding: 8rpx 20rpx;
      border-radius: 4rpx;
    }
  }

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .job-requirements {
    margin-bottom: 30rpx;

    .requirement-list {
      .requirement-item {
        font-size: 28rpx;
        color: #666;
        line-height: 1.8;
        display: block;
      }
    }
  }

  .job-description {
    .description-content {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);

  .apply-button {
    width: 100%;
    height: 80rpx;
    font-size: 30rpx;
    background-color: #409EFF;
    border-radius: 8rpx;
    color: #fff;

    &[disabled] {
      background-color: #a0cfff;
      color: #ffffff;
    }
  }
}
</style>
