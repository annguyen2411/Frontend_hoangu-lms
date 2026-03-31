import { Router } from 'express';
import { query } from '../db/pool';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { key } = req.query;
    if (key) {
      const result = await query('SELECT * FROM settings WHERE key = $1', [key]);
      return res.json({ success: true, data: result.rows[0] || null });
    }
    const result = await query('SELECT * FROM settings ORDER BY key');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body;
    const result = await query(
      `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING *`,
      [key, value]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const result = await query('UPDATE settings SET value = $1 WHERE key = $2 RETURNING *', [value, key]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    await query('DELETE FROM settings WHERE key = $1', [key]);
    res.json({ success: true, message: 'Xóa cài đặt thành công' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
