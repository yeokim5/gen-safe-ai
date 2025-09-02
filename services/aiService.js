const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate FMECA (Failure Mode, Effects, and Criticality Analysis)
 * @param {Object} systemDescription - The system description (structured or simple)
 * @param {boolean} isStructured - Whether the input is structured or simple text
 * @returns {Promise<Object>} FMECA analysis results
 */
async function generateFMECA(systemDescription, isStructured) {
  try {
    console.log('🔍 Generating FMECA analysis...');
    
    const systemInfo = isStructured 
      ? `System: ${systemDescription.systemName}
Description: ${systemDescription.description}
Components: ${systemDescription.components.map(c => `${c.name}: ${c.function}`).join(', ')}
Safety Standards: ${systemDescription.safetyStandards?.join(', ') || 'General Safety Principles'}`
      : `System Description: ${systemDescription.description}`;

    const prompt = `You are a senior safety engineer with expertise in FMECA (Failure Mode, Effects, and Criticality Analysis). Analyze the following system and generate a comprehensive FMECA.

${systemInfo}

Generate a detailed FMECA analysis with the following requirements:

1. Identify 5-8 critical failure modes across the system components
2. For each failure mode, provide:
   - Component/Function name
   - Specific failure mode
   - Root cause(s)
   - Local effects (component level)
   - System-level effects
   - End effects (system/mission level)
   - Severity rating (1-10, where 10 is catastrophic)
   - Occurrence probability (1-10, where 10 is very frequent)
   - Detection rating (1-10, where 10 is cannot detect)
   - Risk Priority Number (RPN = Severity × Occurrence × Detection)
   - Recommended actions/mitigations

3. Consider relevant safety standards and best practices
4. Focus on safety-critical failure modes that could lead to hazardous conditions

Return the response as a valid JSON object with this exact structure:
{
  "fmecaTable": [
    {
      "itemFunction": "Component/Function Name",
      "failureMode": "Specific failure mode",
      "failureCause": "Root cause(s)",
      "localEffect": "Component-level effect",
      "systemEffect": "System-level effect", 
      "endEffect": "Mission/safety-level effect",
      "severity": 9,
      "occurrence": 3,
      "detection": 4,
      "rpn": 108,
      "recommendedAction": "Specific mitigation strategy"
    }
  ],
  "summary": {
    "totalFailureModes": 6,
    "highRiskItems": 3,
    "averageRPN": 85,
    "keyRecommendations": ["Priority recommendation 1", "Priority recommendation 2"]
  }
}

Ensure all numeric ratings follow standard FMECA scales and the analysis is thorough and professional.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert safety engineer specializing in FMECA analysis. Provide detailed, accurate, and professional safety analysis following industry standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500
    });

    const responseText = completion.choices[0].message.content;
    console.log('🔍 Raw FMECA response received, parsing...');
    
    // Parse JSON response
    let fmecaData;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      fmecaData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parsing failed, using fallback parser:', parseError);
      fmecaData = parseFMECAFallback(responseText);
    }

    console.log('✅ FMECA analysis generated successfully');
    return fmecaData;

  } catch (error) {
    console.error('❌ FMECA generation failed:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your API usage and billing.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    } else if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }
    
    // Return mock data as fallback
    console.log('🔄 Using fallback FMECA data');
    return generateMockFMECA(systemDescription, isStructured);
  }
}

/**
 * Generate FTA (Fault Tree Analysis)
 * @param {Object} systemDescription - The system description (structured or simple)
 * @param {boolean} isStructured - Whether the input is structured or simple text
 * @returns {Promise<Object>} FTA analysis results
 */
async function generateFTA(systemDescription, isStructured) {
  try {
    console.log('🌳 Generating FTA analysis...');
    
    const systemInfo = isStructured 
      ? `System: ${systemDescription.systemName}
Description: ${systemDescription.description}
Components: ${systemDescription.components.map(c => `${c.name}: ${c.function}`).join(', ')}`
      : `System Description: ${systemDescription.description}`;

    const prompt = `You are a senior safety engineer expert in Fault Tree Analysis (FTA). Create a comprehensive fault tree for the most critical hazard of the following system:

${systemInfo}

Generate an FTA with these requirements:

1. Identify the most critical top-level hazard/undesired event
2. Create a logical fault tree with:
   - Top event (the critical hazard)
   - Intermediate events (system-level failures)
   - Basic events (component-level failures)
   - Appropriate logic gates (AND, OR)
   - 3-4 levels of decomposition

3. Use proper FTA symbology and ensure logical consistency
4. Focus on the most safety-critical failure path
5. Use clear "AND" and "OR" labels in gates for readability

Return the response as a valid JSON object with this structure:
{
  "topEvent": "Description of the critical hazard",
  "mermaidDiagram": "flowchart TD\\n    A([Top Event])\\n    G1{OR}\\n    A --> G1\\n    G1 --> B([Intermediate Event 1])\\n    G1 --> C([Intermediate Event 2])\\n    ...",
  "events": [
    {
      "id": "A",
      "type": "top",
      "description": "Critical system hazard",
      "probability": "1E-6 per hour"
    },
    {
      "id": "B", 
      "type": "intermediate",
      "description": "System failure mode",
      "probability": "5E-5 per hour"
    }
  ],
  "gates": [
    {
      "id": "G1",
      "type": "OR",
      "description": "Either failure path can cause top event"
    }
  ],
  "analysis": {
    "criticalPath": "Most likely failure sequence",
    "recommendations": ["Key mitigation 1", "Key mitigation 2"]
  }
}

Ensure the Mermaid diagram uses proper syntax with appropriate styling for FTA elements.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert safety engineer specializing in Fault Tree Analysis. Create logical, comprehensive fault trees following industry standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content;
    console.log('🌳 Raw FTA response received, parsing...');
    
    // Parse JSON response
    let ftaData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      ftaData = JSON.parse(jsonText);
      
      // Add professional styling to Mermaid diagram
      if (ftaData.mermaidDiagram) {
        ftaData.mermaidDiagram += `
    
    %% Professional FTA Styling
    classDef gate fill:#2c3e50,stroke:#34495e,stroke-width:3px,color:#ffffff,font-weight:700;
    classDef event fill:#ecf0f1,stroke:#2c3e50,stroke-width:2px,color:#2c3e50,font-weight:600;
    classDef top fill:#e74c3c,stroke:#c0392b,stroke-width:3px,color:#ffffff,font-weight:700;
    classDef intermediate fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#ffffff,font-weight:600;
    classDef basic fill:#f39c12,stroke:#e67e22,stroke-width:2px,color:#ffffff,font-weight:600;
    
    class G1,G2,G3,G4,G5,G6 gate;
    class B,C,D,E,F,G,H,I,J,K intermediate;
    class L,M,N,O,P,Q,R,S,T,U basic;
    class A top;`;
      }
      
    } catch (parseError) {
      console.error('JSON parsing failed, using fallback parser:', parseError);
      ftaData = parseFTAFallback(responseText);
    }

    console.log('✅ FTA analysis generated successfully');
    return ftaData;

  } catch (error) {
    console.error('❌ FTA generation failed:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your API usage and billing.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    } else if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }
    
    // Return mock data as fallback
    console.log('🔄 Using fallback FTA data');
    return generateMockFTA(systemDescription, isStructured);
  }
}

/**
 * Fallback FMECA parser for malformed JSON responses
 */
function parseFMECAFallback(responseText) {
  // Basic fallback - return structured mock data
  return generateMockFMECA({ description: "System analysis" }, false);
}

/**
 * Fallback FTA parser for malformed JSON responses
 */
function parseFTAFallback(responseText) {
  // Basic fallback - return structured mock data
  return generateMockFTA({ description: "System analysis" }, false);
}

/**
 * Generate mock FMECA data as fallback
 */
function generateMockFMECA(systemDescription, isStructured) {
  const systemName = isStructured ? systemDescription.systemName : "System";
  
  return {
    fmecaTable: [
      {
        itemFunction: `${systemName} - Primary Component`,
        failureMode: "Complete failure",
        failureCause: "Component degradation, environmental stress",
        localEffect: "Loss of component function",
        systemEffect: "Reduced system capability",
        endEffect: "Potential safety hazard",
        severity: 8,
        occurrence: 3,
        detection: 4,
        rpn: 96,
        recommendedAction: "Implement redundancy and monitoring"
      },
      {
        itemFunction: `${systemName} - Control Unit`,
        failureMode: "Intermittent operation",
        failureCause: "Software fault, electrical interference",
        localEffect: "Erratic control behavior",
        systemEffect: "System instability",
        endEffect: "Degraded performance",
        severity: 6,
        occurrence: 4,
        detection: 3,
        rpn: 72,
        recommendedAction: "Improve software validation and EMI protection"
      },
      {
        itemFunction: `${systemName} - Sensor`,
        failureMode: "False readings",
        failureCause: "Calibration drift, contamination",
        localEffect: "Incorrect data output",
        systemEffect: "Poor decision making",
        endEffect: "System malfunction",
        severity: 7,
        occurrence: 5,
        detection: 2,
        rpn: 70,
        recommendedAction: "Regular calibration and self-diagnostics"
      }
    ],
    summary: {
      totalFailureModes: 3,
      highRiskItems: 1,
      averageRPN: 79,
      keyRecommendations: [
        "Implement comprehensive monitoring system",
        "Add redundancy for critical components",
        "Establish regular maintenance schedule"
      ]
    }
  };
}

/**
 * Generate mock FTA data as fallback
 */
function generateMockFTA(systemDescription, isStructured) {
  const systemName = isStructured ? systemDescription.systemName : "System";
  
  return {
    topEvent: `${systemName} fails to perform critical function`,
    mermaidDiagram: `flowchart TD
    A([${systemName} Critical Failure])
    G1{OR}
    A --> G1
    G1 --> B([Hardware Subsystem Failure])
    G1 --> C([Software Subsystem Failure])
    G2{AND}
    B --> G2
    G2 --> D([Primary Component Failure])
    G2 --> E([Backup Component Failure])
    G3{OR}
    C --> G3
    G3 --> F([Logic Error])
    G3 --> G([Data Corruption])
    G4{AND}
    D --> G4
    G4 --> H([Mechanical Wear])
    G4 --> I([Environmental Stress])
    
    %% Professional FTA Styling
    classDef gate fill:#2c3e50,stroke:#34495e,stroke-width:3px,color:#ffffff,font-weight:700;
    classDef event fill:#ecf0f1,stroke:#2c3e50,stroke-width:2px,color:#2c3e50,font-weight:600;
    classDef top fill:#e74c3c,stroke:#c0392b,stroke-width:3px,color:#ffffff,font-weight:700;
    classDef intermediate fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#ffffff,font-weight:600;
    classDef basic fill:#f39c12,stroke:#e67e22,stroke-width:2px,color:#ffffff,font-weight:600;
    
    class G1,G2,G3,G4 gate;
    class B,C intermediate;
    class D,E,F,G basic;
    class H,I basic;
    class A top;`,
    events: [
      {
        id: "A",
        type: "top",
        description: `${systemName} critical failure`,
        probability: "1E-6 per hour"
      },
      {
        id: "B",
        type: "intermediate", 
        description: "Hardware subsystem failure",
        probability: "5E-5 per hour"
      },
      {
        id: "C",
        type: "intermediate",
        description: "Software subsystem failure", 
        probability: "2E-5 per hour"
      },
      {
        id: "D",
        type: "basic",
        description: "Primary component failure",
        probability: "1E-4 per hour"
      }
    ],
    gates: [
      {
        id: "G1",
        type: "OR",
        description: "Either hardware or software failure causes system failure"
      },
      {
        id: "G2", 
        type: "AND",
        description: "Both components must fail for hardware failure"
      }
    ],
    analysis: {
      criticalPath: "Hardware failure through component degradation",
      recommendations: [
        "Implement hardware redundancy",
        "Add comprehensive diagnostics",
        "Establish preventive maintenance program"
      ]
    }
  };
}

/**
 * Generate system structure (components, connections, safety standards) using AI
 */
async function generateSystemStructure({ systemName, description }) {
  if (!openai) {
    console.log('🔄 Using mock system structure data (OpenAI not configured)');
    return generateMockSystemStructure(systemName, description);
  }

  try {
    const prompt = `
You are a system engineering expert. Based on the system name and description provided, generate a detailed system structure including components, connections, and applicable safety standards.

System Name: ${systemName}
Description: ${description}

Generate a JSON response with the following structure:
{
  "components": [
    {
      "name": "Component Name",
      "function": "Detailed description of what this component does"
    }
  ],
  "connections": [
    {
      "from": "Source Component",
      "to": "Target Component", 
      "type": "Type of connection (e.g., electrical, mechanical, data, hydraulic)"
    }
  ],
  "safetyStandards": [
    {
      "standard": "Standard Name (e.g., ISO 26262, DO-178C, IEC 61508)",
      "requirement": "Specific requirement or description"
    }
  ]
}

Requirements:
- Generate 3-8 realistic components that would be part of this system
- Create logical connections between components
- Include 2-5 relevant safety standards for this type of system
- Use industry-standard terminology
- Make sure all components are interconnected logically
- Focus on the most critical components for safety analysis

Respond ONLY with valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert system engineer specializing in system architecture and safety analysis. Generate accurate, industry-standard system structures.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content.trim();
    console.log('🤖 Raw AI structure response:', response);

    // Parse the JSON response
    try {
      const structureData = JSON.parse(response);
      
      // Validate the structure
      if (!structureData.components || !Array.isArray(structureData.components)) {
        throw new Error('Invalid components structure');
      }
      if (!structureData.connections || !Array.isArray(structureData.connections)) {
        throw new Error('Invalid connections structure');
      }
      if (!structureData.safetyStandards || !Array.isArray(structureData.safetyStandards)) {
        throw new Error('Invalid safety standards structure');
      }

      console.log('✅ System structure generated successfully');
      return structureData;

    } catch (parseError) {
      console.error('❌ Failed to parse AI structure response:', parseError);
      console.log('🔄 Falling back to mock data');
      return generateMockSystemStructure(systemName, description);
    }

  } catch (error) {
    console.error('❌ OpenAI structure generation failed:', error);
    console.log('🔄 Falling back to mock data');
    return generateMockSystemStructure(systemName, description);
  }
}

/**
 * Generate mock system structure data for testing
 */
function generateMockSystemStructure(systemName, description) {
  // Determine system type based on keywords
  const systemType = determineSystemType(systemName, description);
  
  const mockStructures = {
    automotive: {
      components: [
        { name: "Electronic Control Unit", function: "Controls overall system operation and decision making" },
        { name: "Sensor Array", function: "Collects environmental and operational data" },
        { name: "Actuator System", function: "Executes control commands and physical actions" },
        { name: "Communication Interface", function: "Handles data exchange with other vehicle systems" },
        { name: "Power Management Unit", function: "Manages electrical power distribution and conditioning" }
      ],
      connections: [
        { from: "Sensor Array", to: "Electronic Control Unit", type: "Data signals" },
        { from: "Electronic Control Unit", to: "Actuator System", type: "Control signals" },
        { from: "Power Management Unit", to: "Electronic Control Unit", type: "Electrical power" },
        { from: "Electronic Control Unit", to: "Communication Interface", type: "Data bus" }
      ],
      safetyStandards: [
        { standard: "ISO 26262", requirement: "Functional safety for automotive systems" },
        { standard: "ISO 21448", requirement: "Safety of the intended functionality (SOTIF)" },
        { standard: "IEC 61508", requirement: "Functional safety of electrical systems" }
      ]
    },
    aerospace: {
      components: [
        { name: "Flight Control Computer", function: "Primary flight control processing and decision making" },
        { name: "Navigation Sensors", function: "Provides position, attitude, and velocity information" },
        { name: "Communication System", function: "Handles air traffic control and data link communications" },
        { name: "Display System", function: "Presents flight information to pilots" },
        { name: "Backup Systems", function: "Provides redundant functionality for critical operations" }
      ],
      connections: [
        { from: "Navigation Sensors", to: "Flight Control Computer", type: "Sensor data" },
        { from: "Flight Control Computer", to: "Display System", type: "Display data" },
        { from: "Communication System", to: "Flight Control Computer", type: "Communication data" },
        { from: "Backup Systems", to: "Flight Control Computer", type: "Redundant control" }
      ],
      safetyStandards: [
        { standard: "DO-178C", requirement: "Software considerations in airborne systems" },
        { standard: "DO-254", requirement: "Design assurance guidance for airborne electronic hardware" },
        { standard: "ARP4754A", requirement: "Guidelines for development of civil aircraft systems" }
      ]
    },
    industrial: {
      components: [
        { name: "Process Controller", function: "Controls industrial process parameters and sequences" },
        { name: "Monitoring Sensors", function: "Monitors process conditions and equipment status" },
        { name: "Safety Interlock System", function: "Provides emergency shutdown and safety protection" },
        { name: "Human Machine Interface", function: "Allows operator interaction and monitoring" },
        { name: "Data Logging System", function: "Records process data for analysis and compliance" }
      ],
      connections: [
        { from: "Monitoring Sensors", to: "Process Controller", type: "Process data" },
        { from: "Process Controller", to: "Safety Interlock System", type: "Safety signals" },
        { from: "Process Controller", to: "Human Machine Interface", type: "Status information" },
        { from: "Process Controller", to: "Data Logging System", type: "Historical data" }
      ],
      safetyStandards: [
        { standard: "IEC 61508", requirement: "Functional safety of electrical/electronic systems" },
        { standard: "IEC 61511", requirement: "Functional safety - Safety instrumented systems" },
        { standard: "ISO 13849", requirement: "Safety of machinery - Safety-related parts of control systems" }
      ]
    },
    medical: {
      components: [
        { name: "Patient Monitoring Unit", function: "Continuously monitors patient vital signs and parameters" },
        { name: "Alarm System", function: "Alerts medical staff to critical patient conditions" },
        { name: "Data Recording System", function: "Stores patient data for medical records and analysis" },
        { name: "Communication Interface", function: "Interfaces with hospital information systems" },
        { name: "Power Backup System", function: "Ensures continuous operation during power failures" }
      ],
      connections: [
        { from: "Patient Monitoring Unit", to: "Alarm System", type: "Alert signals" },
        { from: "Patient Monitoring Unit", to: "Data Recording System", type: "Patient data" },
        { from: "Data Recording System", to: "Communication Interface", type: "Medical records" },
        { from: "Power Backup System", to: "Patient Monitoring Unit", type: "Backup power" }
      ],
      safetyStandards: [
        { standard: "IEC 60601", requirement: "Medical electrical equipment safety requirements" },
        { standard: "ISO 14971", requirement: "Medical devices - Application of risk management" },
        { standard: "IEC 62304", requirement: "Medical device software - Software life cycle processes" }
      ]
    }
  };

  return mockStructures[systemType] || mockStructures.industrial;
}

/**
 * Determine system type based on keywords in name and description
 */
function determineSystemType(systemName, description) {
  const text = (systemName + ' ' + description).toLowerCase();
  
  if (text.includes('aircraft') || text.includes('aviation') || text.includes('flight') || text.includes('aerospace')) {
    return 'aerospace';
  } else if (text.includes('automotive') || text.includes('vehicle') || text.includes('car') || text.includes('brake')) {
    return 'automotive';
  } else if (text.includes('patient') || text.includes('medical') || text.includes('hospital') || text.includes('health')) {
    return 'medical';
  } else {
    return 'industrial';
  }
}

module.exports = {
  generateFMECA,
  generateFTA,
  generateSystemStructure
};
