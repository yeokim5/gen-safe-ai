const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const analysisRoutes = require('./routes/analysis');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// API-specific rate limiting for analysis endpoint
const analysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 analysis requests per minute
  message: {
    error: 'Too many analysis requests, please wait before trying again.'
  }
});
app.use('/api/analysis', analysisLimiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://localhost:5500'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from React build directory
const reactBuildPath = path.join(__dirname, 'frontend', 'dist');

if (require('fs').existsSync(reactBuildPath)) {
  console.log('📱 Serving React frontend from:', reactBuildPath);
  app.use(express.static(reactBuildPath));
} else {
  console.error('❌ React build not found. Please run "cd frontend && npm run build"');
  process.exit(1);
}

// API Routes
app.use('/api/analysis', analysisRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve React frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(reactBuildPath, 'index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Gen-SAFE server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  Warning: OPENAI_API_KEY not set in environment variables');
  }
});

module.exports = app;
