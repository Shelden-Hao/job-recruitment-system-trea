const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Skill = sequelize.define('Skill', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '技能名称'
    }
  }, {
    tableName: 'skills',
    timestamps: false
  });

  Skill.associate = (models) => {
    Skill.belongsToMany(models.Job, { 
      through: 'job_skills', 
      foreignKey: 'skill_id', 
      otherKey: 'job_id' 
    });
    Skill.belongsToMany(models.User, { 
      through: 'user_skills', 
      foreignKey: 'skill_id', 
      otherKey: 'user_id' 
    });
  };

  return Skill;
}; 