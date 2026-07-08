import { Router } from 'express';
import { login, logout, checkAuth } from '../controllers/auth.controller';

const router = Router();

// 登录
router.post('/login', login);

// 登出
router.post('/logout', logout);

// 检查登录状态
router.get('/check', checkAuth);

export default router;
