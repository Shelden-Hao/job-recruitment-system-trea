<template>
  <view class="container">
    <view class="search-section">
      <view class="search-box">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索职位、公司" 
          confirm-type="search"
          @confirm="handleSearch"
        />
        <button class="search-button" @click="showFilter">筛选</button>
      </view>
    </view>
    
    <view class="filter-drawer" v-if="showFilterDrawer">
      <form @submit="applyFilter">
        <view class="form-item">
          <text class="form-label">工作地点</text>
          <input 
            class="form-input" 
            v-model="filterForm.location" 
            placeholder="请输入工作地点"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">薪资范围</text>
          <view class="slider-box">
            <slider 
              class="slider" 
              block-size="20" 
              :min="0" 
              :max="50" 
              :step="1"
              :value="filterForm.salary[0]" 
              @change="(e) => filterForm.salary[0] = e.detail.value"
            ></slider>
            <text class="slider-value">{{ filterForm.salary[0] }}k</text>
            <slider 
              class="slider" 
              block-size="20" 
              :min="0" 
              :max="50" 
              :step="1"
              :value="filterForm.salary[1]" 
              @change="(e) => filterForm.salary[1] = e.detail.value"
            ></slider>
            <text class="slider-value">{{ filterForm.salary[1] }}k</text>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">工作经验</text>
          <radio-group class="radio-group" @change="(e) => filterForm.experience = e.detail.value">
            <label class="radio-item" v-for="(item, index) in experienceOptions" :key="index">
              <radio :value="item.value" :checked="filterForm.experience === item.value" />
              <text class="radio-text">{{ item.label }}</text>
            </label>
          </radio-group>
        </view>
      
        <view class="filter-actions">
          <button class="btn btn-default" @click="resetFilter">重置</button>
          <button class="btn btn-primary" form-type="submit">确定</button>
        </view>
      </form>
    </view>
    
    <view class="job-list">
      <scroll-view 
        class="job-scroll" 
        scroll-y 
        @scrolltolower="loadMore"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        refresher-background="#f5f5f5"
      >
        <view class="job-cards">
          <view v-for="job in jobs" :key="job.id" class="job-card" @click="goToJobDetail(job.id)">
            <view class="job-info">
              <view class="job-header">
                <text class="job-title">{{ job.title }}</text>
                <text class="job-salary">{{ job.salary }}</text>
              </view>
              <view class="company-info">
                <text class="company-name">{{ job.company }}</text>
                <text class="location">{{ job.location }}</text>
              </view>
              <view class="job-tags">
                <text v-for="(tag, index) in job.tags" :key="index" class="tag">{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="loadmore">
          <view v-if="loadMoreStatus === 'loading'" class="loadmore-loading">
            <view class="loading-icon"></view>
            <text class="loadmore-text">加载中...</text>
          </view>
          <view v-else-if="loadMoreStatus === 'nomore'" class="loadmore-nomore">
            <text class="loadmore-text">没有更多数据了</text>
          </view>
          <view v-else class="loadmore-default" @click="loadMore">
            <text class="loadmore-text">点击加载更多</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { ref, reactive } from 'vue';

export default {
  setup() {
    const searchKeyword = ref('');
    const showFilterDrawer = ref(false);
    const refreshing = ref(false);
    const loadMoreStatus = ref('loadmore');
    const page = ref(1);
    const jobs = ref([]);
    
    const filterForm = reactive({
      location: '',
      salary: [0, 50],
      experience: ''
    });
    
    const experienceOptions = [
      { label: '不限', value: '' },
      { label: '应届生', value: 'fresh' },
      { label: '1-3年', value: '1-3' },
      { label: '3-5年', value: '3-5' },
      { label: '5年以上', value: '5+' }
    ];
    
    const fetchJobs = async () => {
      try {
        if (page.value > 1) {
          loadMoreStatus.value = 'loading';
        }
        
        const mockJobs = [
          {
            id: 1,
            title: '前端开发工程师',
            company: '科技有限公司',
            location: '深圳',
            salary: '15k-25k',
            tags: ['React', 'Vue', '前端开发']
          },
          {
            id: 2,
            title: '后端开发工程师',
            company: '互联网公司',
            location: '广州',
            salary: '20k-35k',
            tags: ['Java', 'Spring Boot', '后端开发']
          }
        ];
        
        if (page.value === 1) {
          jobs.value = mockJobs;
        } else {
          jobs.value.push(...mockJobs);
        }
        
        loadMoreStatus.value = mockJobs.length < 10 ? 'nomore' : 'loadmore';
      } catch (error) {
        console.error('获取职位列表失败:', error);
        uni.showToast({
          title: '获取职位列表失败',
          icon: 'none'
        });
      }
    };
    
    const handleSearch = () => {
      page.value = 1;
      fetchJobs();
    };
    
    const showFilter = () => {
      showFilterDrawer.value = true;
    };
    
    const resetFilter = () => {
      filterForm.location = '';
      filterForm.salary = [0, 50];
      filterForm.experience = '';
    };
    
    const applyFilter = () => {
      showFilterDrawer.value = false;
      page.value = 1;
      fetchJobs();
    };
    
    const onRefresh = async () => {
      refreshing.value = true;
      page.value = 1;
      await fetchJobs();
      refreshing.value = false;
    };
    
    const loadMore = () => {
      if (loadMoreStatus.value === 'nomore' || loadMoreStatus.value === 'loading') return;
      page.value++;
      fetchJobs();
    };
    
    const goToJobDetail = (jobId) => {
      uni.navigateTo({
        url: `/pages/jobs/detail?id=${jobId}`
      });
    };
    
    onLoad(() => {
      fetchJobs();
    });
    
    onPullDownRefresh(() => {
      onRefresh();
    });
    
    onReachBottom(() => {
      loadMore();
    });
    
    return {
      searchKeyword,
      showFilterDrawer,
      filterForm,
      experienceOptions,
      refreshing,
      loadMoreStatus,
      jobs,
      handleSearch,
      showFilter,
      resetFilter,
      applyFilter,
      onRefresh,
      loadMore,
      goToJobDetail
    };
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-section {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  
  .search-box {
    display: flex;
    align-items: center;
    
    .search-input {
      flex: 1;
      height: 70rpx;
      background-color: #f5f5f5;
      border-radius: 35rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
    }
    
    .search-button {
      width: 120rpx;
      height: 70rpx;
      line-height: 70rpx;
      margin-left: 20rpx;
      background-color: #2979ff;
      color: #fff;
      font-size: 28rpx;
      border-radius: 35rpx;
      padding: 0;
    }
  }
}

.filter-drawer {
  position: fixed;
  top: 100rpx;
  right: 0;
  bottom: 0;
  width: 600rpx;
  background-color: #fff;
  z-index: 99;
  padding: 30rpx;
  box-shadow: -2rpx 0 12rpx rgba(0, 0, 0, 0.1);
  
  .form-item {
    margin-bottom: 30rpx;
    
    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .form-input {
      width: 100%;
      height: 80rpx;
      border: 1px solid #dcdfe6;
      border-radius: 4rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
    }
    
    .slider-box {
      padding: 0 10rpx;
      
      .slider {
        margin: 20rpx 0;
      }
      
      .slider-value {
        font-size: 24rpx;
        color: #666;
      }
    }
    
    .radio-group {
      display: flex;
      flex-direction: column;
      
      .radio-item {
        margin-bottom: 20rpx;
        display: flex;
        align-items: center;
        
        .radio-text {
          font-size: 28rpx;
          margin-left: 10rpx;
        }
      }
    }
  }
  
  .filter-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx;
    display: flex;
    gap: 20rpx;
    justify-content: space-between;
    background-color: #fff;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
    
    .btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 4rpx;
      
      &.btn-default {
        background-color: #f5f5f5;
        color: #333;
      }
      
      &.btn-primary {
        background-color: #2979ff;
        color: #fff;
      }
    }
  }
}

.job-list {
  flex: 1;
  padding: 20rpx;
  overflow: hidden;
  
  .job-scroll {
    height: 100%;
  }
  
  .job-cards {
    .job-card {
      background: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
      
      .job-info {
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10rpx;
          
          .job-title {
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
          }
          
          .job-salary {
            font-size: 30rpx;
            color: #f56c6c;
            font-weight: bold;
          }
        }
        
        .company-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10rpx;
          
          .company-name {
            font-size: 28rpx;
            color: #666;
          }
          
          .location {
            font-size: 28rpx;
            color: #666;
          }
        }
        
        .job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10rpx;
          
          .tag {
            font-size: 24rpx;
            color: #409EFF;
            background: rgba(64, 158, 255, 0.1);
            padding: 4rpx 12rpx;
            border-radius: 4rpx;
          }
        }
      }
    }
  }
  
  .loadmore {
    text-align: center;
    padding: 20rpx 0;
    
    .loadmore-loading, .loadmore-nomore, .loadmore-default {
      display: flex;
      justify-content: center;
      align-items: center;
      
      .loadmore-text {
        font-size: 24rpx;
        color: #999;
      }
      
      .loading-icon {
        width: 30rpx;
        height: 30rpx;
        border: 2rpx solid #999;
        border-radius: 50%;
        border-color: #999 transparent transparent transparent;
        animation: loading 1s infinite linear;
        margin-right: 10rpx;
      }
    }
  }
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>