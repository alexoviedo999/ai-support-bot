import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './ChatWidget';

// Configuration interface
interface WidgetConfig {
  tenantId?: string;
  apiBaseUrl?: string;
  botName?: string;
  primaryColor?: string;
}

// Expose widget initialization to window
declare global {
  interface Window {
    AISupportWidget?: {
      init: (config: WidgetConfig) => void;
    };
  }
}

// Auto-initialize or expose API
const init = (config: WidgetConfig = {}) => {
  // Create container if it doesn't exist
  let container = document.getElementById('ai-support-widget-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ai-support-widget-root';
    document.body.appendChild(container);
  }

  // Render widget
  const root = ReactDOM.createRoot(container);
  root.render(
    React.createElement(ChatWidget, {
      tenantId: config.tenantId || 'demo',
      apiBaseUrl: config.apiBaseUrl || 'https://ai-support-api.vercel.app',
      botName: config.botName || 'AI Assistant',
      primaryColor: config.primaryColor || '#6366f1'
    })
  );
};

// Export for module usage
export { ChatWidget, init };

// Auto-init if data-config attribute present
if (typeof document !== 'undefined') {
  const script = document.currentScript as HTMLScriptElement;
  if (script?.dataset?.config) {
    try {
      const config = JSON.parse(script.dataset.config);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init(config));
      } else {
        init(config);
      }
    } catch (e) {
      console.error('Failed to parse widget config:', e);
    }
  }

  // Expose init function globally
  window.AISupportWidget = { init };
}
