'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Menu, Plus, Clock, Zap, Moon, Sun } from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

// Typing Indicator Component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl max-w-[100px] shadow-sm">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  </div>
);

// Message Bubble Component
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={`flex gap-3 mb-4 animate-fadeIn ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
        isUser 
          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
          : 'bg-gradient-to-br from-blue-500 to-cyan-500'
      }`}>
        {isUser ? (
          <span className="text-white font-bold text-sm">أنت</span>
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ${
            isUser
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
          {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ 
  conversations, 
  onNewChat, 
  isOpen 
}: { 
  conversations: Conversation[]; 
  onNewChat: () => void; 
  isOpen: boolean;
}) => (
  <div className={`fixed right-0 top-0 h-full bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 z-50 ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  } w-80 border-l border-gray-200 dark:border-gray-700`}>
    {/* Sidebar Header */}
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onNewChat}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>محادثة جديدة</span>
      </button>
    </div>

    {/* Conversations List */}
    <div className="p-4 overflow-y-auto h-[calc(100%-100px)]">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">
        المحادثات السابقة
      </h3>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            className="w-full p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-right group"
          >
            <div className="flex items-center justify-between">
              <Clock className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate flex-1 mr-2">
                {conv.title}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {conv.timestamp.toLocaleDateString('ar-SA')}
            </p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// Main Chat Window Component
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! أنا Oqool AI، مساعدك الطبي الذكي. كيف يمكنني مساعدتك اليوم؟ 🏥',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversations: Conversation[] = [
    { id: '1', title: 'استشارة طبية', timestamp: new Date(2024, 9, 9) },
    { id: '2', title: 'أسئلة عن الأدوية', timestamp: new Date(2024, 9, 8) },
    { id: '3', title: 'نصائح صحية', timestamp: new Date(2024, 9, 7) }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // TODO: Connect to Claude API
    // For now, simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'شكراً لسؤالك! هذا رد تجريبي. قريباً سيتم ربط النظام بـ Claude 3.5 Sonnet للحصول على استشارات طبية دقيقة ومتخصصة. 🏥✨',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`${isDark ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
        {/* Sidebar */}
        <Sidebar 
          conversations={conversations}
          onNewChat={() => setMessages([messages[0]])}
          isOpen={isSidebarOpen}
        />

        {/* Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Right Side */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </button>
                  
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {isDark ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Center - Title */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Oqool AI - مساعدك الطبي الذكي
                  </h1>
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>

                {/* Left Side - Spacer */}
                <div className="w-20" />
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isTyping && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <TypingIndicator />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="relative">
                {/* Input Container */}
                <div className="flex items-end gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 focus-within:border-purple-500 dark:focus-within:border-purple-500 transition-all duration-200 p-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب سؤالك الطبي هنا..."
                    className="flex-1 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm px-2 py-1"
                    dir="rtl"
                  />
                  
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Helper Text */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  اضغط Enter للإرسال • Shift+Enter لسطر جديد
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}