<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';
import { useResumeStore } from '../../stores/resume';
import { useAuthStore } from '../../stores/auth';

const resumeStore = useResumeStore();
const authStore = useAuthStore();

const applications = ref([]);
const loading = ref(false);

// 加载投递记录
const loadApplications = async () => {
  loading.value = true;
  try {
    const response = await resumeStore.getApplications();
    applications.value = response.data;
  } catch (error) {
    uni.showToast({
      title: error.message || '加载投递记录失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 上传简历
const uploadResume = () => {
  uni.chooseFile({
    count: 1,
    type: 'file',
    extension: ['.pdf', '.doc', '.docx'],
    success: async (res) => {
      const file = res.tempFiles[0];
      const formData = new FormData();
      formData.append('resume', file);
      
      try {
        await resumeStore.uploadResume(formData);
      } catch (error) {
        uni.showToast({
          title: error.message || '上传失败',
          icon: 'none'
        });
      }
    }
  });
};

// 预览简历
const previewResume = (application) => {
  if (application.resumeUrl) {
    uni.downloadFile({
      url: application.resumeUrl,
      success: (res) => {
        uni.openDocument({
          filePath: res.tempFilePath,
          success: () => {
            console.log('打开文档成功');
          },
          fail: () => {
            uni.showToast({
              title: '打开文档失败',
              icon: 'none'
            });
          }
        });
      },
      fail: () => {
        uni.showToast({
          title: '下载文件失败',
          icon: 'none'
        });
      }
    });
  }
};

// 撤回投递
const withdrawApplication = async (application) => {
  uni.showModal({
    title: '确认撤回',
    content: '确定要撤回该投递吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await resumeStore.updateApplicationStatus(application.id, 'withdrawn');
          await loadApplications();
          uni.showToast({
            title: '撤回成功',
            icon: 'success'
          });
        } catch (error) {
          uni.showToast({
            title: error.message || '撤回失败',
            icon: 'none'
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
    <view class="resume-upload" v-if="!resumeStore.hasResume">
      <u-upload
        :action="null"
        :auto-upload="false"
        @select="uploadResume"
      >
        <template #default>
          <view class="upload-box">
            <u-icon name="file-text" size="48"></u-icon>
            <text class="upload-text">点击上传简历</text>
            <text class="upload-desc">支持 PDF、Word 格式</text>
          </view>
        </template>
      </u-upload>
    </view>
    
    <!-- 投递记录 -->
    <view class="application-list">
      <view class="section-title">
        <text>投递记录</text>
        <text class="count">({{ applications.length }})</text>
      </view>
      
      <u-empty v-if="applications.length === 0" text="暂无投递记录" mode="file" />
      
      <view v-else class="application-item" v-for="application in applications" :key="application.id">
        <view class="job-info">
          <view class="job-header">
            <text class="job-title">{{ application.job.title }}</text>
            <u-tag
              :text="application.status"
              :type="application.status === 'pending' ? 'warning' : application.status === 'accepted' ? 'success' : 'error'"
              size="mini"
            />
          </view>
          
          <view class="company-info">
            <text>{{ application.job.company.name }}</text>
            <text class="apply-time">投递时间：{{ application.createdAt }}</text>
          </view>
        </view>
        
        <view class="application-actions">
          <u-button
            type="primary"
            size="mini"
            plain
            @click="previewResume(application)"
          >查看简历</u-button>
          
          <u-button
            v-if="application.status === 'pending'"
            type="error"
            size="mini"
            plain
            @click="withdrawApplication(application)"
          >撤回投递</u-button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.resume-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  
  .resume-upload {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;
    
    .upload-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40rpx;
      border: 2rpx dashed #ddd;
      border-radius: 8rpx;
      
      .upload-text {
        font-size: 32rpx;
        color: #333;
        margin: 20rpx 0 8rpx;
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
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 24rpx;
      
      .count {
        font-size: 28rpx;
        color: #999;
        font-weight: normal;
        margin-left: 8rpx;
      }
    }
    
    .application-item {
      border-bottom: 2rpx solid #f5f5f5;
      padding: 20rpx 0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .job-info {
        margin-bottom: 16rpx;
        
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8rpx;
          
          .job-title {
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
          }
        }
        
        .company-info {
          display: flex;
          justify-content: space-between;
          font-size: 28rpx;
          color: #666;
          
          .apply-time {
            color: #999;
          }
        }
      }
      
      .application-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16rpx;
      }
    }
  }
}
</style>