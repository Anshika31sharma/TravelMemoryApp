export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  console.error(`[Error] ${statusCode} - ${message}`, err.stack);
  res.status(statusCode).json({ error: message });
};
