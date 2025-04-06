const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '申请用户ID'
    },
    job_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '申请职位ID'
    },
    apply_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '申请日期'
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      comment: '申请状态：pending-待处理，interview-面试中，offer-已录用，rejected-已拒绝'
    },
    resume_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '简历路径'
    },
    cover_letter_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '求职信路径'
    },
    interview_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '面试时间'
    }
  }, {
    tableName: 'applications',
    timestamps: true,
    underscored: true
  });

  Application.associate = (models) => {
    Application.belongsTo(models.User, { foreignKey: 'user_id' });
    Application.belongsTo(models.Job, { foreignKey: 'job_id' });
    Application.belongsTo(models.JobSeeker, { 
      foreignKey: 'jobseeker_id',
      constraints: false // 暂时禁用外键约束，避免同步问题
    });
  };

  return Application;
};