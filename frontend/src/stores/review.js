import { defineStore } from 'pinia';
import { reviewAPI } from '../services/api';

export const useReviewStore = defineStore('review', {
  state: () => ({
    reviews: [],
    userReviews: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  }),

  getters: {
    reviewCount: (state) => state.reviews.length,
    userReviewCount: (state) => state.userReviews.length,
    averageRating: (state) => {
      if (state.reviews.length === 0) return 0;
      const sum = state.reviews.reduce((acc, review) => acc + review.rating, 0);
      return (sum / state.reviews.length).toFixed(1);
    }
  },

  actions: {
    async createReview(reviewData) {
      this.loading = true;
      try {
        const response = await reviewAPI.createReview(reviewData);
        this.reviews.unshift(response.data);
        uni.showToast({
          title: '发布评价成功',
          icon: 'success'
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '发布评价失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getReviewsByTarget(targetId) {
      this.loading = true;
      try {
        const response = await reviewAPI.getReviewsByTarget(targetId);
        this.reviews = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取评价列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getUserReviews() {
      this.loading = true;
      try {
        const response = await reviewAPI.getUserReviews();
        this.userReviews = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取用户评价列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateReviewStatus(id, status) {
      this.loading = true;
      try {
        const response = await reviewAPI.updateReviewStatus(id, status);
        const index = this.reviews.findIndex(review => review.id === id);
        if (index !== -1) {
          this.reviews[index] = response.data;
        }
        uni.showToast({
          title: '更新评价状态成功',
          icon: 'success'
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '更新评价状态失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteReview(id) {
      this.loading = true;
      try {
        await reviewAPI.deleteReview(id);
        this.reviews = this.reviews.filter(review => review.id !== id);
        this.userReviews = this.userReviews.filter(review => review.id !== id);
        uni.showToast({
          title: '删除评价成功',
          icon: 'success'
        });
      } catch (error) {
        this.error = error.response?.data?.message || '删除评价失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.reviews = [];
      this.userReviews = [];
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