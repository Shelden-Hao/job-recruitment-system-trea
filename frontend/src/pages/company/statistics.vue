<template>
  <view class="container">
    <view class="statistics-cards">
      <view class="stat-card">
        <text class="stat-title">职位总数</text>
        <text class="stat-number">{{ statistics.totalJobs }}</text>
        <text class="stat-trend" :class="statistics.jobTrend >= 0 ? 'up' : 'down'">
          {{ statistics.jobTrend >= 0 ? '+' : '' }}{{ statistics.jobTrend }}%
        </text>
      </view>
      
      <view class="stat-card">
        <text class="stat-title">收到申请</text>
        <text class="stat-number">{{ statistics.totalApplications }}</text>
        <text class="stat-trend" :class="statistics.applicationTrend >= 0 ? 'up' : 'down'">
          {{ statistics.applicationTrend >= 0 ? '+' : '' }}{{ statistics.applicationTrend }}%
        </text>
      </view>
      
      <view class="stat-card">
        <text class="stat-title">面试场数</text>
        <text class="stat-number">{{ statistics.totalInterviews }}</text>
        <text class="stat-trend" :class="statistics.interviewTrend >= 0 ? 'up' : 'down'">
          {{ statistics.interviewTrend >= 0 ? '+' : '' }}{{ statistics.interviewTrend }}%
        </text>
      </view>
    </view>
    
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">申请趋势</text>
        <view class="time-filter">
          <text :class="['filter-item', timeRange === 'week' ? 'active' : '']" @click="handleTimeRangeChange('week')">周</text>
          <text :class="['filter-item', timeRange === 'month' ? 'active' : '']" @click="handleTimeRangeChange('month')">月</text>
          <text :class="['filter-item', timeRange === 'year' ? 'active' : '']" @click="handleTimeRangeChange('year')">年</text>
        </view>
      </view>
      
      <view class="chart-container">
        <!-- TODO: 集成图表组件 -->
        <view class="placeholder-chart">申请趋势图表</view>
      </view>
    </view>
    
    <view class="data-table">
      <view class="section-header">
        <text class="section-title">职位数据</text>
      </view>
      
      <view class="table-header">
        <text class="header-cell">职位名称</text>
        <text class="header-cell">浏览量</text>
        <text class="header-cell">申请数</text>
        <text class="header-cell">面试数</text>
      </view>
      
      <view v-for="job in jobStatistics" :key="job.id" class="table-row">
        <text class="cell">{{ job.title }}</text>
        <text class="cell">{{ job.views }}</text>
        <text class="cell">{{ job.applications }}</text>
        <text class="cell">{{ job.interviews }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';

const timeRange = ref('week');
const statistics = ref({
  totalJobs: 0,
  jobTrend: 0,
  totalApplications: 0,
  applicationTrend: 0,
  totalInterviews: 0,
  interviewTrend: 0
});

const jobStatistics = ref([]);

const fetchStatistics = async () => {
  try {
    // TODO: 实现获取统计数据的API调用
    statistics.value = {
      totalJobs: 12,
      jobTrend: 8.5,
      totalApplications: 156,
      applicationTrend: 12.3,
      totalInterviews: 45,
      interviewTrend: -5.2
    };
    
    jobStatistics.value = [
      {
        id: 1,
        title: '前端开发工程师',
        views: 523,
        applications: 45,
        interviews: 12
      },
      {
        id: 2,
        title: '后端开发工程师',
        views: 412,
        applications: 38,
        interviews: 10
      },
      {
        id: 3,
        title: '产品经理',
        views: 368,
        applications: 28,
        interviews: 8
      }
    ];
  } catch (error) {
    console.error('获取统计数据失败:', error);
    uni.showToast({
      title: '获取统计数据失败',
      icon: 'none'
    });
  }
};

const handleTimeRangeChange = (range) => {
  timeRange.value = range;
  fetchStatistics();
};

onLoad(() => {
  fetchStatistics();
});
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
}

.statistics-cards {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
  
  .stat-card {
    flex: 1;
    margin: 0 15rpx;
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    
    &:first-child {
      margin-left: 0;
    }
    
    &:last-child {
      margin-right: 0;
    }
    
    .stat-title {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;
    }
    
    .stat-number {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .stat-trend {
      font-size: 24rpx;
      
      &.up {
        color: #67c23a;
      }
      
      &.down {
        color: #f56c6c;
      }
    }
  }
}

.chart-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .time-filter {
      display: flex;
      background: #f5f7fa;
      border-radius: 8rpx;
      overflow: hidden;
      
      .filter-item {
        padding: 10rpx 30rpx;
        font-size: 28rpx;
        color: #666;
        
        &.active {
          background: #409eff;
          color: #fff;
        }
      }
    }
  }
  
  .chart-container {
    height: 400rpx;
    
    .placeholder-chart {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f7fa;
      border-radius: 8rpx;
      color: #999;
      font-size: 28rpx;
    }
  }
}

.data-table {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  
  .section-header {
    margin-bottom: 30rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .table-header {
    display: flex;
    padding: 20rpx 0;
    border-bottom: 2rpx solid #eee;
    
    .header-cell {
      flex: 1;
      font-size: 28rpx;
      color: #666;
      text-align: center;
      
      &:first-child {
        flex: 2;
        text-align: left;
      }
    }
  }
  
  .table-row {
    display: flex;
    padding: 30rpx 0;
    border-bottom: 2rpx solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .cell {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      text-align: center;
      
      &:first-child {
        flex: 2;
        text-align: left;
      }
    }
  }
}
</style>