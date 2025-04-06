const { Message, User, Conversation } = require('../models');
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

    const { sender_id, receiver_id, content, content_type = 'text', related_to, related_type } = req.body;

    // 查找或创建会话
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user_id1: sender_id, user_id2: receiver_id },
          { user_id1: receiver_id, user_id2: sender_id }
        ]
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        user_id1: sender_id,
        user_id2: receiver_id,
        unread_count_user1: 0,
        unread_count_user2: 0
      });
    }

    // 创建消息
    const message = await Message.create({
      sender_id,
      receiver_id,
      content,
      content_type,
      related_to,
      related_type,
      is_read: false,
      conversation_id: conversation.id
    });

    // 更新会话的未读消息计数和最后一条消息
    if (conversation.user_id1 === receiver_id) {
      await conversation.update({
        last_message_id: message.id,
        unread_count_user1: conversation.unread_count_user1 + 1
      });
    } else {
      await conversation.update({
        last_message_id: message.id,
        unread_count_user2: conversation.unread_count_user2 + 1
      });
    }

    res.status(201).json({
      success: true,
      message: '消息发送成功',
      data: message
    });
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户的所有会话
exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // 分页参数
    const offset = (page - 1) * limit;

    // 查找用户参与的所有会话
    const { count, rows: conversations } = await Conversation.findAndCountAll({
      where: {
        [Op.or]: [
          { user_id1: userId },
          { user_id2: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Message,
          as: 'lastMessage'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[{ model: Message, as: 'lastMessage' }, 'created_at', 'DESC']]
    });

    // 格式化数据
    const formattedConversations = conversations.map(conversation => {
      const otherUser = conversation.user_id1 == userId ? conversation.user2 : conversation.user1;
      const unreadCount = conversation.user_id1 == userId ? 
        conversation.unread_count_user1 : conversation.unread_count_user2;
      
      return {
        id: conversation.id,
        user: {
          id: otherUser.id,
          username: otherUser.username,
          avatar: otherUser.avatar
        },
        lastMessage: conversation.lastMessage ? {
          id: conversation.lastMessage.id,
          content: conversation.lastMessage.content,
          content_type: conversation.lastMessage.content_type,
          created_at: conversation.lastMessage.created_at,
          is_read: conversation.lastMessage.is_read
        } : null,
        unreadCount
      };
    });

    res.json({
      success: true,
      data: formattedConversations,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户会话列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取与特定用户的会话
exports.getConversation = async (req, res) => {
  try {
    const currUserId = req.user.id;
    const { userId: otherUserId } = req.params;
    
    // 查找会话
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user_id1: currUserId, user_id2: otherUserId },
          { user_id1: otherUserId, user_id2: currUserId }
        ]
      }
    });

    // 如果不存在会话，则创建
    if (!conversation) {
      conversation = await Conversation.create({
        user_id1: currUserId,
        user_id2: otherUserId,
        unread_count_user1: 0,
        unread_count_user2: 0
      });
    }

    // 查询最近的消息
    const messages = await Message.findAll({
      where: { conversation_id: conversation.id },
      order: [['created_at', 'DESC']],
      limit: 20
    });

    // 获取对方用户信息
    const otherUser = await User.findByPk(otherUserId, {
      attributes: ['id', 'username', 'avatar']
    });

    res.json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse(),
        user: otherUser
      }
    });
  } catch (error) {
    console.error('获取会话错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取会话消息
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // 验证会话存在
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: '会话不存在' });
    }

    // 验证权限（只有会话参与者可以查看消息）
    const userId = req.user.id;
    if (conversation.user_id1 !== userId && conversation.user_id2 !== userId) {
      return res.status(403).json({ message: '没有权限查看此会话' });
    }

    // 分页参数
    const offset = (page - 1) * limit;

    // 查询消息
    const { count, rows: messages } = await Message.findAndCountAll({
      where: { conversation_id: conversationId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: messages,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取会话消息错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 标记消息为已读
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // 查找消息
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: '消息不存在' });
    }

    // 验证权限（只有接收者可以标记为已读）
    const userId = req.user.id;
    if (message.receiver_id !== userId) {
      return res.status(403).json({ message: '没有权限标记此消息' });
    }

    // 标记为已读
    await message.update({
      is_read: true,
      read_at: new Date()
    });

    res.json({
      success: true,
      message: '消息已标记为已读'
    });
  } catch (error) {
    console.error('标记消息已读错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 标记会话所有消息为已读
exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // 查找会话
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: '会话不存在' });
    }

    // 验证权限（只有会话参与者可以标记消息为已读）
    const userId = req.user.id;
    if (conversation.user_id1 !== userId && conversation.user_id2 !== userId) {
      return res.status(403).json({ message: '不是会话参与者' });
    }

    // 更新所有未读消息
    await Message.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          conversation_id: conversationId,
          receiver_id: userId,
          is_read: false
        }
      }
    );

    // 更新会话的未读消息计数
    if (conversation.user_id1 === userId) {
      await conversation.update({ unread_count_user1: 0 });
    } else {
      await conversation.update({ unread_count_user2: 0 });
    }

    res.json({
      success: true,
      message: '所有消息已标记为已读'
    });
  } catch (error) {
    console.error('标记会话已读错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取未读消息数
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 计算总未读消息数
    const unreadCount = await Message.count({
      where: {
        receiver_id: userId,
        is_read: false
      }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('获取未读消息数错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 标记所有消息为已读
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 更新所有未读消息
    await Message.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          receiver_id: userId,
          is_read: false
        }
      }
    );

    // 更新所有会话的未读计数
    await Conversation.update(
      { unread_count_user1: 0 },
      { where: { user_id1: userId } }
    );
    
    await Conversation.update(
      { unread_count_user2: 0 },
      { where: { user_id2: userId } }
    );

    res.json({
      success: true,
      message: '所有消息已标记为已读'
    });
  } catch (error) {
    console.error('标记所有消息已读错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 