<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useMessageStore } from '../../stores/message';
import { useAuthStore } from '../../stores/auth';
import { useSocketStore } from '../../stores/socket';

const messageStore = useMessageStore();
const authStore = useAuthStore();
const socketStore = useSocketStore();

const messages = ref([]);
const loading = ref(false);
const messageContent = ref('');

// 获取聊天对象ID
const targetId = uni.getStorageSync('currentChatTargetId');

// 加载历史消息
const loadMessages = async () => {
  loading.value = true;
  try {
    const response = await messageStore.getMessages(targetId);
    messages.value = response.data;
  } catch (error) {
    uni.showToast({
      title: error.message || '加载消息失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 发送消息
const sendMessage = async () => {
  if (!messageContent.value.trim()) {
    uni.showToast({
      title: '请输入消息内容',
      icon: 'none'
    });
    return;
  }
  
  try {
    await messageStore.sendMessage({
      receiverId: targetId,
      content: messageContent.value
    });
    messageContent.value = '';
  } catch (error) {
    uni.showToast({
      title: error.message || '发送失败',
      icon: 'none'
    });
  }
};

// 处理新消息
const handleNewMessage = (message) => {
  if (message.senderId === targetId || message.receiverId === targetId) {
    messages.value.push(message);
  }
};

// 监听新消息
onMounted(() => {
  loadMessages();
  socketStore.connect();
  socketStore.onMessage(handleNewMessage);
});

// 组件卸载时断开连接
onUnmounted(() => {
  socketStore.disconnect();
});
</script>

<template>
  <view class="chat-container">
    <!-- 消息列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      :scroll-top="messages.length * 100"
    >
      <u-empty v-if="messages.length === 0" text="暂无消息" mode="message" />
      
      <view
        v-else
        v-for="message in messages"
        :key="message.id"
        :class="['message-item', message.senderId === authStore.user.id ? 'self' : '']"
      >
        <image
          class="avatar"
          :src="message.sender.avatar || '/static/images/default-avatar.png'"
          mode="aspectFill"
        />
        
        <view class="message-content">
          <view class="message-info">
            <text class="sender-name">{{ message.sender.name }}</text>
            <text class="message-time">{{ message.createdAt }}</text>
          </view>
          
          <view class="message-text">
            <text>{{ message.content }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 输入框 -->
    <view class="input-area">
      <u-input
        v-model="messageContent"
        type="textarea"
        placeholder="请输入消息"
        :height="80"
        :border="false"
        @confirm="sendMessage"
      />
      
      <u-button
        type="primary"
        size="mini"
        @click="sendMessage"
      >发送</u-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  
  .message-list {
    flex: 1;
    padding: 20rpx;
    
    .message-item {
      display: flex;
      margin-bottom: 20rpx;
      
      &.self {
        flex-direction: row-reverse;
        
        .message-content {
          margin-right: 16rpx;
          margin-left: 0;
          
          .message-info {
            flex-direction: row-reverse;
          }
          
          .message-text {
            background-color: #007AFF;
            color: #fff;
            border-radius: 12rpx 0 12rpx 12rpx;
          }
        }
      }
      
      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
      }
      
      .message-content {
        flex: 1;
        margin-left: 16rpx;
        max-width: 70%;
        
        .message-info {
          display: flex;
          align-items: center;
          margin-bottom: 8rpx;
          
          .sender-name {
            font-size: 24rpx;
            color: #666;
          }
          
          .message-time {
            font-size: 24rpx;
            color: #999;
            margin-left: 16rpx;
          }
        }
        
        .message-text {
          background-color: #fff;
          padding: 16rpx 24rpx;
          border-radius: 0 12rpx 12rpx 12rpx;
          font-size: 28rpx;
          color: #333;
          word-break: break-all;
        }
      }
    }
  }
  
  .input-area {
    background-color: #fff;
    padding: 20rpx;
    border-top: 2rpx solid #eee;
    display: flex;
    align-items: flex-end;
    
    .u-input {
      flex: 1;
      margin-right: 16rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      padding: 16rpx;
    }
  }
}
</style>