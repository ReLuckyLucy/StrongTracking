import app from './app';
import pool from './config/database';
import config from './config/config';

// 启动服务器
const PORT = config.port;

const startServer = async () => {
  try {
    // 测试数据库连接
    const connected = await pool.getConnection();
    console.log('数据库连接成功');
    connected.release();

    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`环境: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();
