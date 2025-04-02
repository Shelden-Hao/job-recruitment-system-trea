<template>
  <view class="container">
    <view class="search-section">
      <u-search
        v-model="searchKeyword"
        placeholder="搜索职位、公司"
        :show-action="true"
        action-text="筛选"
        @search="handleSearch"
        @custom="showFilter"
      ></u-search>
    </view>
    
    <view class="filter-drawer" v-if="showFilterDrawer">
      <u-form :model="filterForm">
        <u-form-item label="工作地点">
          <u-input v-model="filterForm.location" placeholder="请输入工作地点"></u-input>
        </u-form-item>
        <u-form-item label="薪资范围">
          <u-slider
            v-model="filterForm.salary"
            :min="0"
            :max="50"
            :step="1"
            range
          ></u-slider>
        </u-form-item>
        <u-form-item label="工作经验">
          <u-radio-group v-model="filterForm.experience">
            <u-radio v-for="(item, index) in experienceOptions" :key="index" :name="item.value">{{ item.label }}</u-radio>
          </u-radio-group>
        </u-form-item>
      </u-form>
      <view class="filter-actions">
        <u-button @click="resetFilter">重置</u-button>
        <u-button type="primary" @click="applyFilter">确定</u-button>
      </view>
    </view>
    
    <view class="job-list">
      <u-pull-refresh
        v-model="refreshing"
        @refresh="onRefresh"
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
        
        <u-loadmore
          :status="loadMoreStatus"
          @loadmore="loadMore"
        />
      </u-pull-refresh>
    </view>
  </view>
</template>

<script>
import { onLoad } from '@dcloudio/uni-app'
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
        // TODO: 实现获取职位列表的API调用
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
      page.value = 1;
      await fetchJobs();
      refreshing.value = false;
    };
    
    const loadMore = () => {
      if (loadMoreStatus.value === 'nomore') return;
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
}

.search-section {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
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
  }
}

.job-list {
  padding: 20rpx;
  
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
}
</style>