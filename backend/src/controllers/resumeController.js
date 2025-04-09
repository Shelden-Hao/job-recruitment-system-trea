const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { JobSeeker, Job, Application, User, Company } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${req.id}-${uniqueSuffix}${ext}`);
  }
});

// 文件类型过滤
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，请上传PDF或Word文档'), false);
  }
};

// 创建multer实例
const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 限制5MB
});

// 上传简历
exports.uploadResume = (req, res) => {
  // 使用multer中间件处理单个文件上传
  const uploadMiddleware = upload.single('resume');

  uploadMiddleware(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: '请选择要上传的简历文件' });
      }

      // 查找求职者信息
      const jobseeker = await JobSeeker.findOne({ where: { user_id: req.query.userId } });
      if (!jobseeker) {
        // 删除已上传的文件
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: '求职者信息不存在' });
      }

      // 更新求职者简历信息
      await jobseeker.update({
        resume_url: `/uploads/resumes/${path.basename(req.file.path)}`
      });

      res.status(200).json({
        message: '简历上传成功',
        resume_url: `/uploads/resumes/${path.basename(req.file.path)}`
      });
    } catch (error) {
      console.error('简历上传错误:', error);
      // 发生错误时删除已上传的文件
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: '服务器错误' });
    }
  });
};

// 获取求职者简历
exports.getResume = async (req, res) => {
  try {
    const jobseekerId = req.params.id;
    
    // 查找求职者信息
    const jobseeker = await JobSeeker.findByPk(jobseekerId, {
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    if (!jobseeker) {
      return res.status(404).json({ message: '求职者信息不存在' });
    }
    
    // if (!jobseeker.resumeUrl) {
    //   return res.status(404).json({ message: '该求职者尚未上传简历' });
    // }
    
    res.json({
      jobseeker,
      // resumeUrl: jobseeker.resumeUrl
    });
  } catch (error) {
    console.error('获取简历错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 简历与职位匹配
exports.matchResume = async (req, res) => {
  try {
    // 获取求职者ID
    const jobseeker = await JobSeeker.findOne({ 
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    });
    
    if (!jobseeker) {
      return res.status(404).json({ message: '求职者信息不存在' });
    }
    
    if (!jobseeker.resumeUrl) {
      return res.status(400).json({ message: '请先上传简历' });
    }
    
    // 获取所有活跃的职位
    const jobs = await Job.findAll({
      where: { status: 'active' },
      include: [{
        model: Company,
        attributes: ['id', 'name', 'industry']
      }]
    });
    
    // 根据简历内容和职位要求计算匹配度
    // 这里使用一个简单的匹配算法，实际项目中可以使用更复杂的算法或AI模型
    const matchedJobs = jobs.map(job => {
      // 计算匹配度分数 (0-100)
      let matchScore = 0;
      
      // 基于技能匹配
      if (jobseeker.skills && job.skills) {
        const jobseekerSkills = Array.isArray(jobseeker.skills) ? jobseeker.skills : [];
        const jobSkills = Array.isArray(job.skills) ? job.skills : [];
        
        // 计算技能匹配度
        const matchedSkills = jobseekerSkills.filter(skill => 
          jobSkills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        );
        
        if (jobSkills.length > 0) {
          matchScore += (matchedSkills.length / jobSkills.length) * 50; // 技能匹配占50分
        }
      }
      
      // 基于教育背景匹配
      if (jobseeker.education && job.educationRequired) {
        // 简单匹配教育程度
        const educationLevels = ['高中', '大专', '本科', '硕士', '博士'];
        const jobseekerEduLevel = educationLevels.findIndex(level => 
          jobseeker.education.some(edu => edu.degree && edu.degree.includes(level))
        );
        const jobEduLevel = educationLevels.findIndex(level => 
          job.educationRequired.includes(level)
        );
        
        if (jobseekerEduLevel >= jobEduLevel && jobEduLevel !== -1) {
          matchScore += 20; // 教育背景匹配占20分
        }
      }
      
      // 基于工作经验匹配
      if (jobseeker.experience && job.experienceRequired) {
        // 提取年限数字
        const extractYears = (text) => {
          const match = text.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };
        
        const jobseekerYears = jobseeker.experience.reduce((total, exp) => {
          // 假设experience中有workYears字段表示工作年限
          return total + (exp.workYears || 0);
        }, 0);
        
        const requiredYears = extractYears(job.experienceRequired);
        
        if (jobseekerYears >= requiredYears) {
          matchScore += 30; // 工作经验匹配占30分
        } else if (requiredYears > 0) {
          // 部分匹配
          matchScore += (jobseekerYears / requiredYears) * 30;
        }
      }
      
      return {
        job,
        matchScore: Math.min(Math.round(matchScore), 100) // 确保分数不超过100
      };
    });
    
    // 按匹配度排序
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
    
    res.json({
      message: '简历匹配完成',
      matches: matchedJobs
    });
  } catch (error) {
    console.error('简历匹配错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 申请职位
exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    
    // 验证职位是否存在
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: '职位不存在' });
    }
    
    if (job.status !== 'active') {
      return res.status(400).json({ message: '该职位已关闭申请' });
    }
    
    // 查找求职者信息
    const jobseeker = await JobSeeker.findOne({ where: { userId: req.user.id } });
    if (!jobseeker) {
      return res.status(404).json({ message: '求职者信息不存在' });
    }
    
    if (!jobseeker.resumeUrl) {
      return res.status(400).json({ message: '请先上传简历' });
    }
    
    // 检查是否已经申请过该职位
    const existingApplication = await Application.findOne({
      where: {
        jobId,
        jobseekerId: jobseeker.id
      }
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: '您已经申请过该职位' });
    }
    
    // 创建申请记录
    const application = await Application.create({
      jobId,
      jobseekerId: jobseeker.id,
      resumeUrl: jobseeker.resumeUrl,
      coverLetter,
      status: 'pending'
    });
    
    // 更新职位申请数量
    await job.update({ applications: job.applications + 1 });
    
    res.status(201).json({
      message: '职位申请成功',
      application
    });
  } catch (error) {
    console.error('职位申请错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取求职者的申请列表
exports.getApplications = async (req, res) => {
  try {
    // 查找求职者信息
    const jobseeker = await JobSeeker.findOne({ where: { userId: req.user.id } });
    if (!jobseeker) {
      return res.status(404).json({ message: '求职者信息不存在' });
    }
    
    // 获取申请列表
    const applicationResults = await Application.findAll({
      where: { jobseekerId: jobseeker.id },
      include: [{
        model: Job,
        include: [{
          model: Company,
          attributes: ['id', 'name', 'logo']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    // 转换数据格式以匹配前端期望的结构
    const applications = applicationResults.map(application => {
      const formattedDate = new Date(application.createdAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-');
      
      return {
        id: application.id,
        job: {
          id: application.Job.id,
          title: application.Job.title,
          company: {
            id: application.Job.Company.id,
            name: application.Job.Company.name,
            logo: application.Job.Company.logo
          }
        },
        status: application.status,
        createdAt: formattedDate,
        resumeUrl: application.resumeUrl,
        coverLetter: application.coverLetter,
        hrNotes: application.hrNotes,
        rejectionReason: application.rejectionReason
      };
    });
    
    res.json(applications);
  } catch (error) {
    console.error('获取申请列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取企业收到的申请列表
exports.getCompanyApplications = async (req, res) => {
  try {
    // 查找企业信息
    const company = await Company.findOne({ where: { userId: req.user.id } });
    if (!company) {
      return res.status(404).json({ message: '企业信息不存在' });
    }
    
    // 获取企业的所有职位ID
    const jobs = await Job.findAll({
      where: { companyId: company.id },
      attributes: ['id']
    });
    
    const jobIds = jobs.map(job => job.id);
    
    // 获取这些职位的申请
    const applicationResults = await Application.findAll({
      where: { jobId: { [Op.in]: jobIds } },
      include: [{
        model: Job,
        attributes: ['id', 'title', 'location']
      }, {
        model: JobSeeker,
        include: [{
          model: User,
          attributes: ['username', 'email', 'avatar']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    // 转换数据格式以匹配前端期望的结构
    const applications = applicationResults.map(application => {
      const formattedDate = new Date(application.createdAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-');
      
      return {
        id: application.id,
        job: {
          id: application.Job.id,
          title: application.Job.title,
          location: application.Job.location
        },
        jobseeker: {
          id: application.JobSeeker.id,
          name: application.JobSeeker.fullName,
          avatar: application.JobSeeker.User.avatar,
          email: application.JobSeeker.User.email,
          username: application.JobSeeker.User.username
        },
        status: application.status,
        createdAt: formattedDate,
        resumeUrl: application.resumeUrl,
        coverLetter: application.coverLetter,
        matchScore: application.matchScore,
        hrNotes: application.hrNotes,
        rejectionReason: application.rejectionReason
      };
    });
    
    res.json(applications);
  } catch (error) {
    console.error('获取企业申请列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新申请状态
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, hrNotes } = req.body;
    
    // 验证状态值
    const validStatuses = ['pending', 'reviewed', 'interview', 'offer', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }
    
    // 查找申请记录
    const application = await Application.findByPk(applicationId, {
      include: [{
        model: Job,
        include: [{
          model: Company
        }]
      }]
    });
    
    if (!application) {
      return res.status(404).json({ message: '申请记录不存在' });
    }
    
    // 验证权限（只有发布该职位的企业可以更新状态）
    const company = await Company.findOne({ where: { userId: req.user.id } });
    if (!company || application.Job.companyId !== company.id) {
      return res.status(403).json({ message: '无权更新此申请状态' });
    }
    
    // 更新申请状态
    await application.update({
      status,
      hrNotes: hrNotes || application.hrNotes
    });
    
    res.json({
      message: '申请状态更新成功',
      application
    });
  } catch (error) {
    console.error('更新申请状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};