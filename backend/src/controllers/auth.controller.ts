import { Request, Response } from 'express';
import { verifyPassword } from '../middleware/auth.middleware';

// 登录处理
export const login = (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: '密码不能为空' });
  }

  if (verifyPassword(password)) {
    (req.session as any).authenticated = true;
    res.json({
      success: true,
      message: '登录成功'
    });
  } else {
    res.status(401).json({
      error: '密码错误'
    });
  }
};

// 登出处理
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: '登出失败' });
    }
    res.json({
      success: true,
      message: '登出成功'
    });
  });
};

// 检查登录状态
export const checkAuth = (req: Request, res: Response) => {
  const isAuthenticated = req.session && (req.session as any).authenticated;
  res.json({
    authenticated: !!isAuthenticated
  });
};
