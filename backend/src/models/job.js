const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Job = sequelize.define('Job', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '所属公司ID'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '职位名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '职位描述'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '工作地点'
    },
    salary_range: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '薪资范围（例如：15k-25k）'
    },
    publish_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '发布日期'
    },
    experience: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '经验要求（例如：3-5年）'
    },
    education: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '学历要求（例如：本科及以上）'
    },
    tags: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '职位标签，用逗号分隔（例如：React, Vue, 前端开发）'
    }
  }, {
    tableName: 'jobs',
    timestamps: true,
    underscored: true
  });

  Job.associate = (models) => {
    Job.belongsTo(models.Company, { foreignKey: 'company_id' });
    Job.hasMany(models.Application, { foreignKey: 'job_id', as: 'jobApplications' });
    Job.belongsToMany(models.Skill, { 
      through: 'job_skills', 
      foreignKey: 'job_id', 
      otherKey: 'skill_id' 
    });
  };

  return Job;
};