'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import './teacher.css';
import { Message as AIMessage, ToastData } from '@/lib/types';

interface Message extends AIMessage {
  sources?: any[];
}

export default function TeacherPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // التمرير التلقائي
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // إرسال الرسالة
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // إرسال إلى API مع تحديد نوع المعلم
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: 'teacher-user',
          conversationId: 'teacher-session',
          settings: {
            teacherMode: true,
            iraqiTeacher: true, // تفعيل المعلم العراقي
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
          sources: data.sources,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'فشل في الحصول على رد');
      }
    } catch (error: any) {
      console.error('خطأ في الإرسال:', error);
      setToast({
        message: error.message || 'حدث خطأ في الاتصال',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // التعامل مع Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="teacher-page">
      {/* Header */}
      <div className="teacher-header">
        <div className="teacher-avatar">👨‍🏫</div>
        <div className="teacher-info">
          <h1>المعلم العراقي الذكي</h1>
          <p>أستاذك الخاص في جميع المواد الدراسية 📚</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">👋</div>
            <h2>مرحباً بيك يا طالب! 🎓</h2>
            <p>أنا أستاذك الخاص، جاهز لمساعدتك في:</p>
            <div className="features-grid">
              <div className="feature-card">
                <span>📖</span>
                <span>شرح الدروس</span>
              </div>
              <div className="feature-card">
                <span>✏️</span>
                <span>حل الواجبات</span>
              </div>
              <div className="feature-card">
                <span>🧮</span>
                <span>الرياضيات</span>
              </div>
              <div className="feature-card">
                <span>🔬</span>
                <span>العلوم</span>
              </div>
              <div className="feature-card">
                <span>📚</span>
                <span>اللغة العربية</span>
              </div>
              <div className="feature-card">
                <span>🌍</span>
                <span>الإنجليزي</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="message-avatar">👨‍🏫</div>
                )}
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources">
                      <p className="sources-title">📚 مصادر إضافية:</p>
                      {msg.sources.slice(0, 3).map((source: any, idx: number) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="message-avatar user-avatar">👤</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message">
                <div className="message-avatar">👨‍🏫</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-container">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب سؤالك هنا... مثلاً: شرح لي درس الكسور"
          className="teacher-input"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
