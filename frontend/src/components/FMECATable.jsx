import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './FMECATable.css';

const FMECATable = ({ data }) => {
  const fmecaData = data?.fmecaTable || [];

  // Helper function to get RPN risk class
  const getRPNClass = (rpn) => {
    if (rpn >= 200) return 'rpn-critical';
    if (rpn >= 100) return 'rpn-high';
    if (rpn >= 50) return 'rpn-medium';
    return 'rpn-low';
  };

  // Helper function to get severity class
  const getSeverityClass = (severity) => {
    if (severity >= 9) return 'severity-critical';
    if (severity >= 7) return 'severity-high';
    if (severity >= 5) return 'severity-medium';
    return 'severity-low';
  };

  // Export FMECA as PDF
  const exportToPDF = async () => {
    const element = document.getElementById('fmeca-table-container');
    if (!element) return;

    try {
      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Failure Mode, Effects, and Criticality Analysis (FMECA)', 20, 20);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

      // Add the table image
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 250; // A4 landscape width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let yPosition = 40;
      
      // If the image is too tall, split it across pages
      if (imgHeight > 170) { // A4 landscape height minus margins
        const pageHeight = 170;
        let remainingHeight = imgHeight;
        let sourceY = 0;
        
        while (remainingHeight > 0) {
          const currentHeight = Math.min(pageHeight, remainingHeight);
          const sourceHeight = (currentHeight / imgHeight) * canvas.height;
          
          if (sourceY > 0) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, currentHeight, 
                      undefined, 'FAST', 0, sourceY, canvas.width, sourceHeight);
          
          sourceY += sourceHeight;
          remainingHeight -= currentHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
      }

      // Save the PDF
      pdf.save('FMECA-Analysis.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (!fmecaData || fmecaData.length === 0) {
    return (
      <div className="fmeca-container">
        <div className="fmeca-header">
          <h3>Failure Mode, Effects, and Criticality Analysis (FMECA)</h3>
          <div className="subtitle">Risk Assessment & Mitigation Analysis</div>
        </div>
        <div className="no-data">No FMECA data available</div>
      </div>
    );
  }

  return (
    <div className="fmeca-container">
      <div className="fmeca-header">
        <h3>Failure Mode, Effects, and Criticality Analysis (FMECA)</h3>
        <div className="subtitle">Risk Assessment & Mitigation Analysis</div>
      </div>
      
      <div className="fmeca-controls">
        <button className="export-button" onClick={exportToPDF}>
          Export PDF
        </button>
      </div>

      <div id="fmeca-table-container" className="fmeca-table-wrapper">
        <table>
          <thead>
            <tr>
              <th rowSpan="2">Item/<br/>Function</th>
              <th rowSpan="2">Failure<br/>Mode</th>
              <th rowSpan="2">Failure<br/>Cause(s)</th>
              <th colSpan="3">Failure Effects</th>
              <th colSpan="3">Risk Assessment</th>
              <th rowSpan="2">RPN</th>
              <th rowSpan="2">Recommended<br/>Actions</th>
            </tr>
            <tr>
              <th>Local</th>
              <th>System</th>
              <th>End</th>
              <th>S</th>
              <th>O</th>
              <th>D</th>
            </tr>
          </thead>
          <tbody>
            {fmecaData.map((row, index) => {
              const rpn = row.rpn || (row.severity * row.occurrence * row.detection);
              const localEffect = row.localEffect || row.failureEffect || '';
              const systemEffect = row.systemEffect || '';
              const endEffect = row.endEffect || '';
              
              return (
                <tr key={index}>
                  <td>{row.itemFunction || ''}</td>
                  <td>{row.failureMode || ''}</td>
                  <td>{row.failureCause || ''}</td>
                  <td>{localEffect}</td>
                  <td>{systemEffect}</td>
                  <td>{endEffect}</td>
                  <td className={getSeverityClass(row.severity)}>{row.severity || ''}</td>
                  <td>{row.occurrence || ''}</td>
                  <td>{row.detection || ''}</td>
                  <td className={getRPNClass(rpn)}>{rpn}</td>
                  <td>{row.recommendedAction || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="rpn-legend">
          <strong>Risk Priority Number (RPN) Scale:</strong> 
          <span className="rpn-low">1-49: Low</span>
          <span className="rpn-medium">50-99: Medium</span>
          <span className="rpn-high">100-199: High</span>
          <span className="rpn-critical">200+: Critical</span>
        </div>
      </div>
    </div>
  );
};

export default FMECATable;
