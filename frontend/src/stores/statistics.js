import { defineStore } from 'pinia';
import { statisticsAPI } from '../services/api';

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    jobsStatistics: null,
    companyStatistics: null,
    jobSeekerStatistics: null,
    platformStatistics: null,
    reviewStatistics: null,
    reviewRankings: null,
    reviewAnalytics: null,
    loading: false,
    error: null
  }),

  getters: {
    hasJobsStatistics: (state) => !!state.jobsStatistics,
    hasCompanyStatistics: (state) => !!state.companyStatistics,
    hasJobSeekerStatistics: (state) => !!state.jobSeekerStatistics,
    hasPlatformStatistics: (state) => !!state.platformStatistics,
    hasReviewStatistics: (state) => !!state.reviewStatistics
  },

  actions: {
    async getJobsStatistics() {
      this.loading = true;
      try {
        const response = await statisticsAPI.getJobsStatistics();
        this.jobsStatistics = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取职位统计数据失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getCompanyStatistics(companyId) {
      this.loading = true;
      try {
        const response = await statisticsAPI.getCompanyStatistics(companyId);
        this.companyStatistics = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取企业统计数据失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getJobSeekerStatistics() {
      this.loading = true;
      try {
        const response = await statisticsAPI.getJobSeekerStatistics();
        this.jobSeekerStatistics = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取求职者统计数据失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getPlatformStatistics() {
      this.loading = true;
      try {
        const response = await statisticsAPI.getPlatformStatistics();
        this.platformStatistics = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取平台统计数据失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getReviewStatistics() {
      this.loading = true;
      try {
        const response = await statisticsAPI.getReviewStatistics();
        this.reviewStatistics = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取评价统计数据失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getReviewRankings() {
      this.loading = true;
      try {
        const response = await statisticsAPI.getReviewRankings();
        this.reviewRankings = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取评价排名数据失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getReviewAnalyticsReport() {
      this.loading = true;
      try {
        const response = await statisticsAPI.getReviewAnalyticsReport();
        this.reviewAnalytics = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取评价分析报告失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.jobsStatistics = null;
      this.companyStatistics = null;
      this.jobSeekerStatistics = null;
      this.platformStatistics = null;
      this.reviewStatistics = null;
      this.reviewRankings = null;
      this.reviewAnalytics = null;
      this.error = null;
      this.loading = false;
    }
  }
});