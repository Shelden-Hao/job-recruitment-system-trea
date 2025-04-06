const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/reviewController');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 公司评论管理API
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: 创建新评论
 *     tags: [Reviews]
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
 *               - user_id
 *               - content
 *               - rating
 *             properties:
 *               company_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               pros:
 *                 type: string
 *               cons:
 *                 type: string
 *               position:
 *                 type: string
 *             example:
 *               company_id: "550e8400-e29b-41d4-a716-446655440000"
 *               user_id: "550e8400-e29b-41d4-a716-446655440001"
 *               content: "这是一家非常好的公司，工作环境优良，福利待遇丰厚。"
 *               rating: 5
 *               pros: "福利好，团队和谐，工作有挑战性"
 *               cons: "加班较多"
 *               position: "软件工程师"
 *     responses:
 *       201:
 *         description: 创建评论成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: 获取评论详情
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 获取评论详情成功
 *       404:
 *         description: 评论不存在
 *       500:
 *         description: 服务器错误
 */
// router.get('/:id', reviewController.getReviewById); // TODO: 暂不支持

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: 更新评论
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               pros:
 *                 type: string
 *               cons:
 *                 type: string
 *             example:
 *               content: "修改后的评论内容"
 *               rating: 4
 *               pros: "修改后的优点"
 *               cons: "修改后的缺点"
 *     responses:
 *       200:
 *         description: 更新评论成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       404:
 *         description: 评论不存在
 *       500:
 *         description: 服务器错误
 */
// router.put('/:id', auth, reviewController.updateReview); // TODO: 暂不支持

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: 删除评论
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 删除评论成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 评论不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', auth, reviewController.deleteReview);

/**
 * @swagger
 * /api/reviews/helpful/{id}:
 *   put:
 *     summary: 标记评论为有帮助
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 标记成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 评论不存在
 *       500:
 *         description: 服务器错误
 */
// router.put('/helpful/:id', auth, reviewController.markReviewAsHelpful); // TODO: 暂不支持

module.exports = router;
