const { Application, Job, User, Company } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// 创建申请
exports.createApplication = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 检查职位是否存在
    const job = await Job.findByPk(req.body.job_id);
    if (!job) {
      return res.status(404).json({ message: '职位不存在' });
    }

    // 检查用户是否已经申请过该职位
    const existingApplication = await Application.findOne({
      where: {
        user_id: req.body.user_id,
        job_id: req.body.job_id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: '您已经申请过该职位' });
    }

    // 创建申请
    const application = await Application.create({
      ...req.body,
      apply_date: new Date(),
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: '申请提交成功',
      data: application
    });
  } catch (error) {
    console.error('创建申请错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户的所有申请
exports.getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const whereCondition = { user_id: userId };
    if (status) whereCondition.status = status;

    // 分页参数
    const offset = (page - 1) * limit;

    // 查询申请
    const { count, rows: applications } = await Application.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Job,
          include: [{ model: Company }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['apply_date', 'DESC']]
    });

    res.json({
      success: true,
      data: applications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户申请列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取职位的所有申请
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const whereCondition = { job_id: jobId };
    if (status) whereCondition.status = status;

    // 分页参数
    const offset = (page - 1) * limit;

    // 查询申请
    const { count, rows: applications } = await Application.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'realname', 'email', 'phone', 'avatar']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['apply_date', 'DESC']]
    });

    res.json({
      success: true,
      data: applications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取职位申请列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取申请详情
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Job,
          include: [{ model: Company }]
        },
        {
          model: User,
          attributes: ['id', 'username', 'realname', 'email', 'phone', 'avatar']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: '申请不存在' });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('获取申请详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新申请状态
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, interview_time, notes } = req.body;

    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 查找申请
    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: '申请不存在' });
    }

    // 更新申请信息
    const updateData = { status };
    if (interview_time) updateData.interview_time = interview_time;
    
    await application.update(updateData);

    res.json({
      success: true,
      message: '申请状态更新成功',
      data: application
    });
  } catch (error) {
    console.error('更新申请状态错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除申请
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找申请
    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: '申请不存在' });
    }

    // 删除申请
    await application.destroy();

    res.json({
      success: true,
      message: '申请删除成功'
    });
  } catch (error) {
    console.error('删除申请错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 