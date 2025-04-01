import { createRouter, createWebHistory } from 'vue-router';

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { title: '注册', guest: true }
  },
  {
    path: '/jobs',
    name: 'Jobs',
    component: () => import('../views/jobs/JobList.vue'),
    meta: { title: '职位列表' }
  },
  {
    path: '/jobs/:id',
    name: 'JobDetail',
    component: () => import('../views/jobs/JobDetail.vue'),
    meta: { title: '职位详情' },
    props: true
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/profile/Profile.vue'),
    meta: { title: '个人资料', requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../views/messages/MessageCenter.vue'),
    meta: { title: '消息中心', requiresAuth: true }
  },
  {
    path: '/interviews',
    name: 'Interviews',
    component: () => import('../views/interviews/InterviewList.vue'),
    meta: { title: '面试管理', requiresAuth: true }
  },
  // 求职者路由
  {
    path: '/jobseeker',
    name: 'JobSeekerDashboard',
    component: () => import('../views/jobseeker/Dashboard.vue'),
    meta: { title: '求职者中心', requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/jobseeker/resume',
    name: 'Resume',
    component: () => import('../views/jobseeker/Resume.vue'),
    meta: { title: '我的简历', requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/jobseeker/applications',
    name: 'Applications',
    component: () => import('../views/jobseeker/Applications.vue'),
    meta: { title: '我的申请', requiresAuth: true, role: 'jobseeker' }
  },
  // 企业路由
  {
    path: '/company',
    name: 'CompanyDashboard',
    component: () => import('../views/company/Dashboard.vue'),
    meta: { title: '企业中心', requiresAuth: true, role: 'company' }
  },
  {
    path: '/company/jobs',
    name: 'CompanyJobs',
    component: () => import('../views/company/Jobs.vue'),
    meta: { title: '职位管理', requiresAuth: true, role: 'company' }
  },
  {
    path: '/company/applications',
    name: 'CompanyApplications',
    component: () => import('../views/company/Applications.vue'),
    meta: { title: '申请管理', requiresAuth: true, role: 'company' }
  },
  {
    path: '/company/statistics',
    name: 'CompanyStatistics',
    component: () => import('../views/company/Statistics.vue'),
    meta: { title: '数据统计', requiresAuth: true, role: 'company' }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 招聘系统` : '招聘系统';
  
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  // 需要认证的页面
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }
  
  // 角色限制
  if (to.meta.role && to.meta.role !== userRole) {
    next({ name: 'Home' });
    return;
  }
  
  // 已登录用户不能访问游客页面
  if (to.meta.guest && token) {
    next({ name: 'Home' });
    return;
  }
  
  next();
});

export default router;