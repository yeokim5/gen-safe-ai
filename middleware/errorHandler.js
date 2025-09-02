/**
 * Error handling middleware for Gen-SAFE API
 */

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  console.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  }

  // Handle OpenAI API errors
  if (err.message?.includes('OpenAI')) {
    statusCode = 503;
    message = 'AI service temporarily unavailable';
  }

  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'External service unavailable';
  }

  // Rate limiting errors
  if (err.message?.includes('Too many requests')) {
    statusCode = 429;
  }

  const response = {
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err.details || null;
  }

  // Log critical errors
  if (statusCode >= 500) {
    console.error('🚨 Critical error:', {
      error: err,
      request: {
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        body: req.body,
        ip: req.ip
      }
    });
  }

  res.status(statusCode).json(response);
};

/**
 * Async error wrapper to catch async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Request timing middleware
 */
const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  requestTimer
};
