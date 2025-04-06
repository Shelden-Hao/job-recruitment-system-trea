const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 导入模型文件
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// 设置模型关联关系
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 定义模型关联
const setupAssociations = () => {
  // 配置所有关联不自动添加外键约束
  const associationOptions = { constraints: false };

  // User关联
  db.User.hasOne(db.JobSeeker, { foreignKey: 'user_id', as: 'jobseekerProfile', ...associationOptions });
  db.User.hasOne(db.Company, { foreignKey: 'user_id', as: 'companyProfile', ...associationOptions });
  // 注释掉这些重复的关联，因为它们已经在各自的模型文件中定义
  // db.User.hasMany(db.Message, { foreignKey: 'sender_id', as: 'sentMessages' });
  // db.User.hasMany(db.Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
  db.User.hasMany(db.Review, { foreignKey: 'reviewer_id', as: 'reviews', ...associationOptions });

  // JobSeeker关联
  db.JobSeeker.belongsTo(db.User, { foreignKey: 'user_id', ...associationOptions });
  // db.JobSeeker.hasMany(db.Application, { foreignKey: 'jobseeker_id', as: 'jobSeekerApplications' }); // 在jobseeker.js中已定义

  // Company关联
  db.Company.belongsTo(db.User, { foreignKey: 'user_id', ...associationOptions });
  // db.Company.hasMany(db.Job, { foreignKey: 'company_id', as: 'companyJobs' }); // 在company.js中已定义

  // Job关联
  db.Job.belongsTo(db.Company, { foreignKey: 'company_id', ...associationOptions });
  // db.Job.hasMany(db.Application, { foreignKey: 'job_id', as: 'jobApplications' }); // 在job.js中已定义

  // Application关联
  db.Application.belongsTo(db.Job, { foreignKey: 'job_id', ...associationOptions });
  db.Application.belongsTo(db.JobSeeker, { foreignKey: 'jobseeker_id', ...associationOptions });
  db.Application.hasMany(db.Interview, { foreignKey: 'application_id', as: 'interviews', ...associationOptions });

  // Interview关联
  db.Interview.belongsTo(db.Application, { foreignKey: 'application_id', ...associationOptions });

  // 注释掉这些重复的关联，因为它们已经在各自的模型文件中定义
  // Message关联
  // db.Message.belongsTo(db.User, { foreignKey: 'sender_id', as: 'sender' });
  // db.Message.belongsTo(db.User, { foreignKey: 'receiver_id', as: 'receiver' });

  // Review关联
  db.Review.belongsTo(db.User, { foreignKey: 'reviewer_id', as: 'reviewer', ...associationOptions });
};

// 执行关联设置
setupAssociations();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;