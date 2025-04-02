<template>
  <view class="container">
    <view class="banner">
      <image src="https://www.zhipin.com/sem/static/img/banner.97f904e9.png" mode="aspectFill" class="banner-image"></image>
      <view class="banner-content">
        <text class="banner-title">找到理想的工作</text><br/>
        <text class="banner-subtitle">数千个职位等你来选</text>
      </view>
    </view>
    
    <view class="search-section">
      <u-search
        v-model="searchKeyword"
        placeholder="搜索职位、公司"
        :show-action="false"
        @search="handleSearch"
      ></u-search>
    </view>
    
    <view class="job-list">
      <view class="section-title">最新职位</view>
      <view class="job-cards">
        <view v-for="job in jobs" :key="job.id" class="job-card" @click="goToJobDetail(job.id)">
          <view class="job-info">
            <text class="job-title">{{ job.title }}</text>
            <text class="company-name">{{ job.company }}</text>
            <view class="job-tags">
              <text class="tag">{{ job.location }}</text>
              <text class="tag">{{ job.salary }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const searchKeyword = ref('');
const jobs = ref([]);

const fetchJobs = () => {
    try {
    // TODO: 实现获取职位列表的API调用
    jobs.value = [
        {
          id: 1,
          title: '前端开发工程师',
          company: '科技有限公司',
          location: '深圳',
          salary: '15k-25k'
        },
        {
          id: 2,
          title: '后端开发工程师',
          company: '互联网科技有限公司',
          location: '北京',
          salary: '20k-30k'
        },
        {
          id: 3,
          title: 'UI设计师',
          company: '创新科技公司',
          location: '上海',
          salary: '12k-18k'
        },
        {
          id: 4,
          title: '产品经理',
          company: '智能科技公司',
          location: '广州',
          salary: '18k-25k'
        },
        {
          id: 5,
          title: '数据分析师',
          company: '大数据科技公司',
          location: '杭州',
          salary: '15k-22k'
        }
    ];
    } catch (error) {
        console.error('获取职位列表失败:', error);
    }
};

const handleSearch = () => {
    // TODO: 实现搜索功能
    console.log('搜索关键词:', searchKeyword.value);
};

const goToJobDetail = (jobId) => {
    uni.navigateTo({
         url: `/pages/jobs/detail?id=${jobId}`
    });
};

onShow(() => {
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
}

.job-list {
  padding: 0 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .job-cards {
    .job-card {
      background: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
      
      .job-info {
        .job-title {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .company-name {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 10rpx;
        }
        
        .job-tags {
          display: flex;
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