import { Router, Request, Response, NextFunction, Express } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';
import { ApiResponse } from '../types/database';
import { authenticate, loginLimiter } from '../middleware/security';
import { emailService } from '../utils/email';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
};

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key') {
  console.error('⚠️  WARNING: JWT_SECRET is not properly configured!');
}

interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  total_xp: number;
  coins: number;
  streak: number;
  created_at: string;
}

const registerValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('full_name').isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2-100 ký tự').trim(),
];

router.post('/register', registerValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email đã được sử dụng',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, role, level, xp, total_xp, xp_to_next_level, coins)
       VALUES ($1, $2, $3, 'student', 1, 0, 0, 100, 0)
       RETURNING id, email, full_name, role, avatar_url, level, xp, total_xp, coins, created_at`,
      [email, password_hash, full_name.trim()]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server',
    });
  }
});

const loginValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
];

router.post('/login', loginLimiter, loginValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Email hoặc mật khẩu không đúng',
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email hoặc mật khẩu không đúng',
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server',
    });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Không có token',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const result = await query(
      `SELECT id, email, full_name, role, avatar_url, level, xp, total_xp, xp_to_next_level, coins, streak, completed_quests, language, theme, notification_enabled, created_at
       FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Người dùng không tồn tại',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({
      success: false,
      error: 'Token không hợp lệ',
    });
  }
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const { full_name, avatar_url, language, theme, notification_enabled } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (full_name !== undefined) {
      if (typeof full_name !== 'string' || full_name.length < 2 || full_name.length > 100) {
        return res.status(400).json({ success: false, error: 'Tên phải từ 2-100 ký tự' });
      }
      updates.push(`full_name = $${paramIndex++}`);
      params.push(full_name.trim());
    }

    if (avatar_url !== undefined) {
      if (avatar_url && typeof avatar_url !== 'string') {
        return res.status(400).json({ success: false, error: 'Avatar URL phải là chuỗi' });
      }
      updates.push(`avatar_url = $${paramIndex++}`);
      params.push(avatar_url);
    }

    if (language !== undefined) {
      updates.push(`language = $${paramIndex++}`);
      params.push(language);
    }

    if (theme !== undefined) {
      updates.push(`theme = $${paramIndex++}`);
      params.push(theme);
    }

    if (notification_enabled !== undefined) {
      if (typeof notification_enabled !== 'boolean') {
        return res.status(400).json({ success: false, error: 'notification_enabled phải là boolean' });
      }
      updates.push(`notification_enabled = $${paramIndex++}`);
      params.push(notification_enabled);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Không có dữ liệu để cập nhật' });
    }

    params.push(req.userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} 
       RETURNING id, email, full_name, role, avatar_url, level, xp, total_xp, coins, language, theme, notification_enabled`,
      params
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server',
    });
  }
});

router.put('/password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, error: 'Thiếu mật khẩu' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    
    if (!userResult.rows[0]) {
      return res.status(404).json({ success: false, error: 'Người dùng không tồn tại' });
    }
    
    const validPassword = await bcrypt.compare(current_password, userResult.rows[0].password_hash);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu hiện tại không đúng',
      });
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, req.userId]);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server',
    });
  }
});

// Quên mật khẩu - gửi email reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập email',
      });
    }

    const user = await query('SELECT id, full_name FROM users WHERE email = $1', [email]);
    
    // Always return success to prevent email enumeration
    if (user.rows.length === 0) {
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu',
      });
    }

    // Tạo reset token
    const resetToken = jwt.sign(
      { userId: user.rows[0].id, type: 'reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Lưu token vào database
    await query(
      'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
      [resetToken, user.rows[0].id]
    );

    // Send reset email
    await emailService.sendPasswordResetEmail(email, resetToken);

    // In development, also log the token
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[RESET PASSWORD] Token for ${email}: ${resetToken}`);
    }

    res.json({
      success: true,
      message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu',
      // Demo: trả về token để test (xóa trong production)
      debug_token: resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server',
    });
  }
});

// Đặt lại mật khẩu
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Token và mật khẩu mới là bắt buộc',
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      });
    }

    if (decoded.type !== 'reset') {
      return res.status(400).json({
        success: false,
        error: 'Token không hợp lệ',
      });
    }

    // Kiểm tra token trong database
    const user = await query(
      'SELECT id FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
      [decoded.userId, token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      });
    }

    // Cập nhật mật khẩu mới
    const newPasswordHash = await bcrypt.hash(new_password, 10);
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [newPasswordHash, decoded.userId]
    );

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server',
    });
  }
});

export default router;
