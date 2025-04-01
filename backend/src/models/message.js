const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '消息内容'
    },
    contentType: {
      type: DataTypes.ENUM('text', 'image', 'file'),
      defaultValue: 'text',
      comment: '消息类型'
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '文件或图片URL'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已读'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '阅读时间'
    },
    relatedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '相关联的实体ID（如职位、申请等）'
    },
    relatedType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '相关联的实体类型'
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['senderId', 'receiverId']
      },
      {
        fields: ['receiverId', 'isRead']
      }
    ]
  });

  return Message;
};