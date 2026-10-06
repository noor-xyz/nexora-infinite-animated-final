export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(error, req, res, next) {
  console.error(error)
  if (res.headersSent) return next(error)
  res.status(error.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
  })
}
