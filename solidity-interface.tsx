/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// --- SOLIDITY INTERFACE STATE ---
let solidityInterface: HTMLElement;
let codeInput: HTMLTextAreaElement;
let contractInfo: HTMLTextAreaElement;
let auditButton: HTMLButtonElement;
let auditResults: HTMLElement;
let isAuditing = false;

// --- SOLIDITY INTERFACE FUNCTIONS ---

function renderSolidityInterface() {
  const app = document.getElementById('app')!;
  
  app.innerHTML = `
    <div class="solidity-interface">
      <!-- Header -->
      <header class="solidity-header">
        <div class="header-content">
          <h1 class="interface-title">
            <span class="title-icon">🔍</span>
            <span class="title-text">Solidity Audit Bot</span>
          </h1>
          <p class="interface-subtitle">Professional Smart Contract Security Analysis</p>
        </div>
        <div class="header-decoration">
          <div class="security-badges">
            <div class="badge badge-critical">Critical</div>
            <div class="badge badge-high">High</div>
            <div class="badge badge-medium">Medium</div>
            <div class="badge badge-low">Low</div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="solidity-main">
        <div class="input-section">
          <!-- Contract Code Input -->
          <div class="code-input-container">
            <div class="input-header">
              <h3>Contract Code</h3>
              <div class="input-actions">
                <button class="action-btn" id="clear-code">Clear</button>
                <button class="action-btn" id="format-code">Format</button>
                <button class="action-btn" id="example-code">Example</button>
              </div>
            </div>
            <div class="code-editor">
              <textarea id="code-input" placeholder="// Paste your Solidity contract code here...
// Example:
// pragma solidity ^0.8.0;
// 
// contract MyToken {
//     mapping(address => uint256) public balances;
//     
//     function transfer(address to, uint256 amount) public {
//         require(balances[msg.sender] >= amount, 'Insufficient balance');
//         balances[msg.sender] -= amount;
//         balances[to] += amount;
//     }
// }"></textarea>
              <div class="line-numbers"></div>
            </div>
          </div>

          <!-- Contract Information -->
          <div class="info-input-container">
            <div class="input-header">
              <h3>Contract Information</h3>
              <span class="optional-text">(Optional but recommended)</span>
            </div>
            <textarea id="contract-info" placeholder="Describe your contract's purpose, functionality, and any specific concerns you have...

Examples:
• This is a token contract with transfer and mint functions
• The contract handles user deposits and withdrawals
• I'm concerned about reentrancy in the withdraw function
• This contract integrates with external price feeds"></textarea>
          </div>

          <!-- Audit Options -->
          <div class="audit-options">
            <div class="input-header">
              <h3>Audit Focus Areas</h3>
              <button class="help-btn" id="help-btn" title="Learn about each security category">
                <span class="help-icon">?</span>
                <span class="help-text">Help</span>
              </button>
            </div>
            <div class="options-grid">
              <label class="option-item">
                <input type="checkbox" checked data-category="access-control">
                <span class="option-text">Access Control</span>
              </label>
              <label class="option-item">
                <input type="checkbox" checked data-category="reentrancy">
                <span class="option-text">Reentrancy</span>
              </label>
              <label class="option-item">
                <input type="checkbox" checked data-category="overflow">
                <span class="option-text">Integer Overflow</span>
              </label>
              <label class="option-item">
                <input type="checkbox" checked data-category="logic">
                <span class="option-text">Logic Flaws</span>
              </label>
              <label class="option-item">
                <input type="checkbox" checked data-category="gas">
                <span class="option-text">Gas Optimization</span>
              </label>
              <label class="option-item">
                <input type="checkbox" checked data-category="frontrunning">
                <span class="option-text">Front-running</span>
              </label>
              <label class="option-item">
                <input type="checkbox" checked data-category="oracle">
                <span class="option-text">Oracle Security</span>
              </label>
              <label class="option-item">
                <input type="checkbox" checked data-category="upgradeability">
                <span class="option-text">Upgradeability</span>
              </label>
            </div>
          </div>

          <!-- Help Modal -->
          <div id="help-modal" class="help-modal" style="display: none;">
            <div class="help-modal-content">
              <div class="help-modal-header">
                <h3>Security Categories Explained</h3>
                <button class="close-btn" id="close-help">×</button>
              </div>
              <div class="help-modal-body">
                <div class="help-category">
                  <h4>🔐 Access Control</h4>
                  <p>Checks for proper authorization mechanisms, owner privileges, role management, and who can call sensitive functions. Ensures only authorized users can perform critical operations.</p>
                </div>
                
                <div class="help-category">
                  <h4>🔄 Reentrancy</h4>
                  <p>Detects vulnerabilities where external calls can re-enter the contract before state changes are completed. This can lead to double-spending and other exploits.</p>
                </div>
                
                <div class="help-category">
                  <h4>📊 Integer Overflow/Underflow</h4>
                  <p>Identifies arithmetic operations that could exceed data type limits, causing unexpected behavior. Critical for mathematical operations and token transfers.</p>
                </div>
                
                <div class="help-category">
                  <h4>🧠 Logic Flaws</h4>
                  <p>Finds business logic errors, edge cases, race conditions, and flawed algorithms that could lead to unintended behavior or exploitation.</p>
                </div>
                
                <div class="help-category">
                  <h4>⛽ Gas Optimization</h4>
                  <p>Analyzes inefficient patterns, storage vs memory usage, and opportunities to reduce transaction costs while maintaining functionality.</p>
                </div>
                
                <div class="help-category">
                  <h4>🏃 Front-running</h4>
                  <p>Detects MEV (Maximal Extractable Value) attacks where transactions can be manipulated based on pending transactions in the mempool.</p>
                </div>
                
                <div class="help-category">
                  <h4>🔮 Oracle Security</h4>
                  <p>Examines external data source reliability, price feed manipulation risks, and single points of failure in oracle dependencies.</p>
                </div>
                
                <div class="help-category">
                  <h4>🔄 Upgradeability</h4>
                  <p>Assesses proxy patterns, storage collision risks, and upgrade mechanisms that could compromise contract security or functionality.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Audit Button -->
          <div class="audit-actions">
            <button id="audit-button" class="audit-btn">
              <span class="btn-icon">🔍</span>
              <span class="btn-text">Start Security Audit</span>
              <div class="btn-loading" style="display: none;">
                <div class="spinner"></div>
                <span>Analyzing...</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Results Section -->
        <div class="results-section" id="results-section" style="display: none;">
          <div class="results-header">
            <h3>Audit Results</h3>
            <div class="results-actions">
              <button class="action-btn" id="export-results">Export</button>
              <button class="action-btn" id="clear-results">Clear</button>
            </div>
          </div>
          <div id="audit-results" class="audit-results"></div>
        </div>
      </main>
    </div>

    <style>
      .solidity-interface {
        min-height: 100vh;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
        color: #e5e7eb;
        font-family: 'Inter', 'Monaco', 'Menlo', monospace;
      }

      /* Header Styles */
      .solidity-header {
        background: rgba(30, 30, 30, 0.9);
        border-bottom: 2px solid #3b82f6;
        padding: 1.5rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        backdrop-filter: blur(10px);
      }

      .interface-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0;
      }

      .title-icon {
        font-size: 2rem;
      }

      .title-text {
        background: linear-gradient(135deg, #3b82f6, #06b6d4);
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
      }

      .interface-subtitle {
        color: #94a3b8;
        margin: 0.25rem 0 0 0;
        font-size: 0.9rem;
      }

      .security-badges {
        display: flex;
        gap: 0.5rem;
      }

      .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .badge-critical {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid #ef4444;
      }

      .badge-high {
        background: rgba(245, 158, 11, 0.2);
        color: #fcd34d;
        border: 1px solid #f59e0b;
      }

      .badge-medium {
        background: rgba(59, 130, 246, 0.2);
        color: #93c5fd;
        border: 1px solid #3b82f6;
      }

      .badge-low {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
        border: 1px solid #10b981;
      }

      /* Main Content */
      .solidity-main {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      /* Input Section */
      .input-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .code-input-container,
      .info-input-container,
      .audit-options {
        background: rgba(30, 30, 30, 0.8);
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 1.5rem;
        backdrop-filter: blur(10px);
      }

      .input-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .input-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #f3f4f6;
      }

      .optional-text {
        font-size: 0.8rem;
        color: #6b7280;
        font-style: italic;
      }

      .input-actions {
        display: flex;
        gap: 0.5rem;
      }

      /* Help Button */
      .help-btn {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid #3b82f6;
        color: #93c5fd;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .help-btn:hover {
        background: rgba(59, 130, 246, 0.2);
        transform: translateY(-1px);
      }

      .help-icon {
        font-weight: bold;
        font-size: 0.9rem;
      }

      /* Help Modal */
      .help-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
      }

      .help-modal-content {
        background: rgba(30, 30, 30, 0.95);
        border: 1px solid #374151;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        backdrop-filter: blur(10px);
      }

      .help-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #374151;
      }

      .help-modal-header h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #f3f4f6;
      }

      .close-btn {
        background: none;
        border: none;
        color: #6b7280;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .close-btn:hover {
        color: #e5e7eb;
        background: rgba(107, 114, 128, 0.2);
      }

      .help-modal-body {
        padding: 1.5rem;
      }

      .help-category {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #374151;
      }

      .help-category:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .help-category h4 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #f3f4f6;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .help-category p {
        margin: 0;
        color: #d1d5db;
        line-height: 1.6;
        font-size: 0.9rem;
      }

      .action-btn {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid #3b82f6;
        color: #93c5fd;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .action-btn:hover {
        background: rgba(59, 130, 246, 0.2);
        transform: translateY(-1px);
      }

      /* Code Editor */
      .code-editor {
        position: relative;
        background: #1e1e1e;
        border: 1px solid #374151;
        border-radius: 8px;
        overflow: hidden;
      }

      #code-input {
        width: 100%;
        min-height: 300px;
        background: #1e1e1e;
        color: #e5e7eb;
        border: none;
        outline: none;
        padding: 1rem;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9rem;
        line-height: 1.5;
        resize: vertical;
        tab-size: 4;
      }

      #code-input::placeholder {
        color: #6b7280;
        font-style: italic;
      }

      .line-numbers {
        position: absolute;
        top: 0;
        left: 0;
        width: 3rem;
        height: 100%;
        background: #2d2d2d;
        border-right: 1px solid #374151;
        pointer-events: none;
        font-size: 0.8rem;
        color: #6b7280;
        padding: 1rem 0.5rem;
        line-height: 1.5;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }

      /* Contract Info */
      #contract-info {
        width: 100%;
        min-height: 120px;
        background: #1e1e1e;
        color: #e5e7eb;
        border: 1px solid #374151;
        border-radius: 8px;
        padding: 1rem;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        line-height: 1.5;
        resize: vertical;
        outline: none;
      }

      #contract-info::placeholder {
        color: #6b7280;
        font-style: italic;
      }

      /* Audit Options */
      .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
      }

      .option-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 6px;
        transition: background 0.2s ease;
      }

      .option-item:hover {
        background: rgba(59, 130, 246, 0.1);
      }

      .option-item input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: #3b82f6;
      }

      .option-text {
        font-size: 0.9rem;
        color: #e5e7eb;
      }

      /* Audit Button */
      .audit-actions {
        display: flex;
        justify-content: center;
        padding: 1rem 0;
      }

      .audit-btn {
        background: linear-gradient(135deg, #3b82f6, #06b6d4);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 200px;
        justify-content: center;
      }

      .audit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
      }

      .audit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .btn-loading {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Results Section */
      .results-section {
        background: rgba(30, 30, 30, 0.8);
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 1.5rem;
        backdrop-filter: blur(10px);
      }

      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #374151;
      }

      .results-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #f3f4f6;
      }

      .results-actions {
        display: flex;
        gap: 0.5rem;
      }

      .audit-results {
        color: #e5e7eb;
        line-height: 1.6;
      }

      /* Severity Styling */
      .severity-critical {
        color: #fca5a5;
        font-weight: 600;
      }

      .severity-high {
        color: #fcd34d;
        font-weight: 600;
      }

      .severity-medium {
        color: #93c5fd;
        font-weight: 600;
      }

      .severity-low {
        color: #6ee7b7;
        font-weight: 600;
      }

      .severity-info {
        color: #a5b4fc;
        font-weight: 600;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .solidity-header {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
          padding: 1rem;
        }

        .security-badges {
          flex-wrap: wrap;
          justify-content: center;
        }

        .solidity-main {
          padding: 1rem;
          gap: 1rem;
        }

        .options-grid {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }

        .input-actions {
          flex-wrap: wrap;
        }

        .code-input-container,
        .info-input-container,
        .audit-options {
          padding: 1rem;
        }

        #code-input {
          min-height: 200px;
          font-size: 0.85rem;
        }

        #contract-info {
          min-height: 100px;
          font-size: 0.85rem;
        }

        .help-modal-content {
          width: 95%;
          max-height: 90vh;
          margin: 1rem;
        }

        .help-modal-header {
          padding: 1rem;
        }

        .help-modal-body {
          padding: 1rem;
        }
      }

      @media (max-width: 480px) {
        .solidity-header {
          padding: 0.75rem;
        }

        .interface-title {
          font-size: 1.3rem;
        }

        .title-icon {
          font-size: 1.5rem;
        }

        .interface-subtitle {
          font-size: 0.8rem;
        }

        .solidity-main {
          padding: 0.75rem;
        }

        .options-grid {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        .audit-btn {
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          min-width: 180px;
        }

        .code-input-container,
        .info-input-container,
        .audit-options {
          padding: 0.75rem;
        }

        .input-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .input-actions {
          width: 100%;
          justify-content: space-between;
        }

        .action-btn {
          padding: 0.2rem 0.5rem;
          font-size: 0.75rem;
        }

        .help-btn {
          padding: 0.2rem 0.5rem;
          font-size: 0.75rem;
        }

        #code-input {
          min-height: 150px;
          font-size: 0.8rem;
          padding: 0.75rem;
        }

        #contract-info {
          min-height: 80px;
          font-size: 0.8rem;
          padding: 0.75rem;
        }

        .help-modal-content {
          width: 98%;
          max-height: 95vh;
          margin: 0.5rem;
        }

        .help-modal-header {
          padding: 0.75rem;
        }

        .help-modal-header h3 {
          font-size: 1rem;
        }

        .help-modal-body {
          padding: 0.75rem;
        }

        .help-category h4 {
          font-size: 0.9rem;
        }

        .help-category p {
          font-size: 0.8rem;
        }
      }

      /* Mobile-specific fixes */
      @media (max-width: 768px) {
        .solidity-interface {
          min-height: 100vh;
          overflow-x: hidden;
        }

        .solidity-main {
          overflow-x: hidden;
        }

        .input-section {
          overflow-x: hidden;
        }

        .code-editor {
          overflow-x: auto;
        }

        #code-input {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .results-section {
          overflow-x: auto;
        }

        .audit-results {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      }

      /* Prevent horizontal scroll on mobile */
      @media (max-width: 480px) {
        body {
          overflow-x: hidden;
        }

        .solidity-interface {
          width: 100vw;
          overflow-x: hidden;
        }

        .solidity-main {
          width: 100%;
          overflow-x: hidden;
        }

        .input-section {
          width: 100%;
          overflow-x: hidden;
        }

        .code-input-container,
        .info-input-container,
        .audit-options {
          width: 100%;
          overflow-x: hidden;
        }

        .code-editor {
          width: 100%;
          overflow-x: auto;
        }

        #code-input {
          width: 100%;
          box-sizing: border-box;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        #contract-info {
          width: 100%;
          box-sizing: border-box;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      }
    </style>
  `;

  // Initialize interface elements
  initializeSolidityInterface();
}

function initializeSolidityInterface() {
  // Get DOM elements
  solidityInterface = document.querySelector('.solidity-interface')!;
  codeInput = document.getElementById('code-input') as HTMLTextAreaElement;
  contractInfo = document.getElementById('contract-info') as HTMLTextAreaElement;
  auditButton = document.getElementById('audit-button') as HTMLButtonElement;
  auditResults = document.getElementById('audit-results')!;

  // Add event listeners
  addSolidityEventListeners();
  
  // Initialize line numbers
  updateLineNumbers();
}

function addSolidityEventListeners() {
  // Code input events
  codeInput.addEventListener('input', updateLineNumbers);
  codeInput.addEventListener('keydown', handleCodeKeydown);

  // Action buttons
  document.getElementById('clear-code')?.addEventListener('click', clearCode);
  document.getElementById('format-code')?.addEventListener('click', formatCode);
  document.getElementById('example-code')?.addEventListener('click', loadExample);
  document.getElementById('export-results')?.addEventListener('click', exportResults);
  document.getElementById('clear-results')?.addEventListener('click', clearResults);

  // Help modal
  document.getElementById('help-btn')?.addEventListener('click', showHelpModal);
  document.getElementById('close-help')?.addEventListener('click', hideHelpModal);
  
  // Close modal when clicking outside
  document.getElementById('help-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hideHelpModal();
    }
  });

  // Audit button
  auditButton.addEventListener('click', startAudit);
}

function updateLineNumbers() {
  const lineNumbers = document.querySelector('.line-numbers');
  if (!lineNumbers || !codeInput) return;

  const lines = codeInput.value.split('\n');
  const lineNumbersHTML = lines.map((_, index) => index + 1).join('\n');
  lineNumbers.textContent = lineNumbersHTML;
}

function handleCodeKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = codeInput.selectionStart;
    const end = codeInput.selectionEnd;
    
    codeInput.value = codeInput.value.substring(0, start) + '    ' + codeInput.value.substring(end);
    codeInput.selectionStart = codeInput.selectionEnd = start + 4;
    
    updateLineNumbers();
  }
}

function clearCode() {
  codeInput.value = '';
  updateLineNumbers();
}

function formatCode() {
  // Basic formatting - in a real implementation, you'd use a proper formatter
  let code = codeInput.value;
  
  // Add basic indentation
  const lines = code.split('\n');
  let indentLevel = 0;
  
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.includes('}')) indentLevel = Math.max(0, indentLevel - 1);
    
    const formatted = '    '.repeat(indentLevel) + trimmed;
    
    if (trimmed.includes('{')) indentLevel++;
    
    return formatted;
  });
  
  codeInput.value = formattedLines.join('\n');
  updateLineNumbers();
}

function loadExample() {
  const exampleCode = `pragma solidity ^0.8.0;

contract VulnerableToken {
    mapping(address => uint256) public balances;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Vulnerable to reentrancy attack
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount;
    }
    
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}`;

  codeInput.value = exampleCode;
  updateLineNumbers();
}

function startAudit() {
  if (isAuditing) return;
  
  const code = codeInput.value.trim();
  const info = contractInfo.value.trim();
  
  if (!code) {
    alert('Please enter contract code to audit');
    return;
  }
  
  isAuditing = true;
  auditButton.disabled = true;
  
  // Show loading state
  const btnText = auditButton.querySelector('.btn-text');
  const btnLoading = auditButton.querySelector('.btn-loading');
  
  if (btnText) btnText.style.display = 'none';
  if (btnLoading) btnLoading.style.display = 'flex';
  
  // Get selected audit categories
  const selectedCategories = Array.from(document.querySelectorAll('.option-item input:checked'))
    .map(input => (input as HTMLInputElement).dataset.category)
    .filter(Boolean);
  
  // Prepare audit message
  const auditMessage = `Please audit this Solidity smart contract:

**Contract Code:**
\`\`\`solidity
${code}
\`\`\`

**Contract Information:**
${info || 'No additional information provided'}

**Focus Areas:**
${selectedCategories.join(', ')}

Please provide a comprehensive security audit following the professional audit framework.`;

  // Send to AI
  sendAuditRequest(auditMessage);
}

async function sendAuditRequest(message: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        isFirstMessage: false,
        agentType: 'solidity'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayAuditResults(data.text);
    
  } catch (error) {
    console.error("Audit Error:", error);
    displayAuditResults('❌ **Audit Failed**\n\nSorry, something went wrong while performing the security audit. Please try again.');
  } finally {
    // Reset button state
    isAuditing = false;
    auditButton.disabled = false;
    
    const btnText = auditButton.querySelector('.btn-text');
    const btnLoading = auditButton.querySelector('.btn-loading');
    
    if (btnText) btnText.style.display = 'inline';
    if (btnLoading) btnLoading.style.display = 'none';
  }
}

function displayAuditResults(results: string) {
  const resultsSection = document.getElementById('results-section');
  if (resultsSection) {
    resultsSection.style.display = 'block';
  }
  
  // Process markdown and apply severity styling
  const processedResults = processAuditMarkdown(results);
  auditResults.innerHTML = processedResults;
  
  // Scroll to results
  resultsSection?.scrollIntoView({ behavior: 'smooth' });
}

function processAuditMarkdown(text: string): string {
  return text
    // Convert line breaks to <br> tags
    .replace(/\n/g, '<br>')
    // Convert **bold** to <strong> tags
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em> tags
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert bullet points to proper HTML lists
    .replace(/^•\s*(.*)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> elements in <ul> tags
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    // Clean up multiple <ul> tags
    .replace(/<\/ul>\s*<ul>/g, '')
    // Add severity styling
    .replace(/\[Critical\]/g, '<span class="severity-critical">[Critical]</span>')
    .replace(/\[High\]/g, '<span class="severity-high">[High]</span>')
    .replace(/\[Medium\]/g, '<span class="severity-medium">[Medium]</span>')
    .replace(/\[Low\]/g, '<span class="severity-low">[Low]</span>')
    .replace(/\[Informational\]/g, '<span class="severity-info">[Informational]</span>')
    // Add spacing around sections
    .replace(/<br><strong>/g, '<br><br><strong>')
    // Ensure proper spacing after sections
    .replace(/<\/strong><br>/g, '</strong><br><br>');
}

function exportResults() {
  const results = auditResults.innerText;
  const blob = new Blob([results], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'solidity-audit-report.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function clearResults() {
  const resultsSection = document.getElementById('results-section');
  if (resultsSection) {
    resultsSection.style.display = 'none';
  }
  auditResults.innerHTML = '';
}

function showHelpModal() {
  const helpModal = document.getElementById('help-modal');
  if (helpModal) {
    helpModal.style.display = 'flex';
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }
}

function hideHelpModal() {
  const helpModal = document.getElementById('help-modal');
  if (helpModal) {
    helpModal.style.display = 'none';
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }
}

// Export functions for use in dashboard
(window as any).renderSolidityInterface = renderSolidityInterface; 