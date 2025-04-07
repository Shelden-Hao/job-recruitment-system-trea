<template>
  <view class="container">
    <view class="banner">
      <image src="https://www.zhipin.com/sem/static/img/banner.97f904e9.png" mode="aspectFill"
             class="banner-image"></image>
      <view class="banner-content">
        <text class="banner-title">找到理想的工作</text>
        <br/>
        <text class="banner-subtitle">数千个职位等你来选</text>
      </view>
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
        <button class="search-button" @click="handleSearch">搜索</button>
      </view>
    </view>

    <view class="job-list">
      <view class="section-title">最新职位</view>
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
              <text class="description">{{ job.description.length > 80 ? job.description.substring(0, 80) + '...' : job.description }}</text>
            </view>
            <view class="job-tags">
              <text class="tag" v-if="job.experience">{{ job.experience }}</text>
              <text class="tag" v-if="job.education">{{ job.education }}</text>
              <text class="tag" v-for="(tag, index) in (job.tags ? job.tags.split(',') : [])" :key="index">{{ tag.trim() }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import {onLoad, onShow} from '@dcloudio/uni-app';
import {ref} from 'vue';
import {useAuthStore} from '@/stores/auth';
import {jobAPI} from "../../services/api";

const authStore = useAuthStore();
const searchKeyword = ref('');
const jobs = ref([]);

const fetchJobs = async () => {
  try {
    // jobs.value = [
    //   {
    //     id: 1,
    //     title: '前端开发工程师',
    //     company: '科技有限公司',
    //     location: '深圳',
    //     salary: '15k-25k'
    //   },
    //   {
    //     id: 2,
    //     title: '后端开发工程师',
    //     company: '互联网科技有限公司',
    //     location: '北京',
    //     salary: '20k-30k'
    //   },
    //   {
    //     id: 3,
    //     title: 'UI设计师',
    //     company: '创新科技公司',
    //     location: '上海',
    //     salary: '12k-18k'
    //   },
    //   {
    //     id: 4,
    //     title: '产品经理',
    //     company: '智能科技公司',
    //     location: '广州',
    //     salary: '18k-25k'
    //   },
    //   {
    //     id: 5,
    //     title: '数据分析师',
    //     company: '大数据科技公司',
    //     location: '杭州',
    //     salary: '15k-22k'
    //   }
    // ];
    const result = await jobAPI.getJobs();
    jobs.value = result.data.data;
  } catch (error) {
    console.error('获取职位列表失败:', error);
  }
};

const handleSearch = () => {
  // TODO: 实现搜索功能
  console.log('搜索关键词:', searchKeyword.value);
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

const goToJobDetail = (jobId) => {
  uni.navigateTo({
    url: `/pages/jobs/detail?id=${jobId}`
  });
};

onLoad(() => {
  fetchJobs();
});

</script>

<style lang="scss" scoped>
.container {
  padding: 0;
}

.banner {
  position: relative;
  height: 300rpx;

  .banner-image {
    width: 100%;
    height: 100%;
  }

  .banner-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #000;

    .banner-title {
      font-size: 40rpx;
      font-weight: bold;
      margin-bottom: 20rpx;
    }

    .banner-subtitle {
      font-size: 28rpx;
    }
  }
}

.search-section {
  padding: 30rpx;
  
  .search-box {
    display: flex;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    overflow: hidden;
    
    .search-input {
      flex: 1;
      height: 70rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      background-color: #f5f5f5;
    }
    
    .search-button {
      width: 120rpx;
      height: 70rpx;
      line-height: 70rpx;
      background-color: #2979ff;
      color: #fff;
      font-size: 28rpx;
      text-align: center;
      padding: 0;
      margin: 0;
    }
  }
}

.job-list {
  padding: 0 30rpx;

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
</style>