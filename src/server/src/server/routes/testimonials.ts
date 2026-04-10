import { Router } from 'express';
import { query } from '../db/pool';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT quote, author, rating, created_at FROM testimonials WHERE is_published = true ORDER BY created_at DESC LIMIT 10'
    );

    if (result.rows.length > 0) {
      return res.json({
        success: true,
        data: result.rows,
      });
    }

    res.json({
      success: true,
      data: [
        {
          quote: 'Sau 3 tháng mình đã đạt HSK3. Lộ trình rất rõ ràng, giảng viên nhiệt tình!',
          author: 'Minh Anh',
        },
        { quote: 'Phát âm chuẩn như người bản xứ. Cảm ơn HoaNgữ rất nhiều!', author: 'Đức Huy' },
        { quote: 'Gamification khiến mình học mỗi ngày không thấy chán!', author: 'Phương Linh' },
      ],
    });
  } catch (error) {
    res.json({
      success: true,
      data: [
        {
          quote: 'Sau 3 tháng mình đã đạt HSK3. Lộ trình rất rõ ràng, giảng viên nhiệt tình!',
          author: 'Minh Anh',
        },
        { quote: 'Phát âm chuẩn như người bản xứ. Cảm ơn HoaNgữ rất nhiều!', author: 'Đức Huy' },
        { quote: 'Gamification khiến mình học mỗi ngày không thấy chán!', author: 'Phương Linh' },
      ],
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { quote, rating } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập' });
    }

    if (!quote) {
      return res.status(400).json({ success: false, error: 'Nội dung không được để trống' });
    }

    const result = await query(
      'INSERT INTO testimonials (user_id, quote, rating, is_published) VALUES ($1, $2, $3, false) RETURNING *',
      [userId, quote, rating || 5]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
