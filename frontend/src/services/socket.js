import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';

let socket;

// 初始化Socket连接
export const initSocket = () => {
  const authStore = useAuthStore();
  
  if (!authStore.token) return null;
  
  // 创建Socket连接
  socket = io('http://localhost:3000', {
    auth: {
      token: authStore.token
    }
  });
  
  // 连接事件
  socket.on('connect', () => {
    console.log('Socket连接成功');
  });
  
  // 错误事件
  socket.on('connect_error', (error) => {
    console.error('Socket连接错误:', error);
  });
  
  // 断开连接事件
  socket.on('disconnect', (reason) => {
    console.log('Socket断开连接:', reason);
  });
  
  return socket;
};

// 获取Socket实例
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// 关闭Socket连接
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// 发送消息
export const sendMessage = (receiverId, content) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('sendMessage', { receiverId, content });
  }
};

// 监听新消息
export const onNewMessage = (callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on('newMessage', callback);
  }
};

// 监听面试提醒
export const onInterviewReminder = (callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on('interviewReminder', callback);
  }
};

// 监听申请状态更新
export const onApplicationStatusUpdate = (callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on('applicationStatusUpdate', callback);
  }
};

// 移除所有监听器
export const removeAllListeners = () => {
  const socket = getSocket();
  if (socket) {
    socket.removeAllListeners();
  }
};