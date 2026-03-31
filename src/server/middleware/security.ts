import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === 'your-production-secret-key-change-this' || JWT_SECRET === 'your-secret-key') {
  console.error('⚠️  SECURITY WARNING: JWT_SECRET is not properly configured in production!');
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: 'Quá nhiều yêu cầu thanh toán' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { success: false, error: 'Quá nhiều yêu cầu API' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Không có token xác thực' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET || 'fallback-secret') as { userId: string; role: string; iat: number; exp: number };
    
    const tokenAge = Date.now() / 1000 - decoded.iat;
    if (tokenAge > 7 * 24 * 60 * 60) {
      return res.status(401).json({ success: false, error: 'Token đã hết hạn, vui lòng đăng nhập lại' });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
};

export const requireRole = (...roles: string[]) => {
  return async (req: any, res: any, next: any) => {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Chưa xác thực' });
    }

    const user = await query('SELECT role FROM users WHERE id = $1', [req.userId]);
    if (!user.rows[0] || !roles.includes(user.rows[0].role)) {
      return res.status(403).json({ success: false, error: 'Không có quyền truy cập' });
    }
    
    req.userRole = user.rows[0].role;
    next();
  };
};

export const requireAdmin = requireRole('admin', 'super_admin');
export const requireInstructor = requireRole('admin', 'super_admin', 'instructor');
