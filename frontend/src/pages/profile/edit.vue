<template>
  <view class="container">
    <view class="form-container">
      <view class="page-title">编辑个人资料</view>

      <view class="form-item">
        <view class="avatar-upload">
          <image
            :src="formData.avatar || '/static/images/default-avatar.png'"
            mode="aspectFill"
            class="avatar"
          ></image>
          <button class="upload-btn" @click="chooseAvatar">更换头像</button>
        </view>
      </view>

      <view class="form-item">
        <text class="label">用户名</text>
        <input
          type="text"
          v-model="formData.username"
          class="input"
          placeholder="请输入用户名"
        />
      </view>

      <view class="form-item">
        <text class="label">电子邮箱</text>
        <input
          type="text"
          v-model="formData.email"
          class="input"
          placeholder="请输入电子邮箱"
        />
      </view>

      <view class="form-item">
        <text class="label">手机号码</text>
        <input
          type="number"
          v-model="formData.phone"
          class="input"
          placeholder="请输入手机号码"
        />
      </view>

      <!-- 求职者特有字段 -->
      <view v-if="isJobSeeker" class="section-header">
        <text class="section-title">简历信息</text>
        <view class="header-actions">
          <button class="action-btn" @click="toggleResumeEdit">
            {{ showResumeEdit ? '收起' : '编辑简历' }}
          </button>
          <button class="action-btn" @click="uploadResumeFile">上传简历文件</button>
        </view>
      </view>

      <template v-if="isJobSeeker && showResumeEdit">
        <view class="form-item">
          <text class="label">姓名</text>
          <input
            type="text"
            v-model="resumeData.fullName"
            class="input"
            placeholder="请输入姓名"
          />
        </view>

        <view class="form-item">
          <text class="label">性别</text>
          <picker
            @change="genderChange"
            :value="genderIndex"
            :range="genderOptions"
          >
            <view class="picker">
              {{ resumeData.gender ? resumeData.gender : '请选择性别' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">出生日期</text>
          <picker
            mode="date"
            :value="resumeData.birthDate"
            @change="birthDateChange"
          >
            <view class="picker">
              {{ resumeData.birthDate ? resumeData.birthDate : '请选择出生日期' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">自我介绍</text>
          <textarea
            v-model="resumeData.selfIntroduction"
            class="textarea"
            placeholder="请输入自我介绍"
          />
        </view>

        <view class="form-item">
          <text class="label">期望职位</text>
          <input
            type="text"
            v-model="resumeData.expectedPosition"
            class="input"
            placeholder="请输入期望职位"
          />
        </view>

        <view class="form-item">
          <text class="label">期望薪资(月)</text>
          <input
            type="number"
            v-model="resumeData.expectedSalary"
            class="input"
            placeholder="请输入期望薪资"
          />
        </view>

        <view class="form-item">
          <text class="label">期望工作地点</text>
          <input
            type="text"
            v-model="resumeData.expectedLocation"
            class="input"
            placeholder="请输入期望工作地点"
          />
        </view>
      </template>

      <view v-if="isJobSeeker && !showResumeEdit" class="resume-summary">
        <view class="resume-info-item" v-if="resumeData.fullName">
          <text class="resume-label">姓名:</text>
          <text class="resume-value">{{ resumeData.fullName }}</text>
        </view>
        <view class="resume-info-item" v-if="resumeData.gender">
          <text class="resume-label">性别:</text>
          <text class="resume-value">{{ resumeData.gender }}</text>
        </view>
        <view class="resume-info-item" v-if="resumeData.expectedPosition">
          <text class="resume-label">期望职位:</text>
          <text class="resume-value">{{ resumeData.expectedPosition }}</text>
        </view>
        <view class="resume-info-item" v-if="resumeData.expectedSalary">
          <text class="resume-label">期望薪资:</text>
          <text class="resume-value">{{ resumeData.expectedSalary }}元/月</text>
        </view>
        <view class="resume-info-item" v-if="resumeData.resumeUrl">
          <text class="resume-label">简历文件:</text>
          <text class="resume-value">已上传</text>
        </view>
      </view>

      <!-- 公司特有字段 -->
      <view class="form-item" v-if="isCompany">
        <text class="label">公司名称</text>
        <input
          type="text"
          v-model="formData.companyName"
          class="input"
          placeholder="请输入公司名称"
        />
      </view>

      <view class="form-item" v-if="isCompany">
        <text class="label">公司地址</text>
        <input
          type="text"
          v-model="formData.companyAddress"
          class="input"
          placeholder="请输入公司地址"
        />
      </view>

      <view class="form-item">
        <text class="label">个人简介</text>
        <textarea
          v-model="formData.bio"
          class="textarea"
          placeholder="请输入个人简介或公司介绍"
        />
      </view>

      <view class="actions">
        <button type="primary" class="btn submit-btn" @click="handleSubmit">
          保存
        </button>
        <button type="default" class="btn cancel-btn" @click="handleCancel">
          取消
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed } from "vue";
import axios from 'axios';
import { useAuthStore } from "@/stores/auth";
import { userAPI } from "../../services/api";
import { resumeAPI } from "../../services/api";

const authStore = useAuthStore();

// 表单数据
const formData = ref({
  username: "",
  email: "",
  phone: "",
  avatar: "",
  bio: "",
  role: "jobseeker",
  companyName: "",
  companyAddress: "",
});

// 简历数据
const resumeData = ref({
  fullName: "",
  gender: "",
  birthDate: "",
  selfIntroduction: "",
  expectedPosition: "",
  expectedSalary: "",
  expectedLocation: "",
  resumeUrl: ""
});

// 简历编辑状态控制
const showResumeEdit = ref(false);

// 性别选择器数据
const genderOptions = ['male', 'female', 'other'];
const genderIndex = ref(0);

// 根据角色计算属性
const isJobSeeker = computed(() => formData.value.role === "jobseeker");
const isCompany = computed(() => formData.value.role === "company");

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const result = await userAPI.getUserById(uni.getStorageSync('user').id);
    console.log("=>(edit.vue:146) result", result);
    formData.value.username = result.data.data.username;
    formData.value.email = result.data.data.email;
    formData.value.phone = result.data.data.phone;
    formData.value.avatar = result.data.data.avatar;
    formData.value.bio = result.data.data.bio;
    formData.value.role = result.data.data.role;
    if (result.data.data.role === 'company') {
      formData.value.companyName = result.data.data.companyName;
      formData.value.companyAddress = result.data.data.companyAddress;
    } else if (result.data.data.role === 'jobseeker') {
      // 如果是求职者，获取简历信息
      fetchResumeInfo(result.data.data.jobseekerProfile?.id);
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    uni.showToast({
      title: "获取用户信息失败",
      icon: "none",
    });
  }
};

// 获取求职者简历信息
const fetchResumeInfo = async (jobseekerId) => {
  if (!jobseekerId) return;
  
  try {
    const result = await resumeAPI.getResumeById(jobseekerId);
    console.log("=>(edit.vue:resume) result", result);
    const jobseeker = result.data.jobseeker;
    
    resumeData.value.fullName = jobseeker.fullName || '';
    resumeData.value.gender = jobseeker.gender || '';
    resumeData.value.birthDate = jobseeker.birthDate || '';
    resumeData.value.selfIntroduction = jobseeker.selfIntroduction || '';
    resumeData.value.expectedPosition = jobseeker.expectedPosition || '';
    resumeData.value.expectedSalary = jobseeker.expectedSalary || '';
    resumeData.value.expectedLocation = jobseeker.expectedLocation || '';
    resumeData.value.resumeUrl = jobseeker.resumeUrl || '';
    
    // 设置性别选择器初始值
    if (jobseeker.gender) {
      genderIndex.value = genderOptions.indexOf(jobseeker.gender);
    }
  } catch (error) {
    console.error("获取简历信息失败:", error);
    uni.showToast({
      title: "获取简历信息失败",
      icon: "none",
    });
  }
};

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      formData.value.avatar = tempFilePath;

      // 实际项目中，这里应该上传图片到服务器
      // uploadAvatar(tempFilePath);
    },
  });
};

// 上传头像到服务器
const uploadAvatar = (filePath) => {
  // 实际项目中，这里应该实现上传图片到服务器的逻辑
  // 并在成功后更新 formData.value.avatar
  console.log("上传头像:", filePath);
};

// 性别选择器变化
const genderChange = (e) => {
  genderIndex.value = e.detail.value;
  resumeData.value.gender = genderOptions[genderIndex.value];
};

// 出生日期选择器变化
const birthDateChange = (e) => {
  resumeData.value.birthDate = e.detail.value;
};

// 切换简历编辑模式
const toggleResumeEdit = () => {
  showResumeEdit.value = !showResumeEdit.value;
};

// 上传简历文件
const uploadResumeFile = () => {
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
        uploadResumeToServer(file);
      }
    },
    fail: (err) => {
      console.error('选择文件失败:', err);
    }
  });
};

// 上传简历到服务器
const uploadResumeToServer = (file) => {
  const jobseekerId = uni.getStorageSync('user').jobseekerProfile?.id;
  if (!jobseekerId) {
    uni.showToast({
      title: '请先完善求职者信息',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({
    title: '上传中...'
  });
  
  const userId = uni.getStorageSync('user').id;
  
  uni.uploadFile({
    url: `${axios.defaults.baseURL}/api/resumes/upload?userId=${userId}`,
    filePath: file.path || file.tempFilePath,
    name: 'resume',
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    },
    success: (res) => {
      try {
        const result = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        if (res.statusCode === 200 && result.resume_url) {
          resumeData.value.resumeUrl = result.resume_url;
          uni.showToast({
            title: '简历上传成功',
            icon: 'success'
          });
          
          // 刷新简历信息
          fetchResumeInfo(jobseekerId);
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
      uni.hideLoading();
    }
  });
};

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!formData.value.username.trim()) {
    return uni.showToast({
      title: "请输入用户名",
      icon: "none",
    });
  }

  try {
    // 1. 更新用户基本信息
    const userResponse = await userAPI.updateUser(
      uni.getStorageSync('user').id, 
      {
        username: formData.value.username,
        email: formData.value.email,
        phone: formData.value.phone,
        bio: formData.value.bio,
        // 其他字段...
      }
    );
    
    // 2. 如果是求职者，更新简历信息
    if (isJobSeeker.value) {
      const jobseekerId = uni.getStorageSync('user').jobseekerProfile?.id;
      if (jobseekerId) {
        await userAPI.updateJobseeker(
          jobseekerId,
          {
            fullName: resumeData.value.fullName,
            gender: resumeData.value.gender,
            birthDate: resumeData.value.birthDate,
            selfIntroduction: resumeData.value.selfIntroduction,
            expectedPosition: resumeData.value.expectedPosition,
            expectedSalary: resumeData.value.expectedSalary,
            expectedLocation: resumeData.value.expectedLocation,
            // 其他简历字段...
          }
        );
      }
    }
    
    // 3. 如果是公司，更新公司信息
    if (isCompany.value) {
      // 更新公司信息的逻辑...
    }
    
    uni.showToast({
      title: "保存成功",
      icon: "success",
    });

    // 返回个人中心页面
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    console.error("更新用户信息失败:", error);
    uni.showToast({
      title: "保存失败，请重试",
      icon: "none",
    });
  }
};

// 取消编辑
const handleCancel = () => {
  uni.navigateBack();
};

onLoad(() => {
  fetchUserInfo();
});
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
}

.form-container {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
  color: #333;
}

.section-header {
  margin: 30rpx 0 20rpx;
  border-bottom: 1px solid #eee;
  padding-bottom: 15rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  font-size: 24rpx;
  margin: 0;
  padding: 6rpx 16rpx;
  line-height: 1.8;
  background-color: #409eff;
  color: #fff;
  border-radius: 6rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.input,
.picker,
.textarea {
  width: 100%;
  height: 80rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  background-color: #f8f8f8;
}

.textarea {
  height: 180rpx;
  padding: 20rpx;
  line-height: 1.5;
}

.picker {
  display: flex;
  align-items: center;
}

.resume-summary {
  background-color: #f9f9f9;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.resume-info-item {
  display: flex;
  margin-bottom: 10rpx;
}

.resume-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666;
}

.resume-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
}

.upload-btn {
  font-size: 26rpx;
  background-color: #409eff;
  color: #fff;
  margin: 0;
  padding: 10rpx 30rpx;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}

.btn {
  width: 45%;
  margin: 0;
}

.submit-btn {
  background-color: #409eff;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}
</style>
