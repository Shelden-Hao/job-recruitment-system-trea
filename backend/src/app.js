const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require('./models');
// 更改为单独导入各个路由模块
const authRoutes = require('./routes/api/auth');
const userRoutes = require('./routes/api/users');
const companyRoutes = require('./routes/api/companies');
const jobRoutes = require('./routes/api/jobs');
const applicationRoutes = require('./routes/api/applications');
const skillRoutes = require('./routes/api/skills');
const messageRoutes = require('./routes/api/messages');
const reviewRoutes = require('./routes/api/reviews');
const resumeRoutes = require('./routes/api/resumes');
const jobseekerRoutes = require('./routes/api/jobseekers');
const socketHandler = require('./socket');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // 允许所有来源，生产环境应该限制
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  transports: ['websocket', 'polling'], // 支持WebSocket和轮询
  pingTimeout: 30000, // 超时设置
  pingInterval: 25000, // 心跳间隔
  path: '/socket.io', // 确保路径正确
  serveClient: true, // 提供Socket.IO客户端代码
  connectTimeout: 45000 // 连接超时
});

// 输出Socket.IO配置信息
console.log('Socket.IO配置已完成，传输方式:', io.engine.opts.transports);
console.log('Socket.IO CORS设置:', io.engine.opts.cors);

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '招聘系统 API',
      version: '1.0.0',
      description: '招聘系统的API文档',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: '开发服务器'
      }
    ],
  },
  apis: ['./src/routes/api/*.js', './src/models/*.js', './src/controllers/*.js'], // 更新路径包含api子目录
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件目录 - 用于存储上传的简历和图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 直接注册各个模块路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobseekers', jobseekerRoutes);

// swagger json 路由
app.get('/api-swagger.json', (req, res) => {
  res.json(swaggerDocs);
});

// 基础路由
app.get('/', (req, res) => {
  res.send('招聘系统API服务正在运行');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: '服务器内部错误', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// 设置WebSocket
socketHandler(io);

// 数据库连接与服务器启动
const PORT = process.env.PORT || 3000;

// 完全禁用自动同步，仅建立数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`Swagger文档可在 http://localhost:${PORT}/api-docs 访问`);
    });
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

module.exports = { app, server };
