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

    <view class="job-list">
      <view class="job-cards">
        <view v-for="job in jobs" :key="job.id" class="job-card" @click="goToJobDetail(job.id)">
          <view class="job-info">
            <view class="job-header">
              <text class="job-title">{{ job.title }}</text>
              <text class="salary">{{ job.salary_range }}</text>
            </view>
            <view class="location">
              <text class="location-icon">📍</text>
              <text>{{ job.location }}</text>
            </view>
            <view class="description-container">
              <text class="description">
                {{ job.description.length > 80 ? job.description.substring(0, 80) + '...' : job.description }}
              </text>
            </view>
            <view class="job-tags">
              <text class="tag" v-if="job.experience">{{ job.experience }}</text>
              <text class="tag" v-if="job.education">{{ job.education }}</text>
              <text class="tag" v-for="(tag, index) in (job.tags ? job.tags.split(',') : [])" :key="index">{{
                  tag.trim()
                }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {onLoad, onPullDownRefresh, onReachBottom} from '@dcloudio/uni-app'
import {ref, reactive} from 'vue';
import {jobAPI} from "../../services/api";

export default {
  setup() {
    const searchKeyword = ref('');
    const showFilterDrawer = ref(false);
    const refreshing = ref(false);
    const loadMoreStatus = ref('loadmore');
    const page = ref(1);
    const jobs = ref([]);
    const originalJobs = ref([]);

    const filterForm = reactive({
      location: '',
      salary: [0, 50],
      experience: ''
    });

    const experienceOptions = [
      {label: '不限', value: ''},
      {label: '应届生', value: 'fresh'},
      {label: '1-3年', value: '1-3'},
      {label: '3-5年', value: '3-5'},
      {label: '5年以上', value: '5+'}
    ];

    const fetchJobs = async () => {
      try {
        const result = await jobAPI.getJobs();
        jobs.value = result.data.data;
        originalJobs.value = result.data.data;
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
      // TODO: 实现搜索功能
      console.log('搜索关键词:', searchKeyword.value);
      jobs.value = originalJobs.value;
      // 不调用后端接口，直接在前端实现搜索功能
      if (searchKeyword.value) {
        jobs.value = jobs.value.filter(job => {
          console.log('job title', job.title)
          if (job.title?.includes(searchKeyword.value) || job.company?.includes(searchKeyword.value)
              || job.location?.includes(searchKeyword.value)) {
            return true;
          } else {
            return false;
          }
        })
      } else {
        fetchJobs();
      }
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
  padding: 20rpx 30rpx;

  .section-title {
    font-size: 36rpx;
    font-weight: bold;
    margin: 30rpx 0;
    position: relative;
    padding-left: 20rpx;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8rpx;
      height: 32rpx;
      width: 8rpx;
      background-color: #2979ff;
      border-radius: 4rpx;
    }
  }

  .job-cards {
    .job-card {
      background: #fff;
      border-radius: 16rpx;
      padding: 30rpx;
      margin-bottom: 30rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
      transition: transform 0.3s, box-shadow 0.3s;

      &:active {
        transform: translateY(2rpx);
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
      }

      .job-info {
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16rpx;

          .job-title {
            font-size: 34rpx;
            font-weight: bold;
            color: #333;
            flex: 1;
          }

          .salary {
            font-size: 32rpx;
            font-weight: bold;
            color: #ff5722;
          }
        }

        .location {
          display: flex;
          align-items: center;
          font-size: 26rpx;
          color: #666;
          margin-bottom: 20rpx;

          .location-icon {
            font-size: 24rpx;
            margin-right: 6rpx;
          }

          text {
            margin-left: 6rpx;
          }
        }

        .description-container {
          margin: 20rpx 0;

          .description {
            font-size: 28rpx;
            color: #666;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }
        }

        .job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 16rpx;
          margin-top: 20rpx;

          .tag {
            font-size: 24rpx;
            color: #5c6bc0;
            background: rgba(92, 107, 192, 0.1);
            padding: 8rpx 20rpx;
            border-radius: 50rpx;
            border: 1rpx solid rgba(92, 107, 192, 0.2);
          }
        }
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