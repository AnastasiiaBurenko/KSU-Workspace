import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Потрібна авторизація');
    error.status = 401;
    return next(error);
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    next();
  } catch {
    const error = new Error('Недійсний або прострочений токен');
    error.status = 401;
    next(error);
  }
};