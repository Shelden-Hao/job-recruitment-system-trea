const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jobController = require('../controllers/jobController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// 认证路由
router.post('/auth/register', [
  check('username', '用户名不能为空').not().isEmpty(),
  check('email', '请提供有效的邮箱').isEmail(),
  check('password', '密码长度至少为6个字符').isLength({ min: 6 }),
  check('role', '角色必须为jobseeker或company').isIn(['jobseeker', 'company'])
], authController.register);

router.post('/auth/login', [
  check('username', '用户名不能为空').not().isEmpty(),
  check('password', '密码不能为空').exists()
], authController.login);

router.get('/auth/me', auth, authController.getCurrentUser);

// 职位路由
router.post('/jobs', auth, [
  check('title', '职位名称不能为空').not().isEmpty(),
  check('description', '职位描述不能为空').not().isEmpty(),
  check('location', '工作地点不能为空').not().isEmpty(),
  check('salaryMin', '最低薪资必须为数字').isNumeric(),
  check('salaryMax', '最高薪资必须为数字').isNumeric()
], jobController.createJob);

router.get('/jobs', jobController.searchJobs);
router.get('/jobs/:id', jobController.getJobById);
router.put('/jobs/:id', auth, jobController.updateJob);
router.delete('/jobs/:id', auth, jobController.deleteJob);

// 简历路由
const resumeController = require('../controllers/resumeController');
router.post('/resumes/upload', auth, resumeController.uploadResume);
router.get('/resumes/:jobseekerId', auth, resumeController.getResume);
router.get('/resumes/match', auth, resumeController.matchResume);
router.post('/jobs/:jobId/apply', auth, resumeController.applyJob);
router.get('/applications', auth, resumeController.getApplications);
router.get('/company/applications', auth, resumeController.getCompanyApplications);
router.put('/applications/:applicationId/status', auth, resumeController.updateApplicationStatus);

// 消息路由
const messageController = require('../controllers/messageController');
router.post('/messages', auth, [
  check('receiverId', '接收者ID不能为空').not().isEmpty(),
  check('content', '消息内容不能为空').not().isEmpty()
], messageController.sendMessage);

router.get('/conversations/:userId', auth, messageController.getConversation);
router.get('/conversations', auth, messageController.getConversationList);
router.put('/messages/:messageId/read', auth, messageController.markAsRead);
router.put('/conversations/:userId/read', auth, messageController.markAllAsRead);
router.get('/messages/unread', auth, messageController.getUnreadCount);

// 面试路由
const interviewController = require('../controllers/interviewController');
router.post('/interviews', auth, [
  check('applicationId', '申请ID不能为空').not().isEmpty(),
  check('scheduledTime', '面试时间不能为空').not().isEmpty(),
  check('interviewType', '面试类型必须为onsite、phone或video').isIn(['onsite', 'phone', 'video'])
], interviewController.createInterview);

router.get('/interviews/:id', auth, interviewController.getInterviewById);
router.put('/interviews/:id', auth, interviewController.updateInterview);
router.get('/company/interviews', auth, interviewController.getCompanyInterviews);
router.get('/jobseeker/interviews', auth, interviewController.getJobSeekerInterviews);
router.post('/interviews/:interviewId/reminder', auth, interviewController.sendInterviewReminder);

// 评价路由
const reviewController = require('../controllers/reviewController');
router.post('/reviews', auth, [
  check('targetId', '评价目标ID不能为空').not().isEmpty(),
  check('targetType', '评价目标类型必须为job、company或jobseeker').isIn(['job', 'company', 'jobseeker']),
  check('rating', '评分必须为1-5之间的整数').isInt({ min: 1, max: 5 })
], reviewController.createReview);

router.get('/reviews/:targetId', reviewController.getReviewsByTarget);
router.get('/reviews/user/me', auth, reviewController.getUserReviews);
router.put('/reviews/:id/status', auth, reviewController.updateReviewStatus);
router.delete('/reviews/:id', auth, reviewController.deleteReview);

// 数据统计路由
const statisticsController = require('../controllers/statisticsController');
router.get('/statistics/jobs', statisticsController.getJobsStatistics);
router.get('/statistics/company/:companyId', auth, statisticsController.getCompanyStatistics);
router.get('/statistics/jobseeker', auth, statisticsController.getJobSeekerStatistics);
router.get('/statistics/platform', auth, statisticsController.getPlatformStatistics);

// 评价统计路由
const reviewStatisticsController = require('../controllers/reviewStatisticsController');
router.get('/statistics/reviews', reviewStatisticsController.getReviewStatistics);
router.get('/statistics/reviews/rankings', reviewStatisticsController.getReviewRankings);
router.get('/statistics/reviews/analytics', auth, reviewStatisticsController.getReviewAnalyticsReport);

module.exports = router;