import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import api from '../services/api';

const QUICK_PROMPTS = [
  "What is the ideal knee angle for Aramandi?",
  "Explain Asamyuta and Samyuta Hastas.",
  "Which tala is used in Kathak Tatkar?",
  "How to correct shoulder alignment in Natyarambha?"
];

export default function NatyaGuruChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaskaram! I am your AI Natya Guru. Ask me anything regarding classical dance postures, Hastas mudras, Tala rhythm cycles, or technique correction.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (userPrompt = inputText) => {
    if (!userPrompt || !userPrompt.trim() || isLoading) return;

    const query = userPrompt.trim();
    setInputText('');

    const updatedMessages = [
      ...messages,
      { role: 'user', content: query }
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await api.post('/guru-chat/ask', {
        message: query,
        conversation_history: updatedMessages.map(m => ({ role: m.role, content: m.content }))
      });

      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: response.data?.reply || response.data?.response || 'I have reflected upon your question in the classical tradition.'
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      let replyText = "Precise geometric alignment is fundamental in classical dance. For Aramandi, maintain a 120°-135° knee bend with heels aligned, while keeping the spine vertical.";
      if (query.toLowerCase().includes("mudra") || query.toLowerCase().includes("hasta")) {
        replyText = "There are 28 Asamyuta (single hand) and 24 Samyuta (combined hand) Hastas. Each hand gesture carries symbolic meaning for communicating narrative expressions.";
      } else if (query.toLowerCase().includes("tala") || query.toLowerCase().includes("rhythm")) {
        replyText = "Tala regulates rhythmic cycles in classical dance. For instance, Adi Tala spans 8 beats (Laghu 4 + Dhrutam 2 + Dhrutam 2), while Teental comprises 16 Matras.";
      }

      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: replyText
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 6px 20px rgba(234, 88, 12, 0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.2s ease'
        }}
        title="Chat with AI Natya Guru"
      >
        {isOpen ? <X size={22} color="#ffffff" /> : <Bot size={26} color="#ffffff" />}
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 110px)',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderTop: '4px solid var(--gold-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.96rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                  AI Natya Guru
                </h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold-dark)', fontWeight: 600 }}>Dance Assistant</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '84%',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' 
                      : '#ffffff',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '14px',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '14px',
                    boxShadow: msg.role === 'user' ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'var(--shadow-xs)',
                    border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#ffffff', padding: '8px 14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
                  <div className="loading-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '8px 12px', background: '#ffffff', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', overflowX: 'auto' }} className="scrollbar-none">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--gold-bg)',
                  border: '1px solid #fde68a',
                  color: 'var(--gold-dark)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px', background: '#ffffff' }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about postures, mudras, tala..."
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: '#f8fafc',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="btn-primary"
              style={{ padding: '9px 14px', borderRadius: 'var(--radius-sm)' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      )}
    </>
  );
}
