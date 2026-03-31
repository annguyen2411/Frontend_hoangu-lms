import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { apiLimiter } from './middleware/security';
import logger, { logError } from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { specs, swaggerRouter, swaggerSetup } from './utils/swagger';
import { socketService } from './utils/socket';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import lessonRoutes from './routes/lessons';
import enrollmentRoutes from './routes/enrollments';
import paymentRoutes from './routes/payments';
import progressRoutes from './routes/progress';
import settingsRoutes from './routes/settings';
import adminRoutes from './routes/admin';
import gamificationRoutes from './routes/gamification';
import shopRoutes from './routes/shop';
import communityRoutes from './routes/community';
import couponRoutes from './routes/coupons';
import leaderboardRoutes from './routes/leaderboard';
import achievementsRoutes from './routes/achievements';
import studyGroupsRoutes from './routes/studyGroups';
import friendsRoutes from './routes/friends';
import notificationsRoutes from './routes/notifications';
import instructorsRoutes from './routes/instructors';
import studentRoutes from './routes/student';
import quizRoutes from './routes/quizzes';
import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(requestLogger);
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/study-groups', studyGroupsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/instructors', instructorsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('/api/docs', swaggerRouter, swaggerSetup);
app.get('/api/docs.json', (req, res) => {
  res.json(specs);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError('Server Error:', { 
    message: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method 
  });
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token đã hết hạn' });
  }

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Lỗi server' : err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint không tồn tại' });
});

const server = http.createServer(app);

socketService.initialize(server);

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔌 Socket.io enabled for real-time notifications`);
});

export default app;
