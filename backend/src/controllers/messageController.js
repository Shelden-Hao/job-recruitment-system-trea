const { Message, User, JobSeeker, Company } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// 发送消息
exports.sendMessage = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, content, contentType = 'text', relatedTo, relatedType } = req.body;
    const senderId = req.user.id;

    // 验证接收者是否存在
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: '接收者不存在' });
    }

    // 创建消息
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      contentType,
      relatedTo,
      relatedType,
      isRead: false
    });

    // 获取发送者信息
    const sender = await User.findByPk(senderId, {
      attributes: ['id', 'username', 'role', 'avatar'],
      include: [
        {
          model: JobSeeker,
          as: 'jobseekerProfile',
          required: false,
          attributes: ['fullName']
        },
        {
          model: Company,
          as: 'companyProfile',
          required: false,
          attributes: ['name']
        }
      ]
    });

    // 构建响应数据
    const messageData = {
      id: message.id,
      content,
      contentType,
      createdAt: message.createdAt,
      sender: {
        id: sender.id,
        username: sender.username,
        role: sender.role,
        avatar: sender.avatar,
        name: sender.role === 'jobseeker' 
          ? (sender.jobseekerProfile ? sender.jobseekerProfile.fullName : sender.username)
          : (sender.companyProfile ? sender.companyProfile.name : sender.username)
      },
      relatedTo,
      relatedType
    };

    res.status(201).json({
      message: '消息发送成功',
      data: messageData
    });
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取与特定用户的对话
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // 验证用户是否存在
    const otherUser = await User.findByPk(userId);
    if (!otherUser) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 计算分页参数
    const offset = (page - 1) * limit;

    // 获取消息列表
    const messages = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // 获取发送者和接收者信息
    const userIds = [...new Set(messages.rows.map(m => [m.senderId, m.receiverId]).flat())];
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'username', 'role', 'avatar'],
      include: [
        {
          model: JobSeeker,
          as: 'jobseekerProfile',
          required: false,
          attributes: ['fullName']
        },
        {
          model: Company,
          as: 'companyProfile',
          required: false,
          attributes: ['name']
        }
      ]
    });

    // 构建用户信息映射
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        name: user.role === 'jobseeker' 
          ? (user.jobseekerProfile ? user.jobseekerProfile.fullName : user.username)
          : (user.companyProfile ? user.companyProfile.name : user.username)
      };
    });

    // 构建响应数据
    const formattedMessages = messages.rows.map(message => ({
      id: message.id,
      content: message.content,
      contentType: message.contentType,
      fileUrl: message.fileUrl,
      createdAt: message.createdAt,
      isRead: message.isRead,
      sender: userMap[message.senderId],
      receiver: userMap[message.receiverId],
      isMine: message.senderId === currentUserId
    }));

    // 标记来自对方的消息为已读
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          senderId: userId,
          receiverId: currentUserId,
          isRead: false
        }
      }
    );

    res.json({
      messages: formattedMessages,
      total: messages.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(messages.count / limit)
    });
  } catch (error) {
    console.error('获取对话错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取最近的对话列表
exports.getConversationList = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 查询与当前用户相关的所有消息
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'senderId', 'receiverId', 'content', 'contentType', 'isRead', 'createdAt']
    });

    // 提取所有对话的用户ID
    const conversationUsers = new Set();
    messages.forEach(message => {
      if (message.senderId !== currentUserId) {
        conversationUsers.add(message.senderId);
      }
      if (message.receiverId !== currentUserId) {
        conversationUsers.add(message.receiverId);
      }
    });

    // 获取这些用户的信息
    const users = await User.findAll({
      where: { id: { [Op.in]: Array.from(conversationUsers) } },
      attributes: ['id', 'username', 'role', 'avatar'],
      include: [
        {
          model: JobSeeker,
          as: 'jobseekerProfile',
          required: false,
          attributes: ['fullName']
        },
        {
          model: Company,
          as: 'companyProfile',
          required: false,
          attributes: ['name']
        }
      ]
    });

    // 构建用户信息映射
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        name: user.role === 'jobseeker' 
          ? (user.jobseekerProfile ? user.jobseekerProfile.fullName : user.username)
          : (user.companyProfile ? user.companyProfile.name : user.username)
      };
    });

    // 构建对话列表
    const conversations = {};
    messages.forEach(message => {
      const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          user: userMap[otherUserId],
          lastMessage: {
            id: message.id,
            content: message.content,
            contentType: message.contentType,
            createdAt: message.createdAt,
            isRead: message.isRead,
            isMine: message.senderId === currentUserId
          },
          unreadCount: 0
        };
      }
      
      // 计算未读消息数
      if (message.receiverId === currentUserId && !message.isRead) {
        conversations[otherUserId].unreadCount += 1;
      }
    });

    // 转换为数组并按最后消息时间排序
    const conversationList = Object.values(conversations).sort((a, b) => 
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json(conversationList);
  } catch (error) {
    console.error('获取对话列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 标记消息为已读
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    // 查找消息
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: '消息不存在' });
    }

    // 验证权限（只有接收者可以标记为已读）
    if (message.receiverId !== currentUserId) {
      return res.status(403).json({ message: '无权操作此消息' });
    }

    // 标记为已读
    await message.update({
      isRead: true,
      readAt: new Date()
    });

    res.json({ message: '消息已标记为已读' });
  } catch (error) {
    console.error('标记消息已读错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 标记所有来自特定用户的消息为已读
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // 标记所有来自该用户的未读消息为已读
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          senderId: userId,
          receiverId: currentUserId,
          isRead: false
        }
      }
    );

    res.json({ message: '所有消息已标记为已读' });
  } catch (error) {
    console.error('标记所有消息已读错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取未读消息数量
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 统计未读消息数量
    const unreadCount = await Message.count({
      where: {
        receiverId: currentUserId,
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('获取未读消息数量错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 上传消息附件（图片/文件）
exports.uploadAttachment = async (req, res) => {
  // 使用multer中间件处理文件上传
  // 这个功能需要在路由中配置multer中间件
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的文件' });
    }

    // 文件路径
    const fileUrl = `/uploads/messages/${path.basename(req.file.path)}`;
    
    res.status(200).json({
      message: '文件上传成功',
      fileUrl
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    // 发生错误时删除已上传的文件
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: '服务器错误' });
  }
};