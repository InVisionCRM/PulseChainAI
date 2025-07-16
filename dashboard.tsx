/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// --- DASHBOARD STATE AND DOM ELEMENTS ---
let currentAgent: string | null = null;
let dashboardContainer: HTMLElement;
let agentCards: NodeListOf<HTMLElement>;

// --- AGENT CONFIGURATIONS ---
const AGENTS = {
  hex: {
    name: "HEX/PulseChain Agent",
    description: "Expert AI assistant for HEX and PulseChain cryptocurrency knowledge",
    icon: "⚡",
    color: "linear-gradient(135deg, #a855f7, #ff7cfb)",
    bgColor: "rgba(168, 85, 247, 0.1)",
    borderColor: "#a855f7"
  },
  solidity: {
    name: "Solidity Audit Bot",
    description: "Specialized AI for auditing Solidity smart contracts and security analysis",
    icon: "🔍",
    color: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    bgColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "#3b82f6"
  },
  positive: {
    name: "Positive Vibes Only",
    description: "Transform negative thoughts into positive, uplifting perspectives",
    icon: "✨",
    color: "linear-gradient(135deg, #10b981, #f59e0b)",
    bgColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "#10b981"
  },
  safety: {
    name: "Staying Safe AI",
    description: "Internet safety tips and guidance for protecting yourself online",
    icon: "🛡️",
    color: "linear-gradient(135deg, #ef4444, #f97316)",
    bgColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#ef4444"
  }
};

// --- DASHBOARD FUNCTIONS ---

function renderDashboard() {
  const app = document.getElementById('app')!;
  
  app.innerHTML = `
    <div class="dashboard-container">
      <!-- Futuristic Header -->
      <header class="dashboard-header">
        <div class="title-container">
          <h1 class="main-title">
            <span class="title-pulsechain">PULSECHAIN</span>
            <span class="title-ai">AI</span>
          </h1>
          <div class="subtitle">Multi-Agent Intelligence Platform</div>
        </div>
        <div class="header-decoration">
          <div class="floating-orbs">
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            <div class="orb orb-3"></div>
          </div>
        </div>
      </header>

      <!-- Agent Grid -->
      <main class="agents-grid">
        ${Object.entries(AGENTS).map(([key, agent]) => `
          <div class="agent-card" data-agent="${key}">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="agent-icon">${agent.icon}</div>
              <h3 class="agent-name">${agent.name}</h3>
              <p class="agent-description">${agent.description}</p>
              <div class="card-actions">
                <button class="launch-btn" data-agent="${key}">
                  <span class="btn-text">Launch Agent</span>
                  <span class="btn-icon">→</span>
                </button>
              </div>
            </div>
            <div class="card-particles">
              <div class="particle"></div>
              <div class="particle"></div>
              <div class="particle"></div>
            </div>
          </div>
        `).join('')}
      </main>

      <!-- Back to Dashboard Button (hidden initially) -->
      <button id="back-to-dashboard" class="back-btn" style="display: none;">
        <span class="back-icon">←</span>
        <span class="back-text">Back to Dashboard</span>
      </button>
    </div>

    <style>
      .dashboard-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
        position: relative;
        overflow: hidden;
      }

      .dashboard-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
        pointer-events: none;
      }

      /* Futuristic Header */
      .dashboard-header {
        position: relative;
        padding: 3rem 2rem 4rem;
        text-align: center;
        z-index: 2;
      }

      .title-container {
        position: relative;
        z-index: 3;
      }

      .main-title {
        font-size: 4.5rem;
        font-weight: 900;
        margin: 0;
        line-height: 1;
        letter-spacing: -0.02em;
        position: relative;
      }

      .title-pulsechain {
        background: linear-gradient(135deg, #a855f7, #ff7cfb, #38bdf8);
        background-size: 200% 200%;
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 8s ease-in-out infinite;
        text-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
      }

      .title-ai {
        background: linear-gradient(135deg, #ff7cfb, #a855f7, #38bdf8);
        background-size: 200% 200%;
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 8s ease-in-out infinite reverse;
        text-shadow: 0 0 30px rgba(255, 124, 251, 0.5);
        margin-left: 0.5rem;
      }

      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      .subtitle {
        font-size: 1.2rem;
        color: #94a3b8;
        margin-top: 1rem;
        font-weight: 400;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      /* Floating Orbs */
      .floating-orbs {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }

      .orb {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent);
        animation: float 6s ease-in-out infinite;
      }

      .orb-1 {
        width: 100px;
        height: 100px;
        top: 20%;
        left: 10%;
        animation-delay: 0s;
      }

      .orb-2 {
        width: 60px;
        height: 60px;
        top: 60%;
        right: 15%;
        animation-delay: 2s;
      }

      .orb-3 {
        width: 80px;
        height: 80px;
        bottom: 20%;
        left: 20%;
        animation-delay: 4s;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }

      /* Agents Grid */
      .agents-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        padding: 0 2rem 4rem;
        max-width: 1400px;
        margin: 0 auto;
        position: relative;
        z-index: 2;
      }

      /* Agent Cards */
      .agent-card {
        position: relative;
        background: rgba(30, 30, 30, 0.8);
        border: 2px solid;
        border-radius: 20px;
        padding: 2rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(20px);
        overflow: hidden;
      }

      .agent-card[data-agent="hex"] {
        border-color: ${AGENTS.hex.borderColor};
        background: ${AGENTS.hex.bgColor};
      }

      .agent-card[data-agent="solidity"] {
        border-color: ${AGENTS.solidity.borderColor};
        background: ${AGENTS.solidity.bgColor};
      }

      .agent-card[data-agent="positive"] {
        border-color: ${AGENTS.positive.borderColor};
        background: ${AGENTS.positive.bgColor};
      }

      .agent-card[data-agent="safety"] {
        border-color: ${AGENTS.safety.borderColor};
        background: ${AGENTS.safety.bgColor};
      }

      .agent-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }

      .card-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .agent-card:hover .card-glow {
        opacity: 1;
      }

      .agent-card[data-agent="hex"] .card-glow {
        background: radial-gradient(circle at center, rgba(168, 85, 247, 0.2), transparent);
      }

      .agent-card[data-agent="solidity"] .card-glow {
        background: radial-gradient(circle at center, rgba(59, 130, 246, 0.2), transparent);
      }

      .agent-card[data-agent="positive"] .card-glow {
        background: radial-gradient(circle at center, rgba(16, 185, 129, 0.2), transparent);
      }

      .agent-card[data-agent="safety"] .card-glow {
        background: radial-gradient(circle at center, rgba(239, 68, 68, 0.2), transparent);
      }

      .card-content {
        position: relative;
        z-index: 2;
      }

      .agent-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
      }

      .agent-name {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        color: #fff;
      }

      .agent-description {
        color: #94a3b8;
        line-height: 1.6;
        margin-bottom: 2rem;
        font-size: 0.95rem;
      }

      .launch-btn {
        background: linear-gradient(135deg, #a855f7, #ff7cfb);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
      }

      .launch-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
      }

      .btn-icon {
        transition: transform 0.3s ease;
      }

      .launch-btn:hover .btn-icon {
        transform: translateX(4px);
      }

      /* Particles */
      .card-particles {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        animation: particleFloat 4s linear infinite;
      }

      .particle:nth-child(1) {
        top: 20%;
        left: 10%;
        animation-delay: 0s;
      }

      .particle:nth-child(2) {
        top: 60%;
        right: 20%;
        animation-delay: 1.5s;
      }

      .particle:nth-child(3) {
        bottom: 30%;
        left: 50%;
        animation-delay: 3s;
      }

      @keyframes particleFloat {
        0% {
          transform: translateY(0) translateX(0);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(-100px) translateX(20px);
          opacity: 0;
        }
      }

      /* Back Button */
      .back-btn {
        position: fixed;
        top: 2rem;
        left: 2rem;
        background: rgba(30, 30, 30, 0.9);
        border: 2px solid #a855f7;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        backdrop-filter: blur(10px);
        z-index: 1000;
      }

      .back-btn:hover {
        background: rgba(168, 85, 247, 0.2);
        transform: translateX(-4px);
      }

      .back-icon {
        font-size: 1.2rem;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .main-title {
          font-size: 3rem;
        }

        .agents-grid {
          grid-template-columns: 1fr;
          padding: 0 1rem 2rem;
          gap: 1.5rem;
        }

        .dashboard-header {
          padding: 2rem 1rem 3rem;
        }

        .back-btn {
          top: 1rem;
          left: 1rem;
          padding: 0.5rem 1rem;
        }

        .agent-card {
          margin: 0;
        }

        .agent-name {
          font-size: 1.3rem;
        }

        .agent-description {
          font-size: 0.9rem;
        }

        .launch-btn {
          padding: 0.6rem 1.2rem;
          font-size: 0.85rem;
        }
      }

      @media (max-width: 480px) {
        .dashboard-container {
          overflow-x: hidden;
        }

        .main-title {
          font-size: 2.2rem;
          line-height: 1.1;
        }

        .subtitle {
          font-size: 1rem;
        }

        .dashboard-header {
          padding: 1.5rem 0.75rem 2rem;
        }

        .agents-grid {
          padding: 0 0.75rem 1.5rem;
          gap: 1rem;
        }

        .agent-card {
          padding: 1.25rem;
          margin: 0;
        }

        .agent-icon {
          font-size: 2.2rem;
        }

        .agent-name {
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
        }

        .agent-description {
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .launch-btn {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          width: 100%;
          justify-content: center;
        }

        .back-btn {
          top: 0.75rem;
          left: 0.75rem;
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
        }

        .back-text {
          display: none;
        }

        .orb {
          display: none;
        }
      }

      /* Mobile-specific fixes */
      @media (max-width: 768px) {
        .dashboard-container {
          min-height: 100vh;
          overflow-x: hidden;
        }

        .agents-grid {
          overflow-x: hidden;
        }

        .agent-card {
          overflow-x: hidden;
        }
      }

      /* Prevent horizontal scroll on mobile */
      @media (max-width: 480px) {
        body {
          overflow-x: hidden;
        }

        .dashboard-container {
          width: 100vw;
          overflow-x: hidden;
        }

        .dashboard-header {
          width: 100%;
          overflow-x: hidden;
        }

        .agents-grid {
          width: 100%;
          overflow-x: hidden;
        }

        .agent-card {
          width: 100%;
          overflow-x: hidden;
        }
      }
    </style>
  `;

  // Add event listeners
  addDashboardEventListeners();
}

function addDashboardEventListeners() {
  // Agent card click handlers
  document.querySelectorAll('.launch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const agent = (btn as HTMLElement).dataset.agent;
      if (agent) {
        launchAgent(agent);
      }
    });
  });

  // Back button
  const backBtn = document.getElementById('back-to-dashboard');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showDashboard();
    });
  }
}

function launchAgent(agentType: string) {
  currentAgent = agentType;
  // Set the global currentAgent variable
  (window as any).currentAgent = agentType;
  
  // Hide dashboard
  const dashboardContainer = document.querySelector('.dashboard-container');
  if (dashboardContainer) {
    dashboardContainer.style.display = 'none';
  }

  // Show back button
  const backBtn = document.getElementById('back-to-dashboard');
  if (backBtn) {
    backBtn.style.display = 'flex';
  }

  // Launch the appropriate agent
  switch (agentType) {
    case 'hex':
      launchHexAgent();
      break;
    case 'solidity':
      launchSolidityAgent();
      break;
    case 'positive':
      launchPositiveAgent();
      break;
    case 'safety':
      launchSafetyAgent();
      break;
  }
}

function showDashboard() {
  currentAgent = null;
  
  // Show dashboard
  const dashboardContainer = document.querySelector('.dashboard-container');
  if (dashboardContainer) {
    dashboardContainer.style.display = 'block';
  }

  // Hide back button
  const backBtn = document.getElementById('back-to-dashboard');
  if (backBtn) {
    backBtn.style.display = 'none';
  }

  // Hide any active agent
  hideAllAgents();
}

function hideAllAgents() {
  // Hide chat interface if it exists
  const chatElements = document.querySelectorAll('#chat-log, #chat-form, .header-blur-bg');
  chatElements.forEach(el => {
    (el as HTMLElement).style.display = 'none';
  });
  
  // Hide Solidity interface if it exists
  const solidityInterface = document.querySelector('.solidity-interface');
  if (solidityInterface) {
    solidityInterface.style.display = 'none';
  }
}

// Agent launch functions (to be implemented)
function launchHexAgent() {
  // This will use the existing chat functionality
  buildUI();
  renderMessage('ai', "Hello! I am an AI assistant with knowledge about HEX and PulseChain, based on the official technical documentation. How can I help you understand the HEX smart contract today?");
}

function launchSolidityAgent() {
  // Use the specialized Solidity interface instead of the basic chat
  renderSolidityInterface();
}

function launchPositiveAgent() {
  buildUI();
  renderMessage('ai', "✨ **Positive Vibes Only**\n\nI'm here to help transform negative thoughts into positive perspectives! Share any negative thoughts, worries, or concerns you have, and I'll help you see them in a more positive light.");
}

function launchSafetyAgent() {
  buildUI();
  renderMessage('ai', "🛡️ **Staying Safe AI**\n\nI'm your digital safety companion! I can help you with:\n• Password security tips\n• Phishing detection\n• Social media safety\n• Online privacy protection\n• Cybersecurity best practices\n\nWhat safety topic would you like to discuss?");
}

// Export functions for use in main.tsx
(window as any).renderDashboard = renderDashboard;
(window as any).showDashboard = showDashboard; 