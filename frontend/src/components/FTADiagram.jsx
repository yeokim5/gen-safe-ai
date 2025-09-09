import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './FTADiagram.css';

const FTADiagram = ({ data }) => {
  const diagramRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const minZoom = 0.3;
  const maxZoom = 3.0;
  const zoomStep = 0.2;

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 80,
        rankSpacing: 100,
        padding: 30
      },
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      themeVariables: {
        primaryColor: '#2c3e50',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#34495e',
        lineColor: '#2c3e50',
        secondaryColor: '#ecf0f1',
        tertiaryColor: '#f39c12'
      }
    });
  }, []);

  // Render diagram when data changes
  useEffect(() => {
    if (data?.mermaidDiagram && diagramRef.current) {
      renderDiagram();
    }
  }, [data]);

  const renderDiagram = async () => {
    if (!diagramRef.current || !data?.mermaidDiagram) return;

    setIsLoading(true);
    try {
      // Clear previous diagram
      diagramRef.current.innerHTML = '';
      
      // Create unique ID for this diagram
      const diagramId = `fta-diagram-${Date.now()}`;
      
      // Render the diagram
      const { svg } = await mermaid.render(diagramId, data.mermaidDiagram);
      
      // Insert the SVG
      diagramRef.current.innerHTML = svg;
      
      // Apply zoom
      applyZoom();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error rendering Mermaid diagram:', error);
      diagramRef.current.innerHTML = `
        <div class="diagram-error">
          <p>Error rendering fault tree diagram</p>
          <p>Please try again or check the system description format.</p>
        </div>
      `;
      setIsLoading(false);
    }
  };

  const applyZoom = () => {
    if (diagramRef.current) {
      const svg = diagramRef.current.querySelector('svg');
      if (svg) {
        svg.style.transform = `scale(${zoom})`;
        svg.style.transformOrigin = 'center center';
        svg.style.transition = 'transform 0.3s ease';
      }
    }
  };

  // Apply zoom whenever zoom state changes
  useEffect(() => {
    applyZoom();
  }, [zoom]);

  const handleZoomIn = () => {
    if (zoom < maxZoom) {
      setZoom(Math.min(zoom + zoomStep, maxZoom));
    }
  };

  const handleZoomOut = () => {
    if (zoom > minZoom) {
      setZoom(Math.max(zoom - zoomStep, minZoom));
    }
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  // Export FTA as PDF
  const exportToPDF = async () => {
    if (!diagramRef.current) return;

    try {
      // Temporarily reset zoom for export
      const originalZoom = zoom;
      setZoom(1);
      
      // Wait for zoom to apply
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: containerRef.current.scrollWidth,
        height: containerRef.current.scrollHeight
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Fault Tree Analysis (FTA)', 20, 20);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

      // Add the diagram
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let yPosition = 40;
      
      if (imgHeight > pageHeight - 60) {
        // Scale down if too large
        const scaleFactor = (pageHeight - 60) / imgHeight;
        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = imgHeight * scaleFactor;
        pdf.addImage(imgData, 'PNG', 20, yPosition, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
      }

      pdf.save('FTA-Analysis.pdf');

      // Restore original zoom
      setZoom(originalZoom);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      setZoom(originalZoom);
    }
  };

  if (!data?.mermaidDiagram) {
    return (
      <div className="fta-container">
        <div className="fta-header">
          <h3>Fault Tree Analysis (FTA)</h3>
          <div className="subtitle">Logical Failure Path Analysis</div>
        </div>
        <div className="no-data">No FTA data available</div>
      </div>
    );
  }

  return (
    <div className="fta-container">
      <div className="fta-header">
        <h3>Fault Tree Analysis (FTA)</h3>
        <div className="subtitle">Logical Failure Path Analysis</div>
      </div>
      
      <div className="fta-content">
        <div className="fta-controls">
          <div className="zoom-controls">
            <span>🔍</span>
            <button className="zoom-btn" onClick={handleZoomOut} disabled={zoom <= minZoom}>
              -
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button className="zoom-btn" onClick={handleZoomIn} disabled={zoom >= maxZoom}>
              +
            </button>
            <button className="zoom-btn" onClick={handleZoomReset}>
              Reset
            </button>
          </div>
          <button className="export-button" onClick={exportToPDF}>
            Export PDF
          </button>
        </div>

        <div ref={containerRef} className="diagram-container">
          {isLoading && <div className="loading">Rendering diagram...</div>}
          <div ref={diagramRef} className="mermaid-diagram"></div>
        </div>
      </div>
    </div>
  );
};

export default FTADiagram;
