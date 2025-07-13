/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import { marked } from 'marked';

// --- APP STATE AND DOM ELEMENTS ---
const app = document.getElementById('app')!;
let chatLog: HTMLElement;
let chatForm: HTMLFormElement;
let chatInput: HTMLTextAreaElement;
let sendButton: HTMLButtonElement;

let isLoading = false;
let isFirstMessage = true;
let deferredInstallPrompt: any = null;

// API Configuration
const API_BASE_URL = 'http://localhost:3001';

// Listen for PWA installation prompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredInstallPrompt = e;
  // Update UI to notify the user they can install the PWA
  const installButton = document.getElementById('install-app-button');
  if (installButton) {
    installButton.style.display = 'flex';
  }
});

/**
 * Handles the PWA installation prompt.
 */
async function handleInstallPrompt() {
  const installButton = document.getElementById('install-app-button');
  if (!deferredInstallPrompt || !installButton) {
    return;
  }
  // Show the install prompt
  deferredInstallPrompt.prompt();
  // Wait for the user to respond to the prompt
  await deferredInstallPrompt.userChoice;
  // We've used the prompt, and can't use it again, but we can listen for another event.
  deferredInstallPrompt = null;
  // Hide the install button
  installButton.style.display = 'none';
}

// --- CORE FUNCTIONS ---

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
    textEl.innerHTML = text;
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
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        isFirstMessage: isFirstMessage
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    let streamedText = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      streamedText += chunk;
      
      aiMessageEl.innerHTML = streamedText + ' <span class="loading-indicator">●</span>';
      chatLog.scrollTop = chatLog.scrollHeight;
    }
    
    aiMessageEl.innerHTML = streamedText;
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
  app.innerHTML = `
    <header>
      <h1>PulseChainAI.COM</h1>
      <button id="install-app-button" style="display: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="install-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Install</span>
      </button>
    </header>
    <div id="chat-log"></div>
    <form id="chat-form">
      <div class="form-controls">
        <div class="input-wrapper">
          <textarea id="chat-input" placeholder="Ask about HEX..." rows="1"></textarea>
        </div>
        <button id="send-button" type="submit">Send</button>
      </div>
    </form>
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

  document.getElementById('install-app-button')!.addEventListener('click', handleInstallPrompt);
}

/**
 * Main application entry point.
 */
async function main() {
  buildUI();
  await renderMessage('ai', "Hello! I am an AI assistant with knowledge about HEX and PulseChain, based on the official technical documentation. How can I help you understand the HEX smart contract today?");
  setLoading(false);
}

main();