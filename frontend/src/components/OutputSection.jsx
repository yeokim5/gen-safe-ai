import React, { useState } from 'react';
import FMECATable from './FMECATable';
import FTADiagram from './FTADiagram';
import './OutputSection.css';

const OutputSection = ({ analysisData, error, systemName, description }) => {
  const [activeTab, setActiveTab] = useState('fmeca');

  if (error && !analysisData) {
    return (
      <div className="output-section">
        <div className="output-header">
          <h2>🔬 Analysis Results</h2>
        </div>
        <div className="error-container">
          <div className="error-message">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <div className="output-section">
      <div className="output-header">
        <h2>🔬 Analysis Results</h2>
      </div>
      
      <div className="output-tabs">
        <button 
          className={`tab-button ${activeTab === 'fmeca' ? 'active' : ''}`}
          onClick={() => setActiveTab('fmeca')}
        >
          FMECA
        </button>
        <button 
          className={`tab-button ${activeTab === 'fta' ? 'active' : ''}`}
          onClick={() => setActiveTab('fta')}
        >
          FTA
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'fmeca' && (
          <div className="tab-pane active">
            <FMECATable 
              data={analysisData.results.fmeca} 
              systemName={systemName}
              description={description}
            />
          </div>
        )}
        
        {activeTab === 'fta' && (
          <div className="tab-pane active">
            <FTADiagram 
              data={analysisData.results.fta}
              systemName={systemName}
              description={description}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputSection;
