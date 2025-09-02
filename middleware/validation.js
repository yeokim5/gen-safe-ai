const Joi = require('joi');

/**
 * Validation middleware for system descriptions
 */
const validateSystemDescription = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errorDetails,
        timestamp: new Date().toISOString()
      });
    }

    req.validatedBody = value;
    next();
  };
};

/**
 * Sanitize input to prevent XSS and injection attacks
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    return sanitizeString(obj);
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * Check if request contains potentially malicious content
 */
const checkMaliciousContent = (req, res, next) => {
  const maliciousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /document\./i,
    /window\./i
  ];

  const checkString = (str) => {
    if (typeof str !== 'string') return false;
    return maliciousPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.some(checkObject);
    }
    
    if (obj !== null && typeof obj === 'object') {
      return Object.values(obj).some(checkObject);
    }
    
    return checkString(obj);
  };

  if (req.body && checkObject(req.body)) {
    console.warn('🚨 Malicious content detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      error: 'Malicious content detected',
      message: 'Request contains potentially harmful content',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate API key if provided
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey && process.env.VALID_API_KEYS) {
    const validKeys = process.env.VALID_API_KEYS.split(',');
    if (!validKeys.includes(apiKey)) {
      return res.status(401).json({
        error: 'Invalid API key',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  next();
};

module.exports = {
  validateSystemDescription,
  sanitizeInput,
  checkMaliciousContent,
  validateApiKey
};
