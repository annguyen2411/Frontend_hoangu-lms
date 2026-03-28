import { Router } from 'express';
import { query } from '../db/pool';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        l.*,
        u.full_name,
        u.avatar_url,
        u.level
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.rank ASC
      LIMIT 50
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/my-rank', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const result = await query(`
      SELECT l.*, u.full_name, u.avatar_url, u.level
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      WHERE l.user_id = $1
    `, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get my rank error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const users = await query(`
      SELECT 
        u.id as user_id,
        COALESCE(u.xp, 0) as xp,
        COALESCE(u.coins, 0) as coins,
        COALESCE(u.streak, 0) as streak,
        COALESCE((
          SELECT COUNT(*) FROM lesson_progress lp 
          JOIN lessons l ON lp.lesson_id = l.id 
          WHERE lp.user_id = u.id AND lp.is_completed = true
        ), 0) as lessons_completed
      FROM users u
      WHERE u.role = 'student'
    `);

    for (let i = 0; i < users.rows.length; i++) {
      const user = users.rows[i];
      await query(`
        INSERT INTO leaderboard (user_id, xp, coins, streak, lessons_completed, rank)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO UPDATE SET
          xp = $2,
          coins = $3,
          streak = $4,
          lessons_completed = $5,
          rank = $6,
          updated_at = NOW()
      `, [user.user_id, user.xp, user.coins, user.streak, user.lessons_completed, i + 1]);
    }

    const result = await query(`
      SELECT l.*, u.full_name, u.avatar_url, u.level
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.rank ASC
      LIMIT 50
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Refresh leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
