const express = require('express');
const router = express.Router();
const skillController = require('../../controllers/skillController');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: 技能管理API
 */

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: 创建新技能
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: "JavaScript"
 *     responses:
 *       201:
 *         description: 创建技能成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth, skillController.createSkill);

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: 获取所有技能
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: 获取技能列表成功
 *       500:
 *         description: 服务器错误
 */
router.get('/', skillController.getAllSkills);

/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     summary: 获取技能详情
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 技能ID
 *     responses:
 *       200:
 *         description: 获取技能详情成功
 *       404:
 *         description: 技能不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', skillController.getSkillById);

/**
 * @swagger
 * /api/skills/{id}:
 *   put:
 *     summary: 更新技能信息
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 技能ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: "JavaScript"
 *     responses:
 *       200:
 *         description: 更新技能信息成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       404:
 *         description: 技能不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth, skillController.updateSkill);

/**
 * @swagger
 * /api/skills/{id}:
 *   delete:
 *     summary: 删除技能
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 技能ID
 *     responses:
 *       200:
 *         description: 删除技能成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 技能不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', auth, skillController.deleteSkill);

/**
 * @swagger
 * /api/skills/{skillId}/jobs:
 *   get:
 *     summary: 获取需要该技能的所有职位
 *     tags: [Skills, Jobs]
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 技能ID
 *     responses:
 *       200:
 *         description: 获取职位列表成功
 *       404:
 *         description: 技能不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:skillId/jobs', skillController.getJobsBySkill);

module.exports = router; 