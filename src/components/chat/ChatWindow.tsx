'use client';

import React, { useState } from 'react';
import { Send, Image, ChevronDown, Sparkles, Zap, FileText, Code, Bug, Cpu, Cloud } from 'lucide-react';
import { api } from '@/lib/api';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ModelType = 'local' | 'api';

export default function ChatWindow() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelType>('local');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const models = [
    { 
      id: 'local' as ModelType, 
      name: 'مؤيد (Muayad)', 
      icon: Cpu, 
      color: 'from-emerald-500 to-green-600', 
      desc: 'نموذج محلي - سريع وآمن' 
    },
    { 
      id: 'api' as ModelType, 
      name: 'نموذج سحابي', 
      icon: Cloud, 
      color: 'from-purple-500 to-blue-600', 
      desc: 'قدرات متقدمة' 
    }
  ];

  const selectedModelData = models.find(m => m.id === selectedModel);
  const ModelIcon = selectedModelData?.icon;

  const examples = [
    { icon: FileText, text: 'اكتب توثيق احترافي', color: 'hover:border-blue-500/40' },
    { icon: Zap, text: 'حسّن الأداء والكفاءة', color: 'hover:border-yellow-500/40' },
    { icon: Bug, text: 'ابحث وأصلح الأخطاء', color: 'hover:border-red-500/40' }
  ];

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const modelTypeForApi = selectedModel === 'api' ? 'cloud' : 'local';
      
      const response = await api.sendMessage(
        userMessage.content,
        undefined,
        undefined,
        modelTypeForApi
      );

      const aiMessage: Message = {
        id: response.assistant_message.id,
        role: 'assistant',
        content: response.assistant_message.content,
        timestamp: new Date(response.assistant_message.created_at)
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all group-hover:scale-105">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Oqool AI</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">مطوّر في</div>
            <div className="text-xs font-semibold text-gray-400">🎓 جامعة العين</div>
          </div>
        </div>
      </nav>

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-6 py-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'bg-[#242424] text-gray-100 border border-white/10'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#242424] rounded-2xl px-6 py-4 border border-white/10">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`${messages.length === 0 ? 'flex-1 flex items-end' : ''} justify-center p-8 pb-24`}>
        <div className="w-full max-w-5xl space-y-8">
          <div className={`relative bg-gradient-to-b from-[#242424] to-[#1e1e1e] rounded-3xl border transition-all duration-300 shadow-2xl ${
            isFocused ? 'border-purple-500/50 shadow-purple-500/20' : 'border-white/10'
          }`}>
            {isFocused && (
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl opacity-20 blur-xl" />
            )}
            
            <div className="relative">
              <div className="p-8">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="اطلب من مؤيد الإجابة على أسئلتك، كتابة أكواد، أو أي شيء آخر..."
                  className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-xl leading-relaxed font-light"
                  rows={4}
                  dir="rtl"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between px-8 py-5 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowModelMenu(!showModelMenu)}
                      className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-white/20 group"
                    >
                      <div className={`w-8 h-8 bg-gradient-to-br ${selectedModelData?.color} rounded-lg flex items-center justify-center shadow-lg`}>
                        {ModelIcon && <ModelIcon className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-sm font-semibold">{selectedModelData?.name}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </button>

                    {showModelMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowModelMenu(false)} />
                        <div className="absolute top-full mt-3 left-0 bg-[#242424] rounded-2xl border border-white/10 shadow-2xl min-w-[280px] z-50 overflow-hidden">
                          {models.map((model) => {
                            const Icon = model.icon;
                            return (
                              <button
                                key={model.id}
                                onClick={() => {
                                  setSelectedModel(model.id);
                                  setShowModelMenu(false);
                                }}
                                className="w-full px-5 py-4 text-right hover:bg-white/5 transition-all flex items-center gap-3 group border-b border-white/5 last:border-0"
                              >
                                <div className={`w-10 h-10 bg-gradient-to-br ${model.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 text-right">
                                  <div className="font-semibold text-white">{model.name}</div>
                                  <div className="text-xs text-gray-400 mt-0.5">{model.desc}</div>
                                </div>
                                {selectedModel === model.id && (
                                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className={`p-3 rounded-xl transition-all ${
                    message.trim() && !isLoading
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                      : 'bg-white/5 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {messages.length === 0 && (
            <div className="space-y-5">
              <p className="text-center text-gray-500 text-sm font-medium">
                جرّب هذه الأمثلة للبدء 👇
              </p>
              <div className="flex items-center justify-center gap-4">
                {examples.map((example, idx) => {
                  const Icon = example.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setMessage(example.text)}
                      className={`flex items-center gap-3 px-6 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 ${example.color} transition-all hover:scale-105 group`}
                    >
                      <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">
                        {example.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-xs text-gray-600 font-medium">
          <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">Shift</kbd>
          {' + '}
          <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">Enter</kbd>
          {' للسطر الجديد • '}
          <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">Enter</kbd>
          {' للإرسال'}
        </p>
      </div>
    </div>
  );
}
