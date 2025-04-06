const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Company = sequelize.define('Company', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '公司名称'
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '公司Logo URL'
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '公司规模（例如：20-50人，100-500人）'
    },
    industry: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '公司行业'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '公司简介'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '公司地址'
    }
  }, {
    tableName: 'companies',
    timestamps: true,
    underscored: true
  });

  Company.associate = (models) => {
    Company.belongsTo(models.User, { foreignKey: 'user_id', as: 'companyUser' });
    Company.hasMany(models.Job, { foreignKey: 'company_id', as: 'companyJobs' });
  };

  return Company;
};