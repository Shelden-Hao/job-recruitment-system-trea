const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/jobController');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: 职位管理API
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: 创建新职位
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - title
 *               - description
 *               - location
 *             properties:
 *               company_id:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               salary_range:
 *                 type: string
 *               publish_date:
 *                 type: string
 *                 format: date
 *               experience:
 *                 type: string
 *               education:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               company_id: "550e8400-e29b-41d4-a716-446655440000"
 *               title: "软件工程师"
 *               description: "负责开发和维护公司的核心产品"
 *               location: "北京"
 *               salary_range: "15k-25k"
 *               experience: "3-5年"
 *               education: "本科及以上"
 *               tags: ["Java", "Spring Boot", "React"]
 *     responses:
 *       201:
 *         description: 创建职位成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth, jobController.createJob);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: 搜索职位
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: 按职位名称筛选
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 按地点筛选
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: 按公司名称筛选
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: 按标签筛选（逗号分隔）
 *       - in: query
 *         name: salary_min
 *         schema:
 *           type: string
 *         description: 最低薪资
 *       - in: query
 *         name: salary_max
 *         schema:
 *           type: string
 *         description: 最高薪资
 *       - in: query
 *         name: experience
 *         schema:
 *           type: string
 *         description: 经验要求
 *       - in: query
 *         name: education
 *         schema:
 *           type: string
 *         description: 学历要求
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取职位列表成功
 *       500:
 *         description: 服务器错误
 */
// router.get('/', jobController.searchJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: 获取职位详情
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 职位ID
 *     responses:
 *       200:
 *         description: 获取职位详情成功
 *       404:
 *         description: 职位不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', jobController.getJobById);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: 更新职位信息
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 职位ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               salary_range:
 *                 type: string
 *               experience:
 *                 type: string
 *               education:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 更新职位信息成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       404:
 *         description: 职位不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth, jobController.updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: 删除职位
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 职位ID
 *     responses:
 *       200:
 *         description: 删除职位成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 职位不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', auth, jobController.deleteJob);

/**
 * @swagger
 * /api/jobs/{jobId}/applications:
 *   get:
 *     summary: 获取职位的所有申请
 *     tags: [Jobs, Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: 职位ID
 *     responses:
 *       200:
 *         description: 获取申请列表成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 职位不存在
 *       500:
 *         description: 服务器错误
 */
// router.get('/:jobId/applications', auth, jobController.getJobApplications); // TODO: 暂不支持

router.get('/', jobController.getJobs);

module.exports = router;
