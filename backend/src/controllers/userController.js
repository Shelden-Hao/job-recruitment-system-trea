const { User, Company, Skill, Application, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 创建用户
exports.createUser = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: { username: req.body.username }
    });

    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 创建用户
    const user = await User.create({
      ...req.body,
      password: hashedPassword
    });

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // 移除密码后返回用户信息
    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: userData,
      token
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const { username, role, page = 1, limit = 10 } = req.query;

    // 构建查询条件
    const whereCondition = {};
    if (username) whereCondition.username = { [Op.like]: `%${username}%` };
    if (role) whereCondition.role = role;

    // 分页参数
    const offset = (page - 1) * limit;

    // 查询用户
    const { count, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          required: false
        },
        {
          model: Skill,
          required: false,
          through: { attributes: [] }
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户详情
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          required: false
        },
        {
          model: Skill,
          required: false,
          through: { attributes: [] }
        },
        {
          model: Application,
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新用户
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 如果要更新用户名，检查是否已被使用
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({
        where: { username: req.body.username }
      });

      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
    }

    // 如果要更新密码，对其加密
    const updateData = { ...req.body };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // 更新用户信息
    await user.update(updateData);

    // 移除密码后返回用户信息
    const userData = user.toJSON();
    delete userData.password;

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: userData
    });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 删除用户
    await user.destroy();

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 用户登录
// exports.loginUser = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//
//     // 验证请求数据
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//
//     // 查找用户
//     const user = await User.findOne({
//       where: { username },
//       include: [
//         {
//           model: Company,
//           required: false
//         }
//       ]
//     });
//
//     if (!user) {
//       return res.status(400).json({ message: '用户名或密码错误' });
//     }
//
//     // 验证密码
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: '用户名或密码错误' });
//     }
//
//     // 更新最后登录时间
//     await user.update({
//       updated_at: new Date()
//     });
//
//     // 生成JWT令牌
//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET || 'your_jwt_secret',
//       { expiresIn: '24h' }
//     );
//
//     // 移除密码后返回用户信息
//     const userData = user.toJSON();
//     delete userData.password;
//
//     res.json({
//       success: true,
//       message: '登录成功',
//       data: userData,
//       token
//     });
//   } catch (error) {
//     console.error('用户登录错误:', error);
//     res.status(500).json({ message: '服务器错误', error: error.message });
//   }
// };

// 获取用户拥有的技能
exports.getUserSkills = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const skills = await user.getSkills();

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('获取用户技能错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 添加技能到用户
// exports.addUserSkill = async (req, res) => {
//   try {
//     const { id, skillId } = req.params;
//
//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ message: '用户不存在' });
//     }
//
//     const skill = await Skill.findByPk(skillId);
//     if (!skill) {
//       return res.status(404).json({ message: '技能不存在' });
//     }
//
//     await user.addSkill(skill);
//
//     res.json({
//       success: true,
//       message: '技能添加成功'
//     });
//   } catch (error) {
//     console.error('添加用户技能错误:', error);
//     res.status(500).json({ message: '服务器错误', error: error.message });
//   }
// };

// 获取用户未读消息数量
exports.getUnreadMessageCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 查询未读消息数量
    const unreadCount = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE receiver_id = :userId AND is_read = false
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        unreadCount: unreadCount[0].count || 0
      }
    });
  } catch (error) {
    console.error('获取未读消息数量错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户的所有申请
exports.getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 确保用户是求职者
    if (user.role !== 'jobseeker') {
      return res.status(400).json({ message: '只有求职者可以查看申请记录' });
    }

    // 构建查询条件，同时检查user_id和jobseeker_id
    const whereCondition = {
      [Op.or]: [
        { user_id: userId },
        { jobseeker_id: userId }
      ]
    };

    const applications = await Application.findAll({
      attributes: [
        'id', 
        'status', 
        'apply_date',
        'user_id',
        'job_id',
        'resume_path',
        'cover_letter_path',
        'interview_time'
      ],
      include: [
        {
          model: sequelize.models.Job,
          attributes: [
            'id', 
            'title', 
            'description', 
            'location', 
            'salary_range', 
            'publish_date', 
            'company_id',
            'experience',
            'education',
            'tags'
          ],
          include: [
            {
              model: sequelize.models.Company,
              attributes: ['id', 'name', 'logo', 'industry', 'size', 'address']
            }
          ]
        }
      ],
      where: whereCondition
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('获取用户申请记录错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户的所有对话
exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 查询用户的所有对话
    const conversations = await sequelize.query(`
      SELECT DISTINCT
        CASE
          WHEN sender_id = :userId THEN receiver_id
          ELSE sender_id
        END as conversation_with_id,
        (
          SELECT username FROM users 
          WHERE id = CASE
            WHEN sender_id = :userId THEN receiver_id
            ELSE sender_id
          END
        ) as conversation_with_username,
        (
          SELECT MAX(created_at) FROM messages
          WHERE (sender_id = :userId AND receiver_id = conversation_with_id)
             OR (receiver_id = :userId AND sender_id = conversation_with_id)
        ) as last_message_time,
        (
          SELECT content FROM messages
          WHERE created_at = (
            SELECT MAX(created_at) FROM messages
            WHERE (sender_id = :userId AND receiver_id = conversation_with_id)
               OR (receiver_id = :userId AND sender_id = conversation_with_id)
          )
          LIMIT 1
        ) as last_message
      FROM messages
      WHERE sender_id = :userId OR receiver_id = :userId
      ORDER BY last_message_time DESC
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('获取用户对话列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};
