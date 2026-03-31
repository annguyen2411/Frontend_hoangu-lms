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

router.get('/lesson/:lessonId', authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const result = await query('SELECT * FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2', [req.userId, lessonId]);
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await query('SELECT id FROM lessons WHERE course_id = $1 AND is_published = true', [courseId]);
    const lessonIds = lessons.rows.map(l => l.id);
    if (lessonIds.length === 0) return res.json({ success: true, data: {} });
    const result = await query('SELECT lesson_id, is_completed, watched_seconds FROM lesson_progress WHERE user_id = $1 AND lesson_id = ANY($2)', [req.userId, lessonIds]);
    const progressMap: Record<string, any> = {};
    result.rows.forEach(p => { progressMap[p.lesson_id] = { is_completed: p.is_completed, watched_seconds: p.watched_seconds }; });
    res.json({ success: true, data: progressMap });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { lesson_id, is_completed, watched_seconds } = req.body;
    const result = await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, is_completed, watched_seconds, completed_at)
       VALUES ($1, $2, $3, $4, CASE WHEN $3 = true THEN NOW() ELSE NULL END)
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET is_completed = $3, watched_seconds = $4, completed_at = CASE WHEN $3 = true THEN NOW() ELSE NULL END
       RETURNING *`,
      [req.userId, lesson_id, is_completed, watched_seconds]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
