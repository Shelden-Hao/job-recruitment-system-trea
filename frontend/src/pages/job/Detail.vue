<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';
import { useJobStore } from '../../stores/job';
import { useResumeStore } from '../../stores/resume';
import { useAuthStore } from '../../stores/auth';

const jobStore = useJobStore();
const resumeStore = useResumeStore();
const authStore = useAuthStore();

const job = ref(null);
const loading = ref(false);

// 获取职位ID
const jobId = uni.getStorageSync('currentJobId');

// 加载职位详情
const loadJobDetail = async () => {
  loading.value = true;
  try {
    const response = await jobStore.getJobDetail(jobId);
    job.value = response.data;
  } catch (error) {
    uni.showToast({
      title: error.message || '加载职位详情失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 投递简历
const handleApply = async () => {
  if (!authStore.isAuthenticated) {
    uni.navigateTo({
      url: '/pages/auth/login'
    });
    return;
  }
  
  try {
    if (!resumeStore.hasResume) {
      uni.showModal({
        title: '提示',
        content: '请先上传简历',
        confirmText: '去上传',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/resume/upload'
            });
          }
        }
      });
      return;
    }
    
    await resumeStore.applyJob(jobId);
  } catch (error) {
    uni.showToast({
      title: error.message || '投递失败',
      icon: 'none'
    });
  }
};

// 联系企业
const contactCompany = () => {
  if (!authStore.isAuthenticated) {
    uni.navigateTo({
      url: '/pages/auth/login'
    });
    return;
  }
  
  uni.navigateTo({
    url: `/pages/message/chat?companyId=${job.value.company.id}`
  });
};

onLoad(() => {
  loadJobDetail();
});
</script>

<template>
  <view class="job-detail-container">
    <u-skeleton :loading="loading" :animation="true">
      <template v-if="job">
        <!-- 职位信息 -->
        <view class="job-header">
          <view class="job-title">{{ job.title }}</view>
          <view class="job-salary">{{ job.salary }}</view>
        </view>
        
        <view class="job-info">
          <view class="info-item">
            <u-icon name="map" size="28"></u-icon>
            <text>{{ job.location }}</text>
          </view>
          
          <view class="info-item">
            <u-icon name="clock" size="28"></u-icon>
            <text>{{ job.experience }}经验</text>
          </view>
          
          <view class="info-item">
            <u-icon name="bookmark" size="28"></u-icon>
            <text>{{ job.education }}学历</text>
          </view>
        </view>
        
        <view class="job-tags">
          <u-tag
            v-for="tag in job.tags"
            :key="tag"
            :text="tag"
            type="info"
            size="mini"
            mode="light"
          />
        </view>
        
        <!-- 公司信息 -->
        <view class="company-info">
          <view class="company-header">
            <image
              class="company-logo"
              :src="job.company.logo || '/static/images/default-company.png'"
              mode="aspectFill"
            />
            <view class="company-detail">
              <text class="company-name">{{ job.company.name }}</text>
              <text class="company-desc">{{ job.company.industry }} · {{ job.company.size }}</text>
            </view>
          </view>
          
          <view class="company-intro">
            <text>{{ job.company.description }}</text>
          </view>
        </view>
        
        <!-- 职位描述 -->
        <view class="job-description">
          <view class="section-title">职位描述</view>
          <rich-text :nodes="job.description"></rich-text>
        </view>
        
        <!-- 任职要求 -->
        <view class="job-requirements">
          <view class="section-title">任职要求</view>
          <rich-text :nodes="job.requirements"></rich-text>
        </view>
        
        <!-- 工作地址 -->
        <view class="job-address">
          <view class="section-title">工作地址</view>
          <text>{{ job.address }}</text>
        </view>
      </template>
    </u-skeleton>
    
    <!-- 底部操作栏 -->
    <view class="action-bar">
      <u-button
        type="info"
        icon="chat"
        @click="contactCompany"
      >联系企业</u-button>
      
      <u-button
        type="primary"
        icon="file-text"
        @click="handleApply"
      >投递简历</u-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.job-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
  
  .job-header {
    background-color: #fff;
    padding: 30rpx;
    
    .job-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 16rpx;
    }
    
    .job-salary {
      font-size: 32rpx;
      color: #ff6b81;
      font-weight: bold;
    }
  }
  
  .job-info {
    background-color: #fff;
    padding: 20rpx 30rpx;
    display: flex;
    justify-content: space-between;
    border-top: 2rpx solid #f5f5f5;
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      color: #666;
      font-size: 28rpx;
    }
  }
  
  .job-tags {
    background-color: #fff;
    padding: 20rpx 30rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    border-top: 2rpx solid #f5f5f5;
  }
  
  .company-info {
    background-color: #fff;
    margin-top: 20rpx;
    padding: 30rpx;
    
    .company-header {
      display: flex;
      align-items: center;
      gap: 20rpx;
      margin-bottom: 20rpx;
      
      .company-logo {
        width: 120rpx;
        height: 120rpx;
        border-radius: 12rpx;
      }
      
      .company-detail {
        flex: 1;
        
        .company-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .company-desc {
          font-size: 28rpx;
          color: #666;
        }
      }
    }
    
    .company-intro {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .job-description,
  .job-requirements,
  .job-address {
    background-color: #fff;
    margin-top: 20rpx;
    padding: 30rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    rich-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 20rpx;
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .u-button {
      flex: 1;
    }
  }
}
</style>