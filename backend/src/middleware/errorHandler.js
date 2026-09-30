function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message)
  const status = err.status || 500
  res.status(status).json({
    message: err.message || 'An unexpected error occurred.',
  })
}

module.exports = errorHandler
