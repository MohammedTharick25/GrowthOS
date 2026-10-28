export class AppError extends Error { constructor(message, statusCode = 400) { super(message); this.statusCode = statusCode; } }
export function notFound(req, _res, next) { next(new AppError(`Route not found: ${req.method} ${req.path}`, 404)); }
export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : error.code === 11000 ? 409 : 500);
  const message = status >= 500 ? 'Something went wrong. Please try again.' : error.message;
  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, error: { message, ...(status === 422 && error.fields?.length ? { fields: error.fields } : {}) } });
}
