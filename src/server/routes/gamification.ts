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

router.get('/quests', optionalAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM quests WHERE is_active = true ORDER BY created_at DESC');
    let userProgress: any[] = [];
    if (req.userId) {
      const progress = await query('SELECT * FROM user_quest_progress WHERE user_id = $1', [req.userId]);
      userProgress = progress.rows;
    }
    const quests = result.rows.map(q => {
      const userP = userProgress.find(p => p.quest_id === q.id);
      return { ...q, userProgress: userP?.progress || 0, isCompleted: userP?.is_completed || false };
    });
    res.json({ success: true, data: quests });
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/quests/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: 'Không có token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const quest = await query('SELECT * FROM quests WHERE id = $1', [id]);
    if (!quest.rows[0]) return res.status(404).json({ success: false, error: 'Quest không tồn tại' });
    
    await query(`INSERT INTO user_quest_progress (user_id, quest_id, progress, is_completed, completed_at) VALUES ($1, $2, $3, true, NOW()) ON CONFLICT (user_id, quest_id) DO UPDATE SET is_completed = true, completed_at = NOW()`, [decoded.userId, id, quest.rows[0].target]);
    
    const rewards = quest.rows[0].rewards;
    await query('UPDATE users SET xp = xp + $1, total_xp = total_xp + $1, coins = coins + $2 WHERE id = $3', [rewards.xp, rewards.coins, decoded.userId]);
    
    res.json({ success: true, data: rewards });
  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/achievements', optionalAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM achievements ORDER BY created_at DESC');
    let userAchievements: string[] = [];
    if (req.userId) {
      const ua = await query('SELECT achievement_id FROM user_achievements WHERE user_id = $1', [req.userId]);
      userAchievements = ua.rows.map(a => a.achievement_id);
    }
    const achievements = result.rows.map(a => ({ ...a, unlocked: userAchievements.includes(a.id) }));
    res.json({ success: true, data: achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const result = await query(`SELECT l.*, u.full_name, u.avatar_url FROM leaderboard l JOIN users u ON l.user_id = u.id ORDER BY l.xp DESC LIMIT 50`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
