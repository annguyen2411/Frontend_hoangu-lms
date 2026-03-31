import { Request } from 'express';

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
      payment?: {
        id: string;
        user_id: string;
        course_id: string;
        amount_vnd: number;
        status: string;
      };
    }
  }
}

export {};
