const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    sender_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '发送者ID'
    },
    receiver_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '接收者ID'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '消息内容'
    },
    content_type: {
      type: DataTypes.STRING(20),
      defaultValue: 'text',
      comment: '内容类型: text, image, file'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已读'
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '阅读时间'
    },
    related_to: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '关联ID，例如职位ID或申请ID'
    },
    related_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '关联类型：job, application, etc'
    },
    conversation_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '会话ID'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'messages',
    timestamps: true,
    underscored: true
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
    Message.belongsTo(models.User, { foreignKey: 'receiver_id', as: 'receiver' });
  };

  return Message;
};