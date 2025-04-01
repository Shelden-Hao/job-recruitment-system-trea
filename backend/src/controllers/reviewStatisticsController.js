const { Review, User, JobSeeker, Company, Job, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取评价统计数据
exports.getReviewStatistics = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;

    // 验证参数
    if (!targetType || !['job', 'company', 'jobseeker'].includes(targetType)) {
      return res.status(400).json({ message: '无效的目标类型' });
    }

    // 基础查询条件
    const whereConditions = {
      status: 'approved' // 只统计已审核通过的评价
    };

    // 如果提供了特定目标ID，则添加到查询条件
    if (targetId) {
      whereConditions.targetId = targetId;
      whereConditions.targetType = targetType;
    } else {
      // 如果没有提供特定ID，则只按类型筛选
      whereConditions.targetType = targetType;
    }

    // 获取评分统计
    const ratingStats = await Review.findAll({
      where: whereConditions,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 5 THEN 1 ELSE 0 END')), 'fiveStars'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 4 THEN 1 ELSE 0 END')), 'fourStars'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 3 THEN 1 ELSE 0 END')), 'threeStars'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 2 THEN 1 ELSE 0 END')), 'twoStars'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 1 THEN 1 ELSE 0 END')), 'oneStar']
      ],
      raw: true
    });

    // 获取评价内容关键词统计（提取常见优点和缺点）
    let keywordStats = {};
    
    if (targetId) {
      // 获取所有评价的优点和缺点
      const reviews = await Review.findAll({
        where: whereConditions,
        attributes: ['pros', 'cons'],
        raw: true
      });

      // 简单的关键词提取和统计
      const prosKeywords = {};
      const consKeywords = {};

      // 处理优点关键词
      reviews.forEach(review => {
        if (review.pros) {
          const keywords = review.pros.split(/[,，.。;；!！?？\s]+/);
          keywords.forEach(keyword => {
            if (keyword.length > 1) {
              prosKeywords[keyword] = (prosKeywords[keyword] || 0) + 1;
            }
          });
        }
      });

      // 处理缺点关键词
      reviews.forEach(review => {
        if (review.cons) {
          const keywords = review.cons.split(/[,，.。;；!！?？\s]+/);
          keywords.forEach(keyword => {
            if (keyword.length > 1) {
              consKeywords[keyword] = (consKeywords[keyword] || 0) + 1;
            }
          });
        }
      });

      // 排序并获取前10个关键词
      const topProsKeywords = Object.entries(prosKeywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

      const topConsKeywords = Object.entries(consKeywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

      keywordStats = {
        pros: topProsKeywords,
        cons: topConsKeywords
      };
    }

    // 获取评价趋势（按月统计）
    const reviewTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') AS month,
        COUNT(id) AS count,
        AVG(rating) AS averageRating
      FROM Reviews
      WHERE targetType = :targetType
      ${targetId ? 'AND targetId = :targetId' : ''}
      AND status = 'approved'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12;
    `, { 
      replacements: { targetType, targetId },
      type: sequelize.QueryTypes.SELECT 
    });

    res.json({
      stats: ratingStats[0],
      keywordStats,
      trend: reviewTrend
    });
  } catch (error) {
    console.error('获取评价统计数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取评价排行榜
exports.getReviewRankings = async (req, res) => {
  try {
    const { targetType, limit = 10 } = req.query;

    // 验证参数
    if (!targetType || !['job', 'company', 'jobseeker'].includes(targetType)) {
      return res.status(400).json({ message: '无效的目标类型' });
    }

    // 获取评分最高的目标
    const highestRated = await Review.findAll({
      attributes: [
        'targetId',
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
      ],
      where: {
        targetType,
        status: 'approved'
      },
      group: ['targetId'],
      having: sequelize.literal('COUNT(id) >= 3'), // 至少有3条评价才计入排行
      order: [
        [sequelize.literal('averageRating'), 'DESC'],
        [sequelize.literal('reviewCount'), 'DESC']
      ],
      limit: parseInt(limit),
      raw: true
    });

    // 获取评价数量最多的目标
    const mostReviewed = await Review.findAll({
      attributes: [
        'targetId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      where: {
        targetType,
        status: 'approved'
      },
      group: ['targetId'],
      order: [
        [sequelize.literal('reviewCount'), 'DESC'],
        [sequelize.literal('averageRating'), 'DESC']
      ],
      limit: parseInt(limit),
      raw: true
    });

    // 获取目标详细信息
    const enrichRankingData = async (rankings) => {
      const enrichedData = [];
      
      for (const item of rankings) {
        let targetInfo = null;
        
        if (targetType === 'job') {
          const job = await Job.findByPk(item.targetId, {
            attributes: ['id', 'title', 'companyId'],
            include: [{
              model: Company,
              attributes: ['id', 'name']
            }]
          });
          if (job) {
            targetInfo = {
              id: job.id,
              title: job.title,
              company: job.Company ? { id: job.Company.id, name: job.Company.name } : null
            };
          }
        } else if (targetType === 'company') {
          const company = await Company.findByPk(item.targetId, {
            attributes: ['id', 'name', 'logo', 'industry']
          });
          if (company) {
            targetInfo = {
              id: company.id,
              name: company.name,
              logo: company.logo,
              industry: company.industry
            };
          }
        } else if (targetType === 'jobseeker') {
          const jobseeker = await JobSeeker.findByPk(item.targetId, {
            attributes: ['id', 'fullName', 'title'],
            include: [{
              model: User,
              attributes: ['id', 'username', 'avatar']
            }]
          });
          if (jobseeker) {
            targetInfo = {
              id: jobseeker.id,
              fullName: jobseeker.fullName,
              title: jobseeker.title,
              user: jobseeker.User ? {
                id: jobseeker.User.id,
                username: jobseeker.User.username,
                avatar: jobseeker.User.avatar
              } : null
            };
          }
        }
        
        if (targetInfo) {
          enrichedData.push({
            ...item,
            targetInfo
          });
        }
      }
      
      return enrichedData;
    };

    // 丰富排行榜数据
    const enrichedHighestRated = await enrichRankingData(highestRated);
    const enrichedMostReviewed = await enrichRankingData(mostReviewed);

    res.json({
      highestRated: enrichedHighestRated,
      mostReviewed: enrichedMostReviewed
    });
  } catch (error) {
    console.error('获取评价排行榜错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取评价分析报告（管理员功能）
exports.getReviewAnalyticsReport = async (req, res) => {
  try {
    // 验证管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权访问此功能' });
    }

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

    // 获取评价总数
    const totalReviews = await Review.count();

    // 获取新增评价数量
    const newReviews = await Review.count({
      where: dateCondition
    });

    // 获取评价状态分布
    const reviewStatusDistribution = await Review.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // 获取评价目标类型分布
    const targetTypeDistribution = await Review.findAll({
      attributes: [
        'targetType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['targetType'],
      raw: true
    });

    // 获取评分分布
    const ratingDistribution = await Review.findAll({
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      raw: true
    });

    // 获取评价趋势（按日统计）
    const reviewTrend = await sequelize.query(`
      SELECT 
        DATE(createdAt) AS date,
        COUNT(id) AS count,
        AVG(rating) AS averageRating
      FROM Reviews
      WHERE createdAt >= :startDate
      GROUP BY date
      ORDER BY date;
    `, { 
      replacements: { startDate: dateCondition.createdAt[Op.gte] },
      type: sequelize.QueryTypes.SELECT 
    });

    // 获取匿名评价比例
    const anonymousReviewsCount = await Review.count({
      where: {
        isAnonymous: true
      }
    });

    const anonymousRatio = totalReviews > 0 ? (anonymousReviewsCount / totalReviews) * 100 : 0;

    res.json({
      totalReviews,
      newReviews,
      reviewStatusDistribution,
      targetTypeDistribution,
      ratingDistribution,
      reviewTrend,
      anonymousReviews: {
        count: anonymousReviewsCount,
        ratio: parseFloat(anonymousRatio.toFixed(2))
      }
    });
  } catch (error) {
    console.error('获取评价分析报告错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};