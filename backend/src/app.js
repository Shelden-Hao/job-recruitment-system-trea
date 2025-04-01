const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const socketHandler = require('./socket');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件目录 - 用于存储上传的简历和图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api', routes);

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

sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

module.exports = { app, server };