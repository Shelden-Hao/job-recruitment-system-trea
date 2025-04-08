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
// 获取从用户主页传递过来的jobseekerId
const jobseekerId = ref('')


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

onLoad(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const eventChannel = currentPage.getOpenerEventChannel();
  eventChannel.on('jobseekerId', (params) => {
    jobseekerId.value = params;
    fetchResume();
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
</style>