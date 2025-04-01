const { Job, Application, Interview, Company, JobSeeker, User, Review, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取职位统计数据
exports.getJobsStatistics = async (req, res) => {
  try {
    // 获取时间范围参数
    const { period = 'month' } = req.query;
    let dateCondition;
    const now = new Date();

    // 根据时间周期设置查询条件
    switch (period) {
      case 'week':
        // 过去一周
        dateCondition = {
          createdAt: {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
          }
        };
        break;
      case 'month':
        // 过去一个月
        dateCondition = {
          createdAt: {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          }
        };
        break;
      case 'quarter':
        // 过去三个月
        dateCondition = {
          createdAt: {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          }
        };
        break;
      case 'year':
        // 过去一年
        dateCondition = {
          createdAt: {
            [Op.gte]: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          }
        };
        break;
      default:
        // 默认过去一个月
        dateCondition = {
          createdAt: {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          }
        };
    }

    // 获取职位总数
    const totalJobs = await Job.count();

    // 获取活跃职位数量
    const activeJobs = await Job.count({
      where: {
        status: 'active'
      }
    });

    // 获取新增职位数量
    const newJobs = await Job.count({
      where: dateCondition
    });

    // 获取职位类型分布
    const jobTypeDistribution = await Job.findAll({
      attributes: [
        'jobType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['jobType'],
      raw: true
    });

    // 获取薪资分布
    const salaryCounts = await sequelize.query(`
      SELECT 
        CASE 
          WHEN salaryMin < 5000 THEN '0-5k'
          WHEN salaryMin BETWEEN 5000 AND 10000 THEN '5k-10k'
          WHEN salaryMin BETWEEN 10001 AND 15000 THEN '10k-15k'
          WHEN salaryMin BETWEEN 15001 AND 20000 THEN '15k-20k'
          WHEN salaryMin BETWEEN 20001 AND 30000 THEN '20k-30k'
          WHEN salaryMin > 30000 THEN '30k+'
        END AS salary_range,
        COUNT(*) AS count
      FROM Jobs
      WHERE salaryMin IS NOT NULL
      GROUP BY salary_range
      ORDER BY MIN(salaryMin);
    `, { type: sequelize.QueryTypes.SELECT });

    // 获取热门职位（申请人数最多的职位）
    const hotJobs = await Job.findAll({
      attributes: [
        'id',
        'title',
        'applications',
        'views',
        'location',
        'salaryMin',
        'salaryMax'
      ],
      order: [['applications', 'DESC']],
      limit: 10,
      raw: true
    });

    // 获取热门地区分布
    const locationDistribution = await Job.findAll({
      attributes: [
        'location',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['location'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // 获取职位浏览量与申请量的关系
    const viewsToApplicationsRatio = await Job.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('views')), 'totalViews'],
        [sequelize.fn('SUM', sequelize.col('applications')), 'totalApplications'],
        [sequelize.literal('SUM(applications) / SUM(views)'), 'conversionRate']
      ],
      raw: true
    });

    // 返回统计数据
    res.json({
      totalJobs,
      activeJobs,
      newJobs,
      jobTypeDistribution,
      salaryDistribution: salaryCounts,
      hotJobs,
      locationDistribution,
      viewsToApplicationsRatio: viewsToApplicationsRatio[0]
    });
  } catch (error) {
    console.error('获取职位统计数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取企业招聘数据统计
exports.getCompanyStatistics = async (req, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;

    // 验证权限（只有企业自己或管理员可以查看）
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: '企业不存在' });
    }

    if (company.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权查看此企业数据' });
    }

    // 获取企业发布的职位数量
    const totalJobs = await Job.count({
      where: { companyId }
    });

    // 获取企业收到的申请数量
    const totalApplications = await Application.count({
      include: [{
        model: Job,
        where: { companyId }
      }]
    });

    // 获取面试数量
    const totalInterviews = await Interview.count({
      include: [{
        model: Application,
        include: [{
          model: Job,
          where: { companyId }
        }]
      }]
    });

    // 获取申请状态分布
    const applicationStatusDistribution = await Application.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('Application.id')), 'count']
      ],
      include: [{
        model: Job,
        where: { companyId },
        attributes: []
      }],
      group: ['status'],
      raw: true
    });

    // 获取面试通过率
    const interviewResults = await Interview.findAll({
      attributes: [
        'result',
        [sequelize.fn('COUNT', sequelize.col('Interview.id')), 'count']
      ],
      include: [{
        model: Application,
        attributes: [],
        include: [{
          model: Job,
          where: { companyId },
          attributes: []
        }]
      }],
      where: {
        result: { [Op.ne]: 'pending' }
      },
      group: ['result'],
      raw: true
    });

    // 计算面试通过率
    const passedInterviews = interviewResults.find(r => r.result === 'pass')?.count || 0;
    const totalCompletedInterviews = interviewResults.reduce((sum, item) => sum + parseInt(item.count), 0);
    const passRate = totalCompletedInterviews > 0 ? (passedInterviews / totalCompletedInterviews) * 100 : 0;

    // 获取职位浏览量趋势（按周统计）
    const viewsTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%u') AS week,
        SUM(views) AS totalViews
      FROM Jobs
      WHERE companyId = :companyId
      GROUP BY week
      ORDER BY week DESC
      LIMIT 12;
    `, { 
      replacements: { companyId },
      type: sequelize.QueryTypes.SELECT 
    });

    // 获取申请量趋势（按周统计）
    const applicationsTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(Applications.createdAt, '%Y-%u') AS week,
        COUNT(Applications.id) AS totalApplications
      FROM Applications
      JOIN Jobs ON Applications.jobId = Jobs.id
      WHERE Jobs.companyId = :companyId
      GROUP BY week
      ORDER BY week DESC
      LIMIT 12;
    `, { 
      replacements: { companyId },
      type: sequelize.QueryTypes.SELECT 
    });

    // 获取企业评价统计
    const reviewStats = await Review.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
      ],
      where: {
        targetId: companyId,
        targetType: 'company',
        status: 'approved'
      },
      raw: true
    });

    // 返回统计数据
    res.json({
      totalJobs,
      totalApplications,
      totalInterviews,
      applicationStatusDistribution,
      interviewResults,
      passRate: parseFloat(passRate.toFixed(2)),
      viewsTrend,
      applicationsTrend,
      reviewStats: reviewStats[0]
    });
  } catch (error) {
    console.error('获取企业统计数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取求职者数据统计
exports.getJobSeekerStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取求职者信息
    const jobseeker = await JobSeeker.findOne({
      where: { userId }
    });

    if (!jobseeker) {
      return res.status(404).json({ message: '求职者信息不存在' });
    }

    // 获取申请总数
    const totalApplications = await Application.count({
      where: { jobseekerId: jobseeker.id }
    });

    // 获取申请状态分布
    const applicationStatusDistribution = await Application.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { jobseekerId: jobseeker.id },
      group: ['status'],
      raw: true
    });

    // 获取面试数量
    const totalInterviews = await Interview.count({
      include: [{
        model: Application,
        where: { jobseekerId: jobseeker.id }
      }]
    });

    // 获取面试结果分布
    const interviewResultDistribution = await Interview.findAll({
      attributes: [
        'result',
        [sequelize.fn('COUNT', sequelize.col('Interview.id')), 'count']
      ],
      include: [{
        model: Application,
        where: { jobseekerId: jobseeker.id },
        attributes: []
      }],
      group: ['result'],
      raw: true
    });

    // 获取申请职位类型分布
    const appliedJobTypeDistribution = await Job.findAll({
      attributes: [
        'jobType',
        [sequelize.fn('COUNT', sequelize.col('Job.id')), 'count']
      ],
      include: [{
        model: Application,
        where: { jobseekerId: jobseeker.id },
        attributes: []
      }],
      group: ['jobType'],
      raw: true
    });

    // 获取申请职位地区分布
    const appliedJobLocationDistribution = await Job.findAll({
      attributes: [
        'location',
        [sequelize.fn('COUNT', sequelize.col('Job.id')), 'count']
      ],
      include: [{
        model: Application,
        where: { jobseekerId: jobseeker.id },
        attributes: []
      }],
      group: ['location'],
      raw: true
    });

    // 获取申请趋势（按周统计）
    const applicationTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%u') AS week,
        COUNT(id) AS count
      FROM Applications
      WHERE jobseekerId = :jobseekerId
      GROUP BY week
      ORDER BY week DESC
      LIMIT 12;
    `, { 
      replacements: { jobseekerId: jobseeker.id },
      type: sequelize.QueryTypes.SELECT 
    });

    // 获取求职者收到的评价统计
    const reviewStats = await Review.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
      ],
      where: {
        targetId: jobseeker.id,
        targetType: 'jobseeker',
        status: 'approved'
      },
      raw: true
    });

    // 返回统计数据
    res.json({
      totalApplications,
      applicationStatusDistribution,
      totalInterviews,
      interviewResultDistribution,
      appliedJobTypeDistribution,
      appliedJobLocationDistribution,
      applicationTrend,
      reviewStats: reviewStats[0]
    });
  } catch (error) {
    console.error('获取求职者统计数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取平台整体统计数据（管理员功能）
exports.getPlatformStatistics = async (req, res) => {
  try {
    // 验证管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权访问此功能' });
    }

    // 获取用户总数
    const totalUsers = await User.count();
    
    // 获取用户角色分布
    const userRoleDistribution = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    // 获取企业总数
    const totalCompanies = await Company.count();

    // 获取求职者总数
    const totalJobSeekers = await JobSeeker.count();

    // 获取职位总数
    const totalJobs = await Job.count();

    // 获取申请总数
    const totalApplications = await Application.count();

    // 获取面试总数
    const totalInterviews = await Interview.count();

    // 获取评价总数
    const totalReviews = await Review.count();

    // 获取用户注册趋势（按月统计）
    const userRegistrationTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') AS month,
        COUNT(id) AS count
      FROM Users
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12;
    `, { type: sequelize.QueryTypes.SELECT });

    // 获取职位发布趋势（按月统计）
    const jobPostingTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') AS month,
        COUNT(id) AS count
      FROM Jobs
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12;
    `, { type: sequelize.QueryTypes.SELECT });

    // 获取申请趋势（按月统计）
    const applicationTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') AS month,
        COUNT(id) AS count
      FROM Applications
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12;
    `, { type: sequelize.QueryTypes.SELECT });

    // 返回统计数据
    res.json({
      totalUsers,
      userRoleDistribution,
      totalCompanies,
      totalJobSeekers,
      totalJobs,
      totalApplications,
      totalInterviews,
      totalReviews,
      userRegistrationTrend,
      jobPostingTrend,
      applicationTrend
    });
  } catch (error) {
    console.error('获取平台统计数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};