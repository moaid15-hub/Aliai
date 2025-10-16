"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Send, Sparkles, Menu, Plus, Clock, Moon, Sun, LogOut, User, Paperclip, ExternalLink, Search, Zap, Brain, Copy, Download, Edit2, Trash2, Check, X, Settings, Mic, Volume2, Share2, MessageSquare, Palette, Info } from "lucide-react";

// الاستيرادات من ملفاتنا
import { Message, Conversation, Settings as SettingsType, ToastData } from './types';
import { needsSearch, searchWeb } from './search';
import { sendWithAutoSearch } from './ai-service';
import { AI_PROVIDERS, STORAGE_KEYS, saveToStorage, loadFromStorage, copyToClipboard, exportConversation } from './config';
import { CodeEditor } from './ui-components';
import VoiceSearch from './voice-search';
import TextToSpeech from './text-to-speech';

const parseMessageContent = (content: string) => {
  // التحقق من أن content ليس undefined أو null
  if (!content || typeof content !== 'string') {
    console.warn('⚠️ Invalid content provided to parseMessageContent:', content);
    return [{ type: 'text', content: '' }];
  }
  
  console.log('🔍 Parsing content:', content.substring(0, 100) + '...');
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{ type: string; content: string; language?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1] || 'javascript', content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  console.log('📊 Parsed parts:', parts.length, parts.map(p => p.type));
  return parts.length > 0 ? parts : [{ type: 'text', content }];
};

// =======================
// ERROR BOUNDARY
// =======================

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">حدث خطأ ما 😔</h1>
            <p className="text-slate-700 dark:text-gray-400 mb-6">عذراً، حدث خطأ غير متوقع</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =======================
// COMPONENTS
// =======================

const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'loading'; onClose: () => void }) => {
  const styles = {
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
    error: 'bg-gradient-to-r from-red-600 to-rose-600 text-white',
    info: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
    loading: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    loading: (
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl animate-fadeIn flex items-center gap-3 ${styles[type]}`}>
      {icons[type]}
      <span className="font-semibold">{message}</span>
      {type !== 'loading' && (
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const TypingIndicator = ({ isAutoSearching = false }: { isAutoSearching?: boolean }) => (
  <div className="flex items-center gap-2 px-5 py-4 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 rounded-3xl shadow-lg border border-purple-100 dark:border-purple-800/30">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 ${isAutoSearching 
            ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600' 
            : 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600'
          } rounded-full animate-bounce shadow-sm`}
          style={{ 
            animationDelay: `${i * 0.15}s`, 
            animationDuration: "1s",
            filter: isAutoSearching 
              ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))'
              : 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.5))'
          }}
        />
      ))}
    </div>
    <span className="text-xs text-slate-700 dark:text-gray-300 font-medium">
      {isAutoSearching ? '⚡ بحث فوري جاري...' : 'جاري الكتابة'}
    </span>
  </div>
);

const MessageActions = ({ message, onCopy, onEdit, onDelete }: { 
  message: Message; 
  onCopy: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
}) => (
  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <button
      onClick={onCopy}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
      title="نسخ"
    >
      <Copy className="w-4 h-4 text-slate-700 dark:text-gray-400" />
    </button>
    {message.role === 'user' && (
      <>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          title="تعديل"
        >
          <Edit2 className="w-4 h-4 text-slate-700 dark:text-gray-400" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
          title="حذف"
        >
          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </>
    )}
  </div>
);

const MessageBubble = ({ 
  message, 
  onDeepSearch, 
  onCopy, 
  onEdit, 
  onDelete,
  onSearch,
  isDark 
}: { 
  message: Message; 
  onDeepSearch?: (content: string) => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSearch?: (source: 'google' | 'youtube' | 'advanced') => void;
  isDark: boolean;
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={`flex gap-4 mb-6 animate-fadeIn group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl transform transition-transform hover:scale-105 ${
        isUser 
          ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600' 
          : 'bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600'
      }`}>
        {isUser ? <User className="w-6 h-6 text-white" /> : (
          <svg width="24" height="24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="6" fill="white"/>
            
            {/* الدائرة الخارجية */}
            <line x1="60" y1="60" x2="60" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="85" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="95" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="95" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="85" y2="88" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="60" y2="100" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="35" y2="88" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="25" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="25" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="35" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            
            {/* النقاط الخارجية */}
            <circle cx="60" cy="20" r="3" fill="white"/>
            <circle cx="85" cy="32" r="3" fill="white"/>
            <circle cx="95" cy="50" r="3" fill="white"/>
            <circle cx="95" cy="70" r="3" fill="white"/>
            <circle cx="85" cy="88" r="3" fill="white"/>
            <circle cx="60" cy="100" r="3" fill="white"/>
            <circle cx="35" cy="88" r="3" fill="white"/>
            <circle cx="25" cy="70" r="3" fill="white"/>
            <circle cx="25" cy="50" r="3" fill="white"/>
            <circle cx="35" cy="32" r="3" fill="white"/>
          </svg>
        )}
      </div>

      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {isUser ? (
          <div className="relative">
            <div className="rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 text-white rounded-br-md px-6 py-4 transform hover:-translate-y-0.5">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            <MessageActions 
              message={message} 
              onCopy={onCopy} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className={`prose prose-sm max-w-none ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              {parseMessageContent(message.content).map((part, idx) => (
                part.type === 'code' ? (
                  <CodeEditor key={idx} code={part.content} language={part.language} />
                ) : (
                  <div key={idx} className={`text-[16px] leading-relaxed whitespace-pre-wrap font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                       dangerouslySetInnerHTML={{
                         __html: part.content
                           // صور يوتيوب (يجب أن تكون قبل الروابط العادية)
                           .replace(/\[!\[(.*?)\]\((.*?)\)\]\((.*?)(?:\s+"(.*?)")?\)/g, `<a href="$3" target="_blank" rel="noopener noreferrer" class="block my-3 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"><img src="$2" alt="$1" title="$4" class="w-full max-w-md rounded-xl" /></a>`)
                           .replace(/### (.*)/g, `<h3 class="text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2 mt-4">$1</h3>`)
                           .replace(/## (.*)/g, `<h2 class="text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-3 mt-5">$1</h2>`)
                           .replace(/# (.*)/g, `<h1 class="text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-4 mt-6">$1</h1>`)
                           .replace(/\*\*(.*?)\*\*/g, `<strong class="font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}">$1</strong>`)
                           .replace(/\*(.*?)\*/g, `<em class="italic ${isDark ? 'text-slate-400' : 'text-slate-600'}">$1</em>`)
                           .replace(/`(.*?)`/g, `<code class="${isDark ? 'bg-gray-800 text-blue-400' : 'bg-gray-100 text-blue-600'} px-2 py-1 rounded font-mono text-sm">$1</code>`)
                           .replace(/^\d+\.\s(.*)/gm, `<li class="mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}">$1</li>`)
                           .replace(/^-\s(.*)/gm, `<li class="mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'} list-disc ml-6">$1</li>`)
                       }}
                  />
                )
              ))}
            </div>
            
            {/* ✨ جديد: أزرار اختيار البحث */}
            {message.needsUserChoice && message.searchOptions && onSearch && (
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                <button
                  onClick={() => onSearch(message.searchOptions!.primary === 'youtube' ? 'youtube' : 'google')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-sm flex items-center gap-2"
                >
                  {message.searchOptions!.primary === 'youtube' ? '🎥 YouTube' : '🌐 Google'}
                </button>
                
                <button
                  onClick={() => onSearch('advanced')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-sm flex items-center gap-2"
                >
                  🔍 بحث متقدم شامل
                </button>
              </div>
            )}
            
            {message.sources && message.sources.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <Search className="w-4 h-4" />
                  <span>مصادر المعلومات</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {message.sources.map((source, idx) => {
                    let domain = '';
                    try {
                      domain = new URL(source.url).hostname.replace('www.', '');
                    } catch (e) {
                      domain = 'مصدر';
                    }
                    
                    return (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                              <img 
                                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                                alt=""
                                className="w-5 h-5"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                  {domain}
                                </span>
                                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                                {source.title}
                              </p>
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
                
                {onDeepSearch && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => onDeepSearch(message.content)}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span>بحث متقدم</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <MessageActions 
              message={message} 
              onCopy={onCopy} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
            
            {/* زر النطق للرسائل من AI */}
            <div className="mt-3">
              <TextToSpeech text={message.content} className="opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-2 px-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          {!isUser && message.provider && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm bg-gradient-to-r ${AI_PROVIDERS[message.provider]?.color || AI_PROVIDERS.local.color} ${AI_PROVIDERS[message.provider]?.textColor || AI_PROVIDERS.local.textColor}`}>
                {AI_PROVIDERS[message.provider]?.name || 'Oqool AI'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border-2 border-gray-200 dark:border-gray-700 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6" />
            الإعدادات
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                البحث التلقائي الذكي
              </span>
              <button
                onClick={() => onSettingsChange({ ...settings, autoSearch: !settings.autoSearch })}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  settings.autoSearch ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.autoSearch ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              يبحث تلقائياً عند استخدام كلمات مثل "ابحث عن"، "آخر أخبار"، "ما أفضل" وغيرها
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              تأثيرات الصوت
            </span>
            <button
              onClick={() => onSettingsChange({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`relative w-12 h-6 rounded-full transition-all ${
                settings.soundEnabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              الرسوم المتحركة
            </span>
            <button
              onClick={() => onSettingsChange({ ...settings, animationsEnabled: !settings.animationsEnabled })}
              className={`relative w-12 h-6 rounded-full transition-all ${
                settings.animationsEnabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.animationsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
};

const Sidebar = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onLogout,
  userName,
  isGuest,
  isDark,
}: {
  conversations: Conversation[];
  currentConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onLogout: () => void;
  userName: string;
  isGuest: boolean;
  isDark: boolean;
}) => (
  <div
    className={`fixed right-0 top-0 h-full backdrop-blur-xl shadow-2xl transition-transform duration-300 z-50 ${
      isOpen ? "translate-x-0" : "translate-x-full"
    } w-80`}
    style={{
      background: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderLeft: isDark ? '1px solid rgba(75, 85, 99, 0.3)' : '1px solid rgba(229, 231, 235, 0.3)'
    }}
  >
    <div 
      className="p-6 border-b"
      style={{
        borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.3)',
        background: isDark 
          ? 'linear-gradient(135deg, rgba(91, 33, 182, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)'
          : 'linear-gradient(135deg, rgba(243, 232, 255, 1) 0%, rgba(219, 234, 254, 1) 100%)'
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center shadow-xl">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{userName}</p>
          <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>مستخدم نشط ✨</p>
        </div>
      </div>
      <button
        onClick={onNewChat}
        className="w-full px-5 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>محادثة جديدة</span>
      </button>
    </div>

    <div className="p-4 overflow-y-auto h-[calc(100%-250px)]">
      <h3 className={`text-sm font-bold mb-4 px-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-slate-700'}`}>
        <Clock className="w-4 h-4" />
        المحادثات السابقة
      </h3>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <div 
            key={conv.id}
            className={`relative group ${currentConversationId === conv.id ? 'ring-2 ring-purple-400 dark:ring-purple-600' : ''}`}
          >
            <button
              onClick={() => onSelectConversation(conv.id)}
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-200 text-right border border-transparent hover:border-purple-200 dark:hover:border-purple-800 shadow-sm hover:shadow-md"
            >
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
                {conv.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {conv.messages.length} رسالة
              </p>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="حذف المحادثة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
      {isGuest ? (
        <a
          href="/auth/login"
          className="w-full px-5 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
        >
          <User className="w-5 h-5" />
          <span>تسجيل الدخول</span>
        </a>
      ) : (
        <button
          onClick={onLogout}
          className="w-full px-5 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      )}
    </div>
  </div>
);

// =======================
// MAIN COMPONENT
// =======================

export default function ChatPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [userName, setUserName] = useState("مستخدم");
  const [isGuest, setIsGuest] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVoiceSearchVisible, setIsVoiceSearchVisible] = useState(false);
  const [voiceSearchSupported, setVoiceSearchSupported] = useState(false);
  const [isAutoSearching, setIsAutoSearching] = useState(false);

  const [settings, setSettings] = useState<SettingsType>({
    autoSearch: true,
    soundEnabled: true,
    animationsEnabled: true
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentConversation = useMemo(() => 
    conversations.find(c => c.id === currentConversationId),
    [conversations, currentConversationId]
  );

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'loading' = 'success') => {
    setToast({ message, type });
    if (type !== 'loading') {
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    
    // Check for voice search support
    const checkVoiceSupport = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setVoiceSearchSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        console.log('🎤 Voice Search is supported');
      } else {
        console.log('❌ Voice Search not supported');
      }
    };

    checkVoiceSupport();
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    let name = "زائر";
    
    if (!token) {
      setIsGuest(true);
    } else {
      setIsGuest(false);
      if (user) {
        try {
          const userData = JSON.parse(user);
          name = userData.fullName || userData.full_name || "مستخدم";
        } catch (e) {
          name = "مستخدم";
        }
      }
    }
    
    setUserName(name);
    
    const savedConversations = loadFromStorage(STORAGE_KEYS.CONVERSATIONS, []) as Conversation[];
    if (savedConversations.length > 0) {
      setConversations(savedConversations.map((c: any) => ({
        ...c,
        timestamp: new Date(c.timestamp),
        messages: c.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      })));
      setCurrentConversationId(savedConversations[0].id);
    } else {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: `محادثة جديدة`,
        timestamp: new Date(),
        messages: [{
          id: Date.now().toString(),
          role: "assistant",
          content: `السلام عليكم ${name}! 👋\n\nأنا Oqool AI، مساعدك الذكي الشخصي. يمكنني مساعدتك في:\n\n✨ الإجابة على أسئلتك\n🔍 البحث عن معلومات محدثة\n💡 تقديم اقتراحات إبداعية\n📊 تحليل البيانات\n\nكيف يمكنني مساعدتك اليوم؟`,
          timestamp: new Date(),
          provider: 'openai'
        }]
      };
      
      setConversations([newConv]);
      setCurrentConversationId(newConv.id);
    }
    
    const savedSettings = loadFromStorage<SettingsType | null>(STORAGE_KEYS.SETTINGS, null);
    if (savedSettings) {
      setSettings(savedSettings);
    }
    
    const savedTheme = loadFromStorage(STORAGE_KEYS.THEME, true);
    setIsDark(savedTheme);
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  }, [conversations]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    console.log('🎨 Theme changed to:', isDark ? 'Dark Mode' : 'Light Mode');
    saveToStorage(STORAGE_KEYS.THEME, isDark);
  }, [isDark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages, isTyping]);

  const handleNewChat = useCallback(() => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: `محادثة ${conversations.length + 1}`,
      timestamp: new Date(),
      messages: [{
        id: Date.now().toString(),
        role: "assistant",
        content: `السلام عليكم ${userName}! 👋\n\nأنا Oqool AI، مساعدك الذكي الشخصي. يمكنني مساعدتك في:\n\n✨ الإجابة على أسئلتك\n🔍 البحث عن معلومات محدثة\n💡 تقديم اقتراحات إبداعية\n📊 تحليل البيانات\n\nكيف يمكنني مساعدتك اليوم؟`,
        timestamp: new Date(),
        provider: 'openai'
      }]
    };
    
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setIsSidebarOpen(false);
    setInputValue("");
    setSelectedFiles([]);
  }, [conversations.length, userName]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('textarea')?.focus();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
      
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isSidebarOpen, handleNewChat]);

  const handleSend = useCallback(async () => {
    console.log('🚀 Send button clicked!', inputValue);
    if (!inputValue.trim()) {
      console.log('❌ No input text');
      return;
    }
    
    let conversationId = currentConversationId;
    if (!conversationId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: `محادثة جديدة`,
        timestamp: new Date(),
        messages: []
      };
      
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
      conversationId = newConv.id;
    }

    const currentInput = inputValue;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    ));

    setInputValue('');
    setIsTyping(true);

    try {
      // تفعيل البحث التلقائي دائماً للبحث الصوتي
      const enableAutoSearch = isAutoSearching || settings.autoSearch;
      console.log('📤 Sending to AI:', { currentInput, autoSearch: enableAutoSearch, isVoiceSearch: isAutoSearching });
      const result = await sendWithAutoSearch(
        currentInput,
        currentConversation?.messages || [],
        enableAutoSearch
      );
      console.log('📥 AI Response received:', result);
      
      if (result.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
          provider: result.usedProvider || 'عقول AI',
          sources: result.sources
        };
        
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                messages: [...conv.messages, aiMessage],
                title: conv.messages.length === 0 ? currentInput.slice(0, 30) : conv.title
              }
            : conv
        ));
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `عذراً، حدث خطأ: ${result.error}`,
          timestamp: new Date(),
          provider: 'عقول AI'
        };
        
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        ));
        
        showToast('فشل الاتصال بـ Oqool AI', 'error');
      }
      
      setIsTyping(false);
      setIsAutoSearching(false); // إعادة تعيين حالة البحث التلقائي

    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setIsAutoSearching(false); // إعادة تعيين حالة البحث التلقائي
      showToast('حدث خطأ، حاول مرة أخرى', 'error');
    }
  }, [inputValue, currentConversationId, currentConversation, settings, showToast, isAutoSearching]);

  // ✨ جديد: دالة البحث حسب المصدر
  const handleSearch = useCallback(async (source: 'google' | 'youtube' | 'advanced') => {
    console.log(`🔍 User selected search source: ${source}`);
    
    // 🎯 إشعارات تقدمية
    const searchLabels = {
      google: 'Google',
      youtube: 'YouTube',
      advanced: 'جميع المصادر'
    };
    
    showToast(`⏳ جاري البحث في ${searchLabels[source]}...`, 'loading');
    setIsTyping(true);
    
    // الحصول على آخر رسالة من المستخدم
    const lastUserMessage = currentConversation?.messages
      .filter(m => m.role === 'user')
      .pop()?.content || '';
    
    if (!lastUserMessage) {
      console.warn('⚠️ No user message found');
      setIsTyping(false);
      setToast(null);
      return;
    }
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentConversation?.messages || [],
          searchChoice: source
        })
      });
      
      const result = await response.json();
      console.log('📥 Search result received:', result);
      
      if (result.success) {
        // ✅ إشعار النجاح
        const totalResults = result.sources?.google?.length + result.sources?.youtube?.length + result.sources?.wikipedia?.length || 0;
        showToast(`✅ وجدت ${totalResults} نتيجة!`, 'success');
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
          provider: result.selectedProvider || source,
          sources: result.sources
        };
        
        setConversations(prev => prev.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        ));
      }
      
      setIsTyping(false);
    } catch (error) {
      console.error('❌ Search error:', error);
      setIsTyping(false);
      showToast('حدث خطأ في البحث', 'error');
    }
  }, [currentConversationId, currentConversation, showToast]);

  const handleCopyMessage = useCallback(async (content: string) => {
    const success = await copyToClipboard(content);
    showToast(success ? 'تم النسخ!' : 'فشل النسخ', success ? 'success' : 'error');
  }, [showToast]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId 
        ? { ...conv, messages: conv.messages.filter(m => m.id !== messageId) }
        : conv
    ));
    showToast('تم حذف الرسالة');
  }, [currentConversationId, showToast]);

  const handleEditMessage = useCallback((messageId: string) => {
    const message = currentConversation?.messages.find(m => m.id === messageId);
    if (message) {
      setInputValue(message.content); // فقط يحط النص
      // لا تحذف!
    }
  }, [currentConversation]);

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setCurrentConversationId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
    showToast('تم حذف المحادثة');
  }, [currentConversationId, conversations, handleNewChat, showToast]);

  const handleExportConversation = useCallback(() => {
    if (currentConversation) {
      exportConversation(currentConversation);
      showToast('تم تصدير المحادثة');
    }
  }, [currentConversation, showToast]);

  // Voice Search Functions - محسن للسرعة
  const handleVoiceSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    console.log('🎤 Voice search query:', query);
    
    // إغلاق واجهة البحث الصوتي
    setIsVoiceSearchVisible(false);
    
    // تعيين النص في مربع الإدخال
    setInputValue(query);
    
    showToast(`🎤 تم التعرف على: "${query}" - جاري الإرسال...`);
    
    // إنشاء دالة إرسال مخصصة للصوت
    const sendVoiceMessage = async () => {
      let conversationId = currentConversationId;
      if (!conversationId) {
        const newConv: Conversation = {
          id: Date.now().toString(),
          title: `محادثة جديدة`,
          timestamp: new Date(),
          messages: []
        };
        
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
        conversationId = newConv.id;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: query, // استخدم النص مباشرة من البحث الصوتي
        timestamp: new Date(),
        provider: 'user'
      };

      // إضافة رسالة المستخدم
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, messages: [...conv.messages, userMessage], timestamp: new Date() }
            : conv
        )
      );

      // مسح مربع الإدخال
      setInputValue('');
      
      console.log('🎤 Voice message sent, processing AI response...');
      
      // معالجة رد الذكي الاصطناعي
      try {
        setIsTyping(true);
        setIsAutoSearching(true);

        const enableAutoSearch = settings.autoSearch;
        console.log('📤 Sending to AI:', { query, autoSearch: enableAutoSearch, isVoiceSearch: true });

        const result = await sendWithAutoSearch(query, [], enableAutoSearch);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.message || 'حدث خطأ في الاستجابة',
          timestamp: new Date(),
          provider: result.usedProvider || 'عقول AI',
          sources: result.sources
        };

        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, messages: [...conv.messages, aiMessage], timestamp: new Date() }
              : conv
          )
        );

        console.log('🎤 Voice search completed successfully');
        showToast('✅ تم إرسال البحث الصوتي بنجاح');
        
      } catch (error) {
        console.error('❌ Voice search AI error:', error);
        showToast('خطأ في معالجة البحث الصوتي', 'error');
      } finally {
        setIsTyping(false);
        setIsAutoSearching(false);
      }
    };

    // إرسال فوري
    await sendVoiceMessage();
    
  }, [currentConversationId, settings, showToast]);

  const handleVoiceError = useCallback((error: string) => {
    console.error('Voice search error:', error);
    showToast(error, 'error');
    setIsVoiceSearchVisible(false);
  }, [showToast]);

  const toggleVoiceSearch = useCallback(() => {
    if (!voiceSearchSupported) {
      showToast('البحث الصوتي غير مدعوم في هذا المتصفح', 'error');
      return;
    }
    
    setIsVoiceSearchVisible(!isVoiceSearchVisible);
  }, [voiceSearchSupported, isVoiceSearchVisible, showToast]);

  const deeperSearch = useCallback(async (content: string) => {
    if (!currentConversationId) return;
    
    const loadingMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'جاري البحث عن معلومات إضافية... ⏳',
      timestamp: new Date(),
      provider: 'search'
    };
    
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId 
        ? { ...conv, messages: [...conv.messages, loadingMessage] }
        : conv
    ));
    
    try {
      const keywords = content.split(' ').slice(0, 5).join(' ');
      const searchQuery = `${keywords} معلومات تفصيلية`;
      
      // Enhanced search with AI and context
      const conversationContext = conversations
        .find(c => c.id === currentConversationId)?.messages
        .slice(-3) // Last 3 messages for context
        .map(m => ({ role: m.role, content: m.content })) || [];
      
      const searchResults = await searchWeb(searchQuery, {
        maxResults: 5,
        useAI: false, // للسرعة
        retries: 1
      });
      
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { 
              ...conv, 
              messages: conv.messages.filter(m => m.id !== loadingMessage.id)
            }
          : conv
      ));
      
      if (searchResults.results && searchResults.results.length > 0) {
        const newSources = searchResults.results.map((result: any) => ({
          title: result.title,
          url: result.url,
          snippet: result.content || result.snippet,
          aiEnhanced: result.aiEnhanced,
          relevanceScore: result.relevanceScore,
          category: result.category
        }));
        
        // Enhanced message with AI insights
        let enhancedContent = searchResults.aiEnhanced && searchResults.summary ? 
          `🤖 **ملخص ذكي:** ${searchResults.summary}\n\n` : '';
        
        enhancedContent += `🔍 **مصادر إضافية ومعلومات أعمق حول الموضوع:**`;
        
        if (searchResults.aiEnhanced && searchResults.enhancedQuery !== searchQuery) {
          enhancedContent += `\n💡 *تم تحسين البحث من "${searchQuery}" إلى "${searchResults.enhancedQuery}"*`;
        }
        
        const deeperMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: enhancedContent,
          timestamp: new Date(),
          provider: searchResults.aiEnhanced ? 'ai-search' : 'search',
          sources: newSources
        };
        
        setConversations(prev => prev.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, messages: [...conv.messages, deeperMessage] }
            : conv
        ));
      } else {
        showToast('لم يتم العثور على نتائج إضافية', 'error');
      }
    } catch (error) {
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { 
              ...conv, 
              messages: conv.messages.filter(m => m.id !== loadingMessage.id)
            }
          : conv
      ));
      showToast('فشل البحث الأوسع', 'error');
    }
  }, [currentConversationId, showToast]);

  const isWelcomeOnly = !currentConversation?.messages?.length || 
                        (currentConversation?.messages.length === 1 && 
                         currentConversation.messages[0].role === "assistant");

  if (!isMounted) {
    return (
      <div 
        className="h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0a0a14 0%, #141428 25%, #1e1e3c 50%, #2a2a50 75%, #1a1a2e 100%)'
        }}
      >
        <div className="relative">
          <div 
            className="animate-spin rounded-full h-32 w-32 border-4 border-transparent"
            style={{
              borderTop: '4px solid #3B82F6',
              borderRight: '4px solid #00d9ff',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-8 h-8 rounded-full"
              style={{
                background: 'linear-gradient(45deg, #3B82F6, #00d9ff)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)'
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative" style={{
        background: isDark 
          ? 'linear-gradient(135deg, #0a0a14 0%, #141428 25%, #1e1e3c 50%, #2a2a50 75%, #1a1a2e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #f1f5f9 50%, #e2e8f0 75%, #f8fafc 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Noto Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(0, 217, 255, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(0, 217, 255, 0.3);
          }
        }
        
        .holographic-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(246, 59, 190, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 217, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }
      `}</style>
      
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: `linear-gradient(45deg, #3B82F6, #00d9ff)`,
              animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      <div className="flex h-screen relative z-10 holographic-bg">
        <Sidebar 
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewChat={handleNewChat} 
          onSelectConversation={setCurrentConversationId}
          onDeleteConversation={handleDeleteConversation}
          isOpen={isSidebarOpen}
          onLogout={() => window.location.href = "/auth/login/"}
          userName={userName}
          isGuest={isGuest}
          isDark={isDark}
        />
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        <div className="flex-1 flex flex-col">
          <div 
            className="backdrop-blur-2xl border-b shadow-lg relative"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(20, 20, 40, 0.8))',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
            }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-center justify-between">
                {/* أقصى اليمين - الأزرار والخيارات */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    className="p-2 sm:p-2.5 rounded-xl transition-all duration-200 transform hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 217, 255, 0.2))';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 217, 255, 0.2))';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 217, 255, 0.2))';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                  {currentConversation && !isWelcomeOnly && (
                    <>
                      <button
                        onClick={handleExportConversation}
                        className="hidden sm:block p-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          backdropFilter: 'blur(10px)'
                        }}
                        title="تصدير المحادثة"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 217, 255, 0.2))';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Download className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/chat/${currentConversationId}`;
                          copyToClipboard(url);
                          showToast('تم نسخ رابط المحادثة');
                        }}
                        className="hidden sm:block p-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          backdropFilter: 'blur(10px)'
                        }}
                        title="مشاركة المحادثة"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 217, 255, 0.2))';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Share2 className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}
                </div>
                
                {/* المنتصف - الشعار */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div 
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse"
                    style={{
                      background: 'linear-gradient(45deg, #3B82F6, #00d9ff)',
                      boxShadow: '0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(0, 217, 255, 0.6)',
                      animation: 'pulse-glow 2s ease-in-out infinite'
                    }}
                  />
                  <div className="relative">
                    <svg width="200" height="80" viewBox="0 0 450 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-12 w-auto">
                      {/* Brain Icon Center */}
                      <circle cx="60" cy="75" r="8" fill="url(#centerGradient)"/>
                      
                      {/* الدائرة الخارجية - 12 نقطة */}
                      <line x1="60" y1="75" x2="60" y2="30" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="86" y2="37.5" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="105" y2="60" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="105" y2="90" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="86" y2="112.5" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="60" y2="120" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="34" y2="112.5" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="15" y2="90" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="15" y2="60" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="34" y2="37.5" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
                      
                      {/* الدائرة الوسطى - 8 نقاط */}
                      <line x1="60" y1="75" x2="60" y2="45" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="81" y2="54" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="81" y2="96" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="60" y2="105" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="39" y2="96" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="75" x2="39" y2="54" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round"/>
                      
                      {/* النقاط الخارجية - دائرة مثالية */}
                      <circle cx="60" cy="30" r="5" fill="url(#nodeGradient)"/>
                      <circle cx="86" cy="37.5" r="5" fill="url(#nodeGradient)"/>
                      <circle cx="105" cy="60" r="5" fill="url(#nodeGradient)"/>
                      <circle cx="105" cy="90" r="5" fill="url(#nodeGradient)"/>
                      <circle cx="86" cy="112.5" r="5" fill="url(#nodeGradient)"/>
                      <circle cx="60" cy="120" r="5" fill="url(#nodeGradient)"/>
                      <circle cx="34" cy="112.5" r="5" fill="url(#nodeGradient)"/>
                      <circle cx="15" cy="90" r="5" fill="url(#nodeGradient)"/>
                      <circle cx="15" cy="60" r="5" fill="url(#nodeGradient)"/>
                      <circle cx="34" cy="37.5" r="5" fill="url(#nodeGradient)"/>
                      
                      {/* النقاط الوسطى - دائرة أصغر */}
                      <circle cx="60" cy="45" r="4" fill="url(#nodeGradient)"/>
                      <circle cx="81" cy="54" r="4" fill="url(#nodeGradient)"/>
                      <circle cx="81" cy="96" r="4" fill="url(#nodeGradient)"/>
                      <circle cx="60" cy="105" r="4" fill="url(#nodeGradient)"/>
                      <circle cx="39" cy="96" r="4" fill="url(#nodeGradient)"/>
                      <circle cx="39" cy="54" r="4" fill="url(#nodeGradient)"/>
                      
                      {/* Gradients */}
                      <defs>
                        <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6"/>
                          <stop offset="100%" stopColor="#00d9ff"/>
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60A5FA"/>
                          <stop offset="100%" stopColor="#06B6D4"/>
                        </linearGradient>
                        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60A5FA"/>
                          <stop offset="50%" stopColor="#00d9ff"/>
                          <stop offset="100%" stopColor="#3B82F6"/>
                        </linearGradient>
                        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3B82F6"/>
                          <stop offset="50%" stopColor="#00d9ff"/>
                          <stop offset="100%" stopColor="#60A5FA"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Text - Oqool AI */}
                      <text x="240" y="85" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="900" fill="url(#textGradient)" textAnchor="middle">
                        Oqool
                      </text>
                      <text x="380" y="85" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="600" fill="url(#textGradient)" textAnchor="middle">
                        AI
                      </text>
                    </svg>
                  </div>
                </div>
                
                {/* أقصى اليسار - فارغ للتوازن */}
                <div className="w-12 sm:w-32" />
              </div>
            </div>
          </div>

          {isWelcomeOnly ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative">
              <div className="w-full max-w-3xl">
                <div className="text-center mb-10 sm:mb-12 space-y-4">
                  <div 
                    className="inline-block p-4 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                      boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4), 0 0 40px rgba(0, 217, 255, 0.3)',
                      animation: 'pulse-glow 3s ease-in-out infinite'
                    }}
                  >
                    <svg width="64" height="64" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="60" cy="60" r="8" fill="white"/>
                      
                      {/* الدائرة الخارجية */}
                      <line x1="60" y1="60" x2="60" y2="15" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="91" y2="24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="105" y2="45" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="105" y2="75" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="91" y2="96" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="60" y2="105" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="29" y2="96" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="15" y2="75" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="15" y2="45" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="29" y2="24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      
                      {/* الدائرة الوسطى */}
                      <line x1="60" y1="60" x2="60" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="81" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="81" y2="81" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="60" y2="90" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="39" y2="81" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="39" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      
                      {/* النقاط الخارجية */}
                      <circle cx="60" cy="15" r="5" fill="white"/>
                      <circle cx="91" cy="24" r="5" fill="white"/>
                      <circle cx="105" cy="45" r="5" fill="white"/>
                      <circle cx="105" cy="75" r="5" fill="white"/>
                      <circle cx="91" cy="96" r="5" fill="white"/>
                      <circle cx="60" cy="105" r="5" fill="white"/>
                      <circle cx="29" cy="96" r="5" fill="white"/>
                      <circle cx="15" cy="75" r="5" fill="white"/>
                      <circle cx="15" cy="45" r="5" fill="white"/>
                      <circle cx="29" cy="24" r="5" fill="white"/>
                      
                      {/* النقاط الوسطى */}
                      <circle cx="60" cy="30" r="4" fill="white"/>
                      <circle cx="81" cy="39" r="4" fill="white"/>
                      <circle cx="81" cy="81" r="4" fill="white"/>
                      <circle cx="60" cy="90" r="4" fill="white"/>
                      <circle cx="39" cy="81" r="4" fill="white"/>
                      <circle cx="39" cy="39" r="4" fill="white"/>
                    </svg>
                  </div>
                  <h2 
                    className="text-3xl sm:text-4xl font-black mb-4" 
                    style={{ 
                      direction: 'rtl',
                      background: 'linear-gradient(135deg, #3B82F6, #00d9ff, #60A5FA)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
                    }}
                  >
                    أهلاً {userName}! �
                  </h2>
                  <p className="text-base sm:text-lg font-medium text-gray-300 mb-8">
                    أنا عقول، مساعدك الذكي. تكلم معي بكل راحة!<br />
                    إيش اللي تحتاجه اليوم؟
                  </p>
                </div>
                
                <div 
                  className="flex items-end gap-2 sm:gap-3 backdrop-blur-xl rounded-3xl shadow-2xl transition-all duration-300 p-4 sm:p-5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(20, 20, 40, 0.8))',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-110" 
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 217, 255, 0.2))';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title="إرفاق ملفات"
                  >
                    <Paperclip className="w-5 sm:w-6 h-5 sm:h-6 text-cyan-400" />
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    multiple 
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setSelectedFiles(files);
                      showToast(`تم إرفاق ${files.length} ملف`);
                    }}
                  />
                  
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isVoiceSearchVisible ? "🎤 استمع للصوت..." : "اكتب رسالتك هنا أو استخدم البحث الصوتي..."}
                    className="flex-1 resize-none bg-transparent text-white placeholder-gray-400 outline-none text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-2xl"
                    style={{
                      background: 'transparent',
                      border: 'none'
                    }}
                    rows={2}
                    dir="rtl"
                    disabled={isVoiceSearchVisible}
                  />
                  
                  {/* Voice Search Button */}
                  {voiceSearchSupported && (
                    <button 
                      onClick={toggleVoiceSearch}
                      disabled={isTyping}
                      className="flex-shrink-0 p-2.5 sm:p-3 rounded-2xl transition-all duration-300 transform hover:scale-110"
                      style={{
                        background: isVoiceSearchVisible 
                          ? 'linear-gradient(135deg, #EF4444, #DC2626)' 
                          : 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        boxShadow: isVoiceSearchVisible 
                          ? '0 0 20px rgba(239, 68, 68, 0.5)' 
                          : '0 0 20px rgba(59, 130, 246, 0.4)',
                        opacity: isTyping ? '0.5' : '1',
                        cursor: isTyping ? 'not-allowed' : 'pointer'
                      }}
                      title={isVoiceSearchVisible ? 'إيقاف البحث الصوتي' : 'بدء البحث الصوتي'}
                    >
                      <Mic className={`w-5 sm:w-6 h-5 sm:h-6 text-white ${isVoiceSearchVisible ? 'animate-pulse' : ''}`} />
                    </button>
                  )}
                  
                  {/* Send Button - زر الإرسال في الشاشة الترحيبية */}
                  <button 
                    onClick={handleSend} 
                    disabled={!inputValue.trim() || isTyping} 
                    className="flex-shrink-0 p-3 sm:p-4 text-white rounded-2xl transition-all duration-300 transform hover:scale-105"
                    style={{
                      background: (!inputValue.trim() || isTyping) 
                        ? 'linear-gradient(135deg, #6B7280, #4B5563)' 
                        : 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                      border: '2px solid #3B82F6',
                      boxShadow: (!inputValue.trim() || isTyping) 
                        ? 'none' 
                        : '0 0 30px rgba(59, 130, 246, 0.5)',
                      opacity: (!inputValue.trim() || isTyping) ? '0.6' : '1',
                      cursor: (!inputValue.trim() || isTyping) ? 'not-allowed' : 'pointer',
                      minWidth: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="إرسال الرسالة"
                  >
                    <Send className="w-5 sm:w-6 h-5 sm:h-6" />
                  </button>

                </div>
                
                {/* Voice Search Component */}
                {isVoiceSearchVisible && voiceSearchSupported && (
                  <div className="mt-4">
                    <VoiceSearch
                      onSearchQuery={handleVoiceSearch}
                      onError={handleVoiceError}
                      language="ar-SA"
                      disabled={isTyping}
                    />
                  </div>
                )}
                
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-sm flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        <span className="font-medium">{file.name}</span>
                        <button 
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto relative">
                <div className="max-w-5xl mx-auto px-6 py-8">
                  {currentConversation?.messages.map((message) => (
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      onDeepSearch={deeperSearch}
                      onCopy={() => handleCopyMessage(message.content)}
                      onEdit={() => handleEditMessage(message.id)}
                      onDelete={() => handleDeleteMessage(message.id)}
                      onSearch={handleSearch}
                      isDark={isDark}
                    />
                  ))}
                  {isTyping && (
                    <div className="flex gap-4 mb-6">
                      <div 
                        className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl"
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4), 0 0 20px rgba(0, 217, 255, 0.3)'
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="60" cy="60" r="6" fill="white"/>
                          
                          {/* الدائرة الخارجية */}
                          <line x1="60" y1="60" x2="60" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="60" y1="60" x2="85" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="60" y1="60" x2="95" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="60" y1="60" x2="95" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="60" y1="60" x2="85" y2="88" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="60" y1="60" x2="60" y2="100" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="60" y1="60" x2="35" y2="88" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="60" y1="60" x2="25" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="60" y1="60" x2="25" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="60" y1="60" x2="35" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          
                          {/* النقاط الخارجية */}
                          <circle cx="60" cy="20" r="3" fill="white"/>
                          <circle cx="85" cy="32" r="3" fill="white"/>
                          <circle cx="95" cy="50" r="3" fill="white"/>
                          <circle cx="95" cy="70" r="3" fill="white"/>
                          <circle cx="85" cy="88" r="3" fill="white"/>
                          <circle cx="60" cy="100" r="3" fill="white"/>
                          <circle cx="35" cy="88" r="3" fill="white"/>
                          <circle cx="25" cy="70" r="3" fill="white"/>
                          <circle cx="25" cy="50" r="3" fill="white"/>
                          <circle cx="35" cy="32" r="3" fill="white"/>
                        </svg>
                      </div>
                      <TypingIndicator isAutoSearching={isAutoSearching} />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div 
                className="backdrop-blur-2xl border-t shadow-2xl"
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(20, 20, 40, 0.8))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.3)',
                  boxShadow: isDark ? '0 -4px 20px rgba(59, 130, 246, 0.2)' : '0 -4px 20px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
                  <div 
                    className="flex items-end gap-2 sm:gap-3 rounded-3xl shadow-xl transition-all duration-300 p-4 sm:p-5"
                    style={{
                      background: isDark 
                        ? 'linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(20, 20, 40, 0.9))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
                      border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)',
                      boxShadow: isDark ? '0 10px 40px rgba(59, 130, 246, 0.3)' : '0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-shrink-0 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-110" 
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 217, 255, 0.2))';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      title="إرفاق ملفات"
                    >
                      <Paperclip className="w-5 sm:w-6 h-5 sm:h-6 text-cyan-400" />
                    </button>
                    
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={isVoiceSearchVisible ? "🎤 استمع للصوت..." : "اكتب رسالتك هنا أو استخدم البحث الصوتي..."}
                      className={`flex-1 resize-none bg-transparent outline-none text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                        isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                      }`}
                      rows={2}
                      dir="rtl"
                      disabled={false}
                    />
                    
                    {/* Voice Search Button */}
                    {voiceSearchSupported && (
                      <button 
                        onClick={toggleVoiceSearch}
                        disabled={isTyping}
                        className="flex-shrink-0 p-2.5 sm:p-3 rounded-2xl transition-all duration-300 transform hover:scale-110"
                        style={{
                          background: isVoiceSearchVisible 
                            ? 'linear-gradient(135deg, #EF4444, #DC2626)' 
                            : 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          boxShadow: isVoiceSearchVisible 
                            ? '0 0 20px rgba(239, 68, 68, 0.5)' 
                            : '0 0 20px rgba(59, 130, 246, 0.4)',
                          opacity: isTyping ? '0.5' : '1',
                          cursor: isTyping ? 'not-allowed' : 'pointer'
                        }}
                        title={isVoiceSearchVisible ? 'إيقاف البحث الصوتي' : 'بدء البحث الصوتي'}
                      >
                        <Mic className={`w-5 sm:w-6 h-5 sm:h-6 text-white ${isVoiceSearchVisible ? 'animate-pulse' : ''}`} />
                      </button>
                    )}
                    
                    {/* Send Button - زر الإرسال */}
                    <button 
                      onClick={handleSend} 
                      disabled={false}
                      data-send-button="true"
                      className="flex-shrink-0 p-3 sm:p-4 text-white rounded-2xl transition-all duration-300 transform hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                        border: '2px solid #3B82F6',
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
                        opacity: '1',
                        cursor: 'pointer',
                        minWidth: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="إرسال الرسالة"
                    >
                      <Send className="w-5 sm:w-6 h-5 sm:h-6" />
                    </button>
                  </div>


                  
                  {/* Voice Search Component */}
                  {isVoiceSearchVisible && voiceSearchSupported && (
                    <div className="mt-4 p-4 rounded-2xl backdrop-blur-xl" style={{
                      background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(20, 20, 40, 0.9))',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)'
                    }}>
                      <VoiceSearch
                        onSearchQuery={handleVoiceSearch}
                        onError={handleVoiceError}
                        language="ar-SA"
                        disabled={isTyping}
                      />
                    </div>
                  )}
                  
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-sm flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          <span className="font-medium">{file.name}</span>
                          <button 
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
