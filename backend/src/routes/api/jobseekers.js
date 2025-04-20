const express = require('express');
const router = express.Router();
const jobseekerController = require('../../controllers/jobseekerController');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Jobseekers
 *   description: 求职者管理API
 */

/**
 * @swagger
 * /api/jobseekers/{id}:
 *   get:
 *     summary: 获取求职者信息
 *     tags: [Jobseekers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 求职者ID
 *     responses:
 *       200:
 *         description: 获取求职者信息成功
 *       404:
 *         description: 求职者不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', auth, jobseekerController.getJobseekerById);

/**
 * @swagger
 * /api/jobseekers/{id}:
 *   put:
 *     summary: 更新求职者信息
 *     tags: [Jobseekers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 求职者ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               birthDate:
 *                 type: string
 *                 format: date
 *               education:
 *                 type: object
 *               experience:
 *                 type: object
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *               expectedSalary:
 *                 type: integer
 *               expectedPosition:
 *                 type: string
 *               expectedLocation:
 *                 type: string
 *               selfIntroduction:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新求职者信息成功
 *       400:
 *         description: 参数错误
 *       404:
 *         description: 求职者不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth, jobseekerController.updateJobseeker);

module.exports = router; 