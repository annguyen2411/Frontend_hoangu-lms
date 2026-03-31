import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const optionalAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
    } catch {}
  }
  next();
};

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM shop_items WHERE is_active = true';
    const params: any[] = [];
    if (type) {
      sql += ' AND type = $1';
      params.push(type);
    }
    sql += ' ORDER BY price ASC';
    const result = await query(sql, params);

    let purchasedItems: string[] = [];
    if (req.userId) {
      const purchased = await query('SELECT item_id FROM user_shop_purchases WHERE user_id = $1', [req.userId]);
      purchasedItems = purchased.rows.map(p => p.item_id);
    }

    const items = result.rows.map(item => ({ ...item, owned: purchasedItems.includes(item.id) }));
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Get shop items error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/purchase/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: 'Không có token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const item = await query('SELECT * FROM shop_items WHERE id = $1 AND is_active = true', [id]);
    if (!item.rows[0]) return res.status(404).json({ success: false, error: 'Item không tồn tại' });

    const user = await query('SELECT coins FROM users WHERE id = $1', [decoded.userId]);
    if (user.rows[0].coins < item.rows[0].price) {
      return res.status(400).json({ success: false, error: 'Không đủ coins' });
    }

    await query('UPDATE users SET coins = coins - $1 WHERE id = $2', [item.rows[0].price, decoded.userId]);
    await query('INSERT INTO user_shop_purchases (user_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [decoded.userId, id]);

    res.json({ success: true, message: 'Mua thành công', data: { remainingCoins: user.rows[0].coins - item.rows[0].price } });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
