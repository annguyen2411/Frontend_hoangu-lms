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
    const result = await query('SELECT * FROM achievements ORDER BY created_at DESC');
    let userAchievements: any[] = [];
    if (req.userId) {
      const userAch = await query('SELECT * FROM user_achievements WHERE user_id = $1', [req.userId]);
      userAchievements = userAch.rows;
    }
    const achievements = result.rows.map(a => {
      const userA = userAchievements.find(ua => ua.achievement_id === a.id);
      return { ...a, unlocked: !!userA, unlockedAt: userA?.unlocked_at };
    });
    res.json({ success: true, data: achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/check', optionalAuth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
    }

    const { type, value } = req.body;
    const achievements = await query('SELECT * FROM achievements WHERE requirement->>\'type\' = $1', [type]);
    const userAchievements = await query('SELECT achievement_id FROM user_achievements WHERE user_id = $1', [req.userId]);
    const unlockedIds = userAchievements.rows.map(ua => ua.achievement_id);

    const newlyUnlocked = [];
    for (const achievement of achievements.rows) {
      if (unlockedIds.includes(achievement.id)) continue;
      
      const requirement = achievement.requirement;
      if (value >= requirement.target) {
        await query(
          'INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING',
          [req.userId, achievement.id]
        );
        
        const reward = achievement.reward || {};
        if (reward.xp || reward.coins) {
          const updates = [];
          const params = [req.userId];
          if (reward.xp) { updates.push(`xp = xp + $${params.length + 1}`); params.push(reward.xp); }
          if (reward.coins) { updates.push(`coins = coins + $${params.length + 1}`); params.push(reward.coins); }
          if (updates.length > 0) {
            await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $1`, params);
          }
        }
        
        newlyUnlocked.push(achievement);
      }
    }

    res.json({ success: true, data: newlyUnlocked });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
