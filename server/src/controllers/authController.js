import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { userService } from '../services/userService.js';

const validateCredentials = (username, password) => {
  const errors = {};
  if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 30) {
    errors.username = "Ім'я користувача має містити від 3 до 30 символів";
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    errors.password = 'Пароль має містити від 8 до 72 символів';
  }
  return errors;
};

const invalidCredentials = () => {
  const error = new Error('Невірний логін або пароль');
  error.status = 401;
  return error;
};

export const authController = {
  async register(req, res, next) {
    try {
      const { username, password } = req.body;
      const errors = validateCredentials(username, password);

      if (Object.keys(errors).length > 0) {
        return res.status(422).json({
          status: 'error',
          message: 'Помилка валідації вхідних даних',
          errors
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await userService.create(username.trim(), passwordHash);
      res.status(201).json(user);
    } catch (err) {
      if (err.code === '23505') {
        const error = new Error("Користувач з таким ім'ям уже існує");
        error.status = 409;
        return next(error);
      }
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (typeof username !== 'string' || typeof password !== 'string') {
        return next(invalidCredentials());
      }

      const user = await userService.getByUsername(username.trim());
      const isValid = user && (await bcrypt.compare(password, user.password_hash));
      if (!isValid) {
        return next(invalidCredentials());
      }

      const token = jwt.sign(
        { sub: user.id, username: user.username },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
      next(err);
    }
  }
};