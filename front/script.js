// Initialize Mermaid
mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default',
    flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 50,
        rankSpacing: 50,
        padding: 20
    },
    fontFamily: 'Arial, sans-serif',
    fontSize: 16
});

// Get DOM elements
const systemDescriptionTextarea = document.getElementById('system-description');
const convertButton = document.getElementById('convert-btn');
const outputSection = document.getElementById('output-section');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');
const addComponentBtn = document.getElementById('add-component-btn');
const exportMarkdownBtn = document.getElementById('export-markdown-btn');
const exportMermaidBtn = document.getElementById('export-mermaid-btn');
const fmecaTableContainer = document.getElementById('fmeca-table-container');

// Mock FMECA data - will be populated when convert is clicked
let fmecaData = [];

// Mock FTA diagram data
let ftaDiagramData = '';

// Zoom functionality
let currentZoom = 1;
const zoomStep = 0.1;
const minZoom = 0.5;
const maxZoom = 2.0;

// Initialize the application
function init() {
    setupEventListeners();
    systemDescriptionTextarea.focus();
}

// Setup all event listeners
function setupEventListeners() {
    // Convert button
    convertButton.addEventListener('click', handleConvertClick);
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabSwitch);
    });
    
    // Export functionality
    exportMarkdownBtn.addEventListener('click', exportMarkdown);
    exportMermaidBtn.addEventListener('click', exportMermaid);
    
    // System description input
    systemDescriptionTextarea.addEventListener('input', function() {
        console.log('System description updated:', this.value);
    });
}

// Handle convert button click
function handleConvertClick() {
    const systemDescription = systemDescriptionTextarea.value.trim();
    
    if (!systemDescription) {
        alert('Please enter a system description first.');
        return;
    }
    
    // Generate mock data based on system description
    generateMockData(systemDescription);
    
    // Show output section
    outputSection.classList.remove('hidden');
    outputSection.scrollIntoView({ behavior: 'smooth' });
    
    // Render the data
    renderFMECATable();
    renderFTADiagram();
    
    console.log('Convert button clicked. System description:', systemDescription);
}

// Generate mock data based on system description
function generateMockData(systemDescription) {
    // Generate FMECA data
    fmecaData = [
        {
            component: 'Power Supply Unit',
            failureMode: 'Complete power loss',
            effect: 'System shutdown and data loss',
            severity: 'Critical',
            probability: 'Low',
            riskPriority: 'High'
        },
        {
            component: 'Main Control Processor',
            failureMode: 'Processor malfunction',
            effect: 'Loss of system control and monitoring',
            severity: 'Critical',
            probability: 'Medium',
            riskPriority: 'High'
        },
        {
            component: 'Communication Module',
            failureMode: 'Network connectivity failure',
            effect: 'Loss of remote monitoring and control',
            severity: 'High',
            probability: 'Medium',
            riskPriority: 'Medium'
        },
        {
            component: 'Sensor Array',
            failureMode: 'Sensor calibration drift',
            effect: 'Inaccurate readings and false alarms',
            severity: 'Medium',
            probability: 'High',
            riskPriority: 'Medium'
        },
        {
            component: 'Cooling System',
            failureMode: 'Fan failure',
            effect: 'Overheating and component damage',
            severity: 'High',
            probability: 'Low',
            riskPriority: 'Medium'
        },
        {
            component: 'Backup Battery',
            failureMode: 'Battery degradation',
            effect: 'Loss of backup power during outages',
            severity: 'Medium',
            probability: 'Medium',
            riskPriority: 'Medium'
        },
        {
            component: 'User Interface',
            failureMode: 'Display malfunction',
            effect: 'Loss of user interaction capability',
            severity: 'Low',
            probability: 'High',
            riskPriority: 'Low'
        },
        {
            component: 'Data Storage',
            failureMode: 'Storage corruption',
            effect: 'Loss of historical data and logs',
            severity: 'High',
            probability: 'Low',
            riskPriority: 'Medium'
        }
    ];

    // Generate FTA diagram data with proper FTA symbols
    ftaDiagramData = `graph TD
    A[System Failure] --> B{AND}
    B --> C[Hardware Failure]
    B --> D[Software Failure]
    B --> E[Human Error]
    
    C --> F{OR}
    F --> G[Power Supply Failure]
    F --> H[Processor Failure]
    F --> I[Cooling System Failure]
    
    D --> J{OR}
    J --> K[Software Crash]
    J --> L[Configuration Error]
    J --> M[Data Corruption]
    
    E --> N{OR}
    N --> O[Operator Error]
    N --> P[Maintenance Error]
    
    G --> Q((Power Loss))
    H --> R((CPU Overheating))
    I --> S((Fan Failure))
    
    K --> T((System Halt))
    L --> U((Wrong Settings))
    M --> V((File Corruption))
    
    O --> W((User Mistake))
    P --> X((Maintenance Skip))`;
}

// Handle tab switching
function handleTabSwitch() {
    const targetTab = this.getAttribute('data-tab');
    
    // Remove active class from all tabs and panes
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding pane
    this.classList.add('active');
    document.getElementById(targetTab + '-content').classList.add('active');
    
    // Re-render Mermaid diagram when FTA tab is activated
    if (targetTab === 'fta') {
        setTimeout(() => {
            renderFTADiagram();
        }, 100);
    }
}

// Render FMECA table
function renderFMECATable() {
    const markdownTable = generateMarkdownTable();
    const htmlTable = marked.parse(markdownTable);
    fmecaTableContainer.innerHTML = htmlTable;
}

// Generate Markdown table from FMECA data
function generateMarkdownTable() {
    let markdown = '| Component | Failure Mode | Effect | Severity | Probability | Risk Priority |\n';
    markdown += '|-----------|--------------|--------|----------|-------------|---------------|\n';
    
    fmecaData.forEach(row => {
        markdown += `| ${row.component} | ${row.failureMode} | ${row.effect} | ${row.severity} | ${row.probability} | ${row.riskPriority} |\n`;
    });
    
    return markdown;
}

// Render FTA diagram
function renderFTADiagram() {
    const ftaDiagram = document.getElementById('fta-diagram');
    
    // Clear the diagram container
    ftaDiagram.innerHTML = '';
    
    // Create zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.innerHTML = `
        <button id="zoom-in" class="zoom-btn">+</button>
        <span id="zoom-level">100%</span>
        <button id="zoom-out" class="zoom-btn">-</button>
        <button id="zoom-reset" class="zoom-btn">Reset</button>
    `;
    
    // Create diagram container
    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'diagram-container';
    
    // Create a new element for the diagram
    const diagramElement = document.createElement('div');
    diagramElement.className = 'mermaid';
    diagramElement.textContent = ftaDiagramData;
    
    // Add elements to container
    diagramContainer.appendChild(diagramElement);
    ftaDiagram.appendChild(zoomControls);
    ftaDiagram.appendChild(diagramContainer);
    
    // Setup zoom controls
    setupZoomControls(diagramContainer);
    
    // Render the diagram
    mermaid.init(undefined, diagramElement);
}

// Setup zoom controls
function setupZoomControls(container) {
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomReset = document.getElementById('zoom-reset');
    const zoomLevel = document.getElementById('zoom-level');
    
    zoomIn.addEventListener('click', () => {
        if (currentZoom < maxZoom) {
            currentZoom += zoomStep;
            applyZoom(container, zoomLevel);
        }
    });
    
    zoomOut.addEventListener('click', () => {
        if (currentZoom > minZoom) {
            currentZoom -= zoomStep;
            applyZoom(container, zoomLevel);
        }
    });
    
    zoomReset.addEventListener('click', () => {
        currentZoom = 1;
        applyZoom(container, zoomLevel);
    });
}

// Apply zoom transformation
function applyZoom(container, zoomLevel) {
    container.style.transform = `scale(${currentZoom})`;
    container.style.transformOrigin = 'center top';
    zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
}

// Export FMECA as Markdown
function exportMarkdown() {
    const markdown = generateMarkdownTable();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fmeca-analysis.md';
    a.click();
    URL.revokeObjectURL(url);
}

// Export FTA Mermaid diagram
function exportMermaid() {
    const blob = new Blob([ftaDiagramData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fta-diagram.mmd';
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
