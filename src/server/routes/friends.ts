import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Không có token' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
};

router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT f.*, 
        u.full_name as friend_name, u.avatar_url as friend_avatar, u.level as friend_level
      FROM friends f
      JOIN users u ON (f.friend_id = u.id AND f.user_id = $1) OR (f.user_id = u.id AND f.friend_id = $1)
      WHERE (f.user_id = $1 OR f.friend_id = $1)
    `;
    const params: any[] = [req.userId];
    
    if (status) {
      sql += ' AND f.status = $2';
      params.push(status);
    }
    sql += ' ORDER BY f.created_at DESC';
    
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT id, email, full_name, avatar_url, level
      FROM users 
      WHERE id != $1 
      AND id NOT IN (
        SELECT CASE WHEN user_id = $1 THEN friend_id ELSE user_id END 
        FROM friends 
        WHERE (user_id = $1 OR friend_id = $1) AND status = 'accepted'
      )
      LIMIT 10
    `, [req.userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/request', authenticate, async (req, res) => {
  try {
    const { friendId } = req.body;
    
    if (friendId === req.userId) {
      return res.status(400).json({ success: false, error: 'Không thể kết bạn với chính mình' });
    }

    const existing = await query(`
      SELECT id FROM friends 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `, [req.userId, friendId]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Đã có lời mời kết bạn' });
    }

    await query(`
      INSERT INTO friends (user_id, friend_id, status)
      VALUES ($1, $2, 'pending')
    `, [req.userId, friendId]);

    res.json({ success: true, message: 'Đã gửi lời mời kết bạn' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await query(`UPDATE friends SET status = 'accepted' WHERE id = $1 AND friend_id = $2`, [id, req.userId]);
    res.json({ success: true, message: 'Đã chấp nhận lời mời kết bạn' });
  } catch (error) {
    console.error('Accept friend error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/:id/decline', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM friends WHERE id = $1 AND friend_id = $2`, [id, req.userId]);
    res.json({ success: true, message: 'Đã từ chối lời mời kết bạn' });
  } catch (error) {
    console.error('Decline friend error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM friends WHERE id = $1 AND (user_id = $2 OR friend_id = $2)`, [id, req.userId]);
    res.json({ success: true, message: 'Đã hủy kết bạn' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
