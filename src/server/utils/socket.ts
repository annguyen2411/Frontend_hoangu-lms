import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import logger from './logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  createdAt: Date;
}

class SocketService {
  private io: SocketServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map();

  initialize(httpServer: HttpServer): SocketServer {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; role: string };
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`User connected: ${socket.userId}`);

      if (socket.userId) {
        if (!this.userSockets.has(socket.userId)) {
          this.userSockets.set(socket.userId, new Set());
        }
        this.userSockets.get(socket.userId)?.add(socket.id);

        socket.join(`user:${socket.userId}`);

        if (socket.userRole === 'instructor' || socket.userRole === 'admin') {
          socket.join('staff');
        }
      }

      socket.on('join_course', (courseId: string) => {
        socket.join(`course:${courseId}`);
        logger.debug(`User ${socket.userId} joined course:${courseId}`);
      });

      socket.on('leave_course', (courseId: string) => {
        socket.leave(`course:${courseId}`);
      });

      socket.on('join_study_group', (groupId: string) => {
        socket.join(`study_group:${groupId}`);
      });

      socket.on('leave_study_group', (groupId: string) => {
        socket.leave(`study_group:${groupId}`);
      });

      socket.on('typing', (data: { roomId: string; roomType: string }) => {
        socket.to(`${data.roomType}:${data.roomId}`).emit('user_typing', {
          userId: socket.userId,
          roomId: data.roomId,
          roomType: data.roomType
        });
      });

      socket.on('stop_typing', (data: { roomId: string; roomType: string }) => {
        socket.to(`${data.roomType}:${data.roomId}`).emit('user_stop_typing', {
          userId: socket.userId,
          roomId: data.roomId,
          roomType: data.roomType
        });
      });

      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.userId}`);
        
        if (socket.userId) {
          this.userSockets.get(socket.userId)?.delete(socket.id);
          if (this.userSockets.get(socket.userId)?.size === 0) {
            this.userSockets.delete(socket.userId);
          }
        }
      });
    });

    logger.info('Socket.io initialized');
    return this.io;
  }

  sendNotification(userId: string, notification: NotificationPayload): void {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('notification', notification);
    
    logger.debug(`Notification sent to user ${userId}: ${notification.type}`);
  }

  sendToRoom(roomType: string, roomId: string, event: string, data: any): void {
    if (!this.io) return;

    this.io.to(`${roomType}:${roomId}`).emit(event, data);
  }

  broadcast(event: string, data: any): void {
    if (!this.io) return;

    this.io.emit(event, data);
  }

  sendToStaff(event: string, data: any): void {
    if (!this.io) return;

    this.io.to('staff').emit(event, data);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  sendQuizNotification(userId: string, quizTitle: string, score: number, passed: boolean): void {
    this.sendNotification(userId, {
      id: `quiz_${Date.now()}`,
      type: 'quiz_result',
      title: passed ? 'Quiz Passed!' : 'Quiz Completed',
      message: `You scored ${score}% in "${quizTitle}"`,
      data: { quizTitle, score, passed },
      createdAt: new Date()
    });
  }

  sendAchievementNotification(userId: string, achievementName: string, icon: string): void {
    this.sendNotification(userId, {
      id: `achievement_${Date.now()}`,
      type: 'achievement',
      title: 'Achievement Unlocked! 🎉',
      message: `You earned: ${achievementName}`,
      data: { achievementName, icon },
      createdAt: new Date()
    });
  }

  sendCourseNotification(courseId: string, title: string, message: string, data?: Record<string, any>): void {
    this.sendToRoom('course', courseId, 'course_notification', {
      id: `course_${Date.now()}`,
      type: 'course',
      title,
      message,
      data,
      createdAt: new Date()
    });
  }

  sendNewLessonNotification(courseId: string, lessonTitle: string): void {
    this.sendCourseNotification(
      courseId,
      'New Lesson Available',
      `A new lesson "${lessonTitle}" has been added to your course`,
      { lessonTitle }
    );
  }
}

export const socketService = new SocketService();
