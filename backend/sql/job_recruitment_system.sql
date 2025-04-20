/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80200
 Source Host           : localhost:3306
 Source Schema         : job_recruitment_system

 Target Server Type    : MySQL
 Target Server Version : 80200
 File Encoding         : 65001

 Date: 15/04/2025 10:54:38
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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of applications
-- ----------------------------
INSERT INTO `applications` VALUES (3, 12, 5, '2025-04-08 10:40:57', 'pending', '123456@qq.com', 'gongsi@163.net', '2025-04-08 10:42:47', '2025-04-08 10:41:20', '2025-04-08 10:41:23', 'e227cb16-1419-48d3-8004-7699ab6423e8');

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
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of companies
-- ----------------------------
INSERT INTO `companies` VALUES (6, 'company1', NULL, NULL, NULL, NULL, NULL, '2025-04-07 01:35:09', '2025-04-07 01:35:09', NULL);
INSERT INTO `companies` VALUES (7, 'company1', NULL, NULL, NULL, NULL, NULL, '2025-04-07 01:37:40', '2025-04-07 01:37:40', 14);

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
  `gender` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `birth_date` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `education` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '教育背景，包含学校、专业、学历、起止时间等',
  `experience` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '工作经验，包含公司、职位、起止时间、职责描述等',
  `skills` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '技能列表，包含技能名称和熟练度',
  `resume_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '简历文件路径',
  `expected_salary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '期望薪资（月薪）',
  `expected_position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '期望职位',
  `expected_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '期望工作地点',
  `self_introduction` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '自我介绍',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of jobseekers
-- ----------------------------
INSERT INTO `jobseekers` VALUES ('e227cb16-1419-48d3-8004-7699ab6423e8', '12', 'jobseeker1', '男', '2005-04-13', '本科', '1年工作经验', '1. 熟练使用Vue.js', NULL, '15K-25k', '前端开发工程师', '深圳', '我是一名学习前端两年半的大学生。', '2025-04-06 07:48:46', '2025-04-06 07:48:46', NULL);

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sender_id` int UNSIGNED NULL DEFAULT NULL COMMENT '发送者ID，外键 references users(id)',
  `receiver_id` int UNSIGNED NULL DEFAULT NULL COMMENT '接收者ID，外键 references users(id)',
  `lastMessage` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '消息内容',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `conversation_id` int UNSIGNED NULL DEFAULT NULL COMMENT '会话ID，外键 references conversations(id)',
  `unread` tinyint NULL DEFAULT NULL COMMENT '是否未读 0-true 1-false',
  `unreadCount` int NULL DEFAULT NULL COMMENT '未读消息条数',
  `lastTime` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '消息最后发送时间',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '头像',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '姓名',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_messages_sender_idx`(`sender_id` ASC) USING BTREE,
  INDEX `fk_messages_receiver_idx`(`receiver_id` ASC) USING BTREE,
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of messages
-- ----------------------------
INSERT INTO `messages` VALUES (9, NULL, NULL, '您好，我看到您对前端开发工程师职位感兴趣', '2025-04-11 10:44:57', NULL, 0, 2, '10:30', '/static/images/default-avatar.png', '张三');
INSERT INTO `messages` VALUES (10, NULL, NULL, '这个职位需要3年以上的前端开发经验，熟悉Vue和React框架', '2025-04-11 10:49:05', NULL, 1, 0, '昨天', '/static/images/default-avatar.png', '李四');
INSERT INTO `messages` VALUES (11, NULL, NULL, '已收到您的简历，我们会尽快安排面试', '2025-04-11 10:49:41', NULL, 0, 1, '周一', '/static/images/default-avatar.png', '王五');
INSERT INTO `messages` VALUES (12, NULL, NULL, '您好，请问您有Java开发经验吗？', '2025-04-11 10:50:12', NULL, 1, 0, '上周五', '/static/images/default-avatar.png', '赵六');
INSERT INTO `messages` VALUES (13, NULL, NULL, '恭喜您通过我们的面试，请问您什么时候可以入职？', '2025-04-11 10:50:45', NULL, 0, 3, '2024/03/20', '/static/images/company-logo.png', '科技有限公司');

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'zhangsan', '$2a$10$passwordhash123', 'seeker', 'zhangsan@example.com', '13800138000', '2025-04-05 16:39:34', NULL, NULL, '张三', '/static/images/default-avatar.png', '求职者，期望从事前端开发相关工作。');
INSERT INTO `users` VALUES (2, 'lisi', '$2a$10$anotherhash456', 'recruiter', 'lisi@example.com', '13987654321', '2025-04-05 16:39:34', NULL, 2, '李四', '/static/images/default-avatar.png', '招聘者，负责公司技术人才招聘。');
INSERT INTO `users` VALUES (3, 'wangwu', '$2a$10$yetanotherhash789', 'admin', 'wangwu@example.com', '13322223333', '2025-04-05 16:39:34', NULL, NULL, '王五', '/static/images/default-avatar.png', '管理员。');
INSERT INTO `users` VALUES (4, 'zhaoliu', '$2a$10$zhaoliuhash', 'recruiter', 'zhaoliu@example.com', '13322224444', '2025-04-05 16:39:34', NULL, 1, '赵六', '/static/images/default-avatar.png', '负责公司招聘');
INSERT INTO `users` VALUES (12, 'jobseeker1', '$2a$10$O7fnKJMFYK4GcyGhHDNA5OVzhPuHYBgcsQ3s846xjLmUalSEcEAJ2', 'jobseeker', 'jobseeker1@example.com', '13345657788', '2025-04-06 15:48:46', '2025-04-07 14:13:11', NULL, 'jobseeker1', '/static/images/default-avatar.png', '求职者，期望从事前端开发相关工作。');
INSERT INTO `users` VALUES (14, 'company1', '$2a$10$lJJnV2.jinSXSSjVlbZsDuho6nLlrV7rUxBcsj1R9nTV5wedfsfSC', 'company', 'company1@qq.com', '14522338899', '2025-04-07 09:37:39', '2025-04-07 14:13:11', NULL, 'company1', '/static/images/default-avatar.png', '招聘者，负责公司技术人才招聘。');

SET FOREIGN_KEY_CHECKS = 1;
