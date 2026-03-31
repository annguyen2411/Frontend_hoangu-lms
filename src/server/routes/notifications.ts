import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';
import { socketService } from '../utils/socket';
import { authenticate } from '../middleware/security';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unread === 'true';

    let whereClause = 'WHERE user_id = $1';
    if (unreadOnly) {
      whereClause += ' AND is_read = false';
    }

    const result = await query(
      `SELECT * FROM user_notifications ${whereClause} ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    const count = await query(
      'SELECT COUNT(*) FROM user_notifications WHERE user_id = $1 AND is_read = false',
      [req.userId]
    );

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

router.put('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE user_notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    await query(
      'UPDATE user_notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false',
      [req.userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM user_notifications WHERE id = $1 AND user_id = $2', [id, req.userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/preferences', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      const newPrefs = await query(
        `INSERT INTO notification_preferences (user_id) VALUES ($1) RETURNING *`,
        [req.userId]
      );
      return res.json({ success: true, data: newPrefs.rows[0] });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/preferences', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      email_enabled,
      push_enabled,
      in_app_enabled,
      notify_achievements,
      notify_course_updates,
      notify_community,
      notify_friend_requests,
      notify_quiz_results,
      notify_promotions,
      quiet_hours_start,
      quiet_hours_end
    } = req.body;

    const result = await query(
      `INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, in_app_enabled,
        notify_achievements, notify_course_updates, notify_community, notify_friend_requests,
        notify_quiz_results, notify_promotions, quiet_hours_start, quiet_hours_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (user_id) DO UPDATE SET
         email_enabled = COALESCE($2, notification_preferences.email_enabled),
         push_enabled = COALESCE($3, notification_preferences.push_enabled),
         in_app_enabled = COALESCE($4, notification_preferences.in_app_enabled),
         notify_achievements = COALESCE($5, notification_preferences.notify_achievements),
         notify_course_updates = COALESCE($6, notification_preferences.notify_course_updates),
         notify_community = COALESCE($7, notification_preferences.notify_community),
         notify_friend_requests = COALESCE($8, notification_preferences.notify_friend_requests),
         notify_quiz_results = COALESCE($9, notification_preferences.notify_quiz_results),
         notify_promotions = COALESCE($10, notification_preferences.notify_promotions),
         quiet_hours_start = COALESCE($11, notification_preferences.quiet_hours_start),
         quiet_hours_end = COALESCE($12, notification_preferences.quiet_hours_end),
         updated_at = NOW()
       RETURNING *`,
      [req.userId, email_enabled, push_enabled, in_app_enabled, notify_achievements,
        notify_course_updates, notify_community, notify_friend_requests, notify_quiz_results,
        notify_promotions, quiet_hours_start, quiet_hours_end]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> => {
  const result = await query(
    `INSERT INTO user_notifications (user_id, type, title, message, data, is_delivered)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING *`,
    [userId, type, title, message, data ? JSON.stringify(data) : null]
  );

  const notification = result.rows[0];

  const prefs = await query(
    'SELECT * FROM notification_preferences WHERE user_id = $1',
    [userId]
  );

  const shouldNotify = prefs.rows.length === 0 || prefs.rows[0].in_app_enabled;

  if (shouldNotify && socketService.isUserOnline(userId)) {
    socketService.sendNotification(userId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      createdAt: notification.created_at
    });
  }
};

export const broadcastNotification = async (
  type: string,
  title: string,
  message: string,
  data?: Record<string, any>,
  targetRole?: string
): Promise<void> => {
  const result = await query(
    `INSERT INTO user_notifications (user_id, type, title, message, data)
     SELECT id, $1, $2, $3, $4 FROM users WHERE ($5 IS NULL OR role = $5)`,
    [type, title, message, data ? JSON.stringify(data) : null, targetRole]
  );

  socketService.broadcast('notification', {
    type,
    title,
    message,
    data,
    createdAt: new Date()
  });
};

export default router;
