const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/messageController');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: 消息管理API
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: 发送消息
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender_id
 *               - receiver_id
 *               - content
 *             properties:
 *               sender_id:
 *                 type: string
 *               receiver_id:
 *                 type: string
 *               content:
 *                 type: string
 *               content_type:
 *                 type: string
 *                 enum: [text, image, file]
 *                 default: text
 *               related_to:
 *                 type: string
 *               related_type:
 *                 type: string
 *                 enum: [job, application, interview]
 *             example:
 *               sender_id: "550e8400-e29b-41d4-a716-446655440000"
 *               receiver_id: "550e8400-e29b-41d4-a716-446655440001"
 *               content: "您好，我对您的职位申请非常感兴趣，希望能够了解更多信息。"
 *               content_type: "text"
 *               related_to: "550e8400-e29b-41d4-a716-446655440002"
 *               related_type: "job"
 *     responses:
 *       201:
 *         description: 发送消息成功
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth, messageController.sendMessage);

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   put:
 *     summary: 标记消息为已读
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: 消息ID
 *     responses:
 *       200:
 *         description: 标记消息为已读成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 消息不存在
 *       500:
 *         description: 服务器错误
 */
// router.put('/:messageId/read', auth, messageController.markMessageAsRead); // TODO: 暂不支持

/**
 * @swagger
 * /api/conversations/{conversationId}/messages:
 *   get:
 *     summary: 获取会话中的所有消息
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *     responses:
 *       200:
 *         description: 获取消息列表成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 会话不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/conversations/:conversationId/messages', auth, messageController.getConversationMessages);

/**
 * @swagger
 * /api/conversations/{conversationId}/read:
 *   put:
 *     summary: 标记会话中所有消息为已读
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *     responses:
 *       200:
 *         description: 标记所有消息为已读成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 会话不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/conversations/:conversationId/read', auth, messageController.markConversationAsRead);

module.exports = router;
