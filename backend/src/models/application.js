const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Jobs',
        key: 'id'
      }
    },
    jobseekerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'JobSeekers',
        key: 'id'
      }
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '申请时提交的简历URL'
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '求职信'
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'interview', 'offer', 'rejected', 'withdrawn'),
      defaultValue: 'pending',
      comment: '申请状态'
    },
    matchScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: '匹配度分数'
    },
    hrNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'HR备注'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '拒绝原因'
    }
  }, {
    timestamps: true,
    paranoid: true // 软删除
  });

  return Application;
};