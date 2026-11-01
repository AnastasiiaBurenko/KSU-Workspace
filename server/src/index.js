import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import recordRoutes from './routes/recordRoutes.js';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(requestLogger);

app.use('/api/records', recordRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Сервер KSU Workspace запущено на порту ${config.port}`);
});