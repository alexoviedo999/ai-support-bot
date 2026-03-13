import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  tenantId?: string;
  apiBaseUrl?: string;
  botName?: string;
  primaryColor?: string;
  welcomeMessage?: string;
  avatar?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  tenantId = 'demo',
  apiBaseUrl = 'http://localhost:3001',
  botName = 'AI Assistant',
  primaryColor = '#6366f1',
  welcomeMessage = "👋 Hi! How can I help you today?",
  avatar = "🤖"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, tenantId })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I encountered an error.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (!isOpen) setHasUnread(true);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I couldn\'t connect to the server. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setHasUnread(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Generate lighter shade for backgrounds
  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  };

  const primaryLight = lightenColor(primaryColor, 90);
  const primaryDark = lightenColor(primaryColor, -20);

  const styles = {
    container: {
      position: 'fixed' as const,
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    button: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 8px 24px ${primaryColor}40, 0 4px 8px rgba(0,0,0,0.1)`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    },
    buttonHover: {
      transform: isOpen ? 'rotate(180deg) scale(1.05)' : 'scale(1.05)',
      boxShadow: `0 12px 32px ${primaryColor}50, 0 6px 12px rgba(0,0,0,0.15)`,
    },
    chatWindow: {
      position: 'absolute' as const,
      bottom: '80px',
      right: '0',
      width: '400px',
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 24px 48px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    header: {
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
      color: 'white',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
    },
    headerInfo: {
      flex: 1,
    },
    headerTitle: {
      fontWeight: 600,
      fontSize: '16px',
      marginBottom: '2px',
    },
    headerStatus: {
      fontSize: '12px',
      opacity: 0.85,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#10b981',
    },
    closeButton: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      transition: 'background 0.2s',
    },
    messages: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      background: '#fafbfc',
    },
    messageWrapper: (role: 'user' | 'assistant') => ({
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: role === 'user' ? 'flex-end' : 'flex-start',
      maxWidth: '85%',
      alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    }),
    message: (role: 'user' | 'assistant') => ({
      padding: '14px 18px',
      borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: role === 'user' 
        ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`
        : 'white',
      color: role === 'user' ? 'white' : '#1e293b',
      fontSize: '14px',
      lineHeight: 1.6,
      boxShadow: role === 'user' 
        ? `0 4px 12px ${primaryColor}30`
        : '0 2px 8px rgba(0,0,0,0.06)',
    }),
    messageTime: {
      fontSize: '11px',
      color: '#94a3b8',
      marginTop: '6px',
      padding: '0 4px',
    },
    typingIndicator: {
      display: 'flex',
      gap: '4px',
      padding: '14px 18px',
      background: 'white',
      borderRadius: '18px 18px 18px 4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    typingDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: primaryColor,
      opacity: 0.4,
      animation: 'typingPulse 1.4s ease-in-out infinite',
    },
    welcomeMessage: {
      textAlign: 'center' as const,
      padding: '32px 20px',
    },
    welcomeIcon: {
      fontSize: '3rem',
      marginBottom: '16px',
    },
    welcomeText: {
      color: '#64748b',
      fontSize: '14px',
      lineHeight: 1.6,
    },
    inputContainer: {
      padding: '16px 20px',
      borderTop: '1px solid #e2e8f0',
      background: 'white',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      padding: '14px 18px',
      border: '2px solid #e2e8f0',
      borderRadius: '24px',
      outline: 'none',
      fontSize: '14px',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      background: '#f8fafc',
    },
    sendButton: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
      color: 'white',
      border: 'none',
      cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
      opacity: isLoading || !input.trim() ? 0.5 : 1,
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      boxShadow: `0 4px 12px ${primaryColor}30`,
    },
    unreadBadge: {
      position: 'absolute' as const,
      top: '-4px',
      right: '-4px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: '#ef4444',
      color: 'white',
      fontSize: '11px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
    },
    poweredBy: {
      textAlign: 'center' as const,
      padding: '8px',
      fontSize: '11px',
      color: '#94a3b8',
      borderTop: '1px solid #f1f5f9',
    },
  };

  // Add keyframes animation
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes typingPulse {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-4px); opacity: 1; }
      }
      .chat-widget-messages::-webkit-scrollbar { width: 6px; }
      .chat-widget-messages::-webkit-scrollbar-track { background: transparent; }
      .chat-widget-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
      .chat-widget-messages::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
    `;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <div style={styles.avatar}>{avatar}</div>
            <div style={styles.headerInfo}>
              <div style={styles.headerTitle}>{botName}</div>
              <div style={styles.headerStatus}>
                <span style={styles.statusDot}></span>
                Online • Typically replies instantly
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          
          <div style={styles.messages} className="chat-widget-messages">
            {messages.length === 0 && (
              <div style={styles.welcomeMessage}>
                <div style={styles.welcomeIcon}>{avatar}</div>
                <div style={styles.welcomeText}>{welcomeMessage}</div>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} style={styles.messageWrapper(msg.role)}>
                <div style={styles.message(msg.role)}>
                  {msg.content}
                </div>
                <div style={styles.messageTime}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={styles.messageWrapper('assistant')}>
                <div style={styles.typingIndicator}>
                  <span style={{...styles.typingDot, animationDelay: '0ms'}}></span>
                  <span style={{...styles.typingDot, animationDelay: '200ms'}}></span>
                  <span style={{...styles.typingDot, animationDelay: '400ms'}}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.poweredBy}>
            Powered by AI Support
          </div>

          <div style={styles.inputContainer}>
            <input
              ref={inputRef}
              style={styles.input}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isLoading}
              onFocus={(e) => {
                e.target.style.borderColor = primaryColor;
                e.target.style.boxShadow = `0 0 0 3px ${primaryLight}`;
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.background = '#f8fafc';
              }}
            />
            <button 
              style={styles.sendButton} 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}

      <button 
        style={styles.button} 
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        )}
      </button>
      
      {hasUnread && !isOpen && (
        <div style={styles.unreadBadge}>1</div>
      )}
    </div>
  );
};

export default ChatWidget;
