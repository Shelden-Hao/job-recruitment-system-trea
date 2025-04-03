<template>
  <view class="container">
    <view class="header-actions">
      <button class="primary-button" @click="handleAddJob">发布新职位</button>
    </view>
    
    <view class="job-list">
      <view v-for="job in jobs" :key="job.id" class="job-card">
        <view class="job-header">
          <text class="job-title">{{ job.title }}</text>
          <text class="job-status" :class="job.status">{{ getStatusText(job.status) }}</text>
        </view>
        
        <view class="job-info">
          <view class="info-item">
            <text class="label">薪资范围：</text>
            <text class="value">{{ job.salary }}</text>
          </view>
          <view class="info-item">
            <text class="label">工作地点：</text>
            <text class="value">{{ job.location }}</text>
          </view>
          <view class="info-item">
            <text class="label">发布时间：</text>
            <text class="value">{{ job.createTime }}</text>
          </view>
        </view>
        
        <view class="job-statistics">
          <view class="stat-item">
            <text class="number">{{ job.viewCount }}</text>
            <text class="label">浏览</text>
          </view>
          <view class="stat-item">
            <text class="number">{{ job.applicationCount }}</text>
            <text class="label">申请</text>
          </view>
          <view class="stat-item">
            <text class="number">{{ job.interviewCount }}</text>
            <text class="label">面试</text>
          </view>
        </view>
        
        <view class="actions">
          <button class="action-button edit-button" size="mini" @click="handleEdit(job.id)">编辑</button>
          <button class="action-button toggle-button" size="mini" @click="handleToggleStatus(job)">{{ job.status === 'active' ? '下线' : '上线' }}</button>
          <button class="action-button delete-button" size="mini" @click="handleDelete(job.id)">删除</button>
        </view>
      </view>
    </view>
    
    <view v-if="jobs.length === 0" class="empty-state">
      <image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
      <text class="empty-text">暂无职位</text>
    </view>
  </view>
</template>

<script>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';

export default {
  setup() {
    const jobs = ref([]);
    
    const fetchJobs = async () => {
      try {
        // TODO: 实现获取职位列表的API调用
        jobs.value = [
          {
            id: 1,
            title: '前端开发工程师',
            status: 'active',
            salary: '15k-25k',
            location: '深圳',
            createTime: '2024-01-15',
            viewCount: 156,
            applicationCount: 23,
            interviewCount: 5
          },
          {
            id: 2,
            title: '后端开发工程师',
            status: 'inactive',
            salary: '20k-35k',
            location: '广州',
            createTime: '2024-01-10',
            viewCount: 89,
            applicationCount: 12,
            interviewCount: 3
          }
        ];
      } catch (error) {
        console.error('获取职位列表失败:', error);
        uni.showToast({
          title: '获取职位列表失败',
          icon: 'none'
        });
      }
    };
    
    const getStatusText = (status) => {
      const statusMap = {
        active: '招聘中',
        inactive: '已下线'
      };
      return statusMap[status] || status;
    };
    
    const handleAddJob = () => {
      uni.navigateTo({
        url: '/pages/company/job-edit'
      });
    };
    
    const handleEdit = (jobId) => {
      uni.navigateTo({
        url: `/pages/company/job-edit?id=${jobId}`
      });
    };
    
    const handleToggleStatus = async (job) => {
      const newStatus = job.status === 'active' ? 'inactive' : 'active';
      const actionText = newStatus === 'active' ? '上线' : '下线';
      
      uni.showModal({
        title: '提示',
        content: `确定要${actionText}这个职位吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              // TODO: 实现更新职位状态的API调用
              job.status = newStatus;
              uni.showToast({
                title: `${actionText}成功`,
                icon: 'success'
              });
            } catch (error) {
              uni.showToast({
                title: `${actionText}失败`,
                icon: 'none'
              });
            }
          }
        }
      });
    };
    
    const handleDelete = (jobId) => {
      uni.showModal({
        title: '提示',
        content: '确定要删除这个职位吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // TODO: 实现删除职位的API调用
              jobs.value = jobs.value.filter(job => job.id !== jobId);
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              });
            } catch (error) {
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          }
        }
      });
    };
    
    onLoad(() => {
      fetchJobs();
    });
    
    return {
      jobs,
      getStatusText,
      handleAddJob,
      handleEdit,
      handleToggleStatus,
      handleDelete
    };
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
}

.header-actions {
  margin-bottom: 30rpx;
  
  .primary-button {
    background-color: #2979ff;
    color: #fff;
    font-size: 28rpx;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 8rpx;
  }
}

.job-list {
  .job-card {
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .job-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .job-status {
        font-size: 24rpx;
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        
        &.active {
          color: #67c23a;
          background: rgba(103, 194, 58, 0.1);
        }
        
        &.inactive {
          color: #909399;
          background: rgba(144, 147, 153, 0.1);
        }
      }
    }
    
    .job-info {
      margin-bottom: 20rpx;
      
      .info-item {
        display: flex;
        margin-bottom: 10rpx;
        
        .label {
          font-size: 28rpx;
          color: #666;
          margin-right: 10rpx;
        }
        
        .value {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
    
    .job-statistics {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20rpx;
      
      .stat-item {
        text-align: center;
        
        .number {
          display: block;
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .label {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    
    .actions {
      display: flex;
      gap: 20rpx;
      justify-content: flex-end;
      
      .action-button {
        font-size: 24rpx;
        margin: 0;
        padding: 0 20rpx;
        line-height: 1.8;
        
        &.edit-button {
          background-color: #2979ff;
          color: #fff;
        }
        
        &.toggle-button {
          background-color: #ff9900;
          color: #fff;
        }
        
        &.delete-button {
          background-color: #ff4d4f;
          color: #fff;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  
  .empty-image {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 20rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>