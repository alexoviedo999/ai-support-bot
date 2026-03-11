import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  tenantId?: string;
  apiBaseUrl?: string;
  botName?: string;
  primaryColor?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  tenantId = 'demo',
  apiBaseUrl = 'http://localhost:3001',
  botName = 'AI Assistant',
  primaryColor = '#6366f1'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
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
        content: data.response || 'Sorry, I encountered an error.'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I couldn\'t connect to the server. Please try again.'
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

  const styles = {
    container: {
      position: 'fixed' as const,
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    button: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: primaryColor,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transition: 'transform 0.2s'
    },
    chatWindow: {
      position: 'absolute' as const,
      bottom: '70px',
      right: '0',
      width: '380px',
      height: '550px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden'
    },
    header: {
      backgroundColor: primaryColor,
      color: 'white',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    messages: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px'
    },
    message: (role: 'user' | 'assistant') => ({
      maxWidth: '80%',
      padding: '12px 16px',
      borderRadius: '16px',
      backgroundColor: role === 'user' ? primaryColor : '#f1f5f9',
      color: role === 'user' ? 'white' : '#1e293b',
      alignSelf: role === 'user' ? 'flex-end' : 'flex-start'
    }),
    inputContainer: {
      padding: '16px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      gap: '8px'
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '24px',
      outline: 'none',
      fontSize: '14px'
    },
    sendButton: {
      padding: '12px 20px',
      backgroundColor: primaryColor,
      color: 'white',
      border: 'none',
      borderRadius: '24px',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.6 : 1,
      fontSize: '14px',
      fontWeight: 500
    }
  };

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <span style={{ fontWeight: 600, fontSize: '16px' }}>{botName}</span>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}
            >
              ×
            </button>
          </div>
          
          <div style={styles.messages}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                👋 Hi! How can I help you today?
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} style={styles.message(msg.role)}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div style={styles.message('assistant')}>
                <span style={{ opacity: 0.6 }}>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputContainer}>
            <input
              style={styles.input}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isLoading}
            />
            <button 
              style={styles.sendButton} 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button 
        style={styles.button} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
