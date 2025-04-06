-- 使用job_recruitment_system数据库
USE job_recruitment_system;

-- 插入公司数据
INSERT INTO companies (name, logo, size, industry, description, address) VALUES
('科技有限公司', '/static/company-logo.png', '100-500人', '互联网', '一家快速发展的科技公司，致力于创新。', '深圳'),
('互联网科技有限公司', '/static/company-logo.png', '1000+人', '互联网', '领先的互联网服务提供商。', '北京'),
('创新科技公司', '/static/company-logo.png', '20-50人', '互联网', '一家充满活力的创新科技公司。', '上海'),
('智能科技公司', NULL, '500-1000人', '人工智能', '专注于人工智能领域的研发和应用。', '广州'),
('大数据科技公司', NULL, '100-200人', '大数据', '提供大数据解决方案和服务的科技公司。', '杭州');

-- 插入职位数据
INSERT INTO jobs (company_id, title, description, location, salary_range, publish_date, experience, education, tags) VALUES
(1, '前端开发工程师', '负责公司前端项目的开发和维护\n2. 与产品、设计和后端团队紧密协作\n3. 优化前端性能，提升用户体验\n4. 参与技术方案设计和评审', '深圳', '15k-25k', '2024-01-10 09:00:00', '3-5年', '本科及以上', 'React, Vue, 前端开发'),
(2, '后端开发工程师', '负责后端开发，参与项目架构设计和优化。', '北京', '20k-30k', '2024-01-08 14:00:00', '3-5年', '本科及以上', 'Java, Spring, MySQL, 分布式'),
(3, 'UI设计师', '负责产品界面和用户体验设计，提供高质量的设计方案。', '上海', '12k-18k', '2024-01-05 10:00:00', '2年以上', '本科及以上', 'UI设计, UX设计, Figma, Sketch'),
(4, '产品经理', '负责产品规划、设计和项目推进，关注用户体验。', '广州', '18k-25k', '2024-01-03 16:00:00', '2年以上', '本科及以上', '产品设计, 项目管理, 用户体验'),
(5, '数据分析师', '负责数据收集、整理、分析，为业务决策提供支持。', '杭州', '15k-22k', '2024-01-02 11:00:00', '1-3年', '本科及以上', '数据分析, SQL, Python, Tableau');

-- 插入用户数据
INSERT INTO users (username, password, role, email, phone, company_id, realname, avatar, bio) VALUES
('zhangsan', '$2a$10$passwordhash123', 'seeker', 'zhangsan@example.com', '13800138000', NULL, '张三', '/static/images/default-avatar.png', '求职者，期望从事前端开发相关工作。'), -- 密码需要加密
('lisi', '$2a$10$anotherhash456', 'recruiter', 'lisi@example.com', '13987654321', 2, '李四', '/static/images/default-avatar.png', '招聘者，负责公司技术人才招聘。'),
('wangwu', '$2a$10$yetanotherhash789', 'admin', 'wangwu@example.com', '13322223333', NULL, '王五', '/static/images/default-avatar.png', '管理员。'),
('zhaoliu', '$2a$10$zhaoliuhash', 'recruiter', 'zhaoliu@example.com', '13322224444', 1, '赵六', '/static/images/default-avatar.png', '负责公司招聘');

-- 插入申请数据
INSERT INTO applications (user_id, job_id, apply_date, status, resume_path, cover_letter_path, interview_time) VALUES
(1, 1, '2024-01-15 10:30:00', 'pending', '/path/to/zhangsan_resume.pdf', '/path/to/zhangsan_coverletter.pdf', NULL),
(1, 2, '2024-01-14 15:20:00', 'interview', '/path/to/zhangsan_resume.pdf', NULL, '2024-01-20 14:30:00');

-- 插入技能数据
INSERT INTO skills (name) VALUES
('Java'), ('Spring'), ('MySQL'), ('分布式'), ('产品设计'), ('项目管理'), ('用户体验'), ('金融'), ('市场分析'), ('投资'),
('UI设计'), ('UX设计'), ('Figma'), ('Sketch'), ('React'), ('Vue'), ('前端开发'), ('后端开发'), ('数据分析'), ('SQL'), ('Python'), ('Tableau');

-- 插入职位技能关联数据
INSERT INTO job_skills (job_id, skill_id) VALUES
(1, 15), (1, 16), (1, 17),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 18),
(3, 11), (3, 12), (3, 13), (3, 14),
(4, 5), (4, 6), (4, 7),
(5, 19), (5, 20), (5, 21), (5,22);

-- 插入用户技能关联数据
INSERT INTO user_skills (user_id, skill_id) VALUES
(1, 15), (1, 16), (1, 17),
(2, 1), (2, 2), (2, 18);

-- 插入消息数据
INSERT INTO messages (sender_id, receiver_id, content, created_at, conversation_id) VALUES
(2, 1, '您好，我看到您对前端开发工程师职位感兴趣', '2024-03-19 10:30:00', 1),
(1, 2, '是的，我想了解一下这个职位的详细情况', '2024-03-19 10:32:00', 1),
(2, 1, '这个职位需要3年以上的前端开发经验，熟悉Vue和React框架，有良好的团队协作能力', '2024-03-19 10:35:00', 1),
(3, 1, '这个职位需要3年以上的前端开发经验，熟悉Vue和React框架', '2024-03-18 15:20:00', 2),
(1, 3, '我正好有3年的前端开发经验，对Vue和React都很熟悉', '2024-03-18 15:25:00', 2),
(3, 1, '很好，我们准备安排面试，您的时间是否方便？', '2024-03-18 15:30:00', 2),
(4, 1, '已收到您的简历，我们会尽快安排面试', '2024-03-22 09:15:00', 3),
(5, 1, '您好，请问您有Java开发经验吗？', '2024-03-15 16:40:00', 4),
(1, 5, '我主要是前端开发经验，Java只有在校期间的一些项目经验', '2024-03-15 16:45:00', 4),
(6, 1, '恭喜您通过我们的面试，请问您什么时候可以入职？', '2024-03-20 14:30:00', 5),
(1, 6, '非常感谢！我可以在下个月初入职', '2024-03-20 15:00:00', 5),
(6, 1, '好的，我们会准备好入职材料，请您届时携带相关证件', '2024-03-20 15:10:00', 5);

-- 插入会话数据
INSERT INTO conversations (user_id1, user_id2, last_message_id, unread_count_user1, unread_count_user2) VALUES
(1, 2, 3, 0, 0),
(1, 3, 6, 0, 0),
(1, 4, 7, 0, 1),
(1, 5, 9, 0, 0),
(1, 6, 12, 0, 0);
