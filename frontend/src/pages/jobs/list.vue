<template>
  <view class="container">
    <view class="add-job-section">
      <button class="add-job-button" @click="showAddJobForm">添加职位</button>
    </view>
    
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

    <view v-if="isAddingJob" class="add-job-form">
      <view class="form-header">
        <text class="form-title">添加新职位</text>
        <text class="close-icon" @click="hideAddJobForm">×</text>
      </view>
      
      <view class="form-item">
        <text class="label">职位名称</text>
        <input class="input" v-model="newJob.title" placeholder="请输入职位名称" />
      </view>
      
      <view class="form-item">
        <text class="label">公司名称</text>
        <input class="input" v-model="newJob.company" placeholder="请输入公司名称" />
      </view>
      
      <view class="form-item">
        <text class="label">工作地点</text>
        <input class="input" v-model="newJob.location" placeholder="请输入工作地点" />
      </view>
      
      <view class="form-item">
        <text class="label">薪资范围</text>
        <input class="input" v-model="newJob.salary_range" placeholder="例如: 15k-25k" />
      </view>
      
      <view class="form-item">
        <text class="label">工作经验</text>
        <input class="input" v-model="newJob.experience" placeholder="例如: 3-5年" />
      </view>
      
      <view class="form-item">
        <text class="label">学历要求</text>
        <input class="input" v-model="newJob.education" placeholder="例如: 本科" />
      </view>
      
      <view class="form-item">
        <text class="label">职位标签</text>
        <input class="input" v-model="newJob.tags" placeholder="使用逗号分隔, 例如: 前端,React,Vue" />
      </view>
      
      <view class="form-item">
        <text class="label">职位描述</text>
        <textarea class="textarea" v-model="newJob.description" placeholder="请输入职位描述"></textarea>
      </view>
      
      <view class="form-actions">
        <button class="btn btn-cancel" @click="hideAddJobForm">取消</button>
        <button class="btn btn-submit" @click="addJob">确定</button>
      </view>
    </view>

    <view class="job-list" v-if="!isAddingJob">
      <view class="job-cards">
        <view v-for="job in displayedJobs" :key="job.id" class="job-card" @click="goToJobDetail(job.id)">
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
import {ref, reactive, computed, onMounted} from 'vue';
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
    const localJobs = ref([]);
    const isAddingJob = ref(false);
    
    const newJob = reactive({
      id: '',
      title: '',
      company: '',
      location: '',
      salary_range: '',
      experience: '',
      education: '',
      tags: '',
      description: ''
    });

    const displayedJobs = computed(() => {
      return [...localJobs.value, ...jobs.value];
    });

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
        
        // 加载本地存储的职位
        loadLocalJobs();
      } catch (error) {
        console.error('获取职位列表失败:', error);
        uni.showToast({
          title: '获取职位列表失败',
          icon: 'none'
        });
      }
    };
    
    // 加载本地存储的职位
    const loadLocalJobs = () => {
      try {
        const storedJobs = uni.getStorageSync('localJobs');
        if (storedJobs) {
          localJobs.value = JSON.parse(storedJobs);
        }
      } catch (e) {
        console.error('加载本地职位失败', e);
      }
    };
    
    // 保存职位到本地存储
    const saveLocalJobs = () => {
      try {
        uni.setStorageSync('localJobs', JSON.stringify(localJobs.value));
      } catch (e) {
        console.error('保存本地职位失败', e);
      }
    };
    
    // 显示添加职位表单
    const showAddJobForm = () => {
      isAddingJob.value = true;
    };
    
    // 隐藏添加职位表单
    const hideAddJobForm = () => {
      isAddingJob.value = false;
      resetNewJob();
    };
    
    // 重置新职位表单
    const resetNewJob = () => {
      Object.keys(newJob).forEach(key => {
        newJob[key] = '';
      });
    };
    
    // 添加新职位
    const addJob = () => {
      if (!newJob.title || !newJob.company || !newJob.location) {
        uni.showToast({
          title: '请填写必要信息',
          icon: 'none'
        });
        return;
      }
      
      const job = {
        ...newJob,
        id: 'local_' + Date.now()
      };
      
      localJobs.value.unshift(job);
      saveLocalJobs();
      hideAddJobForm();
      
      uni.showToast({
        title: '职位添加成功',
        icon: 'success'
      });
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
        });
        
        // 也搜索本地职位
        localJobs.value = uni.getStorageSync('localJobs') ? JSON.parse(uni.getStorageSync('localJobs')).filter(job => {
          if (job.title?.includes(searchKeyword.value) || job.company?.includes(searchKeyword.value)
              || job.location?.includes(searchKeyword.value)) {
            return true;
          } else {
            return false;
          }
        }) : [];
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
      localJobs,
      displayedJobs,
      newJob,
      isAddingJob,
      handleSearch,
      showFilter,
      resetFilter,
      applyFilter,
      onRefresh,
      loadMore,
      goToJobDetail,
      showAddJobForm,
      hideAddJobForm,
      addJob
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

.add-job-section {
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .add-job-button {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #42b983;
    color: #fff;
    font-size: 30rpx;
    border-radius: 40rpx;
  }
}

.add-job-form {
  padding: 30rpx;
  background-color: #fff;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .form-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-icon {
      font-size: 48rpx;
      color: #999;
    }
  }
  
  .form-item {
    margin-bottom: 20rpx;
    
    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .input {
      width: 100%;
      height: 80rpx;
      border: 1rpx solid #dcdfe6;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
    }
    
    .textarea {
      width: 100%;
      height: 200rpx;
      border: 1rpx solid #dcdfe6;
      border-radius: 8rpx;
      padding: 20rpx;
      font-size: 28rpx;
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 40rpx;
    
    .btn {
      width: 45%;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 30rpx;
      border-radius: 40rpx;
      
      &.btn-cancel {
        background-color: #f5f5f5;
        color: #666;
      }
      
      &.btn-submit {
        background-color: #42b983;
        color: #fff;
      }
    }
  }
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