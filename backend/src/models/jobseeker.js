const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JobSeeker = sequelize.define('JobSeeker', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    education: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '教育背景，包含学校、专业、学历、起止时间等'
    },
    experience: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '工作经验，包含公司、职位、起止时间、职责描述等'
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '技能列表，包含技能名称和熟练度'
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '简历文件路径'
    },
    expectedSalary: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '期望薪资（月薪）'
    },
    expectedPosition: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '期望职位'
    },
    expectedLocation: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '期望工作地点'
    },
    selfIntroduction: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '自我介绍'
    }
  }, {
    timestamps: true,
    paranoid: true // 软删除
  });

  return JobSeeker;
};