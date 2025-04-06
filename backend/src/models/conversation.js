const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id1: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '用户ID1'
    },
    user_id2: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '用户ID2'
    },
    last_message_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '最后一条消息ID'
    },
    unread_count_user1: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: '用户1的未读消息数'
    },
    unread_count_user2: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: '用户2的未读消息数'
    }
  }, {
    tableName: 'conversations',
    timestamps: true,
    underscored: true
  });

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.User, { foreignKey: 'user_id1', as: 'user1' });
    Conversation.belongsTo(models.User, { foreignKey: 'user_id2', as: 'user2' });
    Conversation.belongsTo(models.Message, { foreignKey: 'last_message_id', as: 'lastMessage' });
    Conversation.hasMany(models.Message, { foreignKey: 'conversation_id', as: 'messages' });
  };

  return Conversation;
}; 