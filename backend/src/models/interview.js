const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Interview = sequelize.define('Interview', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Applications',
        key: 'id'
      }
    },
    scheduledTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '面试时间'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 60,
      comment: '面试时长（分钟）'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '面试地点'
    },
    interviewType: {
      type: DataTypes.ENUM('onsite', 'phone', 'video'),
      allowNull: false,
      defaultValue: 'onsite',
      comment: '面试类型'
    },
    interviewers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '面试官信息'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
      comment: '面试状态'
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '面试反馈'
    },
    result: {
      type: DataTypes.ENUM('pending', 'pass', 'fail'),
      defaultValue: 'pending',
      comment: '面试结果'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已发送提醒'
    }
  }, {
    timestamps: true,
    paranoid: true // 软删除
  });

  return Interview;
};