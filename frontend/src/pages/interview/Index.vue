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
const loadInterviews = () => {
  loading.value = true;
  
  // 模拟API延迟
  setTimeout(() => {
    // 模拟数据
    interviews.value = [
      {
        id: 1,
        position: '前端开发工程师',
        status: 'pending',
        company: {
          name: '科技有限公司'
        },
        candidate: {
          name: '张三',
          email: 'zhangsan@example.com'
        }
      },
      {
        id: 2,
        position: '后端开发工程师',
        status: 'scheduled',
        scheduledTime: '2024-03-20 14:30',
        location: '广州市天河区科技园B栋3楼',
        company: {
          name: '互联网科技公司'
        },
        candidate: {
          name: '李四',
          email: 'lisi@example.com'
        }
      },
      {
        id: 3,
        position: 'UI设计师',
        status: 'completed',
        scheduledTime: '2024-03-15 10:00',
        location: '深圳市南山区科技园C栋5楼',
        company: {
          name: '创新科技公司'
        },
        candidate: {
          name: '王五',
          email: 'wangwu@example.com'
        }
      }
    ];
    
    loading.value = false;
  }, 500);
};

// 更新面试状态
const updateStatus = async (interview, status) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 更新本地数据
    const index = interviews.value.findIndex(item => item.id === interview.id);
    if (index !== -1) {
      interviews.value[index].status = status;
    }
    
    uni.showToast({
      title: '更新状态成功',
      icon: 'success'
    });
  } catch (error) {
    uni.showToast({
      title: '更新状态失败',
      icon: 'none'
    });
  }
};

// 安排面试
const scheduleInterview = (interview) => {
  uni.navigateTo({
    url: `/pages/interview/schedule?id=${interview.id}`
  });
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
      <uni-load-more v-if="interviews.length === 0" status="noMore" iconType="empty" :contentText="{contentdown: '暂无面试', contentrefresh: '加载中', contentnomore: '暂无面试'}" />

      <view v-else class="interview-item" v-for="interview in interviews" :key="interview.id">
        <view class="interview-header">
          <view class="position-info">
            <text class="position-name">{{ interview.position }}</text>
            <uni-tag
              :text="statusOptions.find(s => s.value === interview.status)?.label"
              :type="interview.status === 'completed' ? 'success' : interview.status === 'cancelled' ? 'error' : 'warning'"
              size="small"
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
          <uni-icons type="calendar" size="28"></uni-icons>
          <text>{{ interview.scheduledTime }}</text>
        </view>

        <view class="interview-location" v-if="interview.location">
          <uni-icons type="location" size="28"></uni-icons>
          <text>{{ interview.location }}</text>
        </view>

        <view class="interview-actions">
          <template v-if="authStore.isCompany">
            <button
              v-if="interview.status === 'pending'"
              type="primary"
              size="mini"
              @tap="scheduleInterview(interview)"
            >安排面试</button>

            <button
              v-if="interview.status === 'scheduled'"
              type="warn"
              size="mini"
              @tap="updateStatus(interview, 'completed')"
            >完成面试</button>

            <button
              v-if="['scheduled', 'completed'].includes(interview.status)"
              type="default"
              size="mini"
              @tap="addFeedback(interview)"
            >添加反馈</button>
          </template>
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
