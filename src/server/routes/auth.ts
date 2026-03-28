import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';
import { ApiResponse } from '../types/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password và full_name là bắt buộc',
      });
    }

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
      [email, password_hash, full_name]
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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email và password là bắt buộc',
      });
    }

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

router.put('/me', async (req, res) => {
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

    const { full_name, avatar_url, language, theme, notification_enabled } = req.body;

    const result = await query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           avatar_url = COALESCE($2, avatar_url),
           language = COALESCE($3, language),
           theme = COALESCE($4, theme),
           notification_enabled = COALESCE($5, notification_enabled)
       WHERE id = $6
       RETURNING id, email, full_name, role, avatar_url, level, xp, total_xp, coins, language, theme, notification_enabled`,
      [full_name, avatar_url, language, theme, notification_enabled, decoded.userId]
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

router.put('/password', async (req, res) => {
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

    const { current_password, new_password } = req.body;

    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [decoded.userId]);
    const validPassword = await bcrypt.compare(current_password, userResult.rows[0].password_hash);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu hiện tại không đúng',
      });
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, decoded.userId]);

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

export default router;
