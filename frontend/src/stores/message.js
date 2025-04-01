import { defineStore } from 'pinia';
import { messageAPI } from '../services/api';

export const useMessageStore = defineStore('message', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    }
  }),

  getters: {
    hasUnreadMessages: (state) => state.unreadCount > 0,
    sortedConversations: (state) => {
      return [...state.conversations].sort((a, b) => {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });
    }
  },

  actions: {
    async sendMessage(messageData) {
      this.loading = true;
      try {
        const response = await messageAPI.sendMessage(messageData);
        this.messages.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '发送消息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getConversation(userId) {
      this.loading = true;
      try {
        const response = await messageAPI.getConversation(userId);
        this.currentConversation = response.data;
        this.messages = response.data.messages;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取会话失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getConversationList() {
      this.loading = true;
      try {
        const response = await messageAPI.getConversationList();
        this.conversations = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取会话列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(messageId) {
      try {
        await messageAPI.markAsRead(messageId);
        const message = this.messages.find(msg => msg.id === messageId);
        if (message) {
          message.isRead = true;
        }
        await this.updateUnreadCount();
      } catch (error) {
        this.error = error.response?.data?.message || '标记已读失败';
        throw error;
      }
    },

    async markAllAsRead(userId) {
      try {
        await messageAPI.markAllAsRead(userId);
        this.messages.forEach(message => {
          if (message.senderId === userId) {
            message.isRead = true;
          }
        });
        await this.updateUnreadCount();
      } catch (error) {
        this.error = error.response?.data?.message || '标记全部已读失败';
        throw error;
      }
    },

    async updateUnreadCount() {
      try {
        const response = await messageAPI.getUnreadCount();
        this.unreadCount = response.data.count;
        return response.data.count;
      } catch (error) {
        this.error = error.response?.data?.message || '获取未读消息数失败';
        throw error;
      }
    },

    addMessage(message) {
      this.messages.push(message);
      this.unreadCount += 1;
    },

    clearCurrentConversation() {
      this.currentConversation = null;
      this.messages = [];
    },

    clearError() {
      this.error = null;
    }
  }
});