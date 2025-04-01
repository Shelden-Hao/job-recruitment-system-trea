const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Job = sequelize.define('Job', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '职位名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '职位描述'
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '职位要求'
    },
    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '工作职责'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '工作地点'
    },
    salaryMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '最低薪资（月薪）'
    },
    salaryMax: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '最高薪资（月薪）'
    },
    jobType: {
      type: DataTypes.ENUM('full-time', 'part-time', 'internship', 'contract'),
      allowNull: false,
      defaultValue: 'full-time',
      comment: '工作类型'
    },
    experienceRequired: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '要求工作经验'
    },
    educationRequired: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '要求学历'
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '所需技能'
    },
    benefits: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '福利待遇'
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '截止日期'
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'draft'),
      defaultValue: 'active',
      comment: '职位状态'
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '浏览次数'
    },
    applicationCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '申请人数'
    }
  }, {
    timestamps: true,
    paranoid: true // 软删除
  });

  return Job;
};