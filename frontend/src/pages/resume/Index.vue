<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';

// 使用假数据
const applications = ref([]);
const loading = ref(false);
const hasResume = ref(false);

// 加载投递记录（假数据）
const loadApplications = () => {
  loading.value = true;
  
  // 模拟API延迟
  setTimeout(() => {
    applications.value = [
      {
        id: 1,
        job: {
          title: '前端开发工程师',
          company: {
            name: '科技有限公司'
          }
        },
        status: 'pending',
        createdAt: '2024-04-01 10:30',
        resumeUrl: 'https://example.com/resume.pdf'
      },
      {
        id: 2,
        job: {
          title: '后端开发工程师',
          company: {
            name: '互联网公司'
          }
        },
        status: 'accepted',
        createdAt: '2024-03-28 15:20',
        resumeUrl: 'https://example.com/resume.pdf'
      },
      {
        id: 3,
        job: {
          title: 'UI设计师',
          company: {
            name: '创新科技公司'
          }
        },
        status: 'rejected',
        createdAt: '2024-03-25 09:45',
        resumeUrl: 'https://example.com/resume.pdf'
      }
    ];
    
    loading.value = false;
  }, 500);
};

// 上传简历
const uploadResume = () => {
  uni.chooseFile({
    count: 1,
    type: 'file',
    extension: ['.pdf', '.doc', '.docx'],
    success: (res) => {
      const file = res.tempFiles[0];
      
      // 模拟上传成功
      uni.showLoading({
        title: '上传中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        hasResume.value = true;
        
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        });
      }, 1500);
    }
  });
};

// 预览简历
const previewResume = (application) => {
  if (application.resumeUrl) {
    uni.showToast({
      title: '正在打开简历...',
      icon: 'none'
    });
    
    // 实际应用中应该下载和打开文档
    // 这里只做UI展示
    setTimeout(() => {
      uni.showModal({
        title: '提示',
        content: '在实际应用中，这里会打开简历文档',
        showCancel: false
      });
    }, 1000);
  }
};

// 撤回投递
const withdrawApplication = (application) => {
  uni.showModal({
    title: '确认撤回',
    content: '确定要撤回该投递吗？',
    success: (res) => {
      if (res.confirm) {
        // 模拟撤回成功
        const index = applications.value.findIndex(item => item.id === application.id);
        if (index !== -1) {
          applications.value[index].status = 'withdrawn';
          
          uni.showToast({
            title: '撤回成功',
            icon: 'success'
          });
        }
      }
    }
  });
};

onLoad(() => {
  loadApplications();
});
</script>

<template>
  <view class="resume-container">
    <!-- 简历上传 -->
    <view class="resume-upload" v-if="!hasResume">
      <view class="upload-area" @click="uploadResume">
        <view class="upload-icon">➕</view>
        <text class="upload-text">上传简历</text>
        <text class="upload-desc">支持PDF、DOC、DOCX格式</text>
      </view>
    </view>

    <!-- 投递列表 -->
    <view class="application-list">
      <view class="list-header">
        <text class="list-title">我的投递</text>
        <text class="list-count">共 {{ applications.length }} 条记录</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="applications.length === 0 && !loading">
        <image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无投递记录</text>
      </view>
      
      <!-- 加载中 -->
      <view class="loading-state" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 投递记录列表 -->
      <view v-else>
        <view 
          class="application-item" 
          v-for="(application, index) in applications" 
          :key="application.id"
        >
          <view class="item-top">
            <view class="job-info">
              <text class="job-title">{{ application.job.title }}</text>
              <text class="company-name">{{ application.job.company.name }}</text>
            </view>
            <view class="status-tag" :class="{
              'status-pending': application.status === 'pending',
              'status-accepted': application.status === 'accepted',
              'status-rejected': application.status === 'rejected',
              'status-withdrawn': application.status === 'withdrawn'
            }">
              {{ 
                application.status === 'pending' ? '待处理' : 
                application.status === 'accepted' ? '已接受' : 
                application.status === 'rejected' ? '已拒绝' : 
                '已撤回'
              }}
            </view>
          </view>
          
          <view class="item-bottom">
            <text class="created-at">投递时间：{{ application.createdAt }}</text>
            <view class="action-buttons">
              <button 
                class="action-button view-button" 
                size="mini"
                @click="previewResume(application)"
              >查看简历</button>
              <button 
                v-if="application.status === 'pending'" 
                class="action-button withdraw-button" 
                size="mini"
                @click="withdrawApplication(application)"
              >撤回</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.resume-container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  
  .resume-upload {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 240rpx;
      border: 2rpx dashed #ddd;
      border-radius: 8rpx;
      
      .upload-icon {
        font-size: 48rpx;
        color: #333;
        margin-bottom: 20rpx;
      }
      
      .upload-text {
        font-size: 30rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
      }
      
      .upload-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .application-list {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 24rpx;
      
      .list-count {
        font-size: 28rpx;
        color: #999;
        font-weight: normal;
      }
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40rpx;
      
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
    
    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40rpx;
      
      .loading-text {
        font-size: 28rpx;
        color: #999;
      }
    }
    
    .application-item {
      border-bottom: 1px solid #eee;
      padding: 20rpx 0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16rpx;
        
        .job-info {
          display: flex;
          flex-direction: column;
          
          .job-title {
            font-size: 30rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 8rpx;
          }
          
          .company-name {
            font-size: 28rpx;
            color: #666;
          }
        }
        
        .status-tag {
          padding: 4rpx 12rpx;
          border-radius: 4rpx;
          font-size: 24rpx;
          color: #fff;
          
          &.status-pending {
            background-color: #ff9900;
          }
          
          &.status-accepted {
            background-color: #19be6b;
          }
          
          &.status-rejected {
            background-color: #ed3f14;
          }
          
          &.status-withdrawn {
            background-color: #999;
          }
        }
      }
      
      .item-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 28rpx;
        
        .created-at {
          color: #999;
        }
        
        .action-buttons {
          display: flex;
          gap: 16rpx;
          
          .action-button {
            margin: 0;
            line-height: 1.8;
            padding: 0 20rpx;
            font-size: 24rpx;
          }
          
          .view-button {
            background-color: #2979ff;
            color: #fff;
          }
          
          .withdraw-button {
            background-color: #ff4d4f;
            color: #fff;
          }
        }
      }
    }
  }
}
</style>