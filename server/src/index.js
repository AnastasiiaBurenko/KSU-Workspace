import express from 'express';
import cors from 'cors';

import { config } from './config/config.js';
import recordRoutes from './routes/recordRoutes.js';
import { requestLogger } from './middleware/logger.js';
import {
  notFoundHandler,
  errorHandler
} from './middleware/errorHandler.js';

import { initDatabase } from './db/database.js';
import { runSeed } from './db/seed.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(requestLogger);

app.use('/api/records', recordRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await initDatabase();

    await runSeed();

    app.listen(config.port, () => {
      console.log(
        `🚀 Сервер KSU Workspace запущено на порту ${config.port}`
      );
    });
  } catch (err) {
    console.error('Помилка запуску сервера:', err.message);
    process.exitCode = 1;
  }
}

startServer();