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
      <u-empty mode="message" text="暂无消息"></u-empty>
    </view>
  </view>
</template>

<script>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

export default {
  setup() {
    const authStore = useAuthStore();
    const messages = ref([]);
    
    const fetchMessages = async () => {
      try {
        // TODO: 实现获取消息列表的API调用
        messages.value = [
          {
            id: 1,
            name: '张三',
            avatar: '/static/images/default-avatar.png',
            lastMessage: '您好，请问您对这个职位感兴趣吗？',
            lastTime: '10:30',
            unread: true,
            unreadCount: 2
          },
          {
            id: 2,
            name: '李四',
            avatar: '/static/images/default-avatar.png',
            lastMessage: '好的，期待与您的合作',
            lastTime: '昨天',
            unread: false,
            unreadCount: 0
          }
        ];
      } catch (error) {
        console.error('获取消息列表失败:', error);
        uni.showToast({
          title: '获取消息列表失败',
          icon: 'none'
        });
      }
    };
    
    const goToChat = (messageId) => {
      uni.navigateTo({
        url: `/pages/message/chat?id=${messageId}`
      });
    };
    
    onLoad(() => {
      fetchMessages();
    });
    
    return {
      messages,
      goToChat
    };
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
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
          @include text-ellipsis;
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
}
</style>