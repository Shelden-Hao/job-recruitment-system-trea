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
import { onLoad, onUnload, onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { io } from '@hyoga/uni-socket.io';

const messages = ref([]);
const loading = ref(false);

// 从本地存储获取最新消息
const getLatestMessageFromStorage = (chatId) => {
  try {
    const storedData = uni.getStorageSync(`chat_${chatId}`);
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.messages && data.messages.length > 0) {
        const latestMessage = data.messages[data.messages.length - 1];
        return {
          content: latestMessage.content,
          time: latestMessage.createdAt
        };
      }
    }
  } catch (e) {
    console.error('获取本地存储的最新消息失败:', e);
  }
  return null;
};

// 更新消息列表项的最新消息
const updateMessageWithLatestContent = (message) => {
  const latest = getLatestMessageFromStorage(message.id);
  if (latest) {
    message.lastMessage = latest.content;
    message.lastTime = latest.time;
  }
  return message;
};

// 获取消息列表（使用假数据）
const fetchMessages = () => {
  loading.value = true;
  
  // 模拟API加载延迟
  setTimeout(() => {
    const initialMessages = [
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
        avatar: '/static/images/default-avatar.png',
        lastMessage: '恭喜您通过我们的面试，请问您什么时候可以入职？',
        lastTime: '2024/03/20',
        unread: true,
        unreadCount: 3
      }
    ];
    
    // 更新消息列表中的最新消息内容（从本地存储获取）
    messages.value = initialMessages.map(updateMessageWithLatestContent);
    
    loading.value = false;
  }, 500);
};

// 跳转到聊天详情页
const goToChat = (messageId) => {
  // 直接通过URL参数传递消息ID
  uni.navigateTo({
    url: `/pages/message/chat?id=${messageId}`
  });
};

const testWebsocket = () => {
  console.log('开始测试WebSocket连接...');
  
  try {
    // 明确指定传输方式和路径
    const socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // 连接事件
    socket.on('connect', () => {
      console.log('WebSocket连接已建立，socket ID:', socket.id);
    });

    socket.on('message', (message) => {
      // 处理收到的消息
      console.log('收到WebSocket消息：', message);
    });

    // 连接错误事件
    socket.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error.message);
    });

    // 连接超时事件
    socket.on('connect_timeout', () => {
      console.error('WebSocket连接超时');
    });

    // 重连尝试事件
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`WebSocket尝试重连 (${attemptNumber})`);
    });

    // 重连成功事件
    socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket重连成功，尝试次数: ${attemptNumber}`);
    });

    // 重连失败事件
    socket.on('reconnect_failed', () => {
      console.error('WebSocket重连失败');
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket连接已断开，原因:', reason);
    });

    socket.on('error', (error) => {
      console.error('WebSocket错误：', error);
    });
    
    // 发送一条测试消息
    setTimeout(() => {
      console.log('发送测试消息...');
      socket.emit('message', {text: '这是一条测试消息', time: new Date().toISOString()});
    }, 2000);

    // 保存socket实例以便后续使用
    return socket;
  } catch (e) {
    console.error('创建WebSocket连接时发生错误:', e);
    return null;
  }
};

// 保存socket实例
let socketInstance = null;

// 页面加载时获取消息列表
onLoad(() => {
  fetchMessages();
  socketInstance = testWebsocket();
});

// 每次页面显示时重新获取消息列表（以便更新最新消息）
onShow(() => {
  fetchMessages();
});

// 页面卸载时关闭Socket连接
onUnload(() => {
  if (socketInstance && socketInstance.connected) {
    console.log('关闭WebSocket连接...');
    socketInstance.disconnect();
  }
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