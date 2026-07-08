import { Router } from 'express';
import {
  getSummary,
  getProgress,
  getRecentTrainings,
  getDateRangeStats
} from '../controllers/stats.controller';
import { authenticateSession } from '../middleware/auth.middleware';

const router = Router();

// 所有统计路由都需要认证
router.use(authenticateSession);

// 获取统计概览
router.get('/summary', getSummary);

// 获取项目进步数据
router.get('/progress/:exerciseId', getProgress);

// 获取最近训练记录
router.get('/recent', getRecentTrainings);

// 获取日期范围统计
router.get('/date-range', getDateRangeStats);

export default router;
