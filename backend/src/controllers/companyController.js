const { Company } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// 创建公司
exports.createCompany = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 创建公司
    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      message: '公司创建成功',
      data: company
    });
  } catch (error) {
    console.error('创建公司错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取所有公司
exports.getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, industry } = req.query;
    const offset = (page - 1) * limit;
    
    // 构建查询条件
    const whereCondition = {};
    if (name) whereCondition.name = { [Op.like]: `%${name}%` };
    if (industry) whereCondition.industry = { [Op.like]: `%${industry}%` };

    // 查询公司
    const { count, rows: companies } = await Company.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    res.json({
      success: true,
      data: companies,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取公司列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取公司详情
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id, {
      include: ['companyJobs'] // 包含该公司的职位，使用更新后的别名
    });

    if (!company) {
      return res.status(404).json({ message: '公司不存在' });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('获取公司详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新公司
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 查找公司
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: '公司不存在' });
    }

    // 更新公司信息
    await company.update(req.body);

    res.json({
      success: true,
      message: '公司信息更新成功',
      data: company
    });
  } catch (error) {
    console.error('更新公司错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除公司
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找公司
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: '公司不存在' });
    }

    // 删除公司
    await company.destroy();

    res.json({
      success: true,
      message: '公司删除成功'
    });
  } catch (error) {
    console.error('删除公司错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 