import { defineStore } from 'pinia';
import { interviewAPI } from '../services/api';

export const useInterviewStore = defineStore('interview', {
  state: () => ({
    interviews: [],
    currentInterview: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  }),

  getters: {
    interviewCount: (state) => state.interviews.length,
    upcomingInterviews: (state) => {
      return state.interviews.filter(interview => {
        const interviewDate = new Date(interview.scheduledTime);
        return interviewDate > new Date();
      }).sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    }
  },

  actions: {
    async createInterview(interviewData) {
      this.loading = true;
      try {
        const response = await interviewAPI.createInterview(interviewData);
        this.interviews.unshift(response.data);
        uni.showToast({
          title: '面试安排成功',
          icon: 'success'
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '面试安排失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getInterviewById(id) {
      this.loading = true;
      try {
        const response = await interviewAPI.getInterviewById(id);
        this.currentInterview = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取面试详情失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateInterview(id, interviewData) {
      this.loading = true;
      try {
        const response = await interviewAPI.updateInterview(id, interviewData);
        const index = this.interviews.findIndex(interview => interview.id === id);
        if (index !== -1) {
          this.interviews[index] = response.data;
        }
        uni.showToast({
          title: '更新面试信息成功',
          icon: 'success'
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '更新面试信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getCompanyInterviews() {
      this.loading = true;
      try {
        const response = await interviewAPI.getCompanyInterviews();
        this.interviews = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取企业面试列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getJobSeekerInterviews() {
      this.loading = true;
      try {
        const response = await interviewAPI.getJobSeekerInterviews();
        this.interviews = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取求职者面试列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async sendInterviewReminder(interviewId) {
      try {
        await interviewAPI.sendInterviewReminder(interviewId);
        uni.showToast({
          title: '面试提醒已发送',
          icon: 'success'
        });
      } catch (error) {
        this.error = error.response?.data?.message || '发送面试提醒失败';
        throw error;
      }
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.interviews = [];
      this.currentInterview = null;
      this.error = null;
      this.loading = false;
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0
      };
    }
  }
});