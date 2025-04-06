const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { check } = require('express-validator');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: 用户认证API
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [jobseeker, company]
 *             example:
 *               username: johndoe
 *               email: john@example.com
 *               password: password123
 *               role: jobseeker
 *     responses:
 *       201:
 *         description: 用户注册成功
 *       400:
 *         description: 参数验证失败
 *       500:
 *         description: 服务器错误
 */
router.post('/register', [
  check('username', '用户名不能为空').not().isEmpty(),
  check('email', '请提供有效的邮箱').isEmail(),
  check('password', '密码长度至少为6个字符').isLength({ min: 6 }),
  check('role', '角色必须为jobseeker或company').isIn(['jobseeker', 'company'])
], authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               username: johndoe
 *               password: password123
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: 参数验证失败
 *       401:
 *         description: 登录失败
 *       500:
 *         description: 服务器错误
 */
router.post('/login', [
  check('username', '用户名不能为空').not().isEmpty(),
  check('password', '密码不能为空').exists()
], authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户信息成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/me', auth, authController.getCurrentUser);

module.exports = router; 