const { Job, Company, User, Application, JobSeeker, Skill } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// 创建新职位
exports.createJob = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 创建职位
    const job = await Job.create({
      ...req.body,
      publish_date: new Date()
    });

    // 处理技能标签
    if (req.body.skills && Array.isArray(req.body.skills)) {
      // 查找或创建技能
      const skillPromises = req.body.skills.map(async (skillName) => {
        const [skill] = await Skill.findOrCreate({
          where: { name: skillName }
        });
        return skill;
      });

      const skills = await Promise.all(skillPromises);
      await job.setSkills(skills);
    }

    res.status(201).json({
      success: true,
      message: '职位发布成功',
      data: job
    });
  } catch (error) {
    console.error('创建职位错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取职位详情
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      attributes: [
        'id', 
        'title', 
        'description', 
        'location', 
        'salary_range', 
        'publish_date', 
        'company_id',
        'experience',
        'education',
        'tags'
      ],
      include: [
        {
          model: Company,
          attributes: ['id', 'name', 'logo', 'industry', 'size', 'address']
        },
        {
          model: Skill,
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    if (!job) {
      return res.status(404).json({ message: '职位不存在' });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('获取职位详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新职位信息
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 查找职位
    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({ message: '职位不存在' });
    }

    // 更新职位信息
    await job.update(req.body);

    // 更新技能
    if (req.body.skills && Array.isArray(req.body.skills)) {
      // 查找或创建技能
      const skillPromises = req.body.skills.map(async (skillName) => {
        const [skill] = await Skill.findOrCreate({
          where: { name: skillName }
        });
        return skill;
      });

      const skills = await Promise.all(skillPromises);
      await job.setSkills(skills);
    }

    res.json({
      success: true,
      message: '职位更新成功',
      data: job
    });
  } catch (error) {
    console.error('更新职位错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除职位
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找职位
    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({ message: '职位不存在' });
    }

    // 删除职位
    await job.destroy();

    res.json({ 
      success: true,
      message: '职位删除成功' 
    });
  } catch (error) {
    console.error('删除职位错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 搜索职位
exports.searchJobs = async (req, res) => {
  try {
    const {
      keyword,
      location,
      salary_min,
      salary_max,
      experience,
      education,
      company_id,
      page = 1,
      limit = 10
    } = req.query;

    // 构建查询条件
    const whereConditions = {};

    // 关键词搜索（职位名称、描述）
    if (keyword) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { tags: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 地点筛选
    if (location) {
      whereConditions.location = { [Op.like]: `%${location}%` };
    }

    // 薪资范围筛选
    if (salary_min || salary_max) {
      // 这是一个近似的查询方式，因为salary_range是字符串
      // 在实际应用中可能需要更复杂的转换逻辑
      if (salary_min) {
        whereConditions.salary_range = { [Op.like]: `%${salary_min}%` };
      }
      if (salary_max) {
        whereConditions.salary_range = { [Op.like]: `%${salary_max}%` };
      }
    }

    // 经验要求筛选
    if (experience) {
      whereConditions.experience = { [Op.like]: `%${experience}%` };
    }

    // 学历要求筛选
    if (education) {
      whereConditions.education = { [Op.like]: `%${education}%` };
    }

    // 公司筛选
    if (company_id) {
      whereConditions.company_id = company_id;
    }

    // 分页参数
    const offset = (page - 1) * limit;

    // 查询职位
    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Company,
          attributes: ['id', 'name', 'logo', 'industry', 'size']
        },
        {
          model: Skill,
          through: { attributes: [] }
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['publish_date', 'DESC']]
    });

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('搜索职位错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取企业发布的所有职位
exports.getCompanyJobs = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { userId: req.user.id } });
    if (!company) {
      return res.status(404).json({ message: '企业信息不存在' });
    }

    const jobs = await Job.findAll({
      where: { companyId: company.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(jobs);
  } catch (error) {
    console.error('获取企业职位错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取推荐职位（基于求职者技能和期望）
exports.getRecommendedJobs = async (req, res) => {
  try {
    // 获取求职者信息
    const jobseeker = await JobSeeker.findOne({ where: { userId: req.user.id } });
    if (!jobseeker) {
      return res.status(404).json({ message: '求职者信息不存在' });
    }

    // 构建推荐查询条件
    const whereConditions = {
      status: 'active'
    };

    // 如果有期望职位，按职位名称匹配
    if (jobseeker.expectedPosition) {
      whereConditions.title = { [Op.like]: `%${jobseeker.expectedPosition}%` };
    }

    // 如果有期望地点，按地点匹配
    if (jobseeker.expectedLocation) {
      whereConditions.location = { [Op.like]: `%${jobseeker.expectedLocation}%` };
    }

    // 如果有期望薪资，按薪资范围匹配
    if (jobseeker.expectedSalary) {
      whereConditions.salaryMax = { [Op.gte]: jobseeker.expectedSalary };
    }

    // 查询匹配的职位
    const jobs = await Job.findAll({
      where: whereConditions,
      include: [{
        model: Company,
        attributes: ['id', 'name', 'logo', 'industry', 'size']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // 如果求职者有技能信息，计算匹配度
    if (jobseeker.skills && Array.isArray(jobseeker.skills)) {
      // 提取求职者技能关键词
      const jobseekerSkills = jobseeker.skills.map(skill => 
        typeof skill === 'string' ? skill.toLowerCase() : skill.name?.toLowerCase()
      ).filter(Boolean);

      // 计算每个职位的匹配度
      const jobsWithScore = jobs.map(job => {
        let matchScore = 0;
        const jobData = job.toJSON();
        
        // 基于职位技能要求计算匹配度
        if (job.skills && Array.isArray(job.skills)) {
          const jobSkills = job.skills.map(skill => 
            typeof skill === 'string' ? skill.toLowerCase() : skill.name?.toLowerCase()
          ).filter(Boolean);
          
          // 计算技能匹配数
          const matchedSkills = jobseekerSkills.filter(skill => 
            jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
          );
          
          // 计算匹配百分比
          if (jobSkills.length > 0) {
            matchScore = (matchedSkills.length / jobSkills.length) * 100;
          }
        }
        
        // 基于职位名称与期望职位的匹配度
        if (jobseeker.expectedPosition && job.title) {
          const positionMatch = job.title.toLowerCase().includes(jobseeker.expectedPosition.toLowerCase()) || 
                               jobseeker.expectedPosition.toLowerCase().includes(job.title.toLowerCase());
          if (positionMatch) matchScore += 20;
        }
        
        // 基于地点匹配度
        if (jobseeker.expectedLocation && job.location) {
          const locationMatch = job.location.toLowerCase().includes(jobseeker.expectedLocation.toLowerCase()) || 
                               jobseeker.expectedLocation.toLowerCase().includes(job.location.toLowerCase());
          if (locationMatch) matchScore += 20;
        }
        
        // 限制最高分为100
        matchScore = Math.min(matchScore, 100);
        
        return {
          ...jobData,
          matchScore: Math.round(matchScore)
        };
      });
      
      // 按匹配度排序
      jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);
      
      res.json(jobsWithScore);
    } else {
      // 如果没有技能信息，直接返回职位列表
      res.json(jobs);
    }
  } catch (error) {
    console.error('获取推荐职位错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取所有职位
exports.getJobs = async (req, res) => {
  try {
    // 显式指定所有字段，避免访问不存在的列
    const jobs = await Job.findAll({
      attributes: [
        'id', 
        'title', 
        'description', 
        'location', 
        'salary_range', 
        'publish_date', 
        'company_id',
        // 如果有这些字段，则包含它们
        'experience',
        'education',
        'tags'
      ],
      raw: true 
    });
    
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('获取所有职位错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}