import React, { useState, useEffect } from 'react';
import './InputSection.css';

const InputSection = ({ value, onChange, onConvert, isLoading, error }) => {
  // Always in AI-assisted mode now
  const [systemName, setSystemName] = useState('');
  const [description, setDescription] = useState('');
  const [components, setComponents] = useState([{ name: '', function: '' }]);
  const [connections, setConnections] = useState([{ from: '', to: '', type: '' }]);
  const [safetyStandards, setSafetyStandards] = useState([{ standard: '', requirement: '' }]);
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);

  // Update parent component when form data changes
  useEffect(() => {
    const yamlData = generateYAML();
    onChange(yamlData);
  }, [systemName, description, components, connections, safetyStandards, onChange]);

  const generateYAML = () => {
    if (!systemName && !description && components.every(c => !c.name && !c.function)) {
      return '';
    }

    let yaml = '';
    if (systemName) yaml += `systemName: ${systemName}\n`;
    if (description) yaml += `description: ${description}\n`;
    
    if (components.some(c => c.name || c.function)) {
      yaml += 'components:\n';
      components.forEach(component => {
        if (component.name || component.function) {
          yaml += `  - name: ${component.name || 'Unnamed Component'}\n`;
          yaml += `    function: ${component.function || 'Function not specified'}\n`;
        }
      });
    }

    if (connections.some(c => c.from || c.to || c.type)) {
      yaml += 'connections:\n';
      connections.forEach(connection => {
        if (connection.from || connection.to || connection.type) {
          yaml += `  - from: ${connection.from || 'Unknown'}\n`;
          yaml += `    to: ${connection.to || 'Unknown'}\n`;
          yaml += `    type: ${connection.type || 'Unknown'}\n`;
        }
      });
    }

    if (safetyStandards.some(s => s.standard || s.requirement)) {
      yaml += 'safetyStandards:\n';
      safetyStandards.forEach(safety => {
        if (safety.standard || safety.requirement) {
          yaml += `  - standard: ${safety.standard || 'Unknown Standard'}\n`;
          yaml += `    requirement: ${safety.requirement || 'Requirement not specified'}\n`;
        }
      });
    }
    
    return yaml;
  };

  const addComponent = () => {
    setComponents([...components, { 
      name: '', 
      function: '' 
    }]);
  };

  const removeComponent = (index) => {
    if (components.length > 1) {
      const newComponents = components.filter((_, i) => i !== index);
      setComponents(newComponents);
    }
  };

  const updateComponent = (index, field, value) => {
    const newComponents = [...components];
    newComponents[index][field] = value;
    setComponents(newComponents);
  };

  // Connection management functions
  const addConnection = () => {
    setConnections([...connections, { 
      from: '', 
      to: '', 
      type: '' 
    }]);
  };

  const removeConnection = (index) => {
    if (connections.length > 1) {
      const newConnections = connections.filter((_, i) => i !== index);
      setConnections(newConnections);
    }
  };

  const updateConnection = (index, field, value) => {
    const newConnections = [...connections];
    newConnections[index][field] = value;
    setConnections(newConnections);
  };

  // Safety standards management functions
  const addSafetyStandard = () => {
    setSafetyStandards([...safetyStandards, { 
      standard: '', 
      requirement: '' 
    }]);
  };

  const removeSafetyStandard = (index) => {
    if (safetyStandards.length > 1) {
      const newStandards = safetyStandards.filter((_, i) => i !== index);
      setSafetyStandards(newStandards);
    }
  };

  const updateSafetyStandard = (index, field, value) => {
    const newStandards = [...safetyStandards];
    newStandards[index][field] = value;
    setSafetyStandards(newStandards);
  };

  // AI-assisted structure generation
  const generateStructureWithAI = async () => {
    if (!systemName || !description) {
      alert('Please fill in System Name and Description first');
      return;
    }

    setIsGeneratingStructure(true);
    try {
      // Use the same API URL configuration as App.jsx
      const API_BASE_URL = (() => {
        // In production (Vercel), use local API routes that proxy to Railway
        // In development, connect directly to local backend
        if (import.meta.env.PROD) {
          return '/api';
        }
        // Local development - connect directly to local backend
        return window.location.origin.replace(':5173', ':3000') + '/api';
      })();
      
      const response = await fetch(`${API_BASE_URL}/analysis/generate-structure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemName,
          description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate structure');
      }

      const structureData = await response.json();
      
      // Replace existing data with AI-generated data
      if (structureData.components && structureData.components.length > 0) {
        setComponents(structureData.components);
      }
      if (structureData.connections && structureData.connections.length > 0) {
        setConnections(structureData.connections);
      }
      if (structureData.safetyStandards && structureData.safetyStandards.length > 0) {
        setSafetyStandards(structureData.safetyStandards);
      }

    } catch (error) {
      console.error('AI structure generation failed:', error);
      alert('Failed to generate structure with AI. Please try again.');
    } finally {
      setIsGeneratingStructure(false);
    }
  };

  return (
    <>
      <div className="input-section">
        <h3 className="form-title">AI-Assisted System Information</h3>
        
        <div className="form-group">
          <label htmlFor="system-name">System Name:</label>
          <input
            id="system-name"
            type="text"
            placeholder="e.g., Aircraft Flight Control System"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            className="system-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="system-description">Description:</label>
          <textarea
            id="system-description"
            placeholder="e.g., Primary flight control system for commercial aircraft with redundant safety systems"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="system-textarea"
          />
        </div>

        {/* AI Generation Button */}
        <div className="ai-generation-section">
          <button 
            className={`ai-generate-btn ${isGeneratingStructure ? 'loading' : ''}`}
            onClick={generateStructureWithAI}
            disabled={isGeneratingStructure || !systemName || !description}
          >
            {isGeneratingStructure ? 'Generating Structure...' : 'Generate Structure with AI'}
          </button>
          <p className="ai-help-text">
            Fill in System Name and Description above, then click to generate components, connections, and safety standards using AI.
          </p>
        </div>

        <div className="form-group">
          <div className="components-header">
            <label>Components:</label>
            <button 
              type="button" 
              className="add-component-btn"
              onClick={addComponent}
            >
              + Add Component
            </button>
          </div>
          
          <div className="components-list">
            {components.map((component, index) => (
              <div key={index} className="component-item">
                <div className="component-number">#{index + 1}</div>
                <div className="component-fields">
                  <input
                    type="text"
                    placeholder="Component name"
                    value={component.name}
                    onChange={(e) => updateComponent(index, 'name', e.target.value)}
                    className="component-input"
                  />
                  <input
                    type="text"
                    placeholder="Component function"
                    value={component.function}
                    onChange={(e) => updateComponent(index, 'function', e.target.value)}
                    className="component-input"
                  />
                </div>
                {components.length > 1 && (
                  <button 
                    type="button"
                    className="remove-component-btn"
                    onClick={() => removeComponent(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Connections Section */}
        <div className="form-group">
          <div className="components-header">
            <label>Connections:</label>
            <button 
              type="button" 
              className="add-component-btn"
              onClick={addConnection}
            >
              + Add Connection
            </button>
          </div>
          
          <div className="components-list">
            {connections.map((connection, index) => (
              <div key={index} className="component-item">
                <div className="component-number">#{index + 1}</div>
                <div className="connection-fields">
                  <input
                    type="text"
                    placeholder="From component"
                    value={connection.from}
                    onChange={(e) => updateConnection(index, 'from', e.target.value)}
                    className="component-input"
                  />
                  <input
                    type="text"
                    placeholder="To component"
                    value={connection.to}
                    onChange={(e) => updateConnection(index, 'to', e.target.value)}
                    className="component-input"
                  />
                  <input
                    type="text"
                    placeholder="Connection type"
                    value={connection.type}
                    onChange={(e) => updateConnection(index, 'type', e.target.value)}
                    className="component-input"
                  />
                </div>
                {connections.length > 1 && (
                  <button 
                    type="button"
                    className="remove-component-btn"
                    onClick={() => removeConnection(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Standards Section */}
        <div className="form-group">
          <div className="components-header">
            <label>Safety Standards:</label>
            <button 
              type="button" 
              className="add-component-btn"
              onClick={addSafetyStandard}
            >
              + Add Standard
            </button>
          </div>
          
          <div className="components-list">
            {safetyStandards.map((safety, index) => (
              <div key={index} className="component-item">
                <div className="component-number">#{index + 1}</div>
                <div className="component-fields">
                  <input
                    type="text"
                    placeholder="Standard name (e.g., DO-178C)"
                    value={safety.standard}
                    onChange={(e) => updateSafetyStandard(index, 'standard', e.target.value)}
                    className="component-input"
                  />
                  <input
                    type="text"
                    placeholder="Requirement description"
                    value={safety.requirement}
                    onChange={(e) => updateSafetyStandard(index, 'requirement', e.target.value)}
                    className="component-input"
                  />
                </div>
                {safetyStandards.length > 1 && (
                  <button 
                    type="button"
                    className="remove-component-btn"
                    onClick={() => removeSafetyStandard(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="yaml-preview">
          <label>Generated YAML:</label>
          <pre className="yaml-display">{generateYAML() || 'Fill in the form above to see YAML preview...'}</pre>
        </div>
      </div>

      <div className="button-section">
        <button 
          className={`convert-button ${isLoading ? 'loading' : ''}`}
          onClick={onConvert}
          disabled={isLoading || !systemName || !description}
        >
          {isLoading ? 'Generating Analysis...' : 'Convert to FMECA and FTA'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

export default InputSection;
