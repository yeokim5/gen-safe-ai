import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './FTADiagram.css';

const FTADiagram = ({ data, systemName, description }) => {
  const diagramRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

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
        svg.style.transform = `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`;
        svg.style.transformOrigin = 'center center';
        svg.style.transition = isDragging ? 'none' : 'transform 0.3s ease';
        svg.style.cursor = zoom > 1 ? 'grab' : 'default';
      }
    }
  };

  // Apply zoom whenever zoom state or pan offset changes
  useEffect(() => {
    applyZoom();
  }, [zoom, panOffset, isDragging]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      const svg = diagramRef.current?.querySelector('svg');
      if (svg) {
        svg.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      const svg = diagramRef.current?.querySelector('svg');
      if (svg) {
        svg.style.cursor = zoom > 1 ? 'grab' : 'default';
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      const svg = diagramRef.current?.querySelector('svg');
      if (svg) {
        svg.style.cursor = zoom > 1 ? 'grab' : 'default';
      }
    }
  };

  // Reset pan when zoom is reset or changed significantly
  const resetPan = () => {
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    if (zoom < maxZoom) {
      handleZoomChange(Math.min(zoom + zoomStep, maxZoom));
    }
  };

  const handleZoomOut = () => {
    if (zoom > minZoom) {
      handleZoomChange(Math.max(zoom - zoomStep, minZoom));
    }
  };

  const handleZoomReset = () => {
    setZoom(1);
    resetPan();
  };

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    if (newZoom <= 1) {
      resetPan();
    }
  };

  // Export FTA as PDF
  const exportToPDF = async () => {
    if (!diagramRef.current) return;

    const originalZoom = zoom;
    try {
      // Temporarily reset zoom for export
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

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add title and system information
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Fault Tree Analysis (FTA)', 20, 20);
      
      let yPos = 30;
      
      if (systemName) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`System Name: ${systemName}`, 20, yPos);
        yPos += 8;
      }
      
      if (description) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const descLines = pdf.splitTextToSize(`Description: ${description}`, pageWidth - 40);
        pdf.text(descLines, 20, yPos);
        yPos += descLines.length * 5;
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 10;

      // Add the diagram
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let yPosition = yPos;
      
      if (imgHeight > pageHeight - yPos - 20) {
        // Scale down if too large
        const availableHeight = pageHeight - yPos - 20;
        const scaleFactor = availableHeight / imgHeight;
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
      // Restore original zoom even on error
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

        <div 
          ref={containerRef} 
          className="diagram-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            overflow: zoom > 1 ? 'hidden' : 'auto',
            cursor: isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'default')
          }}
        >
          {isLoading && <div className="loading">Rendering diagram...</div>}
          <div ref={diagramRef} className="mermaid-diagram"></div>
        </div>
      </div>
    </div>
  );
};

export default FTADiagram;
