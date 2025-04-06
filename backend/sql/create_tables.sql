-- 创建job_recruitment_system数据库
CREATE DATABASE IF NOT EXISTS job_recruitment_system;
USE job_recruitment_system;

-- -----------------------------------------------------
-- 表：companies
-- -----------------------------------------------------
CREATE TABLE companies (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL COMMENT '公司名称',
  logo VARCHAR(255) COMMENT '公司Logo URL',
  size VARCHAR(50) COMMENT '公司规模（例如：20-50人，100-500人）',
  industry VARCHAR(100) COMMENT '公司行业',
  description TEXT COMMENT '公司简介',
  address VARCHAR(255) COMMENT '公司地址',
  PRIMARY KEY (id)
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- 表：jobs
-- -----------------------------------------------------
CREATE TABLE jobs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id INT UNSIGNED NOT NULL COMMENT '所属公司ID，外键 references companies(id)',
  title VARCHAR(255) NOT NULL COMMENT '职位名称',
  description TEXT NOT NULL COMMENT '职位描述',
  location VARCHAR(100) NOT NULL COMMENT '工作地点',
  salary_range VARCHAR(50) NOT NULL COMMENT '薪资范围（例如：15k-25k）',
  publish_date DATETIME NOT NULL COMMENT '发布日期',
  experience VARCHAR(50) COMMENT '经验要求（例如：3-5年）',
  education VARCHAR(50) COMMENT '学历要求（例如：本科及以上）',
  tags VARCHAR(255) COMMENT '职位标签，用逗号分隔（例如：React, Vue, 前端开发）',
  PRIMARY KEY (id),
  INDEX fk_jobs_companies_idx (company_id ASC),
  CONSTRAINT fk_jobs_companies
    FOREIGN KEY (company_id)
    REFERENCES companies (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- 表：users
-- -----------------------------------------------------
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码（建议使用哈希加密存储）',
  role ENUM('seeker', 'recruiter', 'admin') NOT NULL DEFAULT 'seeker' COMMENT '角色：seeker-求职者，recruiter-招聘者，admin-管理员',
  email VARCHAR(255) COMMENT '邮箱',
  phone VARCHAR(20) COMMENT '电话号码',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  company_id INT UNSIGNED COMMENT '公司ID，如果用户是招聘者，外键 references companies(id)',
  realname VARCHAR(50) COMMENT '真实姓名',
  avatar VARCHAR(255) COMMENT '用户头像',
  bio TEXT COMMENT '个人简介',
  PRIMARY KEY (id),
  INDEX fk_users_companies_idx (company_id ASC),
  CONSTRAINT fk_users_companies
    FOREIGN KEY (company_id)
    REFERENCES companies (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- 表：applications
-- -----------------------------------------------------
CREATE TABLE applications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL COMMENT '申请用户ID，外键 references users(id)',
  job_id INT UNSIGNED NOT NULL COMMENT '申请职位ID，外键 references jobs(id)',
  apply_date DATETIME NOT NULL COMMENT '申请日期',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '申请状态：pending-待处理，interview-面试中，offer-已录用，rejected-已拒绝',
  resume_path VARCHAR(255) COMMENT '简历路径',
  cover_letter_path VARCHAR(255) COMMENT '求职信路径',
  interview_time DATETIME COMMENT '面试时间',
  PRIMARY KEY (id),
  INDEX fk_applications_users_idx (user_id ASC),
  INDEX fk_applications_jobs_idx (job_id ASC),
  CONSTRAINT fk_applications_users
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_applications_jobs
    FOREIGN KEY (job_id)
    REFERENCES jobs (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- 表：skills
-- -----------------------------------------------------
CREATE TABLE skills (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT '技能名称',
  PRIMARY KEY (id)
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- 表：job_skills
-- -----------------------------------------------------
CREATE TABLE job_skills (
  job_id INT UNSIGNED NOT NULL,
  skill_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (job_id, skill_id),
  INDEX fk_job_skills_jobs_idx (job_id ASC),
  INDEX fk_job_skills_skills_idx (skill_id ASC),
  CONSTRAINT fk_job_skills_jobs
    FOREIGN KEY (job_id)
    REFERENCES jobs (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_job_skills_skills
    FOREIGN KEY (skill_id)
    REFERENCES skills (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- 表：user_skills
-- -----------------------------------------------------
CREATE TABLE user_skills (
  user_id INT UNSIGNED NOT NULL,
  skill_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, skill_id),
  INDEX fk_user_skills_users_idx (user_id ASC),
  INDEX fk_user_skills_skills_idx (skill_id ASC),
  CONSTRAINT fk_user_skills_users
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_user_skills_skills
    FOREIGN KEY (skill_id)
    REFERENCES skills (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
ENGINE = InnoDB;

-- -----------------------------------------------------
--  表: messages
-- -----------------------------------------------------
CREATE TABLE messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sender_id INT UNSIGNED NOT NULL COMMENT '发送者ID，外键 references users(id)',
  receiver_id INT UNSIGNED NOT NULL COMMENT '接收者ID，外键 references users(id)',
  content TEXT NOT NULL COMMENT '消息内容',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  conversation_id INT UNSIGNED NOT NULL COMMENT '会话ID，外键 references conversations(id)',
  PRIMARY KEY (id),
  INDEX fk_messages_sender_idx (sender_id ASC),
  INDEX fk_messages_receiver_idx (receiver_id ASC),
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
--  表: conversations
-- -----------------------------------------------------
CREATE TABLE conversations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id1 INT UNSIGNED NOT NULL COMMENT '用户ID1，外键 references users(id)',
  user_id2 INT UNSIGNED NOT NULL COMMENT '用户ID2，外键 references users(id)',
  last_message_id INT UNSIGNED COMMENT '最后一条消息ID，外键 references messages(id)',
  unread_count_user1 INT UNSIGNED DEFAULT 0 COMMENT '用户1的未读消息数',
  unread_count_user2 INT UNSIGNED DEFAULT 0 COMMENT '用户2的未读消息数',
  PRIMARY KEY (id),
  INDEX fk_conversations_user1_idx (user_id1 ASC),
  INDEX fk_conversations_user2_idx (user_id2 ASC),
  CONSTRAINT fk_conversations_user1 FOREIGN KEY (user_id1) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_conversations_user2 FOREIGN KEY (user_id2) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_conversations_last_message FOREIGN KEY (last_message_id) REFERENCES messages (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
