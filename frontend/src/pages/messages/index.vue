<template>
  <view class="container">
    <view class="message-list">
      <view v-for="message in messages" :key="message.id" class="message-card" @click="goToChat(message.id)">
        <view class="avatar-section">
          <image :src="message.avatar" mode="aspectFill" class="avatar"></image>
          <view v-if="message.unread" class="unread-badge">{{ message.unreadCount }}</view>
        </view>
        
        <view class="message-info">
          <view class="message-header">
            <text class="name">{{ message.name }}</text>
            <text class="time">{{ message.lastTime }}</text>
          </view>
          <view class="message-preview">
            <text class="preview-text">{{ message.lastMessage }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view v-if="messages.length === 0" class="empty-state">
      <view class="empty-content">
        <image src="/static/images/empty-message.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无消息</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const messages = ref([]);
const loading = ref(false);

// 获取消息列表（使用假数据）
const fetchMessages = () => {
  loading.value = true;
  
  // 模拟API加载延迟
  setTimeout(() => {
    messages.value = [
      {
        id: 1,
        name: '张三',
        avatar: '/static/images/default-avatar.png',
        lastMessage: '您好，我看到您对前端开发工程师职位感兴趣',
        lastTime: '10:30',
        unread: true,
        unreadCount: 2
      },
      {
        id: 2,
        name: '李四',
        avatar: '/static/images/default-avatar.png',
        lastMessage: '这个职位需要3年以上的前端开发经验，熟悉Vue和React框架',
        lastTime: '昨天',
        unread: false,
        unreadCount: 0
      },
      {
        id: 3,
        name: '王五',
        avatar: '/static/images/default-avatar.png',
        lastMessage: '已收到您的简历，我们会尽快安排面试',
        lastTime: '周一',
        unread: true,
        unreadCount: 1
      },
      {
        id: 4,
        name: '赵六',
        avatar: '/static/images/default-avatar.png',
        lastMessage: '您好，请问您有Java开发经验吗？',
        lastTime: '上周五',
        unread: false,
        unreadCount: 0
      },
      {
        id: 5,
        name: '科技有限公司',
        avatar: '/static/images/company-logo.png',
        lastMessage: '恭喜您通过我们的面试，请问您什么时候可以入职？',
        lastTime: '2024/03/20',
        unread: true,
        unreadCount: 3
      }
    ];
    
    loading.value = false;
  }, 500);
};

// 跳转到聊天详情页
const goToChat = (messageId) => {
  // 直接通过URL参数传递消息ID
  uni.navigateTo({
    url: `/pages/message/chat`
  });
};

// 页面加载时获取消息列表
onLoad(() => {
  fetchMessages();
});
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.message-list {
  .message-card {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: #fff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    
    .avatar-section {
      position: relative;
      margin-right: 20rpx;
      
      .avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
      }
      
      .unread-badge {
        position: absolute;
        top: -10rpx;
        right: -10rpx;
        background: #f56c6c;
        color: #fff;
        font-size: 24rpx;
        min-width: 36rpx;
        height: 36rpx;
        border-radius: 18rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 8rpx;
      }
    }
    
    .message-info {
      flex: 1;
      overflow: hidden;
      
      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10rpx;
        
        .name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
        }
        
        .time {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .message-preview {
        .preview-text {
          font-size: 26rpx;
          color: #666;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          display: block;
          width: 100%;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  
  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .empty-image {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 20rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #909399;
    }
  }
}
</style>