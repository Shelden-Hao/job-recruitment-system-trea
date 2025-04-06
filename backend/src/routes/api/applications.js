const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/applicationController');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: 职位申请管理API
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: 创建新申请
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_id
 *               - user_id
 *             properties:
 *               job_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               resume_path:
 *                 type: string
 *               cover_letter_path:
 *                 type: string
 *             example:
 *               job_id: "550e8400-e29b-41d4-a716-446655440000"
 *               user_id: "550e8400-e29b-41d4-a716-446655440001"
 *               resume_path: "/uploads/resumes/resume_123.pdf"
 *               cover_letter_path: "/uploads/cover_letters/cl_123.pdf"
 *     responses:
 *       201:
 *         description: 创建申请成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth, applicationController.createApplication);

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: 获取申请详情
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 获取申请详情成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 申请不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', auth, applicationController.getApplicationById);

/**
 * @swagger
 * /api/applications/{id}:
 *   put:
 *     summary: 更新申请状态
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewing, interviewed, accepted, rejected]
 *               interview_time:
 *                 type: string
 *                 format: date-time
 *             example:
 *               status: "reviewing"
 *     responses:
 *       200:
 *         description: 更新申请状态成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       404:
 *         description: 申请不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth, applicationController.updateApplicationStatus);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: 删除申请
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 删除申请成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 申请不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', auth, applicationController.deleteApplication);

module.exports = router; 