<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';
import { useJobStore } from '../../stores/job';
import { useResumeStore } from '../../stores/resume';

const jobStore = useJobStore();
const resumeStore = useResumeStore();

// 搜索关键词
const searchKeyword = ref('');
const loading = ref(false);

// 职位列表
const jobs = ref([]);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0
});

// 加载职位列表
const loadJobs = async () => {
  loading.value = true;
  try {
    const response = await jobStore.getJobs({
      keyword: searchKeyword.value,
      page: pagination.value.page,
      limit: pagination.value.limit
    });
    jobs.value = response.data;
    pagination.value.total = response.total;
  } catch (error) {
    uni.showToast({
      title: error.message || '加载职位失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 搜索职位
const handleSearch = () => {
  pagination.value.page = 1;
  loadJobs();
};

// 投递简历
const handleApply = async (job) => {
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
    
    await resumeStore.applyJob(job.id);
  } catch (error) {
    uni.showToast({
      title: error.message || '投递失败',
      icon: 'none'
    });
  }
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
      <u-search
        v-model="searchKeyword"
        placeholder="搜索职位名称、公司名称"
        :show-action="true"
        action-text="搜索"
        @search="handleSearch"
        @custom="handleSearch"
      />
    </view>
    
    <!-- 职位列表 -->
    <view class="job-list">
      <u-empty v-if="jobs.length === 0" text="暂无职位" mode="job" />
      
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
          <u-tag
            v-for="tag in job.tags"
            :key="tag"
            :text="tag"
            type="info"
            size="mini"
            mode="light"
          />
        </view>
        
        <view class="job-footer">
          <view class="job-requirements">
            <text>{{ job.experience }}经验</text>
            <text class="dot">·</text>
            <text>{{ job.education }}学历</text>
          </view>
          
          <u-button
            type="primary"
            size="mini"
            @click="handleApply(job)"
          >投递简历</u-button>
        </view>
      </view>
    </view>
    
    <!-- 分页 -->
    <u-loadmore
      :status="loading ? 'loading' : jobs.length < pagination.total ? 'loadmore' : 'nomore'"
      @loadmore="loadJobs"
    />
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
      }
    }
  }
}
</style>