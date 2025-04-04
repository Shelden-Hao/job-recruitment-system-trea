import axios from 'axios';

// 设置基础URL
axios.defaults.baseURL = 'http://localhost:3000';

// 请求拦截器
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  register: (userData) => axios.post('/api/auth/register', userData),
  login: (credentials) => axios.post('/api/auth/login', credentials),
  getCurrentUser: () => axios.get('/api/auth/me'),
  updateProfile: (profileData) => axios.put('/api/auth/profile', profileData)
};

// 职位相关API
export const jobAPI = {
  getJobs: (params) => axios.get('/api/jobs', { params }),
  getJobById: (id) => axios.get(`/api/jobs/${id}`),
  createJob: (jobData) => axios.post('/api/jobs', jobData),
  updateJob: (id, jobData) => axios.put(`/api/jobs/${id}`, jobData),
  deleteJob: (id) => axios.delete(`/api/jobs/${id}`)
};

// 简历相关API
export const resumeAPI = {
  uploadResume: (formData) => axios.post('/api/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getResume: (jobseekerId) => axios.get(`/api/resumes/${jobseekerId}`),
  applyJob: (jobId, data) => axios.post(`/api/jobs/${jobId}/apply`, data),
  getApplications: () => axios.get('/api/applications'),
  getCompanyApplications: () => axios.get('/api/company/applications'),
  updateApplicationStatus: (applicationId, status) => axios.put(`/api/applications/${applicationId}/status`, { status })
};

// 消息相关API
export const messageAPI = {
  sendMessage: (messageData) => axios.post('/api/messages', messageData),
  getConversation: (userId) => axios.get(`/api/conversations/${userId}`),
  getConversationList: () => axios.get('/api/conversations'),
  markAsRead: (messageId) => axios.put(`/api/messages/${messageId}/read`),
  markAllAsRead: (userId) => axios.put(`/api/conversations/${userId}/read`),
  getUnreadCount: () => axios.get('/api/messages/unread')
};

// 面试相关API
export const interviewAPI = {
  createInterview: (interviewData) => axios.post('/api/interviews', interviewData),
  getInterviewById: (id) => axios.get(`/api/interviews/${id}`),
  updateInterview: (id, interviewData) => axios.put(`/api/interviews/${id}`, interviewData),
  getCompanyInterviews: () => axios.get('/api/company/interviews'),
  getJobSeekerInterviews: () => axios.get('/api/jobseeker/interviews'),
  sendInterviewReminder: (interviewId) => axios.post(`/api/interviews/${interviewId}/reminder`)
};

// 评价相关API
export const reviewAPI = {
  createReview: (reviewData) => axios.post('/api/reviews', reviewData),
  getReviewsByTarget: (targetId) => axios.get(`/api/reviews/${targetId}`),
  getUserReviews: () => axios.get('/api/reviews/user/me'),
  updateReviewStatus: (id, status) => axios.put(`/api/reviews/${id}/status`, { status }),
  deleteReview: (id) => axios.delete(`/api/reviews/${id}`)
};

// 统计相关API
export const statisticsAPI = {
  getJobsStatistics: () => axios.get('/api/statistics/jobs'),
  getCompanyStatistics: (companyId) => axios.get(`/api/statistics/company/${companyId}`),
  getJobSeekerStatistics: () => axios.get('/api/statistics/jobseeker'),
  getPlatformStatistics: () => axios.get('/api/statistics/platform'),
  getReviewStatistics: () => axios.get('/api/statistics/reviews'),
  getReviewRankings: () => axios.get('/api/statistics/reviews/rankings'),
  getReviewAnalyticsReport: () => axios.get('/api/statistics/reviews/analytics')
};