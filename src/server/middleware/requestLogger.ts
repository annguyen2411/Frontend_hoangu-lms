import { Request, Response, NextFunction } from 'express';
import { logInfo, logError } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 400) {
      logError(`${req.method} ${req.url} ${res.statusCode}`, logData);
    } else {
      logInfo(`${req.method} ${req.url} ${res.statusCode}`, logData);
    }
  });

  next();
};
