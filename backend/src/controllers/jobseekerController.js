const { JobSeeker, User } = require('../models');
const { validationResult } = require('express-validator');

// 获取求职者信息
exports.getJobseekerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const jobseeker = await JobSeeker.findByPk(id, {
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    if (!jobseeker) {
      return res.status(404).json({ message: '求职者信息不存在' });
    }
    
    res.json({
      success: true,
      data: jobseeker
    });
  } catch (error) {
    console.error('获取求职者信息错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新求职者信息
exports.updateJobseeker = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const jobseeker = await JobSeeker.findByPk(id);
    
    if (!jobseeker) {
      return res.status(404).json({ message: '求职者信息不存在' });
    }
    
    // 允许更新的字段
    const updateFields = [
      'fullName', 
      'gender', 
      'birthDate', 
      'education', 
      'experience', 
      'skills',
      'expectedSalary',
      'expectedPosition',
      'expectedLocation',
      'selfIntroduction'
    ];
    
    // 过滤出需要更新的字段
    const updates = {};
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    await jobseeker.update(updates);
    
    res.json({
      success: true,
      message: '求职者信息更新成功',
      data: jobseeker
    });
  } catch (error) {
    console.error('更新求职者信息错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 