const express = require('express');
const router = express.Router();
const companyController = require('../../controllers/companyController');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: 公司管理API
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: 获取所有公司列表
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: 按公司名称筛选
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: 按行业筛选
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 按地点筛选
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
 *         description: 获取公司列表成功
 *       500:
 *         description: 服务器错误
 */
router.get('/', companyController.getAllCompanies);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: 获取指定公司详情
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 公司ID
 *     responses:
 *       200:
 *         description: 获取公司详情成功
 *       404:
 *         description: 公司不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', companyController.getCompanyById);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: 更新公司信息
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 公司ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               logo:
 *                 type: string
 *               industry:
 *                 type: string
 *               size:
 *                 type: string
 *               location:
 *                 type: string
 *               founded_year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新公司信息成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       404:
 *         description: 公司不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth, companyController.updateCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: 删除公司
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 公司ID
 *     responses:
 *       200:
 *         description: 删除公司成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 公司不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', auth, companyController.deleteCompany);

/**
 * @swagger
 * /api/companies/{companyId}/jobs:
 *   get:
 *     summary: 获取公司发布的所有职位
 *     tags: [Companies, Jobs]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: 公司ID
 *     responses:
 *       200:
 *         description: 获取职位列表成功
 *       404:
 *         description: 公司不存在
 *       500:
 *         description: 服务器错误
 */
// router.get('/:companyId/jobs', companyController.getCompanyJobs); // TODO: 暂不支持

/**
 * @swagger
 * /api/companies/{companyId}/reviews:
 *   get:
 *     summary: 获取公司的所有评论
 *     tags: [Companies, Reviews]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: 公司ID
 *     responses:
 *       200:
 *         description: 获取评论列表成功
 *       404:
 *         description: 公司不存在
 *       500:
 *         description: 服务器错误
 */
// router.get('/:companyId/reviews', companyController.getCompanyReviews); // TODO: 暂不支持

module.exports = router;
