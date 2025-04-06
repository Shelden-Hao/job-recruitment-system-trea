const { Interview, Application, Job, Company, JobSeeker, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

// 创建面试
exports.createInterview = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { applicationId, scheduledTime, duration, location, interviewType, interviewers } = req.body;

    // 验证申请是否存在
    const application = await Application.findByPk(applicationId, {
      include: [{
        model: Job,
        include: [{
          model: Company
        }]
      }, {
        model: JobSeeker,
        include: [{
          model: User,
          attributes: ['email']
        }]
      }]
    });

    if (!application) {
      return res.status(404).json({ message: '申请记录不存在' });
    }

    // 验证权限（只有发布该职位的企业可以创建面试）
    const company = await Company.findOne({ where: { userId: req.user.id } });
    if (!company || application.Job.companyId !== company.id) {
      return res.status(403).json({ message: '无权为此申请创建面试' });
    }

    // 检查是否已经存在面试
    const existingInterview = await Interview.findOne({
      where: { applicationId }
    });

    if (existingInterview) {
      return res.status(400).json({ message: '该申请已存在面试安排，请使用更新功能' });
    }

    // 创建面试记录
    const interview = await Interview.create({
      applicationId,
      scheduledTime,
      duration: duration || 60,
      location,
      interviewType,
      interviewers: interviewers || [],
      status: 'scheduled',
      result: 'pending'
    });

    // 更新申请状态
    await application.update({ status: 'interview' });

    // 发送面试邀请邮件
    await sendInterviewNotification(interview, application);

    res.status(201).json({
      message: '面试安排成功',
      interview
    });
  } catch (error) {
    console.error('创建面试错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取面试详情
exports.getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findByPk(id, {
      include: [{
        model: Application,
        include: [{
          model: Job,
          include: [{
            model: Company,
            attributes: ['id', 'name', 'logo']
          }]
        }, {
          model: JobSeeker,
          include: [{
            model: User,
            attributes: ['username', 'email']
          }]
        }]
      }]
    });

    if (!interview) {
      return res.status(404).json({ message: '面试记录不存在' });
    }

    // 验证权限（只有相关企业和求职者可以查看）
    const isCompany = await Company.findOne({ where: { userId: req.user.id } });
    const isJobSeeker = await JobSeeker.findOne({ where: { userId: req.user.id } });

    if ((isCompany && interview.Application.Job.Company.id !== isCompany.id) && 
        (isJobSeeker && interview.Application.JobSeeker.id !== isJobSeeker.id)) {
      return res.status(403).json({ message: '无权查看此面试记录' });
    }

    res.json(interview);
  } catch (error) {
    console.error('获取面试详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新面试状态
exports.updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, scheduledTime, duration, location, interviewType, feedback, result, notes } = req.body;

    // 查找面试记录
    const interview = await Interview.findByPk(id, {
      include: [{
        model: Application,
        include: [{
          model: Job,
          include: [{
            model: Company
          }]
        }, {
          model: JobSeeker,
          include: [{
            model: User
          }]
        }]
      }]
    });

    if (!interview) {
      return res.status(404).json({ message: '面试记录不存在' });
    }

    // 验证权限
    const company = await Company.findOne({ where: { userId: req.user.id } });
    const jobseeker = await JobSeeker.findOne({ where: { userId: req.user.id } });

    // 企业可以更新所有字段，求职者只能更新状态（确认或取消）
    if (company && interview.Application.Job.Company.id === company.id) {
      // 企业更新面试
      await interview.update({
        status: status || interview.status,
        scheduledTime: scheduledTime || interview.scheduledTime,
        duration: duration || interview.duration,
        location: location || interview.location,
        interviewType: interviewType || interview.interviewType,
        feedback: feedback !== undefined ? feedback : interview.feedback,
        result: result || interview.result,
        notes: notes !== undefined ? notes : interview.notes
      });

      // 如果面试结果已更新，同时更新申请状态
      if (result && result !== 'pending') {
        const newApplicationStatus = result === 'pass' ? 'offer' : 'rejected';
        await interview.Application.update({ status: newApplicationStatus });
      }

      // 如果面试时间被重新安排，发送通知
      if (scheduledTime && scheduledTime !== interview.scheduledTime) {
        await sendInterviewNotification(interview, interview.Application, '面试时间已更新');
      }
    } else if (jobseeker && interview.Application.JobSeeker.id === jobseeker.id) {
      // 求职者只能确认或取消面试
      if (!status || !['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: '求职者只能确认或取消面试' });
      }

      await interview.update({ status });

      // 发送面试状态更新通知给企业
      const statusMessage = status === 'confirmed' ? '求职者已确认面试' : '求职者已取消面试';
      await sendInterviewStatusUpdate(interview, statusMessage);
    } else {
      return res.status(403).json({ message: '无权更新此面试记录' });
    }

    res.json({
      message: '面试记录更新成功',
      interview
    });
  } catch (error) {
    console.error('更新面试错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取企业的面试列表
exports.getCompanyInterviews = async (req, res) => {
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

    // 获取这些职位的申请ID
    const applications = await Application.findAll({
      where: { jobId: { [Op.in]: jobIds } },
      attributes: ['id']
    });

    const applicationIds = applications.map(app => app.id);

    // 获取这些申请的面试
    const interviewResults = await Interview.findAll({
      where: { applicationId: { [Op.in]: applicationIds } },
      include: [{
        model: Application,
        include: [{
          model: Job,
          attributes: ['id', 'title']
        }, {
          model: JobSeeker,
          include: [{
            model: User,
            attributes: ['username', 'email', 'avatar']
          }]
        }]
      }],
      order: [['scheduledTime', 'DESC']]
    });
    
    // 转换数据格式以匹配前端期望的结构
    const interviews = interviewResults.map(interview => {
      const scheduledDate = new Date(interview.scheduledTime);
      const formattedDateTime = scheduledDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-');
      
      return {
        id: interview.id,
        application: {
          id: interview.Application.id,
          job: {
            id: interview.Application.Job.id,
            title: interview.Application.Job.title
          },
          jobseeker: {
            id: interview.Application.JobSeeker.id,
            name: interview.Application.JobSeeker.fullName,
            email: interview.Application.JobSeeker.User.email,
            username: interview.Application.JobSeeker.User.username,
            avatar: interview.Application.JobSeeker.User.avatar
          }
        },
        scheduledTime: interview.scheduledTime,
        formattedDateTime,
        duration: interview.duration,
        location: interview.location,
        interviewType: interview.interviewType,
        status: interview.status,
        interviewers: interview.interviewers,
        feedback: interview.feedback,
        result: interview.result,
        notes: interview.notes,
        reminderSent: interview.reminderSent,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt
      };
    });

    res.json(interviews);
  } catch (error) {
    console.error('获取企业面试列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取求职者的面试列表
exports.getJobSeekerInterviews = async (req, res) => {
  try {
    // 查找求职者信息
    const jobseeker = await JobSeeker.findOne({ where: { userId: req.user.id } });
    if (!jobseeker) {
      return res.status(404).json({ message: '求职者信息不存在' });
    }

    // 获取求职者的申请ID
    const applications = await Application.findAll({
      where: { jobseekerId: jobseeker.id },
      attributes: ['id']
    });

    const applicationIds = applications.map(app => app.id);

    // 获取这些申请的面试
    const interviewResults = await Interview.findAll({
      where: { applicationId: { [Op.in]: applicationIds } },
      include: [{
        model: Application,
        include: [{
          model: Job,
          include: [{
            model: Company,
            attributes: ['id', 'name', 'logo', 'address']
          }]
        }]
      }],
      order: [['scheduledTime', 'DESC']]
    });
    
    // 转换数据格式以匹配前端期望的结构
    const interviews = interviewResults.map(interview => {
      const scheduledDate = new Date(interview.scheduledTime);
      const formattedDateTime = scheduledDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-');
      
      return {
        id: interview.id,
        application: {
          id: interview.Application.id,
          job: {
            id: interview.Application.Job.id,
            title: interview.Application.Job.title,
            company: {
              id: interview.Application.Job.Company.id,
              name: interview.Application.Job.Company.name,
              logo: interview.Application.Job.Company.logo,
              address: interview.Application.Job.Company.address
            }
          }
        },
        scheduledTime: interview.scheduledTime,
        formattedDateTime,
        duration: interview.duration,
        location: interview.location,
        interviewType: interview.interviewType,
        status: interview.status,
        interviewers: interview.interviewers,
        feedback: interview.feedback,
        result: interview.result,
        notes: interview.notes,
        reminderSent: interview.reminderSent,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt
      };
    });

    res.json(interviews);
  } catch (error) {
    console.error('获取求职者面试列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 发送面试提醒
exports.sendInterviewReminder = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // 查找面试记录
    const interview = await Interview.findByPk(interviewId, {
      include: [{
        model: Application,
        include: [{
          model: Job,
          include: [{
            model: Company
          }]
        }, {
          model: JobSeeker,
          include: [{
            model: User
          }]
        }]
      }]
    });

    if (!interview) {
      return res.status(404).json({ message: '面试记录不存在' });
    }

    // 验证权限（只有发布该职位的企业可以发送提醒）
    const company = await Company.findOne({ where: { userId: req.user.id } });
    if (!company || interview.Application.Job.Company.id !== company.id) {
      return res.status(403).json({ message: '无权发送此面试提醒' });
    }

    // 发送面试提醒
    await sendInterviewNotification(interview, interview.Application, '面试提醒');

    // 更新提醒状态
    await interview.update({ reminderSent: true });

    res.json({ message: '面试提醒已发送' });
  } catch (error) {
    console.error('发送面试提醒错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 辅助函数：发送面试通知
async function sendInterviewNotification(interview, application, subject = '面试邀请') {
  try {
    // 获取求职者邮箱
    const jobseekerEmail = application.JobSeeker.User.email;
    if (!jobseekerEmail) return;

    // 创建邮件发送器
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 格式化面试时间
    const interviewDate = new Date(interview.scheduledTime).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 构建邮件内容
    const mailOptions = {
      from: `"${application.Job.Company.name}招聘团队" <${process.env.EMAIL_USER}>`,
      to: jobseekerEmail,
      subject: `${subject} - ${application.Job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">${subject}</h2>
          <p>尊敬的 ${application.JobSeeker.fullName || '求职者'},</p>
          <p>感谢您申请 ${application.Job.Company.name} 的 ${application.Job.title} 职位。</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>面试详情：</strong></p>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>职位：</strong> ${application.Job.title}</li>
              <li><strong>公司：</strong> ${application.Job.Company.name}</li>
              <li><strong>时间：</strong> ${interviewDate}</li>
              <li><strong>时长：</strong> ${interview.duration} 分钟</li>
              <li><strong>地点：</strong> ${interview.location || '线上面试'}</li>
              <li><strong>面试形式：</strong> ${interview.interviewType === 'onsite' ? '现场面试' : interview.interviewType === 'video' ? '视频面试' : '电话面试'}</li>
            </ul>
          </div>
          <p>请您准时参加面试。如需调整面试时间，请登录系统或直接回复此邮件。</p>
          <p>祝您面试顺利！</p>
          <p style="margin-top: 20px;">此致,</p>
          <p>${application.Job.Company.name}招聘团队</p>
        </div>
      `
    };

    // 发送邮件
    await transporter.sendMail(mailOptions);
    console.log(`面试通知邮件已发送至 ${jobseekerEmail}`);
  } catch (error) {
    console.error('发送面试通知邮件错误:', error);
    // 不中断主流程，仅记录错误
  }
}

// 辅助函数：发送面试状态更新
async function sendInterviewStatusUpdate(interview, statusMessage) {
  try {
    // 获取企业邮箱
    const company = await Company.findByPk(interview.Application.Job.companyId, {
      include: [{
        model: User,
        attributes: ['email']
      }]
    });

    if (!company || !company.User.email) return;

    // 创建邮件发送器
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 获取求职者信息
    const jobseeker = await JobSeeker.findByPk(interview.Application.jobseekerId, {
      include: [{
        model: User,
        attributes: ['username']
      }]
    });

    // 格式化面试时间
    const interviewDate = new Date(interview.scheduledTime).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 构建邮件内容
    const mailOptions = {
      from: `"招聘系统通知" <${process.env.EMAIL_USER}>`,
      to: company.User.email,
      subject: `面试状态更新 - ${interview.Application.Job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">面试状态更新</h2>
          <p>尊敬的招聘团队,</p>
          <p><strong>${statusMessage}</strong></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>面试详情：</strong></p>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>求职者：</strong> ${jobseeker ? jobseeker.fullName || jobseeker.User.username : '未知'}</li>
              <li><strong>职位：</strong> ${interview.Application.Job.title}</li>
              <li><strong>时间：</strong> ${interviewDate}</li>
              <li><strong>状态：</strong> ${interview.status === 'confirmed' ? '已确认' : '已取消'}</li>
            </ul>
          </div>
          <p>请登录系统查看详细信息。</p>
        </div>
      `
    };

    // 发送邮件
    await transporter.sendMail(mailOptions);
    console.log(`面试状态更新邮件已发送至 ${company.User.email}`);
  } catch (error) {
    console.error('发送面试状态更新邮件错误:', error);
    // 不中断主流程，仅记录错误
  }
};