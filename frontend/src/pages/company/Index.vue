<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';
import { useJobStore } from '../../stores/job';
import { useResumeStore } from '../../stores/resume';

const jobStore = useJobStore();
const resumeStore = useResumeStore();

// 职位列表
const jobs = ref([]);
const loading = ref(false);

// 加载企业发布的职位
const loadCompanyJobs = async () => {
  loading.value = true;
  try {
    const response = await jobStore.getCompanyJobs();
    jobs.value = response.data;
  } catch (error) {
    uni.showToast({
      title: error.message || '加载职位失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 发布新职位
const createJob = () => {
  uni.navigateTo({
    url: '/pages/job/create'
  });
};

// 编辑职位
const editJob = (job) => {
  uni.navigateTo({
    url: `/pages/job/edit?id=${job.id}`
  });
};

// 查看职位申请
const viewApplications = (job) => {
  uni.navigateTo({
    url: `/pages/job/applications?jobId=${job.id}`
  });
};

// 删除职位
const deleteJob = async (job) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该职位吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await jobStore.deleteJob(job.id);
          await loadCompanyJobs();
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
        } catch (error) {
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 页面加载时获取职位列表
onLoad(() => {
  loadCompanyJobs();
});
</script>

<template>
  <view class="company-container">
    <!-- 顶部操作栏 -->
    <view class="action-bar">
      <u-button
        type="primary"
        icon="plus"
        @click="createJob"
      >发布新职位</u-button>
    </view>
    
    <!-- 职位列表 -->
    <view class="job-list">
      <u-empty v-if="jobs.length === 0" text="暂无发布的职位" mode="job" />
      
      <view v-else class="job-item" v-for="job in jobs" :key="job.id">
        <view class="job-header">
          <view class="job-title">{{ job.title }}</view>
          <view class="job-salary">{{ job.salary }}</view>
        </view>
        
        <view class="job-info">
          <text>{{ job.location }}</text>
          <text class="dot">·</text>
          <text>{{ job.experience }}经验</text>
          <text class="dot">·</text>
          <text>{{ job.education }}学历</text>
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
        
        <view class="job-stats">
          <text>发布时间：{{ job.createdAt }}</text>
          <text>投递数：{{ job.applicationCount || 0 }}</text>
        </view>
        
        <view class="job-actions">
          <u-button
            type="primary"
            size="mini"
            @click="viewApplications(job)"
          >查看申请</u-button>
          
          <u-button
            type="warning"
            size="mini"
            @click="editJob(job)"
          >编辑</u-button>
          
          <u-button
            type="error"
            size="mini"
            @click="deleteJob(job)"
          >删除</u-button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.company-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30rpx;
  
  .action-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 20rpx;
    background-color: #fff;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  }
  
  .job-list {
    padding: 20rpx;
    
    .job-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;
      
      .job-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;
        
        .job-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }
        
        .job-salary {
          font-size: 28rpx;
          color: #ff6b81;
          font-weight: bold;
        }
      }
      
      .job-info {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 16rpx;
        
        .dot {
          margin: 0 8rpx;
        }
      }
      
      .job-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
        margin-bottom: 16rpx;
      }
      
      .job-stats {
        display: flex;
        justify-content: space-between;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 16rpx;
      }
      
      .job-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16rpx;
      }
    }
  }
}
</style>