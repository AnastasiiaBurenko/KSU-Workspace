import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { initDatabase } from './db/database.js';
import recordRoutes from './routes/recordRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

if (!config.jwtSecret) {
  console.error('Не задано JWT_SECRET у змінних середовища');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

initDatabase()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Сервер KSU Workspace запущено на порту ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('Помилка запуску бази даних:', err);
  });