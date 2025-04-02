<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';
import { useStatisticsStore } from '../../stores/statistics';
import { useAuthStore } from '../../stores/auth';

const statisticsStore = useStatisticsStore();
const authStore = useAuthStore();

const loading = ref(false);
const statistics = ref(null);

// 加载统计数据
const loadStatistics = async () => {
  loading.value = true;
  try {
    const response = await statisticsStore.getStatistics();
    statistics.value = response.data;
  } catch (error) {
    uni.showToast({
      title: error.message || '加载统计数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

onLoad(() => {
  loadStatistics();
});
</script>

<template>
  <view class="statistics-container">
    <u-skeleton :loading="loading" :animation="true">
      <template v-if="statistics">
        <!-- 求职者统计 -->
        <view v-if="authStore.isJobSeeker" class="statistics-section">
          <view class="section-header">
            <text class="section-title">我的求职统计</text>
          </view>
          
          <view class="statistics-grid">
            <view class="stat-item">
              <text class="stat-value">{{ statistics.totalApplications }}</text>
              <text class="stat-label">投递简历</text>
            </view>
            
            <view class="stat-item">
              <text class="stat-value">{{ statistics.interviewInvitations }}</text>
              <text class="stat-label">面试邀请</text>
            </view>
            
            <view class="stat-item">
              <text class="stat-value">{{ statistics.offerCount }}</text>
              <text class="stat-label">收到Offer</text>
            </view>
            
            <view class="stat-item">
              <text class="stat-value">{{ statistics.favoriteJobs }}</text>
              <text class="stat-label">收藏职位</text>
            </view>
          </view>
          
          <!-- 投递状态分布 -->
          <view class="chart-section">
            <view class="chart-header">
              <text class="chart-title">投递状态分布</text>
            </view>
            
            <u-circle-progress
              :percentage="statistics.applicationProgress"
              :width="200"
              :show-text="true"
            />
          </view>
        </view>
        
        <!-- 企业统计 -->
        <view v-else class="statistics-section">
          <view class="section-header">
            <text class="section-title">招聘统计</text>
          </view>
          
          <view class="statistics-grid">
            <view class="stat-item">
              <text class="stat-value">{{ statistics.totalJobs }}</text>
              <text class="stat-label">发布职位</text>
            </view>
            
            <view class="stat-item">
              <text class="stat-value">{{ statistics.totalApplications }}</text>
              <text class="stat-label">收到简历</text>
            </view>
            
            <view class="stat-item">
              <text class="stat-value">{{ statistics.interviewCount }}</text>
              <text class="stat-label">面试场数</text>
            </view>
            
            <view class="stat-item">
              <text class="stat-value">{{ statistics.offerCount }}</text>
              <text class="stat-label">发出Offer</text>
            </view>
          </view>
          
          <!-- 简历处理进度 -->
          <view class="chart-section">
            <view class="chart-header">
              <text class="chart-title">简历处理进度</text>
            </view>
            
            <u-line-progress
              :percentage="statistics.resumeProgress"
              :show-text="true"
              height="30"
            />
          </view>
          
          <!-- 职位投递趋势 -->
          <view class="chart-section">
            <view class="chart-header">
              <text class="chart-title">职位投递趋势</text>
            </view>
            
            <u-line-chart
              :points="statistics.applicationTrend"
              :categories="statistics.trendDates"
              :width="680"
              :height="300"
            />
          </view>
        </view>
      </template>
    </u-skeleton>
  </view>
</template>

<style lang="scss" scoped>
.statistics-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  
  .statistics-section {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    
    .section-header {
      margin-bottom: 24rpx;
      
      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }
    
    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20rpx;
      margin-bottom: 32rpx;
      
      .stat-item {
        background-color: #f8f9fa;
        border-radius: 8rpx;
        padding: 24rpx;
        text-align: center;
        
        .stat-value {
          font-size: 36rpx;
          font-weight: bold;
          color: #2979ff;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .stat-label {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
    
    .chart-section {
      margin-top: 32rpx;
      
      .chart-header {
        margin-bottom: 20rpx;
        
        .chart-title {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
  }
}
</style>