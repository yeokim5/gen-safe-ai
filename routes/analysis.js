const express = require('express');
const Joi = require('joi');
const { generateFMECA, generateFTA } = require('../services/aiService');
const { validateSystemDescription } = require('../middleware/validation');

const router = express.Router();

// Schema for system description validation
const systemDescriptionSchema = Joi.object({
  systemName: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(1000),
  components: Joi.array().items(
    Joi.object({
      name: Joi.string().required().min(2).max(50),
      function: Joi.string().required().min(5).max(200)
    })
  ).min(1).max(20),
  connections: Joi.array().items(
    Joi.object({
      from: Joi.string().required(),
      to: Joi.string().required(),
      description: Joi.string().required().min(5).max(200)
    })
  ).optional(),
  operatingConditions: Joi.object({
    temperature: Joi.string().optional(),
    pressure: Joi.string().optional(),
    environment: Joi.string().optional(),
    powerRequirements: Joi.string().optional()
  }).optional(),
  safetyStandards: Joi.array().items(
    Joi.string().valid('ISO 26262', 'MIL-STD-882E', 'IEC 61508', 'DO-178C', 'ARP4754A')
  ).optional()
});

// Alternative schema for simple text description
const simpleDescriptionSchema = Joi.object({
  description: Joi.string().required().min(20).max(2000)
});

/**
 * POST /api/analysis/generate
 * Generate FMECA and FTA analysis from system description
 */
router.post('/generate', async (req, res, next) => {
  try {
    console.log('📝 Analysis request received:', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Validate input - try structured format first, then simple text
    let validatedInput;
    let isStructured = false;

    try {
      validatedInput = await systemDescriptionSchema.validateAsync(req.body);
      isStructured = true;
      console.log('✅ Structured input validated');
    } catch (structuredError) {
      try {
        validatedInput = await simpleDescriptionSchema.validateAsync(req.body);
        console.log('✅ Simple text input validated');
      } catch (simpleError) {
        return res.status(400).json({
          error: 'Invalid input format',
          details: 'Please provide either a structured system description or a simple text description (minimum 20 characters)',
          structuredFormatExample: {
            systemName: "Forward-Facing Lidar Unit",
            description: "Scans environment to detect obstacles",
            components: [
              { name: "Laser Emitter", function: "Emits laser pulses" },
              { name: "Processing Unit", function: "Calculates distance from raw data" }
            ]
          },
          simpleFormatExample: {
            description: "A brake system for an autonomous vehicle consisting of brake pedal, master cylinder, brake lines, and brake pads..."
          }
        });
      }
    }

    console.log('🤖 Starting AI analysis generation...');
    
    // Generate FMECA and FTA in parallel for better performance
    const [fmecaResult, ftaResult] = await Promise.all([
      generateFMECA(validatedInput, isStructured),
      generateFTA(validatedInput, isStructured)
    ]);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      input: {
        type: isStructured ? 'structured' : 'simple',
        systemName: isStructured ? validatedInput.systemName : 'System Analysis'
      },
      results: {
        fmeca: fmecaResult,
        fta: ftaResult
      },
      metadata: {
        processingTime: Date.now() - req.startTime,
        componentsAnalyzed: isStructured ? validatedInput.components.length : 'N/A',
        safetyStandards: isStructured ? (validatedInput.safetyStandards || ['General']) : ['General']
      }
    };

    console.log('✅ Analysis completed successfully');
    res.json(response);

  } catch (error) {
    console.error('❌ Analysis generation failed:', error);
    next(error);
  }
});

/**
 * POST /api/analysis/validate
 * Validate system description format without generating analysis
 */
router.post('/validate', async (req, res) => {
  try {
    // Try structured validation first
    try {
      await systemDescriptionSchema.validateAsync(req.body);
      return res.json({
        valid: true,
        format: 'structured',
        message: 'Structured system description is valid'
      });
    } catch (structuredError) {
      // Try simple validation
      try {
        await simpleDescriptionSchema.validateAsync(req.body);
        return res.json({
          valid: true,
          format: 'simple',
          message: 'Simple text description is valid'
        });
      } catch (simpleError) {
        return res.status(400).json({
          valid: false,
          errors: {
            structured: structuredError.details,
            simple: simpleError.details
          },
          message: 'Input does not match either structured or simple format'
        });
      }
    }
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      valid: false,
      message: 'Validation service error'
    });
  }
});

/**
 * POST /api/analysis/generate-structure
 * Generate system structure (components, connections, safety standards) with AI
 */
router.post('/generate-structure', async (req, res) => {
  try {
    const { systemName, description } = req.body;
    
    if (!systemName || !description) {
      return res.status(400).json({ 
        error: 'System name and description are required' 
      });
    }

    console.log('🤖 Structure generation request received:', {
      timestamp: new Date().toISOString(),
      systemName,
      ip: req.ip
    });

    // Generate system structure using AI
    const aiService = require('../services/aiService');
    const structureResult = await aiService.generateSystemStructure({
      systemName,
      description
    });

    console.log('✅ Structure generation completed successfully');
    res.json(structureResult);

  } catch (error) {
    console.error('❌ Structure generation failed:', error);
    
    if (error.message.includes('OpenAI')) {
      res.status(503).json({ 
        error: 'AI service temporarily unavailable. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } else if (error.message.includes('rate limit')) {
      res.status(429).json({ 
        error: 'Too many requests. Please wait a moment and try again.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Structure generation failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

/**
 * GET /api/analysis/examples
 * Get example system descriptions
 */
router.get('/examples', (req, res) => {
  const examples = {
    structured: {
      automotive: {
        systemName: "Automotive Brake System",
        description: "Hydraulic brake system for passenger vehicle with ABS capability",
        components: [
          { name: "Brake Pedal", function: "Receives driver input force" },
          { name: "Master Cylinder", function: "Converts pedal force to hydraulic pressure" },
          { name: "Brake Lines", function: "Transmit hydraulic pressure to wheels" },
          { name: "Brake Calipers", function: "Apply clamping force to brake discs" },
          { name: "ABS Controller", function: "Prevents wheel lockup during braking" }
        ],
        connections: [
          { from: "Brake Pedal", to: "Master Cylinder", description: "Mechanical linkage" },
          { from: "Master Cylinder", to: "Brake Lines", description: "Hydraulic fluid under pressure" },
          { from: "Brake Lines", to: "Brake Calipers", description: "Pressurized brake fluid" }
        ],
        operatingConditions: {
          temperature: "-40°C to +85°C",
          pressure: "0 to 180 bar",
          environment: "Automotive under-hood and wheel well"
        },
        safetyStandards: ["ISO 26262"]
      },
      aerospace: {
        systemName: "Aircraft Navigation System",
        description: "Primary navigation system for commercial aircraft",
        components: [
          { name: "GPS Receiver", function: "Receives satellite positioning signals" },
          { name: "Inertial Navigation Unit", function: "Provides position data when GPS unavailable" },
          { name: "Flight Management Computer", function: "Processes navigation data and flight plans" },
          { name: "Display Unit", function: "Shows navigation information to pilots" }
        ],
        connections: [
          { from: "GPS Receiver", to: "Flight Management Computer", description: "Digital position data" },
          { from: "Inertial Navigation Unit", to: "Flight Management Computer", description: "Backup position data" },
          { from: "Flight Management Computer", to: "Display Unit", description: "Processed navigation display data" }
        ],
        safetyStandards: ["DO-178C", "ARP4754A"]
      }
    },
    simple: {
      automotive: "A forward-facing lidar sensor system for an autonomous ground vehicle. The system includes a laser emitter that sends out pulses, a rotating mirror that directs the laser across the field of view, a receiver that detects reflected pulses, and a processing unit that calculates distances and creates point cloud data. The system operates on 24V DC power and communicates with the main vehicle computer via Ethernet to provide obstacle detection capabilities.",
      industrial: "A chemical reactor temperature control system consisting of temperature sensors, a PID controller, control valves, and heating/cooling elements. The system maintains reactor temperature within specified limits to ensure safe chemical processes and prevent runaway reactions.",
      medical: "A patient monitoring system that tracks vital signs including heart rate, blood pressure, oxygen saturation, and temperature. The system includes sensors, signal processing units, display monitors, and alarm systems to alert medical staff of critical changes in patient condition."
    }
  };

  res.json({
    success: true,
    examples: examples,
    usage: {
      structured: "Use for detailed component-level analysis with specific safety standards",
      simple: "Use for quick analysis of systems described in natural language"
    }
  });
});

module.exports = router;
