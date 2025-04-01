const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('x-auth-token');

    // 检查是否有token
    if (!token) {
      return res.status(401).json({ message: '无访问权限，请先登录' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findByPk(decoded.user.id);
    
    // 检查用户是否存在
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({ message: '账户已被禁用，请联系管理员' });
    }

    // 将用户信息添加到请求对象
    req.user = decoded.user;
    
    // 更新最后登录时间
    await user.update({ lastLoginAt: new Date() });
    
    next();
  } catch (error) {
    console.error('认证错误:', error.message);
    res.status(401).json({ message: '无效的令牌' });
  }
};