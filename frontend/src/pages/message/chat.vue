<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 使用假数据
const authStore = {
  user: {
    id: 1,
    name: '我',
    avatar: '/static/images/default-avatar.png'
  }
};

const contactInfo = ref({});
const messages = ref([]);
const loading = ref(false);
const messageContent = ref('');
const scrollIntoView = ref('');

// 消息假数据映射表
const messageDataMap = {
  1: {
    contact: {
      id: 2,
      name: '张三',
      avatar: '/static/images/default-avatar.png'
    },
    messages: [
      {
        id: 1,
        senderId: 2,
        receiverId: 1,
        sender: {
          id: 2,
          name: '张三',
          avatar: '/static/images/default-avatar.png'
        },
        content: '您好，我看到您对前端开发工程师职位感兴趣',
        createdAt: '10:30'
      },
      {
        id: 2,
        senderId: 1,
        receiverId: 2,
        sender: {
          id: 1,
          name: '我',
          avatar: '/static/images/default-avatar.png'
        },
        content: '是的，我想了解一下这个职位的详细情况',
        createdAt: '10:32'
      },
      {
        id: 3,
        senderId: 2,
        receiverId: 1,
        sender: {
          id: 2,
          name: '张三',
          avatar: '/static/images/default-avatar.png'
        },
        content: '这个职位需要3年以上的前端开发经验，熟悉Vue和React框架，有良好的团队协作能力',
        createdAt: '10:35'
      }
    ]
  },
  2: {
    contact: {
      id: 3,
      name: '李四',
      avatar: '/static/images/default-avatar.png'
    },
    messages: [
      {
        id: 1,
        senderId: 3,
        receiverId: 1,
        sender: {
          id: 3,
          name: '李四',
          avatar: '/static/images/default-avatar.png'
        },
        content: '这个职位需要3年以上的前端开发经验，熟悉Vue和React框架',
        createdAt: '昨天 15:20'
      },
      {
        id: 2,
        senderId: 1,
        receiverId: 3,
        sender: {
          id: 1,
          name: '我',
          avatar: '/static/images/default-avatar.png'
        },
        content: '我正好有3年的前端开发经验，对Vue和React都很熟悉',
        createdAt: '昨天 15:25'
      },
      {
        id: 3,
        senderId: 3,
        receiverId: 1,
        sender: {
          id: 3,
          name: '李四',
          avatar: '/static/images/default-avatar.png'
        },
        content: '很好，我们准备安排面试，您的时间是否方便？',
        createdAt: '昨天 15:30'
      }
    ]
  },
  3: {
    contact: {
      id: 4,
      name: '王五',
      avatar: '/static/images/default-avatar.png'
    },
    messages: [
      {
        id: 1,
        senderId: 4,
        receiverId: 1,
        sender: {
          id: 4,
          name: '王五',
          avatar: '/static/images/default-avatar.png'
        },
        content: '已收到您的简历，我们会尽快安排面试',
        createdAt: '周一 09:15'
      }
    ]
  },
  4: {
    contact: {
      id: 5,
      name: '赵六',
      avatar: '/static/images/default-avatar.png'
    },
    messages: [
      {
        id: 1,
        senderId: 5,
        receiverId: 1,
        sender: {
          id: 5,
          name: '赵六',
          avatar: '/static/images/default-avatar.png'
        },
        content: '您好，请问您有Java开发经验吗？',
        createdAt: '上周五 16:40'
      },
      {
        id: 2,
        senderId: 1,
        receiverId: 5,
        sender: {
          id: 1,
          name: '我',
          avatar: '/static/images/default-avatar.png'
        },
        content: '我主要是前端开发经验，Java只有在校期间的一些项目经验',
        createdAt: '上周五 16:45'
      }
    ]
  },
  5: {
    contact: {
      id: 6,
      name: '科技有限公司',
      avatar: '/static/images/company-logo.png'
    },
    messages: [
      {
        id: 1,
        senderId: 6,
        receiverId: 1,
        sender: {
          id: 6,
          name: '科技有限公司',
          avatar: '/static/images/company-logo.png'
        },
        content: '恭喜您通过我们的面试，请问您什么时候可以入职？',
        createdAt: '2024/03/20 14:30'
      },
      {
        id: 2,
        senderId: 1,
        receiverId: 6,
        sender: {
          id: 1,
          name: '我',
          avatar: '/static/images/default-avatar.png'
        },
        content: '非常感谢！我可以在下个月初入职',
        createdAt: '2024/03/20 15:00'
      },
      {
        id: 3,
        senderId: 6,
        receiverId: 1,
        sender: {
          id: 6,
          name: '科技有限公司',
          avatar: '/static/images/company-logo.png'
        },
        content: '好的，我们会准备好入职材料，请您届时携带相关证件',
        createdAt: '2024/03/20 15:10'
      }
    ]
  }
};

// 根据消息ID加载对应的假数据
const loadMessages = (messageId) => {
  loading.value = true;
  
  // 模拟API加载延迟
  setTimeout(() => {
    const messageData = messageDataMap[messageId] || messageDataMap[1]; // 默认使用ID为1的数据
    
    contactInfo.value = messageData.contact;
    messages.value = messageData.messages;
    
    loading.value = false;
    
    // 设置页面标题为联系人名称
    uni.setNavigationBarTitle({
      title: contactInfo.value.name
    });
    
    // 滚动到最新消息
    scrollToBottom();
  }, 500);
};

// 发送消息
const sendMessage = () => {
  if (!messageContent.value.trim()) {
    uni.showToast({
      title: '请输入消息内容',
      icon: 'none'
    });
    return;
  }
  
  // 添加新消息到列表
  const newMessage = {
    id: messages.value.length + 1,
    senderId: authStore.user.id,
    receiverId: contactInfo.value.id,
    sender: {
      id: authStore.user.id,
      name: authStore.user.name,
      avatar: authStore.user.avatar
    },
    content: messageContent.value,
    createdAt: new Date().toLocaleTimeString('zh', { hour: '2-digit', minute: '2-digit' })
  };
  
  messages.value.push(newMessage);
  messageContent.value = '';
  
  // 滚动到最新消息
  setTimeout(() => {
    scrollToBottom();
  }, 100);
};

// 滚动到底部
const scrollToBottom = () => {
  if (messages.value.length > 0) {
    scrollIntoView.value = `msg-${messages.value[messages.value.length - 1].id}`;
  }
};

// 监听页面加载，获取传递的消息ID
onLoad((options) => {
  const messageId = options.id || '1'; // 默认使用ID为1的数据
  loadMessages(messageId);
});
</script>

<template>
  <view class="chat-container">
    <!-- 消息列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
    >
      <!-- 空状态 -->
      <view v-if="messages.length === 0" class="empty-state">
        <view class="empty-content">
          <image src="/static/images/empty-message.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">暂无消息</text>
        </view>
      </view>
      
      <!-- 消息列表 -->
      <view v-else>
        <view
          v-for="message in messages"
          :key="message.id"
          :id="`msg-${message.id}`"
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
      </view>
    </scroll-view>
    
    <!-- 输入框 -->
    <view class="input-area">
      <textarea
        class="message-input"
        v-model="messageContent"
        placeholder="请输入消息"
        auto-height
        :maxlength="-1"
        :cursor-spacing="20"
        @confirm="sendMessage"
        focus
      />
      
      <button
        class="send-button"
        type="primary"
        size="mini"
        @click="sendMessage"
      >发送</button>
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
  
  .input-area {
    background-color: #fff;
    padding: 20rpx;
    border-top: 2rpx solid #eee;
    display: flex;
    align-items: flex-end;
    
    .message-input {
      flex: 1;
      margin-right: 16rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      padding: 16rpx;
      min-height: 80rpx;
      max-height: 200rpx;
      font-size: 28rpx;
    }
    
    .send-button {
      width: 120rpx;
      height: 70rpx;
      line-height: 70rpx;
      font-size: 28rpx;
      margin: 0;
      padding: 0;
    }
  }
}
</style>