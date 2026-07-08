import express, { Application } from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import config from './config/config';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import trainingRoutes from './routes/training.routes';
import statsRoutes from './routes/stats.routes';

// 加载环境变量
dotenv.config();

const app: Application = express();

// 信任 nginx 代理（正确识别协议和 IP）
app.set('trust proxy', 1);

// 中间件配置
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || '*'
    : '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Session配置
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // nginx 负责 HTTPS，后端本身走 HTTP
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    sameSite: 'lax'
  }
}));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/stats', statsRoutes);

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

export default app;
