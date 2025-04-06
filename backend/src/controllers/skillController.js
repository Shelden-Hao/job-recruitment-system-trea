const { Skill, Job, User, Company } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// 创建技能
exports.createSkill = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 检查是否已存在
    const existingSkill = await Skill.findOne({
      where: { name: req.body.name }
    });

    if (existingSkill) {
      return res.status(400).json({ message: '该技能已存在' });
    }

    // 创建技能
    const skill = await Skill.create(req.body);

    res.status(201).json({
      success: true,
      message: '技能创建成功',
      data: skill
    });
  } catch (error) {
    console.error('创建技能错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取所有技能
exports.getAllSkills = async (req, res) => {
  try {
    const { name, page = 1, limit = 50 } = req.query;

    // 构建查询条件
    const whereCondition = {};
    if (name) whereCondition.name = { [Op.like]: `%${name}%` };

    // 分页参数
    const offset = (page - 1) * limit;

    // 查询技能
    const { count, rows: skills } = await Skill.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: skills,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取技能列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取技能详情
exports.getSkillById = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByPk(id);
    if (!skill) {
      return res.status(404).json({ message: '技能不存在' });
    }

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('获取技能详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新技能
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 查找技能
    const skill = await Skill.findByPk(id);
    if (!skill) {
      return res.status(404).json({ message: '技能不存在' });
    }

    // 检查名称是否已被使用
    if (req.body.name && req.body.name !== skill.name) {
      const existingSkill = await Skill.findOne({
        where: { name: req.body.name }
      });

      if (existingSkill) {
        return res.status(400).json({ message: '该技能名称已存在' });
      }
    }

    // 更新技能信息
    await skill.update(req.body);

    res.json({
      success: true,
      message: '技能更新成功',
      data: skill
    });
  } catch (error) {
    console.error('更新技能错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除技能
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找技能
    const skill = await Skill.findByPk(id);
    if (!skill) {
      return res.status(404).json({ message: '技能不存在' });
    }

    // 检查技能是否被使用
    const jobCount = await skill.countJobs();
    const userCount = await skill.countUsers();

    if (jobCount > 0 || userCount > 0) {
      return res.status(400).json({
        message: '该技能正在被使用，无法删除',
        meta: { jobCount, userCount }
      });
    }

    // 删除技能
    await skill.destroy();

    res.json({
      success: true,
      message: '技能删除成功'
    });
  } catch (error) {
    console.error('删除技能错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 添加技能到用户
// exports.addSkillToUser = async (req, res) => {
//   try {
//     const { userId, skillId } = req.params;
//
//     // 查找用户和技能
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: '用户不存在' });
//     }
//
//     const skill = await Skill.findByPk(skillId);
//     if (!skill) {
//       return res.status(404).json({ message: '技能不存在' });
//     }
//
//     // 添加关联
//     await user.addSkill(skill);
//
//     res.json({
//       success: true,
//       message: '技能已添加到用户'
//     });
//   } catch (error) {
//     console.error('添加用户技能错误:', error);
//     res.status(500).json({ message: '服务器错误', error: error.message });
//   }
// };

// 从用户移除技能
// exports.removeSkillFromUser = async (req, res) => {
//   try {
//     const { userId, skillId } = req.params;
//
//     // 查找用户和技能
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: '用户不存在' });
//     }
//
//     const skill = await Skill.findByPk(skillId);
//     if (!skill) {
//       return res.status(404).json({ message: '技能不存在' });
//     }
//
//     // 移除关联
//     await user.removeSkill(skill);
//
//     res.json({
//       success: true,
//       message: '技能已从用户移除'
//     });
//   } catch (error) {
//     console.error('移除用户技能错误:', error);
//     res.status(500).json({ message: '服务器错误', error: error.message });
//   }
// };

// 获取拥有特定技能的职位
exports.getJobsBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // 查找技能
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      return res.status(404).json({ message: '技能不存在' });
    }

    // 分页参数
    const offset = (page - 1) * limit;

    // 查询拥有该技能的职位
    const jobs = await skill.getJobs({
      include: [{ model: Company }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['publish_date', 'DESC']]
    });

    const count = await skill.countJobs();

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取技能相关职位错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};
