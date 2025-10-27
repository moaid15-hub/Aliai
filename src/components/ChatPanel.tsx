'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatPanelProps {
  onCodeUpdate: (code: string, language: string) => void;
  currentCode: string;
}

export default function ChatPanel({ onCodeUpdate, currentCode }: ChatPanelProps) {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'ai', content: 'مرحباً! اكتب طلبك وسأكتب لك الكود 🚀' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/code-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          currentCode
        })
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'ai', content: `❌ ${data.error}` }]);
      } else if (data.code) {
        console.log('📝 Updating code:', data.code); // للتأكد
        onCodeUpdate(data.code, data.language);
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: `✅ تم تحديث المحرر بـ ${data.language}!` 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: '⚠️ لم أستطع توليد الكود' }]);
      }
    } catch (error: any) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: '❌ خطأ في الاتصال. حاول مرة أخرى.' }]);
    }

    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#1a1a1a',
      borderRight: '1px solid #333'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        background: 'rgba(102,126,234,0.1)'
      }}>
        <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>💬 الدردشة</h2>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '12px',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255,255,255,0.1)',
              padding: '12px 16px',
              borderRadius: '12px',
              color: 'white',
              maxWidth: '80%',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content.includes('```') ? (
                <div dangerouslySetInnerHTML={{
                  __html: msg.content.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => 
                    `<div style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; margin: 8px 0; overflow-x: auto;">
                      <div style="color: #aaa; font-size: 12px; margin-bottom: 4px;">${lang || ''}</div>
                      <pre style="margin: 0;">${code}</pre>
                    </div>`
                  )
                }} />
              ) : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '20px' }}>🤖</div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '12px 16px',
              borderRadius: '12px',
              color: 'white'
            }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '20px',
        borderTop: '1px solid #333'
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اكتب طلبك..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid #333',
            borderRadius: '8px',
            color: 'white',
            outline: 'none'
          }}
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}