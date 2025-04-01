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
  // User关联
  db.User.hasOne(db.JobSeeker, { foreignKey: 'userId', as: 'jobseekerProfile' });
  db.User.hasOne(db.Company, { foreignKey: 'userId', as: 'companyProfile' });
  db.User.hasMany(db.Message, { foreignKey: 'senderId', as: 'sentMessages' });
  db.User.hasMany(db.Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
  db.User.hasMany(db.Review, { foreignKey: 'reviewerId', as: 'reviews' });

  // JobSeeker关联
  db.JobSeeker.belongsTo(db.User, { foreignKey: 'userId' });
  db.JobSeeker.hasMany(db.Application, { foreignKey: 'jobseekerId', as: 'applications' });

  // Company关联
  db.Company.belongsTo(db.User, { foreignKey: 'userId' });
  db.Company.hasMany(db.Job, { foreignKey: 'companyId', as: 'jobs' });

  // Job关联
  db.Job.belongsTo(db.Company, { foreignKey: 'companyId' });
  db.Job.hasMany(db.Application, { foreignKey: 'jobId', as: 'applications' });

  // Application关联
  db.Application.belongsTo(db.Job, { foreignKey: 'jobId' });
  db.Application.belongsTo(db.JobSeeker, { foreignKey: 'jobseekerId' });
  db.Application.hasMany(db.Interview, { foreignKey: 'applicationId', as: 'interviews' });

  // Interview关联
  db.Interview.belongsTo(db.Application, { foreignKey: 'applicationId' });

  // Message关联
  db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });
  db.Message.belongsTo(db.User, { foreignKey: 'receiverId', as: 'receiver' });

  // Review关联
  db.Review.belongsTo(db.User, { foreignKey: 'reviewerId', as: 'reviewer' });
};

// 执行关联设置
setupAssociations();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;