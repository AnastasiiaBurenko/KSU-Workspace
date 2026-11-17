export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Маршрут не знайдено: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;

  if (statusCode >= 500) {
    console.error('Помилка сервера:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: statusCode >= 500 ? 'Внутрішня помилка сервера' : err.message
  });
};