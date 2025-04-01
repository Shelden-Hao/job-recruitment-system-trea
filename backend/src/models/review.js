const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: '评价者ID'
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '评价目标ID（职位ID或求职者ID）'
    },
    targetType: {
      type: DataTypes.ENUM('job', 'company', 'jobseeker'),
      allowNull: false,
      comment: '评价目标类型'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      },
      comment: '评分（1-5）'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '评价内容'
    },
    pros: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '优点'
    },
    cons: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '缺点'
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否匿名'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      comment: '评价状态'
    }
  }, {
    timestamps: true,
    paranoid: true // 软删除
  });

  return Review;
};