/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80019 (8.0.19)
 Source Host           : localhost:3306
 Source Schema         : job_recruitment_system

 Target Server Type    : MySQL
 Target Server Version : 80019 (8.0.19)
 File Encoding         : 65001

 Date: 06/04/2025 23:12:38
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for applications
-- ----------------------------
DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int UNSIGNED NOT NULL COMMENT '申请用户ID，外键 references users(id)',
  `job_id` int UNSIGNED NOT NULL COMMENT '申请职位ID，外键 references jobs(id)',
  `apply_date` datetime NOT NULL COMMENT '申请日期',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending' COMMENT '申请状态：pending-待处理，interview-面试中，offer-已录用，rejected-已拒绝',
  `resume_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '简历路径',
  `cover_letter_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '求职信路径',
  `interview_time` datetime NULL DEFAULT NULL COMMENT '面试时间',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `jobseeker_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_applications_users_idx`(`user_id` ASC) USING BTREE,
  INDEX `fk_applications_jobs_idx`(`job_id` ASC) USING BTREE,
  INDEX `jobseeker_id`(`jobseeker_id` ASC) USING BTREE,
  CONSTRAINT `applications_ibfk_15` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `applications_ibfk_16` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `applications_ibfk_8` FOREIGN KEY (`jobseeker_id`) REFERENCES `jobseekers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of applications
-- ----------------------------
INSERT INTO `applications` VALUES (1, 1, 1, '2024-01-15 10:30:00', 'pending', '/path/to/zhangsan_resume.pdf', '/path/to/zhangsan_coverletter.pdf', NULL, '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL);
INSERT INTO `applications` VALUES (2, 1, 2, '2024-01-14 15:20:00', 'interview', '/path/to/zhangsan_resume.pdf', NULL, '2024-01-20 14:30:00', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL);

-- ----------------------------
-- Table structure for companies
-- ----------------------------
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '公司名称',
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '公司Logo URL',
  `size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '公司规模（例如：20-50人，100-500人）',
  `industry` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '公司行业',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '公司简介',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '公司地址',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of companies
-- ----------------------------
INSERT INTO `companies` VALUES (1, '科技有限公司', '/static/company-logo.png', '100-500人', '互联网', '一家快速发展的科技公司，致力于创新。', '深圳', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL);
INSERT INTO `companies` VALUES (2, '互联网科技有限公司', '/static/company-logo.png', '1000+人', '互联网', '领先的互联网服务提供商。', '北京', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL);
INSERT INTO `companies` VALUES (3, '创新科技公司', '/static/company-logo.png', '20-50人', '互联网', '一家充满活力的创新科技公司。', '上海', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL);
INSERT INTO `companies` VALUES (4, '智能科技公司', NULL, '500-1000人', '人工智能', '专注于人工智能领域的研发和应用。', '广州', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL);
INSERT INTO `companies` VALUES (5, '大数据科技公司', NULL, '100-200人', '大数据', '提供大数据解决方案和服务的科技公司。', '杭州', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL);

-- ----------------------------
-- Table structure for conversations
-- ----------------------------
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id1` int UNSIGNED NOT NULL COMMENT '用户ID1，外键 references users(id)',
  `user_id2` int UNSIGNED NOT NULL COMMENT '用户ID2，外键 references users(id)',
  `last_message_id` int UNSIGNED NULL DEFAULT NULL COMMENT '最后一条消息ID，外键 references messages(id)',
  `unread_count_user1` int UNSIGNED NULL DEFAULT 0 COMMENT '用户1的未读消息数',
  `unread_count_user2` int UNSIGNED NULL DEFAULT 0 COMMENT '用户2的未读消息数',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_conversations_user1_idx`(`user_id1` ASC) USING BTREE,
  INDEX `fk_conversations_user2_idx`(`user_id2` ASC) USING BTREE,
  INDEX `last_message_id`(`last_message_id` ASC) USING BTREE,
  CONSTRAINT `conversations_ibfk_13` FOREIGN KEY (`user_id1`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `conversations_ibfk_14` FOREIGN KEY (`user_id2`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `conversations_ibfk_15` FOREIGN KEY (`last_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of conversations
-- ----------------------------

-- ----------------------------
-- Table structure for interviews
-- ----------------------------
DROP TABLE IF EXISTS `interviews`;
CREATE TABLE `interviews`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `applicationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `scheduledTime` datetime NOT NULL COMMENT '面试时间',
  `duration` int NULL DEFAULT 60 COMMENT '面试时长（分钟）',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '面试地点',
  `interviewType` enum('onsite','phone','video') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'onsite' COMMENT '面试类型',
  `interviewers` json NULL COMMENT '面试官信息',
  `status` enum('scheduled','confirmed','rescheduled','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'scheduled' COMMENT '面试状态',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '面试反馈',
  `result` enum('pending','pass','fail') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending' COMMENT '面试结果',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '备注',
  `reminderSent` tinyint(1) NULL DEFAULT 0 COMMENT '是否已发送提醒',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime NULL DEFAULT NULL,
  `application_id` int UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of interviews
-- ----------------------------

-- ----------------------------
-- Table structure for job_skills
-- ----------------------------
DROP TABLE IF EXISTS `job_skills`;
CREATE TABLE `job_skills`  (
  `job_id` int UNSIGNED NOT NULL,
  `skill_id` int UNSIGNED NOT NULL,
  PRIMARY KEY (`job_id`, `skill_id`) USING BTREE,
  INDEX `fk_job_skills_jobs_idx`(`job_id` ASC) USING BTREE,
  INDEX `fk_job_skills_skills_idx`(`skill_id` ASC) USING BTREE,
  CONSTRAINT `fk_job_skills_jobs` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_job_skills_skills` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of job_skills
-- ----------------------------
INSERT INTO `job_skills` VALUES (1, 15);
INSERT INTO `job_skills` VALUES (1, 16);
INSERT INTO `job_skills` VALUES (1, 17);
INSERT INTO `job_skills` VALUES (2, 1);
INSERT INTO `job_skills` VALUES (2, 2);
INSERT INTO `job_skills` VALUES (2, 3);
INSERT INTO `job_skills` VALUES (2, 4);
INSERT INTO `job_skills` VALUES (2, 18);
INSERT INTO `job_skills` VALUES (3, 11);
INSERT INTO `job_skills` VALUES (3, 12);
INSERT INTO `job_skills` VALUES (3, 13);
INSERT INTO `job_skills` VALUES (3, 14);
INSERT INTO `job_skills` VALUES (4, 5);
INSERT INTO `job_skills` VALUES (4, 6);
INSERT INTO `job_skills` VALUES (4, 7);
INSERT INTO `job_skills` VALUES (5, 19);
INSERT INTO `job_skills` VALUES (5, 20);
INSERT INTO `job_skills` VALUES (5, 21);
INSERT INTO `job_skills` VALUES (5, 22);

-- ----------------------------
-- Table structure for jobs
-- ----------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` int UNSIGNED NOT NULL COMMENT '所属公司ID，外键 references companies(id)',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '职位名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '职位描述',
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '工作地点',
  `salary_range` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '薪资范围（例如：15k-25k）',
  `publish_date` datetime NOT NULL COMMENT '发布日期',
  `experience` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '经验要求（例如：3-5年）',
  `education` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '学历要求（例如：本科及以上）',
  `tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '职位标签，用逗号分隔（例如：React, Vue, 前端开发）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_jobs_companies_idx`(`company_id` ASC) USING BTREE,
  CONSTRAINT `fk_jobs_companies` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jobs
-- ----------------------------
INSERT INTO `jobs` VALUES (1, 1, '前端开发工程师', '负责公司前端项目的开发和维护\n2. 与产品、设计和后端团队紧密协作\n3. 优化前端性能，提升用户体验\n4. 参与技术方案设计和评审', '深圳', '15k-25k', '2024-01-10 09:00:00', '3-5年', '本科及以上', 'React, Vue, 前端开发');
INSERT INTO `jobs` VALUES (2, 2, '后端开发工程师', '负责后端开发，参与项目架构设计和优化。', '北京', '20k-30k', '2024-01-08 14:00:00', '3-5年', '本科及以上', 'Java, Spring, MySQL, 分布式');
INSERT INTO `jobs` VALUES (3, 3, 'UI设计师', '负责产品界面和用户体验设计，提供高质量的设计方案。', '上海', '12k-18k', '2024-01-05 10:00:00', '2年以上', '本科及以上', 'UI设计, UX设计, Figma, Sketch');
INSERT INTO `jobs` VALUES (4, 4, '产品经理', '负责产品规划、设计和项目推进，关注用户体验。', '广州', '18k-25k', '2024-01-03 16:00:00', '2年以上', '本科及以上', '产品设计, 项目管理, 用户体验');
INSERT INTO `jobs` VALUES (5, 5, '数据分析师', '负责数据收集、整理、分析，为业务决策提供支持。', '杭州', '15k-22k', '2024-01-02 11:00:00', '1-3年', '本科及以上', '数据分析, SQL, Python, Tableau');

-- ----------------------------
-- Table structure for jobseekers
-- ----------------------------
DROP TABLE IF EXISTS `jobseekers`;
CREATE TABLE `jobseekers`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `birth_date` date NULL DEFAULT NULL,
  `education` json NULL COMMENT '教育背景，包含学校、专业、学历、起止时间等',
  `experience` json NULL COMMENT '工作经验，包含公司、职位、起止时间、职责描述等',
  `skills` json NULL COMMENT '技能列表，包含技能名称和熟练度',
  `resume_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '简历文件路径',
  `expected_salary` int NULL DEFAULT NULL COMMENT '期望薪资（月薪）',
  `expected_position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '期望职位',
  `expected_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '期望工作地点',
  `self_introduction` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '自我介绍',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jobseekers
-- ----------------------------
INSERT INTO `jobseekers` VALUES ('e227cb16-1419-48d3-8004-7699ab6423e8', '12', 'jobseeker1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-06 07:48:46', '2025-04-06 07:48:46', NULL);

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sender_id` int UNSIGNED NOT NULL COMMENT '发送者ID，外键 references users(id)',
  `receiver_id` int UNSIGNED NOT NULL COMMENT '接收者ID，外键 references users(id)',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '消息内容',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  `conversation_id` int UNSIGNED NOT NULL COMMENT '会话ID，外键 references conversations(id)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_messages_sender_idx`(`sender_id` ASC) USING BTREE,
  INDEX `fk_messages_receiver_idx`(`receiver_id` ASC) USING BTREE,
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of messages
-- ----------------------------

-- ----------------------------
-- Table structure for reviews
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reviewerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '评价者ID',
  `targetId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '评价目标ID（职位ID或求职者ID）',
  `targetType` enum('job','company','jobseeker') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评价目标类型',
  `rating` int NOT NULL COMMENT '评分（1-5）',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '评价内容',
  `pros` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '优点',
  `cons` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '缺点',
  `isAnonymous` tinyint(1) NULL DEFAULT 0 COMMENT '是否匿名',
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending' COMMENT '评价状态',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime NULL DEFAULT NULL,
  `reviewer_id` int UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reviews
-- ----------------------------

-- ----------------------------
-- Table structure for skills
-- ----------------------------
DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '技能名称',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of skills
-- ----------------------------
INSERT INTO `skills` VALUES (13, 'Figma');
INSERT INTO `skills` VALUES (1, 'Java');
INSERT INTO `skills` VALUES (3, 'MySQL');
INSERT INTO `skills` VALUES (21, 'Python');
INSERT INTO `skills` VALUES (15, 'React');
INSERT INTO `skills` VALUES (14, 'Sketch');
INSERT INTO `skills` VALUES (2, 'Spring');
INSERT INTO `skills` VALUES (20, 'SQL');
INSERT INTO `skills` VALUES (22, 'Tableau');
INSERT INTO `skills` VALUES (11, 'UI设计');
INSERT INTO `skills` VALUES (12, 'UX设计');
INSERT INTO `skills` VALUES (16, 'Vue');
INSERT INTO `skills` VALUES (5, '产品设计');
INSERT INTO `skills` VALUES (4, '分布式');
INSERT INTO `skills` VALUES (17, '前端开发');
INSERT INTO `skills` VALUES (18, '后端开发');
INSERT INTO `skills` VALUES (9, '市场分析');
INSERT INTO `skills` VALUES (10, '投资');
INSERT INTO `skills` VALUES (19, '数据分析');
INSERT INTO `skills` VALUES (7, '用户体验');
INSERT INTO `skills` VALUES (8, '金融');
INSERT INTO `skills` VALUES (6, '项目管理');

-- ----------------------------
-- Table structure for user_skills
-- ----------------------------
DROP TABLE IF EXISTS `user_skills`;
CREATE TABLE `user_skills`  (
  `user_id` int UNSIGNED NOT NULL,
  `skill_id` int UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `skill_id`) USING BTREE,
  INDEX `fk_user_skills_users_idx`(`user_id` ASC) USING BTREE,
  INDEX `fk_user_skills_skills_idx`(`skill_id` ASC) USING BTREE,
  CONSTRAINT `fk_user_skills_skills` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_skills_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_skills
-- ----------------------------
INSERT INTO `user_skills` VALUES (1, 15);
INSERT INTO `user_skills` VALUES (1, 16);
INSERT INTO `user_skills` VALUES (1, 17);
INSERT INTO `user_skills` VALUES (2, 1);
INSERT INTO `user_skills` VALUES (2, 2);
INSERT INTO `user_skills` VALUES (2, 18);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码（建议使用哈希加密存储）',
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'seeker' COMMENT '角色：jobseeker求职者，rcompany公司',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '电话号码',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `company_id` int UNSIGNED NULL DEFAULT NULL COMMENT '公司ID，如果用户是招聘者，外键 references companies(id)',
  `realname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '真实姓名',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户头像',
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '个人简介',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `fk_users_companies_idx`(`company_id` ASC) USING BTREE,
  CONSTRAINT `fk_users_companies` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'zhangsan', '$2a$10$passwordhash123', 'seeker', 'zhangsan@example.com', '13800138000', '2025-04-05 16:39:34', NULL, NULL, '张三', '/static/images/default-avatar.png', '求职者，期望从事前端开发相关工作。');
INSERT INTO `users` VALUES (2, 'lisi', '$2a$10$anotherhash456', 'recruiter', 'lisi@example.com', '13987654321', '2025-04-05 16:39:34', NULL, 2, '李四', '/static/images/default-avatar.png', '招聘者，负责公司技术人才招聘。');
INSERT INTO `users` VALUES (3, 'wangwu', '$2a$10$yetanotherhash789', 'admin', 'wangwu@example.com', '13322223333', '2025-04-05 16:39:34', NULL, NULL, '王五', '/static/images/default-avatar.png', '管理员。');
INSERT INTO `users` VALUES (4, 'zhaoliu', '$2a$10$zhaoliuhash', 'recruiter', 'zhaoliu@example.com', '13322224444', '2025-04-05 16:39:34', NULL, 1, '赵六', '/static/images/default-avatar.png', '负责公司招聘');
INSERT INTO `users` VALUES (12, 'jobseeker1', '$2a$10$O7fnKJMFYK4GcyGhHDNA5OVzhPuHYBgcsQ3s846xjLmUalSEcEAJ2', 'jobseeker', 'jobseeker1@example.com', NULL, '2025-04-06 15:48:46', '2025-04-06 15:48:46', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
