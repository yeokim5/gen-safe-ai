import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import './App.css';

function App() {
  const [systemDescription, setSystemDescription] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = window.location.origin.replace(':5173', ':3000') + '/api';

  // Generate analysis using the API
  const generateAnalysis = async (yamlDescription) => {
    if (!yamlDescription.trim()) {
      setError('Please fill in the system information first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Parse the YAML description into structured data
      const requestBody = parseStructuredDescription(yamlDescription);
      
      console.log('📤 Sending structured request:', requestBody);

      const response = await fetch(`${API_BASE_URL}/analysis/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const analysisResult = await response.json();
      console.log('📥 Analysis result received:', analysisResult);

      setAnalysisData(analysisResult);

    } catch (error) {
      console.error('❌ API call failed:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Unable to connect to the analysis server. Please check your connection and try again.');
      } else if (error.message.includes('429')) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (error.message.includes('500')) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced YAML parser for structured descriptions
  const parseStructuredDescription = (yamlString) => {
    try {
      const lines = yamlString.split('\n');
      const result = {};
      let currentSection = null;
      let currentComponent = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        if (trimmed.startsWith('systemName:')) {
          result.systemName = trimmed.split('systemName:')[1].trim().replace(/['"]/g, '');
        } else if (trimmed.startsWith('description:')) {
          result.description = trimmed.split('description:')[1].trim().replace(/['"]/g, '');
        } else if (trimmed === 'components:') {
          result.components = [];
          currentSection = 'components';
        } else if (trimmed.startsWith('- name:') && currentSection === 'components') {
          const name = trimmed.split('- name:')[1].trim().replace(/['"]/g, '');
          currentComponent = { name: name };
          result.components.push(currentComponent);
        } else if (trimmed.startsWith('function:') && currentSection === 'components' && currentComponent) {
          const func = trimmed.split('function:')[1].trim().replace(/['"]/g, '');
          currentComponent.function = func;
        }
      }
      
      // Validate required fields
      if (!result.systemName || !result.description) {
        throw new Error('System name and description are required');
      }
      
      if (!result.components || result.components.length === 0) {
        throw new Error('At least one component is required');
      }
      
      // Validate components
      for (const component of result.components) {
        if (!component.name || !component.function) {
          throw new Error('All components must have both name and function');
        }
      }
      
      console.log('✅ Parsed structured data:', result);
      return result;
    } catch (error) {
      console.error('❌ YAML parsing failed:', error);
      throw new Error(`Failed to parse system description: ${error.message}`);
    }
  };

  const handleConvert = () => {
    generateAnalysis(systemDescription);
  };

  return (
    <div className="app">
      <div className="container">
        <Header />
        <InputSection 
          value={systemDescription}
          onChange={setSystemDescription}
          onConvert={handleConvert}
          isLoading={isLoading}
          error={error}
        />
        {(analysisData || error) && (
          <OutputSection 
            analysisData={analysisData}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

export default App;