import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import config from '../config/config';

// 密码验证中间件
export const verifyPassword = (password: string): boolean => {
  return password === config.appPassword;
};

// Session认证中间件
export const authenticateSession = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).authenticated) {
    next();
  } else {
    res.status(401).json({ error: '未授权，请先登录' });
  }
};

// 密码加密（如果需要哈希密码）
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 验证哈希密码
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
