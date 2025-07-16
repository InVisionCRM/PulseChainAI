/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import { marked } from 'marked';

// Import dashboard functions
import './dashboard.tsx';
import './solidity-interface.tsx';

// --- APP STATE AND DOM ELEMENTS ---
const app = document.getElementById('app')!;
let chatLog: HTMLElement;
let chatForm: HTMLFormElement;
let chatInput: HTMLTextAreaElement;
let sendButton: HTMLButtonElement;
let splashScreen: HTMLElement | null = null;

let isLoading = false;
let isFirstMessage = true;
let deferredInstallPrompt: any = null;
let showSplash = true;
let canInstall = false;
let currentAgent: string | null = null;

// API Configuration
const API_BASE_URL = '/api';

// Listen for PWA installation prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  canInstall = true;
  const installButton = document.getElementById('install-app-button');
  if (installButton) {
    installButton.style.display = 'flex';
    installButton.disabled = false;
  }
  // Also show install button on splash
  const splashInstallBtn = document.getElementById('splash-install-btn');
  if (splashInstallBtn) {
    splashInstallBtn.style.display = 'inline-flex';
    splashInstallBtn.removeAttribute('disabled');
    splashInstallBtn.title = '';
  }
});

/**
 * Handles the PWA installation prompt.
 */
async function handleInstallPrompt() {
  const installButton = document.getElementById('install-app-button');
  const splashInstallBtn = document.getElementById('splash-install-btn');
  if (!deferredInstallPrompt) {
    // No prompt available
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  if (installButton) installButton.style.display = 'none';
  if (splashInstallBtn) splashInstallBtn.style.display = 'none';
}

function renderSplashScreen() {
  if (splashScreen) splashScreen.remove();
  splashScreen = document.createElement('div');
  splashScreen.id = 'splash-screen';
  splashScreen.tabIndex = 0;
  splashScreen.innerHTML = `
    <div class="splash-overlay-minimal">
      <div class="splash-content-minimal">
        <h1 class="splash-title-minimal">PulseChainAI.com</h1>
        <p class="splash-desc-minimal">
          This is an AI-powered tool for learning the basics of HEX. Information may not be 100% accurate. For official documentation, visit <a href="https://hex.com" target="_blank" rel="noopener">HEX.com</a> and <a href="https://pulsechain.com" target="_blank" rel="noopener">PulseChain.com</a>.
        </p>
        <p class="splash-warning-minimal">
          If you notice any inaccuracies, DM <a href="https://twitter.com/KCCRYPTO369" target="_blank" rel="noopener">@KCCRYPTO369</a> on X.<br>
          This app was made by <a href="https://superstake.win" target="_blank" rel="noopener">SuperStake.Win</a> out of love for HEX and PulseChain.
        </p>
        <div class="splash-scam-minimal">
          <b>Notice:</b> If anyone claims to be part of this project and asks for donations, it is a scam. There are no official X or Telegram accounts for PulseChainAI.com.
        </div>
        <button id="splash-continue-btn" class="splash-btn-minimal">Continue</button>
      </div>
    </div>
    <style>
      .splash-overlay-minimal {
        position: fixed; z-index: 9999; inset: 0; background: rgba(24,24,27,0.85); display: flex; align-items: center; justify-content: center;
      }
      .splash-content-minimal {
        background: rgba(35, 35, 42, 0.2);
        border-radius: 1rem;
        box-shadow: 0 4px 24px 0 rgba(0,0,0,0.18);
        padding: 2.2rem 2rem;
        max-width: 400px;
        width: 100%;
        color: #e5e7eb;
        text-align: center;
        font-family: 'Inter', 'Poppins', sans-serif;
        border: 2px solid #fff;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      .splash-title-minimal {
        font-size: 2rem; font-weight: 700; margin-bottom: 1.1rem; color: #a855f7;
      }
      .splash-desc-minimal {
        font-size: 1.05rem; margin-bottom: 1.1rem; color: #e5e7eb;
      }
      .splash-warning-minimal {
        font-size: 0.98rem; color: #bdbdbd; margin-bottom: 1.1rem;
      }
      .splash-scam-minimal {
        background: #23232a; color: #f87171; border: 1px solid #a855f7; border-radius: 0.5rem; padding: 0.7rem; margin-bottom: 1.2rem; font-size: 0.97rem;
      }
      .splash-btn-minimal {
        background: #a855f7; color: #fff; font-size: 1.08rem; font-weight: 600; border: none; border-radius: 0.4rem; padding: 0.7rem 1.6rem; cursor: pointer; transition: background 0.18s;
      }
      .splash-btn-minimal:hover, .splash-btn-minimal:focus {
        background: #7c3aed;
      }
      a { color: #a855f7; text-decoration: underline; }
      @media (max-width: 600px) {
        .splash-content-minimal { padding: 1.1rem 0.5rem; max-width: 75vw; }
        .splash-title-minimal { font-size: 1rem; }
      }
    </style>
  `;
  document.body.appendChild(splashScreen);
  splashScreen.focus();
  document.getElementById('splash-continue-btn')?.addEventListener('click', () => {
    splashScreen?.remove();
    showSplash = false;
  });
}

// --- CORE FUNCTIONS ---

/**
 * Processes markdown text and converts it to HTML.
 * @param {string} text The markdown text to process.
 * @returns {string} The processed HTML.
 */
function processMarkdown(text: string): string {
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
    // Add spacing around sections
    .replace(/<br><strong>/g, '<br><br><strong>')
    // Ensure proper spacing after sections
    .replace(/<\/strong><br>/g, '</strong><br><br>');
}

/**
 * Renders a message in the chat log.
 * @param {'user' | 'ai'} sender The sender of the message.
 * @param {string} text The message text.
 * @returns {Promise<HTMLElement>} A promise that resolves with the message element that was just added.
 */
async function renderMessage(sender: 'user' | 'ai', text: string): Promise<HTMLElement> {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message', sender);

  const iconEl = document.createElement('div');
  iconEl.classList.add('icon');

  if (sender === 'ai') {
    iconEl.innerHTML = `<img src="https://i.imgur.com/YjBbtpx.png" alt="AI Avatar">`;
  } else {
    iconEl.textContent = '👤';
  }

  const textEl = document.createElement('div');
  textEl.classList.add('text');
  
  if (sender === 'ai') {
    textEl.innerHTML = processMarkdown(text);
  } else {
    textEl.textContent = text;
  }
  
  messageEl.append(iconEl, textEl);
  chatLog.append(messageEl);
  chatLog.scrollTop = chatLog.scrollHeight;
  return textEl;
}

/**
 * Handles the form submission to send a message to the AI.
 * @param {Event} e The form submission event.
 */
async function handleSendMessage(e: Event) {
  e.preventDefault();
  if (isLoading) return;

  const userMessage = chatInput.value.trim();

  if (!userMessage) return;

  await renderMessage('user', userMessage);
  chatInput.value = '';
  chatInput.style.height = 'auto';
  setLoading(true);
  
  const aiMessageEl = await renderMessage('ai', '<span class="loading-indicator">●</span>');

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        isFirstMessage: isFirstMessage,
        agentType: (window as any).currentAgent || 'hex'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Vercel serverless function returns JSON, not a stream
    const data = await response.json();
    aiMessageEl.innerHTML = processMarkdown(data.text);
    isFirstMessage = false;

  } catch (error) {
    console.error("Error sending message:", error);
    aiMessageEl.innerHTML = 'Sorry, something went wrong while getting a response. Please try again.';
  } finally {
    setLoading(false);
    chatLog.scrollTop = chatLog.scrollHeight;
  }
}

/**
 * Sets the loading state of the application.
 * @param {boolean} state The new loading state.
 */
function setLoading(state: boolean) {
  isLoading = state;
  sendButton.disabled = state;
  chatInput.disabled = state;
  if (!state) {
    chatInput.focus();
  }
}

/**
 * Builds the application's UI.
 */
function buildUI() {
  // Set full background image on body (no fallback black background)
  document.body.style.background = "url('https://imgur.com/0MPD1rb.jpg') center center / cover no-repeat fixed";
  document.body.style.minHeight = '100dvh';
  document.body.style.width = '100vw';
  document.body.style.overflowX = 'hidden';

  // Clear any existing dashboard
  const dashboardContainer = document.querySelector('.dashboard-container');
  if (dashboardContainer) {
    dashboardContainer.style.display = 'none';
  }

  app.innerHTML = `
    <header class="header-blur-bg" style="background: none; display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden;">
      <h1 class="animated-gradient-title">PulseChainAI.com</h1>
      <div class="header-subtitle">by <a href="https://superstake.win" target="_blank" rel="noopener" class="superstake-link">SuperStake.Win</a></div>
    </header>
    <div id="chat-log"></div>
    <form id="chat-form" style="background: transparent;">
      <div class="form-controls chat-controls-responsive" style="background: transparent;">
        <div class="input-wrapper" style="background: transparent;">
          <textarea id="chat-input" rows="1"></textarea>
        </div>
        <button id="send-button" type="submit">Send</button>
      </div>
    </form>
    <style>
      .header-blur-bg {
        position: relative;
        z-index: 1;
        border-radius: 0 0 2.5rem 2.5rem;
        overflow: hidden;
        border-bottom: 2.5px solid #fff;
      }
      .header-blur-bg::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background: url('https://imgur.com/4w6ZOzN.jpg') center center / cover no-repeat;
        filter: blur(4px);
        opacity: 1;
      }
      .header-blur-bg > * {
        position: relative;
        z-index: 1;
      }
      .animated-gradient-title {
        font-size: 2.7rem;
        font-weight: 700;
        background: linear-gradient(270deg, #ff7cfb, #a855f7, #38bdf8, #ff7cfb);
        background-size: 200% auto;
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        animation: gradientMove 12s linear infinite;
        margin-bottom: 0.2rem;
        line-height: 1.1;
        filter: brightness(1.25) drop-shadow(0 1px 3px #fff6);
      }
      @keyframes gradientMove {
        0% { background-position: 0% center; }
        100% { background-position: 200% center; }
      }
      .header-subtitle {
        font-size: 0.98rem;
        color: #bdbdbd;
        margin-top: -0.5rem;
        margin-bottom: 0.5rem;
        font-weight: 400;
        display: block;
      }
      .superstake-link {
        font-weight: 700;
        color: #fff !important;
        text-decoration: underline !important;
      }
      .form-controls, .chat-controls-responsive, .input-wrapper, form {
        background: transparent !important;
        border-top: none !important;
        border: none !important;
        box-shadow: none !important;
      }
      .chat-controls-responsive {
        margin-top: 32px;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: center;
        max-width: 480px;
        margin-left: auto;
        margin-right: auto;
        gap: 8px;
        padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
      }
      .input-wrapper {
        flex: 1 1 0%;
        border-radius: 0.7rem;
        border: 2.5px solid;
        border-image: linear-gradient(90deg, #ff5ecd, #7c3aed) 1;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0;
        display: flex;
        align-items: stretch;
      }
      #chat-input {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        font-size: 16px;
        border-radius: 0.7rem;
        border: none;
        outline: none;
        padding: 0.7rem 1rem;
        background: #18181b;
        color: #fff;
        resize: none;
        box-shadow: none;
      }
      #send-button {
        font-size: 1rem;
        padding: 0.7rem 1.2rem;
        border-radius: 0.5rem;
        border: none;
        background: linear-gradient(90deg, #ff5ecd, #7c3aed);
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.18s;
      }
      #send-button:hover, #send-button:focus {
        background: linear-gradient(90deg, #7c3aed, #ff5ecd);
      }
      
      /* Markdown formatting styles */
      .message.ai .text strong {
        font-weight: 700;
        color: #fff;
      }
      
      .message.ai .text ul {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
      }
      
      .message.ai .text li {
        margin: 0.25rem 0;
        line-height: 1.4;
      }
      
      .message.ai .text br {
        line-height: 1.6;
      }
      @media (max-width: 600px) {
        .animated-gradient-title { font-size: 1.7rem; }
        .chat-controls-responsive {
          max-width: 98vw;
          margin-top: 16px;
          gap: 4px;
          padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px));
        }
        #chat-input {
          font-size: 16px;
          padding: 0.6rem 0.7rem;
        }
        #send-button {
          font-size: 0.98rem;
          padding: 0.6rem 0.8rem;
        }
      }
    </style>
  `;

  // Assign DOM elements to variables
  chatLog = document.getElementById('chat-log')!;
  chatForm = document.getElementById('chat-form') as HTMLFormElement;
  chatInput = document.getElementById('chat-input') as HTMLTextAreaElement;
  sendButton = document.getElementById('send-button') as HTMLButtonElement;
  
  // Add event listeners
  chatForm.addEventListener('submit', handleSendMessage);
  
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  });

  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${chatInput.scrollHeight}px`;
  });

  // Show splash on first load
  if (showSplash) {
    renderSplashScreen();
  }
}

/**
 * Main application entry point.
 */
async function main() {
  // Start with the dashboard instead of the chat interface
  renderDashboard();
}

main();