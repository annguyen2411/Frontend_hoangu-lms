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
    const { status, page = '1', limit = '20' } = req.query;
    let sql = 'SELECT p.*, l.title as lesson_title, c.title as course_title FROM payments p LEFT JOIN courses c ON p.course_id = c.id WHERE p.user_id = $1';
    const params: any[] = [req.userId];
    let idx = 2;

    if (status) {
      sql += ` AND p.status = $${idx++}`;
      params.push(status);
    }

    const count = await query(sql.replace('SELECT p.*, l.title as lesson_title, c.title as course_title', 'SELECT COUNT(*)'), params);
    const total = parseInt(count.rows[0].count);

    sql += ` ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(parseInt(limit as string), (parseInt(page as string) - 1) * parseInt(limit as string));

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { course_id, amount_vnd, payment_method } = req.body;
    const result = await query(
      `INSERT INTO payments (user_id, course_id, amount_vnd, payment_method, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [req.userId, course_id, amount_vnd, payment_method]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id } = req.body;
    await query(`UPDATE payments SET status = 'completed', completed_at = NOW(), transaction_id = $1 WHERE id = $2 AND user_id = $3`, [transaction_id, id, req.userId]);
    const payment = await query('SELECT * FROM payments WHERE id = $1', [id]);
    if (payment.rows[0]?.course_id) {
      await query(`INSERT INTO enrollments (user_id, course_id, progress, status) VALUES ($1, $2, 0, 'active') ON CONFLICT DO NOTHING`, [req.userId, payment.rows[0].course_id]);
      await query('UPDATE courses SET students_enrolled = students_enrolled + 1 WHERE id = $1', [payment.rows[0].course_id]);
    }
    res.json({ success: true, message: 'Thanh toán thành công' });
  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
