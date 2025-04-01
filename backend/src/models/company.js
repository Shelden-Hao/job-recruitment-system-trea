const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Company = sequelize.define('Company', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '公司名称'
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '公司logo路径'
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '所属行业'
    },
    size: {
      type: DataTypes.ENUM('1-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'),
      allowNull: true,
      comment: '公司规模'
    },
    foundedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '成立年份'
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '公司网站'
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '公司地址'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '公司简介'
    },
    businessLicense: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '营业执照路径'
    },
    verificationStatus: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending',
      comment: '企业认证状态'
    }
  }, {
    timestamps: true,
    paranoid: true // 软删除
  });

  return Company;
};