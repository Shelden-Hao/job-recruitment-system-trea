<template>
  <view class="container">
    <view class="resume-card">
      <view class="section-header">
        <text class="section-title">基本信息</text>
<!--        <button class="edit-button" size="mini" @click="handleEdit('basic')">编辑</button>-->
      </view>

      <view class="basic-info">
        <view class="info-item">
          <text class="label">姓名</text>
          <text class="value">{{ resume?.fullName }}</text>
        </view>
        <view class="info-item">
          <text class="label">年龄</text>
          <!-- 当前时间减去出生时间-->
          <text class="value">{{ (new Date().getFullYear() - new Date(resume?.birthDate).getFullYear()).toString() }}岁
          </text>
        </view>
        <view class="info-item">
          <text class="label">性别</text>
          <text class="value">{{ resume?.gender }}</text>
        </view>
        <view class="info-item">
          <text class="label">学历</text>
          <text class="value">{{ resume?.education }}</text>
        </view>
        <view class="info-item">
          <text class="label">工作年限</text>
          <text class="value">{{ resume?.experience }}年</text>
        </view>
        <view class="info-item">
          <text class="label">邮箱</text>
          <text class="value">{{ resume?.User?.email }}</text>
        </view>
        <view class="info-item">
          <text class="label">个人介绍</text>
          <text class="value">{{ resume?.selfIntroduction }}</text>
        </view>
      </view>

      <view class="section-header">
        <text class="section-title">求职意向</text>
<!--        <button class="edit-button" size="mini" @click="handleEdit('intention')">编辑</button>-->
      </view>

      <view class="intention-info">
        <view class="info-item">
          <text class="label">期望职位</text>
          <text class="value">{{ resume?.expectedPosition }}</text>
        </view>
        <view class="info-item">
          <text class="label">期望薪资</text>
          <text class="value">{{ resume?.expectedSalary }}</text>
        </view>
        <view class="info-item">
          <text class="label">期望城市</text>
          <text class="value">{{ resume?.expectedLocation }}</text>
        </view>
      </view>

      <view class="section-header">
        <text class="section-title">工作经历</text>
<!--        <button class="edit-button" size="mini" @click="handleEdit('experience')">添加</button>-->
      </view>

      <view class="experience-list">
        <view v-for="(exp, index) in experiences" :key="index" class="experience-item">
          <view class="experience-header">
            <text class="company">{{ exp.company }}</text>
            <text class="period">{{ exp.startDate }} - {{ exp.endDate }}</text>
          </view>
          <text class="position">{{ exp.position }}</text>
          <text class="description">{{ exp.description }}</text>
          <view class="actions">
<!--            <button class="action-button primary-button" size="mini" @click="handleEditExperience(index)">编辑</button>-->
<!--            <button class="action-button danger-button" size="mini" @click="handleDeleteExperience(index)">删除</button>-->
          </view>
        </view>
      </view>
    </view>
<!--    新增一个简历上传的按钮-->
    <view class="upload-button">
      <!-- 移除HTML input元素 -->
      <button class="upload-button-text" @click="handleResumeUpload" :disabled="uploading">
        {{ uploading ? '上传中...' : '上传简历' }}
      </button>
      <text v-if="resume_url" class="resume-url">当前简历网站地址: {{ 'http://localhost:3000/uploads/resumes/' + getResumeFileName(resume_url) }}</text>
    </view>
  </view>
</template>

<script setup>
import {onLoad, onUnload} from '@dcloudio/uni-app'
import {ref} from 'vue';
import {resumeAPI} from "../../services/api";

// 假数据
// const resume = ref({
//   name: '张三',
//   age: 25,
//   education: '本科',
//   experience: 3,
//   phone: '13800138000',
//   email: 'zhangsan@example.com',
//   intention: {
//     position: '前端开发工程师',
//     salary: '15k-25k',
//     city: '深圳'
//   },
//   experiences: [
//     {
//       company: '科技有限公司',
//       position: '前端开发工程师',
//       startDate: '2020-01',
//       endDate: '2023-01',
//       description: '负责公司核心产品的前端开发工作，包括需求分析、技术方案设计和具体实现。'
//     }
//   ]
// });

// 假数据
const experiences = [
  {
    company: '科技有限公司',
    position: '前端开发工程师',
    startDate: '2020-01',
    endDate: '2023-01',
    description: '负责公司核心产品的前端开发工作，包括需求分析、技术方案设计和具体实现。'
  }
]

const resume = ref({})
const resume_url = ref('')
// 获取从用户主页传递过来的jobseekerId
const jobseekerId = ref('')
// 获取从用户主页传递过来的userId
const userId = ref('')
// 上传状态
const uploading = ref(false)
// 上传的文件路径
const resumeUrl = ref('')

const fetchResume = async () => {
  try {
    if (jobseekerId.value) {
      const result = await resumeAPI.getResumeById(jobseekerId.value);
      console.log("=>(resume.vue:117) result", result);
      resume.value = result.data.jobseeker;
    }
  } catch (error) {
    console.error('获取简历信息失败:', error);
    uni.showToast({
      title: '获取简历信息失败',
      icon: 'none'
    });
  }
};

const handleEdit = (type) => {
  uni.navigateTo({
    url: `/pages/jobseeker/resume-edit?type=${type}`
  });
};

const handleEditExperience = (index) => {
  uni.navigateTo({
    url: `/pages/jobseeker/resume-edit?type=experience&index=${index}`
  });
};

const handleDeleteExperience = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这条工作经历吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // TODO: 实现删除工作经历的API调用
          resume.value.experiences.splice(index, 1);
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

// 恢复handleResumeUpload方法，使用uni API选择文件
const handleResumeUpload = () => {
  // 使用uni.chooseFile或在小程序中使用uni.chooseMessageFile
  // #ifdef H5 || APP-PLUS
  uni.chooseFile({
    count: 1,
    type: 'all',
    extension: ['.pdf', '.doc', '.docx'],
    success: (res) => {
      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0];
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) {
          uni.showToast({
            title: '文件大小不能超过5MB',
            icon: 'none'
          });
          return;
        }
        uploadFile(file);
      }
    },
    fail: (err) => {
      console.error('选择文件失败:', err);
    }
  });
  // #endif
  
  // #ifdef MP
  // 微信小程序使用chooseMessageFile
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['.pdf', '.doc', '.docx'],
    success: (res) => {
      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0];
        // 检查文件类型
        const fileName = file.name || '';
        const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        if (!['pdf', 'doc', 'docx'].includes(fileExt)) {
          uni.showToast({
            title: '只支持PDF或Word文档',
            icon: 'none'
          });
          return;
        }
        
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) {
          uni.showToast({
            title: '文件大小不能超过5MB',
            icon: 'none'
          });
          return;
        }
        
        uploadFile(file);
      }
    },
    fail: (err) => {
      console.error('选择文件失败:', err);
      uni.showToast({
        title: '选择文件失败',
        icon: 'none'
      });
    }
  });
  // #endif
};

const uploadFile = (file) => {
  uploading.value = true;
  
  // 使用uni.uploadFile代替fetch
  uni.uploadFile({
    url: `http://localhost:3000/api/resumes/upload?userId=${userId.value}`, // 将 userId 作为查询参数
    filePath: file.path || file.tempFilePath,
    name: 'resume',
    formData: {
      // 不再在formData中包含user_id
    },
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}` // 使用uni.getStorageSync替代localStorage
    },
    success: (res) => {
      try {
        const result = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        if (res.statusCode === 200 && result.resume_url) {
          resume_url.value = result.resume_url;
          
          uni.showToast({
            title: '简历上传成功',
            icon: 'success'
          });
          
          // 更新简历信息
          fetchResume();
        } else {
          uni.showToast({
            title: result.message || '上传失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '处理响应失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('上传文件失败:', err);
      uni.showToast({
        title: '上传文件失败',
        icon: 'none'
      });
    },
    complete: () => {
      uploading.value = false;
    }
  });
};

// 获取简历文件名
const getResumeFileName = (url) => {
  if (!url) return '';
  // 打开简历的url
  console.log(url.split('/'))
  return url.split('/').pop();
}

onLoad(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const eventChannel = currentPage.getOpenerEventChannel();
  eventChannel.on('jobseekerId', (params) => {
    jobseekerId.value = params;
    fetchResume();
  });
  eventChannel.on('userId', (params) => {
    userId.value = params;
  });
});
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
}

.resume-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .edit-button {
    margin: 0;
    font-size: 24rpx;
    line-height: 1.8;
    background-color: #409eff;
    color: #fff;
  }
}

.basic-info,
.intention-info {
  margin-bottom: 40rpx;

  .info-item {
    display: flex;
    margin-bottom: 20rpx;

    .label {
      width: 160rpx;
      font-size: 28rpx;
      color: #666;
    }

    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.experience-list {
  .experience-item {
    margin-bottom: 30rpx;
    padding-bottom: 30rpx;
    border-bottom: 2rpx solid #eee;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .experience-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10rpx;

      .company {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }

      .period {
        font-size: 26rpx;
        color: #999;
      }
    }

    .position {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
    }

    .description {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 20rpx;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 16rpx;

      .action-button {
        margin: 0;
        font-size: 24rpx;
        line-height: 1.8;

        &.primary-button {
          background-color: #409eff;
          color: #fff;
        }

        &.danger-button {
          background-color: #f56c6c;
          color: #fff;
        }
      }
    }
  }
}

.upload-button {
  margin-top: 30rpx;
  text-align: center;
  
  .upload-button-text {
    margin: 0 auto 20rpx;
    font-size: 28rpx;
    line-height: 2;
    background-color: #409eff;
    color: #fff;
    padding: 10rpx 30rpx;
    border-radius: 8rpx;
    width: 80%;
    
    &:disabled {
      background-color: #a0cfff;
    }
  }
  
  .resume-url {
    display: block;
    font-size: 24rpx;
    color: #666;
    margin-top: 20rpx;
    word-break: break-all;
  }
}
</style>