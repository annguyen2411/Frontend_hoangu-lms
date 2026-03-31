import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Không có token' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Không có quyền admin' });
    }
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
};

// Get all coupons
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Create coupon
router.post('/', authenticate, async (req, res) => {
  try {
    const { code, description, discount_percent, discount_amount_vnd, min_purchase_vnd, max_uses, starts_at, expires_at } = req.body;

    const result = await query(
      `INSERT INTO coupons (code, description, discount_percent, discount_amount_vnd, min_purchase_vnd, max_uses, starts_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [code, description, discount_percent || 0, discount_amount_vnd || 0, min_purchase_vnd || 0, max_uses, starts_at, expires_at]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'Mã giảm giá đã tồn tại' });
    }
    console.error('Create coupon error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Update coupon
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, discount_percent, discount_amount_vnd, min_purchase_vnd, max_uses, is_active, starts_at, expires_at } = req.body;

    const result = await query(
      `UPDATE coupons SET 
        description = COALESCE($1, description),
        discount_percent = COALESCE($2, discount_percent),
        discount_amount_vnd = COALESCE($3, discount_amount_vnd),
        min_purchase_vnd = COALESCE($4, min_purchase_vnd),
        max_uses = COALESCE($5, max_uses),
        is_active = COALESCE($6, is_active),
        starts_at = COALESCE($7, starts_at),
        expires_at = COALESCE($8, expires_at)
       WHERE id = $9
       RETURNING *`,
      [description, discount_percent, discount_amount_vnd, min_purchase_vnd, max_uses, is_active, starts_at, expires_at, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy mã giảm giá' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Delete coupon
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM coupons WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Validate coupon (for checkout)
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { amount } = req.query;

    const result = await query(
      'SELECT * FROM coupons WHERE code = $1 AND is_active = true',
      [code]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'Mã giảm giá không hợp lệ' });
    }

    const coupon = result.rows[0];

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.json({ success: false, error: 'Mã giảm giá đã hết hạn' });
    }

    // Check start date
    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      return res.json({ success: false, error: 'Mã giảm giá chưa có hiệu lực' });
    }

    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return res.json({ success: false, error: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    // Check minimum purchase
    if (coupon.min_purchase_vnd && amount && parseInt(amount.toString()) < coupon.min_purchase_vnd) {
      return res.json({ success: false, error: `Giá trị đơn hàng tối thiểu ${coupon.min_purchase_vnd.toLocaleString('vi-VN')}đ` });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;