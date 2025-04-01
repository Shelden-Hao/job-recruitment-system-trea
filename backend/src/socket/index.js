const { User, Message } = require('../models');

module.exports = (io) => {
  // 用户连接映射表，存储用户ID和socket连接
  const userSocketMap = new Map();

  io.on('connection', (socket) => {
    console.log('新的WebSocket连接:', socket.id);

    // 用户认证和连接管理
    socket.on('authenticate', async (data) => {
      try {
        const { userId } = data;
        if (!userId) {
          return socket.emit('error', { message: '认证失败：缺少用户ID' });
        }

        // 验证用户是否存在
        const user = await User.findByPk(userId);
        if (!user) {
          return socket.emit('error', { message: '认证失败：用户不存在' });
        }

        // 将用户ID与socket关联
        socket.userId = userId;
        userSocketMap.set(userId, socket.id);

        // 加入用户私人频道
        socket.join(`user:${userId}`);
        
        console.log(`用户 ${userId} 已认证并加入私人频道`);
        socket.emit('authenticated', { success: true });

        // 更新用户在线状态
        socket.broadcast.emit('user_status_change', {
          userId,
          status: 'online'
        });
      } catch (error) {
        console.error('认证错误:', error);
        socket.emit('error', { message: '认证过程中发生错误' });
      }
    });

    // 处理私人消息
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, contentType = 'text', relatedTo, relatedType } = data;
        const senderId = socket.userId;

        if (!senderId) {
          return socket.emit('error', { message: '发送失败：请先认证' });
        }

        if (!receiverId || !content) {
          return socket.emit('error', { message: '发送失败：缺少接收者ID或消息内容' });
        }

        // 创建消息记录
        const message = await Message.create({
          senderId,
          receiverId,
          content,
          contentType,
          relatedTo,
          relatedType,
          isRead: false
        });

        // 发送给接收者
        const messageData = {
          id: message.id,
          senderId,
          content,
          contentType,
          createdAt: message.createdAt,
          relatedTo,
          relatedType
        };

        // 发送给发送者确认
        socket.emit('message_sent', messageData);

        // 检查接收者是否在线
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
          // 接收者在线，发送实时消息
          io.to(receiverSocketId).emit('new_message', messageData);
        }

        // 也发送到接收者的私人频道
        io.to(`user:${receiverId}`).emit('new_message', messageData);
      } catch (error) {
        console.error('发送消息错误:', error);
        socket.emit('error', { message: '发送消息过程中发生错误' });
      }
    });

    // 标记消息为已读
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId } = data;
        const userId = socket.userId;

        if (!userId) {
          return socket.emit('error', { message: '操作失败：请先认证' });
        }

        const message = await Message.findByPk(messageId);
        if (!message) {
          return socket.emit('error', { message: '消息不存在' });
        }

        // 确保只有接收者可以标记消息为已读
        if (message.receiverId !== userId) {
          return socket.emit('error', { message: '无权操作此消息' });
        }

        // 更新消息状态
        await message.update({
          isRead: true,
          readAt: new Date()
        });

        // 通知发送者消息已读
        const senderSocketId = userSocketMap.get(message.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_read', { messageId });
        }

        socket.emit('mark_read_success', { messageId });
      } catch (error) {
        console.error('标记已读错误:', error);
        socket.emit('error', { message: '标记消息已读过程中发生错误' });
      }
    });

    // 用户断开连接
    socket.on('disconnect', () => {
      const userId = socket.userId;
      if (userId) {
        // 从映射表中移除
        userSocketMap.delete(userId);
        
        // 广播用户离线状态
        socket.broadcast.emit('user_status_change', {
          userId,
          status: 'offline'
        });
        
        console.log(`用户 ${userId} 已断开连接`);
      }
    });
  });

  return io;
};