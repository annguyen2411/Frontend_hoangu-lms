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
    const { limit = 20, offset = 0 } = req.query;
    const result = await query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [req.userId, limit, offset]);
    
    const count = await query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false', [req.userId]);
    
    res.json({ 
      success: true, 
      data: result.rows,
      unreadCount: parseInt(count.rows[0].count)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/:id/read', authenticate, async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/read-all', authenticate, async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Create notification helper
export const createNotification = async (userId: string, type: string, title: string, message: string, data?: any) => {
  await query(
    'INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5)',
    [userId, type, title, message, data ? JSON.stringify(data) : null]
  );
};

export default router;
