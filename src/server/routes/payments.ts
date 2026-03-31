import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';
import { authenticate, paymentLimiter } from '../middleware/security';
import { vnPayService } from '../utils/payment';
import { emailService } from '../utils/email';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const verifyPaymentOwnership = async (req: any, res: any, next: any) => {
  const { id } = req.params;
  const payment = await query('SELECT * FROM payments WHERE id = $1', [id]);
  
  if (payment.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }
  
  if (payment.rows[0].status === 'completed') {
    return res.status(400).json({ success: false, error: 'Payment already completed' });
  }
  
  req.payment = payment.rows[0];
  next();
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

router.post('/vnpay/create', authenticate, paymentLimiter, async (req, res) => {
  try {
    const { payment_id } = req.body;
    const ipAddr = req.ip || '127.0.0.1';

    const payment = await query(
      `SELECT p.*, c.title as course_title FROM payments p 
       LEFT JOIN courses c ON p.course_id = c.id 
       WHERE p.id = $1 AND p.user_id = $2`,
      [payment_id, req.userId]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    if (payment.rows[0].status === 'completed') {
      return res.status(400).json({ success: false, error: 'Payment already completed' });
    }

    const paymentData = payment.rows[0];
    const result = vnPayService.createPaymentUrl({
      amount: paymentData.amount_vnd,
      orderId: paymentData.id,
      orderInfo: `Thanh toán khóa học ${paymentData.course_title}`,
      ipAddr: ipAddr.replace('::ffff:', ''),
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.message });
    }

    await query(
      'UPDATE payments SET payment_method = $1 WHERE id = $2',
      ['vnpay', payment_id]
    );

    res.json({ success: true, data: { paymentUrl: result.paymentUrl } });
  } catch (error) {
    console.error('Create VNPay error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/vnpay/return', async (req, res) => {
  try {
    const params = req.query as Record<string, string>;
    const result = vnPayService.verifyCallback(params);

    if (result.success && result.orderId) {
      await query(
        `UPDATE payments SET status = 'completed', completed_at = NOW(), transaction_id = $1 WHERE id = $2`,
        [params['vnp_TransactionNo'], result.orderId]
      );

      const payment = await query(
        'SELECT p.*, c.title as course_title, u.email, u.full_name FROM payments p LEFT JOIN courses c ON p.course_id = c.id LEFT JOIN users u ON p.user_id = u.id WHERE p.id = $1',
        [result.orderId]
      );

      if (payment.rows[0]) {
        const p = payment.rows[0];
        await query(
          `INSERT INTO enrollments (user_id, course_id, progress, status) VALUES ($1, $2, 0, 'active') ON CONFLICT DO NOTHING`,
          [p.user_id, p.course_id]
        );
        await query(
          'UPDATE courses SET students_enrolled = COALESCE(students_enrolled, 0) + 1 WHERE id = $1',
          [p.course_id]
        );

        emailService.sendPaymentConfirmation(p.email, p.course_title, p.amount_vnd);
      }

      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${result.orderId}`);
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?message=${result.message}`);
  } catch (error) {
    console.error('VNPay return error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?message=Unknown error`);
  }
});

router.post('/:id/complete', authenticate, paymentLimiter, verifyPaymentOwnership, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { transaction_id, payment_signature } = req.body;
    
    if (!req.payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    if (req.payment.user_id !== req.userId) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền với payment này' });
    }

    if (!transaction_id) {
      return res.status(400).json({ success: false, error: 'Thiếu transaction_id' });
    }

    const existingEnrollment = await query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.userId, req.payment.course_id]
    );

    if (existingEnrollment.rows.length === 0) {
      await query(
        `INSERT INTO enrollments (user_id, course_id, progress, status) VALUES ($1, $2, 0, 'active')`,
        [req.userId, req.payment.course_id]
      );
      await query(
        'UPDATE courses SET students_enrolled = COALESCE(students_enrolled, 0) + 1 WHERE id = $1',
        [req.payment.course_id]
      );
    }

    await query(
      `UPDATE payments SET status = 'completed', completed_at = NOW(), transaction_id = $1 WHERE id = $2`,
      [transaction_id, id]
    );

    res.json({ success: true, message: 'Thanh toán thành công' });
  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const { payment_id, status, transaction_id, signature } = req.body;

    if (!payment_id || !status) {
      return res.status(400).json({ success: false, error: 'Invalid webhook data' });
    }

    const payment = await query('SELECT * FROM payments WHERE id = $1', [payment_id]);
    if (payment.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    if (status === 'completed') {
      await query(
        `UPDATE payments SET status = 'completed', completed_at = NOW(), transaction_id = $1 WHERE id = $2`,
        [transaction_id, payment_id]
      );

      const existingEnrollment = await query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [payment.rows[0].user_id, payment.rows[0].course_id]
      );

      if (existingEnrollment.rows.length === 0) {
        await query(
          `INSERT INTO enrollments (user_id, course_id, progress, status) VALUES ($1, $2, 0, 'active')`,
          [payment.rows[0].user_id, payment.rows[0].course_id]
        );
        await query(
          'UPDATE courses SET students_enrolled = COALESCE(students_enrolled, 0) + 1 WHERE id = $1',
          [payment.rows[0].course_id]
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
