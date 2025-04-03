<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';

// 职位列表
const jobs = ref([]);
const loading = ref(false);

// 加载企业发布的职位（使用模拟数据）
const loadCompanyJobs = () => {
  loading.value = true;
  
  // 模拟API延迟
  setTimeout(() => {
    // 模拟数据
    jobs.value = [
      {
        id: 1,
        title: '前端开发工程师',
        salary: '15k-25k',
        location: '深圳',
        experience: '3-5年',
        education: '本科',
        tags: ['Vue', 'React', '小程序'],
        createdAt: '2024-03-15',
        applicationCount: 23
      },
      {
        id: 2,
        title: '后端开发工程师',
        salary: '20k-30k',
        location: '广州',
        experience: '1-3年',
        education: '本科',
        tags: ['Java', 'Spring Boot', 'MySQL'],
        createdAt: '2024-03-10',
        applicationCount: 18
      },
      {
        id: 3,
        title: 'UI设计师',
        salary: '12k-18k',
        location: '北京',
        experience: '2-3年',
        education: '大专',
        tags: ['UI设计', 'Figma', 'Sketch'],
        createdAt: '2024-03-05',
        applicationCount: 15
      }
    ];
    
    loading.value = false;
  }, 500);
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
const deleteJob = (job) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该职位吗？',
    success: (res) => {
      if (res.confirm) {
        // 模拟删除操作
        jobs.value = jobs.value.filter(item => item.id !== job.id);
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
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
      <button class="create-button" @click="createJob">发布新职位</button>
    </view>
    
    <!-- 职位列表 -->
    <view class="job-list">
      <!-- 空状态 -->
      <view v-if="jobs.length === 0" class="empty-state">
        <image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无发布的职位</text>
      </view>
      
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
          <view
            v-for="tag in job.tags"
            :key="tag"
            class="job-tag"
          >{{ tag }}</view>
        </view>
        
        <view class="job-stats">
          <text>发布时间：{{ job.createdAt }}</text>
          <text>投递数：{{ job.applicationCount || 0 }}</text>
        </view>
        
        <view class="job-actions">
          <button
            class="action-button view-button"
            size="mini"
            @click="viewApplications(job)"
          >查看申请</button>
          
          <button
            class="action-button edit-button"
            size="mini"
            @click="editJob(job)"
          >编辑</button>
          
          <button
            class="action-button delete-button"
            size="mini"
            @click="deleteJob(job)"
          >删除</button>
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
    
    .create-button {
      background-color: #2979ff;
      color: #fff;
      font-size: 28rpx;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 8rpx;
    }
  }
  
  .job-list {
    padding: 20rpx;
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80rpx 0;
      
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
        
        .job-tag {
          font-size: 24rpx;
          color: #2979ff;
          background-color: rgba(41, 121, 255, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 4rpx;
        }
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
        
        .action-button {
          font-size: 24rpx;
          margin: 0;
          padding: 0 20rpx;
          line-height: 1.8;
          
          &.view-button {
            background-color: #2979ff;
            color: #fff;
          }
          
          &.edit-button {
            background-color: #ff9900;
            color: #fff;
          }
          
          &.delete-button {
            background-color: #ff4d4f;
            color: #fff;
          }
        }
      }
    }
  }
}
</style>