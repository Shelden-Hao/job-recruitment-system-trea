<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';
import { useInterviewStore } from '../../stores/interview';
import { useAuthStore } from '../../stores/auth';

const interviewStore = useInterviewStore();
const authStore = useAuthStore();

const interviews = ref([]);
const loading = ref(false);

// 面试状态选项
const statusOptions = [
  { label: '待安排', value: 'pending' },
  { label: '已安排', value: 'scheduled' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
];

// 加载面试列表
const loadInterviews = async () => {
  loading.value = true;
  try {
    const response = await interviewStore.getInterviews();
    interviews.value = response.data;
  } catch (error) {
    uni.showToast({
      title: error.message || '加载面试列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 安排面试
const scheduleInterview = (interview) => {
  uni.navigateTo({
    url: `/pages/interview/schedule?id=${interview.id}`
  });
};

// 更新面试状态
const updateStatus = async (interview, status) => {
  try {
    await interviewStore.updateInterviewStatus(interview.id, status);
    await loadInterviews();
    uni.showToast({
      title: '更新状态成功',
      icon: 'success'
    });
  } catch (error) {
    uni.showToast({
      title: error.message || '更新状态失败',
      icon: 'none'
    });
  }
};

// 添加面试反馈
const addFeedback = (interview) => {
  uni.navigateTo({
    url: `/pages/interview/feedback?id=${interview.id}`
  });
};

// 查看面试详情
const viewDetail = (interview) => {
  uni.navigateTo({
    url: `/pages/interview/detail?id=${interview.id}`
  });
};

onLoad(() => {
  loadInterviews();
});
</script>

<template>
  <view class="interview-container">
    <!-- 面试列表 -->
    <view class="interview-list">
      <u-empty v-if="interviews.length === 0" text="暂无面试" mode="list" />
      
      <view v-else class="interview-item" v-for="interview in interviews" :key="interview.id">
        <view class="interview-header">
          <view class="position-info">
            <text class="position-name">{{ interview.position }}</text>
            <u-tag
              :text="statusOptions.find(s => s.value === interview.status)?.label"
              :type="interview.status === 'completed' ? 'success' : interview.status === 'cancelled' ? 'error' : 'warning'"
              size="mini"
            />
          </view>
          
          <view class="company-info" v-if="authStore.isJobSeeker">
            <text>{{ interview.company.name }}</text>
          </view>
          
          <view class="candidate-info" v-else>
            <text>{{ interview.candidate.name }}</text>
            <text class="email">{{ interview.candidate.email }}</text>
          </view>
        </view>
        
        <view class="interview-time" v-if="interview.scheduledTime">
          <u-icon name="calendar" size="28"></u-icon>
          <text>{{ interview.scheduledTime }}</text>
        </view>
        
        <view class="interview-location" v-if="interview.location">
          <u-icon name="map" size="28"></u-icon>
          <text>{{ interview.location }}</text>
        </view>
        
        <view class="interview-actions">
          <template v-if="authStore.isCompany">
            <u-button
              v-if="interview.status === 'pending'"
              type="primary"
              size="mini"
              @click="scheduleInterview(interview)"
            >安排面试</u-button>
            
            <u-button
              v-if="interview.status === 'scheduled'"
              type="warning"
              size="mini"
              @click="updateStatus(interview, 'completed')"
            >完成面试</u-button>
            
            <u-button
              v-if="['scheduled', 'completed'].includes(interview.status)"
              type="info"
              size="mini"
              @click="addFeedback(interview)"
            >添加反馈</u-button>
          </template>
          
          <u-button
            type="primary"
            size="mini"
            plain
            @click="viewDetail(interview)"
          >查看详情</u-button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.interview-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  
  .interview-list {
    .interview-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;
      
      .interview-header {
        margin-bottom: 16rpx;
        
        .position-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12rpx;
          
          .position-name {
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
          }
        }
        
        .company-info,
        .candidate-info {
          font-size: 28rpx;
          color: #666;
          
          .email {
            margin-left: 16rpx;
            color: #999;
          }
        }
      }
      
      .interview-time,
      .interview-location {
        display: flex;
        align-items: center;
        gap: 12rpx;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 12rpx;
      }
      
      .interview-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16rpx;
        margin-top: 20rpx;
      }
    }
  }
}
</style>