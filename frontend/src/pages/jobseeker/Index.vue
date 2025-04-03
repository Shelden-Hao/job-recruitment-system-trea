<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';

// 搜索关键词
const searchKeyword = ref('');
const loading = ref(false);

// 职位列表
const jobs = ref([]);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 30
});

// 加载职位列表（使用假数据）
const loadJobs = () => {
  loading.value = true;
  
  // 模拟API延迟
  setTimeout(() => {
    // 模拟的职位数据
    jobs.value = [
      {
        id: 1,
        title: '前端开发工程师',
        salary: '15k-25k',
        company: {
          name: '科技有限公司'
        },
        location: '深圳',
        tags: ['Vue', 'React', '小程序'],
        experience: '3-5年',
        education: '本科'
      },
      {
        id: 2,
        title: '后端开发工程师',
        salary: '20k-30k',
        company: {
          name: '互联网公司'
        },
        location: '广州',
        tags: ['Java', 'Spring Boot', 'MySQL'],
        experience: '1-3年',
        education: '本科'
      },
      {
        id: 3,
        title: 'UI设计师',
        salary: '12k-18k',
        company: {
          name: '创新科技公司'
        },
        location: '北京',
        tags: ['UI设计', 'Figma', 'Sketch'],
        experience: '2-3年',
        education: '大专'
      }
    ];
    
    loading.value = false;
  }, 500);
};

// 搜索职位
const handleSearch = () => {
  pagination.value.page = 1;
  loadJobs();
};

// 投递简历
const handleApply = (job) => {
  // 检查是否有简历
  const hasResume = true; // 假设用户已上传简历
  
  if (!hasResume) {
    uni.showModal({
      title: '提示',
      content: '请先上传简历',
      confirmText: '去上传',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/resume/index'
          });
        }
      }
    });
    return;
  }
  
  // 模拟投递成功
  uni.showLoading({
    title: '投递中...'
  });
  
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '投递成功',
      icon: 'success'
    });
  }, 1000);
};

// 查看职位详情
const viewJobDetail = (job) => {
  uni.navigateTo({
    url: `/pages/job/detail?id=${job.id}`
  });
};

// 页面加载时获取职位列表
onLoad(() => {
  loadJobs();
});
</script>

<template>
  <view class="jobseeker-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-container">
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索职位名称、公司名称"
          confirm-type="search"
          @confirm="handleSearch"
        />
        <button class="search-button" @click="handleSearch">搜索</button>
      </view>
    </view>
    
    <!-- 职位列表 -->
    <view class="job-list">
      <!-- 空状态 -->
      <view v-if="jobs.length === 0" class="empty-state">
        <image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无职位</text>
      </view>
      
      <view v-else class="job-item" v-for="job in jobs" :key="job.id">
        <view class="job-header" @click="viewJobDetail(job)">
          <view class="job-title">{{ job.title }}</view>
          <view class="job-salary">{{ job.salary }}</view>
        </view>
        
        <view class="job-company">
          <text>{{ job.company.name }}</text>
          <text class="job-location">{{ job.location }}</text>
        </view>
        
        <view class="job-tags">
          <view
            v-for="tag in job.tags"
            :key="tag"
            class="job-tag"
          >
            {{ tag }}
          </view>
        </view>
        
        <view class="job-footer">
          <view class="job-requirements">
            <text>{{ job.experience }}经验</text>
            <text class="dot">·</text>
            <text>{{ job.education }}学历</text>
          </view>
          
          <button
            class="apply-button"
            size="mini"
            @click="handleApply(job)"
          >投递简历</button>
        </view>
      </view>
    </view>
    
    <!-- 加载更多 -->
    <view class="loadmore-container">
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="jobs.length < pagination.total" class="loadmore-button" @click="loadJobs">
        <text class="loadmore-text">加载更多</text>
      </view>
      
      <view v-else class="no-more">
        <text class="no-more-text">没有更多数据了</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.jobseeker-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30rpx;
  
  .search-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 20rpx;
    background-color: #fff;
    
    .search-input-container {
      display: flex;
      align-items: center;
      
      .search-input {
        flex: 1;
        height: 64rpx;
        background-color: #f5f5f5;
        border-radius: 32rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
      }
      
      .search-button {
        margin-left: 16rpx;
        height: 64rpx;
        line-height: 64rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        background-color: #2979ff;
        color: #fff;
      }
    }
  }
  
  .job-list {
    padding: 20rpx;
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40rpx;
      
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
      
      .job-company {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 16rpx;
        
        .job-location {
          margin-left: 16rpx;
          &:before {
            content: '·';
            margin-right: 16rpx;
          }
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
      
      .job-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .job-requirements {
          font-size: 24rpx;
          color: #999;
          
          .dot {
            margin: 0 8rpx;
          }
        }
        
        .apply-button {
          margin: 0;
          background-color: #2979ff;
          color: #fff;
          font-size: 24rpx;
          padding: 8rpx 20rpx;
          line-height: 1.5;
        }
      }
    }
  }
  
  .loadmore-container {
    padding: 20rpx;
    text-align: center;
    
    .loading-state {
      padding: 20rpx 0;
      
      .loading-text {
        font-size: 28rpx;
        color: #999;
      }
    }
    
    .loadmore-button {
      padding: 20rpx 0;
      
      .loadmore-text {
        font-size: 28rpx;
        color: #2979ff;
      }
    }
    
    .no-more {
      padding: 20rpx 0;
      
      .no-more-text {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}
</style>
