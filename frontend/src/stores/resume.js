import { defineStore } from 'pinia';
import { resumeAPI } from '../services/api';

export const useResumeStore = defineStore('resume', {
  state: () => ({
    resume: null,
    applications: [],
    companyApplications: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  }),

  getters: {
    hasResume: (state) => !!state.resume,
    applicationCount: (state) => state.applications.length,
    companyApplicationCount: (state) => state.companyApplications.length
  },

  actions: {
    async uploadResume(formData) {
      this.loading = true;
      try {
        const response = await resumeAPI.uploadResume(formData);
        this.resume = response.data;
        uni.showToast({
          title: '简历上传成功',
          icon: 'success'
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '简历上传失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getResume(jobseekerId) {
      this.loading = true;
      try {
        const response = await resumeAPI.getResume(jobseekerId);
        this.resume = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取简历失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async applyJob(jobId, data) {
      this.loading = true;
      try {
        const response = await resumeAPI.applyJob(jobId, data);
        this.applications.unshift(response.data);
        uni.showToast({
          title: '投递简历成功',
          icon: 'success'
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '投递简历失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getApplications() {
      this.loading = true;
      try {
        const response = await resumeAPI.getApplications();
        this.applications = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取投递记录失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getCompanyApplications() {
      this.loading = true;
      try {
        const response = await resumeAPI.getCompanyApplications();
        this.companyApplications = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取企业投递记录失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateApplicationStatus(applicationId, status) {
      this.loading = true;
      try {
        const response = await resumeAPI.updateApplicationStatus(applicationId, status);
        const index = this.companyApplications.findIndex(app => app.id === applicationId);
        if (index !== -1) {
          this.companyApplications[index] = response.data;
        }
        uni.showToast({
          title: '更新投递状态成功',
          icon: 'success'
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '更新投递状态失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.resume = null;
      this.applications = [];
      this.companyApplications = [];
      this.error = null;
      this.loading = false;
    }
  }
});