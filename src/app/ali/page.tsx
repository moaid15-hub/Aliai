'use client';

import React, { useState } from 'react';
import { Send, Image, ChevronDown, Sparkles, Zap, FileText, Code, Bug, Cpu, Cloud, Paperclip } from 'lucide-react';
import { api } from '@/lib/api';
import type { AxiosError } from 'axios';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AliAI() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState('muayad');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const models = [
    { id: 'muayad', name: 'مُؤيَّد (Muayad)', icon: Cpu, color: 'from-emerald-500 to-green-600', desc: 'نموذج محلي - سريع' },
    { id: 'api', name: 'نموذج سحابي', icon: Cloud, color: 'from-purple-500 to-blue-600', desc: 'قدرات متقدمة' }
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

    // Require auth: redirect to login if no token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const modelTypeForApi = selectedModel === 'api' ? 'cloud' : 'local';

      const response = await api.sendMessage(
        userMessage.content,
        undefined,
        undefined,
        modelTypeForApi as 'local' | 'cloud'
      );

      const aiMessage: Message = {
        id: response.assistant_message.id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.assistant_message?.content || 'تم الإرسال.',
        timestamp: new Date(response.assistant_message?.created_at || Date.now()),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const error = err as AxiosError;
      // If unauthorized, redirect to login
      if ((error?.response?.status as number) === 401) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        setIsLoading(false);
        return;
      }
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'تعذر إرسال الرسالة. تأكد من تسجيل الدخول أو أعد المحاولة لاحقًا.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white flex flex-col">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Ali AI
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-gray-500 leading-tight">مطوّر في</div>
            <div className="text-xs font-semibold text-gray-400">🎓 جامعة العين</div>
          </div>
          <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105">
            م
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex items-end justify-center px-4 pb-20 pt-8">
        <div className="w-full max-w-4xl space-y-6">
          {/* Messages Area */}
          {messages.length > 0 && (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto px-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'bg-[#242424] text-gray-100 border border-white/10'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#242424] rounded-2xl px-4 py-3 border border-white/10">
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
          {/* Main Input Card */}
          <div
            className={`relative rounded-3xl transition-all duration-300 ${
              isFocused ? 'shadow-[0_0_50px_rgba(168,85,247,0.15)]' : 'shadow-2xl'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(45,45,65,0.5) 0%, rgba(35,35,55,0.5) 100%)',
              border: isFocused ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {/* Outer Glow */}
            {isFocused && (
              <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />
            )}

            {/* Input Area */}
            <div className="p-6">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="اطلب من Ali جُدَيد: الإجابة على أسئلتك، كتابة أكواد، أو أي شيء آخر..."
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg leading-relaxed"
                rows={3}
                dir="rtl"
                style={{ fontWeight: 300 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {/* Left: Actions */}
              <div className="flex items-center gap-2">
                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className={`p-2.5 rounded-xl transition-all ${
                    message.trim() && !isLoading
                      ? 'bg-white/10 hover:bg-white/15 border border-white/10'
                      : 'bg-white/5 cursor-not-allowed opacity-40 border border-white/5'
                  }`}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>

                {/* Image Upload */}
                <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10">
                  <Image className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </button>

                {/* Attach */}
                <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10">
                  <Paperclip className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </button>
              </div>

              {/* Right: Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/15 rounded-xl transition-all border border-emerald-500/20 hover:border-emerald-500/30"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">مُؤيَّد (Muayad)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                {showModelMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowModelMenu(false)} />
                    <div
                      className="absolute bottom-full mb-2 left-0 rounded-2xl border shadow-2xl min-w-[260px] z-50 overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(40,40,55,0.95) 0%, rgba(30,30,45,0.95) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      {models.map((model) => {
                        const Icon = model.icon;
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id);
                              setShowModelMenu(false);
                            }}
                            className="w-full px-4 py-3 text-right hover:bg-white/5 transition-all flex items-center gap-3 border-b border-white/5 last:border-0"
                          >
                            <div className={`w-9 h-9 bg-gradient-to-br ${model.color} rounded-xl flex items-center justify-center shadow-lg`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 text-right">
                              <div className="font-semibold text-sm text-white">{model.name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{model.desc}</div>
                            </div>
                            {selectedModel === model.id && (
                              <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Examples */}
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-center text-gray-500 text-xs font-medium">جرّب هذه الأمثلة للبدء</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {examples.map((example, idx) => {
                  const Icon = example.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setMessage(example.text)}
                      className={`flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 ${example.color} transition-all hover:scale-105`}
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-300 font-medium">{example.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center pb-6 px-4">
        <p className="text-[11px] text-gray-600">
          <kbd className="px-2 py-0.5 bg-white/5 rounded text-[10px] border border-white/10">Shift</kbd>
          {' + '}
          <kbd className="px-2 py-0.5 bg-white/5 rounded text-[10px] border border-white/10">Enter</kbd>
          {' للسطر الجديد • '}
          <kbd className="px-2 py-0.5 bg-white/5 rounded text-[10px] border border-white/10">Enter</kbd>
          {' للإرسال'}
        </p>
      </div>
    </div>
  );
}
