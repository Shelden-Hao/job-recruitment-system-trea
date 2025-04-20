import { defineStore } from 'pinia';
import axios from 'axios';
import {authAPI} from "../services/api";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    isJobSeeker: (state) => state.user?.role === 'jobseeker',
    isCompany: (state) => state.user?.role === 'company'
  },

  actions: {
    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/auth/register', userData);
        this.token = response.data.token;
        this.user = response.data.user;

        // 保存到本地存储
        uni.setStorageSync('token', this.token);
        uni.setStorageSync('userRole', this.user.role);

        // 设置axios默认头部
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

        // 根据角色重定向
        if (this.user.role === 'jobseeker') {
          uni.switchTab({
            url: '/pages/jobseeker/index'
          });
        } else if (this.user.role === 'company') {
          uni.switchTab({
            url: '/pages/company/index'
          });
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '注册失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      console.log("=>(auth.js:122) credentials", credentials);
      this.loading = true;
      this.error = null;

      try {
        const response = await authAPI.login(credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        uni.setStorageSync('token', this.token);
        await this.fetchCurrentUser(this.user.id);
        uni.switchTab({
          url: '/pages/index/index'
        });
      } catch (error) {
        this.error = error.response?.data?.message || '登录失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser(id) {
      if (!this.token) return null;

      this.loading = true;

      try {
        const response = await authAPI.getCurrentUser({id});
        this.user = response.data;
        // 保存用户信息到本地存储，包括jobseekerProfile信息
        uni.setStorageSync('user', response.data);
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          this.logout();
        }
        this.error = error.response?.data?.message || '获取用户信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.token = null;
      this.user = null;
      uni.removeStorageSync('token');
      uni.reLaunch({
        url: '/pages/login/login'
      });
    },

    async updateProfile(profileData) {
      this.loading = true;

      try {
        const response = await axios.put('/api/auth/profile', profileData);
        this.user = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '更新个人资料失败';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
