const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码（建议使用哈希加密存储）'
    },
    role: {
      type: DataTypes.ENUM('seeker', 'recruiter', 'admin'),
      allowNull: false,
      defaultValue: 'seeker',
      comment: '角色：seeker-求职者，recruiter-招聘者，admin-管理员'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '邮箱'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '电话号码'
    },
    company_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '公司ID，如果用户是招聘者'
    },
    realname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '真实姓名'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '用户头像'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '个人简介'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  User.associate = (models) => {
    User.belongsTo(models.Company, { foreignKey: 'company_id' });
    User.hasMany(models.Application, { foreignKey: 'user_id' });
    User.hasMany(models.Message, { foreignKey: 'sender_id', as: 'sentMessages' });
    User.hasMany(models.Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
    User.hasMany(models.Conversation, { foreignKey: 'user_id1', as: 'conversationsAsUser1' });
    User.hasMany(models.Conversation, { foreignKey: 'user_id2', as: 'conversationsAsUser2' });
  };

  return User;
};