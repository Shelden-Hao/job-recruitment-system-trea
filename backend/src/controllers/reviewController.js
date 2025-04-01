const { Review, User, JobSeeker, Company, Job } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// 创建评价
exports.createReview = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { targetId, targetType, rating, content, pros, cons, isAnonymous } = req.body;
    const reviewerId = req.user.id;

    // 验证目标是否存在
    let target;
    if (targetType === 'job') {
      target = await Job.findByPk(targetId);
    } else if (targetType === 'company') {
      target = await Company.findByPk(targetId);
    } else if (targetType === 'jobseeker') {
      target = await JobSeeker.findByPk(targetId);
    }

    if (!target) {
      return res.status(404).json({ message: '评价目标不存在' });
    }

    // 检查是否已经评价过
    const existingReview = await Review.findOne({
      where: {
        reviewerId,
        targetId,
        targetType
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: '您已经评价过该目标' });
    }

    // 创建评价
    const review = await Review.create({
      reviewerId,
      targetId,
      targetType,
      rating,
      content,
      pros,
      cons,
      isAnonymous,
      status: 'pending' // 默认为待审核状态
    });

    res.status(201).json({
      message: '评价提交成功，等待审核',
      review
    });
  } catch (error) {
    console.error('创建评价错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取目标的评价列表
exports.getReviewsByTarget = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { targetType, page = 1, limit = 10 } = req.query;

    if (!targetType) {
      return res.status(400).json({ message: '缺少目标类型参数' });
    }

    // 验证目标是否存在
    let target;
    if (targetType === 'job') {
      target = await Job.findByPk(targetId);
    } else if (targetType === 'company') {
      target = await Company.findByPk(targetId);
    } else if (targetType === 'jobseeker') {
      target = await JobSeeker.findByPk(targetId);
    }

    if (!target) {
      return res.status(404).json({ message: '评价目标不存在' });
    }

    // 计算分页参数
    const offset = (page - 1) * limit;

    // 获取评价列表
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: {
        targetId,
        targetType,
        status: 'approved' // 只显示已审核通过的评价
      },
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['id', 'username', 'avatar', 'role'],
        include: [{
          model: JobSeeker,
          as: 'jobseekerProfile',
          attributes: ['fullName'],
          required: false
        }, {
          model: Company,
          as: 'companyProfile',
          attributes: ['name'],
          required: false
        }]
      }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    // 处理评价数据，匿名评价隐藏用户信息
    const processedReviews = reviews.map(review => {
      const reviewData = review.toJSON();
      if (reviewData.isAnonymous) {
        reviewData.reviewer = {
          id: null,
          username: '匿名用户',
          avatar: null,
          role: reviewData.reviewer.role
        };
      }
      return reviewData;
    });

    // 计算评分统计
    const ratingStats = await Review.findAll({
      where: {
        targetId,
        targetType,
        status: 'approved'
      },
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

    res.json({
      reviews: processedReviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      },
      stats: ratingStats[0]
    });
  } catch (error) {
    console.error('获取评价列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取用户发表的评价列表
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // 计算分页参数
    const offset = (page - 1) * limit;

    // 获取评价列表
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: {
        reviewerId: userId
      },
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['id', 'username', 'avatar', 'role']
      }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    // 处理评价数据，添加目标信息
    const processedReviews = await Promise.all(reviews.map(async (review) => {
      const reviewData = review.toJSON();
      let targetInfo = null;

      if (reviewData.targetType === 'job') {
        const job = await Job.findByPk(reviewData.targetId, {
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
      } else if (reviewData.targetType === 'company') {
        const company = await Company.findByPk(reviewData.targetId, {
          attributes: ['id', 'name', 'logo']
        });
        if (company) {
          targetInfo = {
            id: company.id,
            name: company.name,
            logo: company.logo
          };
        }
      } else if (reviewData.targetType === 'jobseeker') {
        const jobseeker = await JobSeeker.findByPk(reviewData.targetId, {
          attributes: ['id', 'fullName'],
          include: [{
            model: User,
            attributes: ['id', 'username', 'avatar']
          }]
        });
        if (jobseeker) {
          targetInfo = {
            id: jobseeker.id,
            fullName: jobseeker.fullName,
            user: jobseeker.User ? {
              id: jobseeker.User.id,
              username: jobseeker.User.username,
              avatar: jobseeker.User.avatar
            } : null
          };
        }
      }

      reviewData.targetInfo = targetInfo;
      return reviewData;
    }));

    res.json({
      reviews: processedReviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户评价列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新评价状态（管理员功能）
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }

    // 查找评价
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: '评价不存在' });
    }

    // 更新状态
    await review.update({ status });

    res.json({
      message: '评价状态更新成功',
      review
    });
  } catch (error) {
    console.error('更新评价状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除评价
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查找评价
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: '评价不存在' });
    }

    // 验证权限（只有评价作者或管理员可以删除）
    if (review.reviewerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除此评价' });
    }

    // 软删除评价
    await review.destroy();

    res.json({ message: '评价删除成功' });
  } catch (error) {
    console.error('删除评价错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};