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

      <view class="form-item" v-if="isJobSeeker">
        <text class="label">所在地区</text>
        <picker
          mode="region"
          @change="regionChange"
          :value="formData.region"
          class="picker"
        >
          <view class="picker-value">{{
            formData.region.join(" ") || "请选择地区"
          }}</view>
        </picker>
      </view>

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
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

// 表单数据
const formData = ref({
  username: "",
  email: "",
  phone: "",
  avatar: "",
  region: ["", "", ""],
  bio: "",
  role: "jobseeker",
  companyName: "",
  companyAddress: "",
});

// 根据角色计算属性
const isJobSeeker = computed(() => formData.value.role === "jobseeker");
const isCompany = computed(() => formData.value.role === "company");

// 获取用户信息
const fetchUserInfo = () => {
  try {
    // 模拟获取用户数据
    // 实际项目中，应该调用 API 获取用户信息
    setTimeout(() => {
      formData.value = {
        username: "John Doe",
        email: "john.doe@example.com",
        phone: "13800138000",
        avatar: "/static/images/default-avatar.png",
        region: ["广东省", "深圳市", "南山区"],
        bio: "热爱技术，专注前端开发",
        role: "jobseeker", // 可以设置为'jobseeker'或'company'测试不同角色
        companyName: "",
        companyAddress: "",
      };
    }, 300);
  } catch (error) {
    console.error("获取用户信息失败:", error);
    uni.showToast({
      title: "获取用户信息失败",
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

// 地区选择器变化
const regionChange = (e) => {
  formData.value.region = e.detail.value;
};

// 提交表单
const handleSubmit = () => {
  // 表单验证
  if (!formData.value.username.trim()) {
    return uni.showToast({
      title: "请输入用户名",
      icon: "none",
    });
  }

  // 实际项目中，这里应该调用 API 更新用户信息
  // 模拟提交
  setTimeout(() => {
    uni.showToast({
      title: "保存成功",
      icon: "success",
    });

    // 返回个人中心页面
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 500);
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
  background-color: #f9f9f9;
}

.textarea {
  height: 200rpx;
  padding: 20rpx;
  line-height: 1.5;
}

.picker {
  display: flex;
  align-items: center;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;

  .avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    margin-bottom: 20rpx;
  }

  .upload-btn {
    font-size: 26rpx;
    padding: 8rpx 20rpx;
    background-color: #f0f0f0;
    border-radius: 30rpx;
  }
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;

  .btn {
    width: 45%;
  }

  .submit-btn {
    background-color: #007aff;
  }

  .cancel-btn {
    border: 1px solid #e0e0e0;
  }
}
</style>
