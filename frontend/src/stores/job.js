import { defineStore } from 'pinia';
import { jobAPI } from '../services/api';

export const useJobStore = defineStore('job', {
  state: () => ({
    jobs: [],
    currentJob: null,
    loading: false,
    error: null,
    filters: {
      keyword: '',
      location: '',
      jobType: '',
      salary: '',
      experience: ''
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  }),

  getters: {
    filteredJobs: (state) => state.jobs,
    jobCount: (state) => state.jobs.length,
    hasMoreJobs: (state) => {
      return state.pagination.page * state.pagination.limit < state.pagination.total;
    }
  },

  actions: {
    async fetchJobs(params = {}) {
      this.loading = true;
      try {
        const response = await jobAPI.getJobs({
          ...this.filters,
          ...this.pagination,
          ...params
        });
        this.jobs = response.data.jobs;
        this.pagination.total = response.data.total;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取职位列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getJobById(id) {
      this.loading = true;
      try {
        const response = await jobAPI.getJobById(id);
        this.currentJob = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取职位详情失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createJob(jobData) {
      this.loading = true;
      try {
        const response = await jobAPI.createJob(jobData);
        this.jobs.unshift(response.data);
        uni.showToast({
          title: '发布职位成功',
          icon: 'success'
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '发布职位失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateJob(id, jobData) {
      this.loading = true;
      try {
        const response = await jobAPI.updateJob(id, jobData);
        const index = this.jobs.findIndex(job => job.id === id);
        if (index !== -1) {
          this.jobs[index] = response.data;
        }
        uni.showToast({
          title: '更新职位成功',
          icon: 'success'
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '更新职位失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteJob(id) {
      this.loading = true;
      try {
        await jobAPI.deleteJob(id);
        this.jobs = this.jobs.filter(job => job.id !== id);
        uni.showToast({
          title: '删除职位成功',
          icon: 'success'
        });
      } catch (error) {
        this.error = error.response?.data?.message || '删除职位失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // 重置页码
      return this.fetchJobs();
    },

    resetFilters() {
      this.filters = {
        keyword: '',
        location: '',
        jobType: '',
        salary: '',
        experience: ''
      };
      this.pagination.page = 1;
      return this.fetchJobs();
    },

    loadMoreJobs() {
      if (this.hasMoreJobs) {
        this.pagination.page += 1;
        return this.fetchJobs();
      }
      return Promise.resolve();
    }
  }
});