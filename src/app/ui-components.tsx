// ui-components.tsx
"use client";

import React from "react";
import { Check, X, Copy, Edit2, Trash2, Search, ExternalLink, Zap, User, Brain, Settings, Clock, Plus, MessageSquare, LogOut } from "lucide-react";
import { Message, Conversation, Settings as SettingsType } from './types';
import { AI_PROVIDERS } from './config';

// =======================
// ERROR BOUNDARY
// =======================

export class ErrorBoundary extends React.Component<
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
            <p className="text-gray-600 dark:text-gray-400 mb-6">عذراً، حدث خطأ غير متوقع</p>
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
// TOAST
// =======================

export const Toast = ({ 
  message, 
  type = 'success', 
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error'; 
  onClose: () => void 
}) => (
  <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl animate-fadeIn flex items-center gap-3 ${
    type === 'success' 
      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
  }`}>
    {type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
    <span className="font-semibold">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-80">
      <X className="w-4 h-4" />
    </button>
  </div>
);

// =======================
// TYPING INDICATOR
// =======================

export const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-5 py-4 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 rounded-3xl shadow-lg border border-purple-100 dark:border-purple-800/30">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-full animate-bounce shadow-sm"
          style={{ 
            animationDelay: `${i * 0.15}s`, 
            animationDuration: "1s",
            filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.5))'
          }}
        />
      ))}
    </div>
    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">جاري الكتابة</span>
  </div>
);

// =======================
// MESSAGE ACTIONS
// =======================

export const MessageActions = ({ 
  message, 
  onCopy, 
  onEdit, 
  onDelete 
}: { 
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
      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
    </button>
    {message.role === 'user' && (
      <>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          title="تعديل"
        >
          <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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

// =======================
// CODE HIGHLIGHTING
// =======================

// محرر كود جانبي سريع وخفيف - بدون تأثير على الأداء
// دالة تنظيف HTML محسّنة باللغة العربية
const تنظيف_HTML = (نص_HTML: string): string => {
  if (typeof window !== 'undefined') {
    // في المتصفح - استخدام DOM
    const عنصر_مؤقت = document.createElement("DIV");
    عنصر_مؤقت.innerHTML = نص_HTML;
    return عنصر_مؤقت.textContent || عنصر_مؤقت.innerText || "";
  } else {
    // في الخادم - استخدام regex محسّن
    return نص_HTML
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // إزالة السكريبت
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // إزالة الستايل
      .replace(/<[^>]*>/g, '')                          // إزالة جميع العلامات
      .replace(/&[^;]+;/g, ' ')                         // إزالة HTML entities
      .replace(/\s+/g, ' ')                             // تنظيف المسافات المتعددة
      .trim();
  }
};

const CodeEditor = ({ code, language }: { code: string; language?: string }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [editableCode, setEditableCode] = React.useState(code);
  
  // دالة محسّنة وآمنة لتلوين الكود - بدون تداخل HTML
  const colorizeCode = React.useMemo(() => {
    if (!code || typeof code !== 'string') return '';
    
    // تنظيف الكود من أي HTML موجود أولاً
    let cleanCode = تنظيف_HTML(code);
    
    const lines = cleanCode.split('\n');
    
    const processLine = (line: string): string => {
      // تجنب المعالجة إذا كان السطر فارغاً
      if (!line.trim()) return line;
      
      // 1. التعليقات أولاً (لأنها تغطي باقي السطر)
      if (line.trim().startsWith('#')) {
        return `<span class="text-gray-400 italic bg-gray-800/30 px-1 rounded">${line}</span>`;
      }
      
      // استخدام approach مختلف - نقسم السطر إلى tokens
      const tokens = [];
      let currentToken = '';
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (!inString && (char === '"' || char === "'" || char === '`')) {
          if (currentToken) {
            tokens.push({ type: 'normal', value: currentToken });
            currentToken = '';
          }
          inString = true;
          stringChar = char;
          currentToken = char;
        } else if (inString && char === stringChar && line[i-1] !== '\\') {
          currentToken += char;
          tokens.push({ type: 'string', value: currentToken });
          currentToken = '';
          inString = false;
          stringChar = '';
        } else if (inString) {
          currentToken += char;
        } else if (/\s/.test(char)) {
          if (currentToken) {
            tokens.push({ type: 'normal', value: currentToken });
            currentToken = '';
          }
          tokens.push({ type: 'space', value: char });
        } else if (/[+\-*\/=<>!(){}[\];,.]/.test(char)) {
          if (currentToken) {
            tokens.push({ type: 'normal', value: currentToken });
            currentToken = '';
          }
          tokens.push({ type: 'operator', value: char });
        } else {
          currentToken += char;
        }
      }
      
      if (currentToken) {
        tokens.push({ type: inString ? 'string' : 'normal', value: currentToken });
      }
      
      // معالجة كل token
      return tokens.map(token => {
        switch (token.type) {
          case 'string':
            return `<span class="text-yellow-400 font-medium bg-yellow-900/20 px-1 rounded">${token.value}</span>`;
          
          case 'operator':
            if (/[+\-*\/]/.test(token.value)) {
              return `<span class="text-red-400 font-bold">${token.value}</span>`;
            } else if (/[=<>!]/.test(token.value)) {
              return `<span class="text-orange-400 font-bold">${token.value}</span>`;
            } else {
              return `<span class="text-gray-400">${token.value}</span>`;
            }
          
          case 'space':
            return token.value;
          
          case 'normal':
            const value = token.value;
            
            // كلمات مفتاحية
            if (/^(def|class)$/.test(value)) {
              return `<span class="text-purple-400 font-bold">${value}</span>`;
            } else if (/^(if|else|elif|for|while|try|except|with|as|in|not|and|or|return|import|from)$/.test(value)) {
              return `<span class="text-blue-400 font-bold">${value}</span>`;
            } else if (/^(True|False|None|print)$/.test(value)) {
              return `<span class="text-red-400 font-bold">${value}</span>`;
            }
            
            // أرقام
            else if (/^\d+(\.\d+)?$/.test(value)) {
              return `<span class="text-cyan-400 font-semibold bg-cyan-900/20 px-1 rounded">${value}</span>`;
            }
            
            // متغيرات عربية أو إنجليزية
            else if (/^[a-zA-Z_\u0600-\u06FF][a-zA-Z0-9_\u0600-\u06FF]*$/.test(value)) {
              return `<span class="text-green-300">${value}</span>`;
            }
            
            return value;
          
          default:
            return token.value;
        }
      }).join('');
    };
    
    const coloredLines = lines.map((line, index) => {
      const colored = processLine(line);
      // إضافة أرقام الأسطر
      return `<span class="text-gray-500 text-xs mr-3 select-none opacity-60">${String(index + 1).padStart(2, '0')}</span>${colored}`;
    });
    
    return coloredLines.join('\n');
  }, [code, language]);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="my-6 rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-[#0a0e1a] via-[#0d1117] to-[#161b22] shadow-2xl">
      {/* Header محسّن مع تدرج جميل */}
      <div className="px-6 py-3 bg-gradient-to-r from-[#1e293b] via-[#334155] to-[#475569] text-gray-100 text-sm font-mono border-b-2 border-blue-400/30 flex items-center justify-between backdrop-blur-sm">
        <span className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-lg animate-pulse"></span>
            <span className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full shadow-lg animate-pulse" style={{animationDelay: '0.2s'}}></span>
            <span className="w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full shadow-lg animate-pulse" style={{animationDelay: '0.4s'}}></span>
          </div>
          <div className="h-4 w-px bg-gray-400/30 mx-2"></div>
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold text-base">
            {language === 'python' ? '🐍 Python' : language === 'javascript' ? '⚡ JavaScript' : '💻 ' + (language || 'Code')}
          </span>
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpanded}
            className="text-gray-300 hover:text-cyan-300 p-2 rounded-lg transition-all duration-200 hover:bg-blue-500/20 transform hover:scale-110"
            title={isExpanded ? "عرض مضغوط" : "محرر جانبي"}
          >
            {isExpanded ? <Edit2 size={16} /> : <ExternalLink size={16} />}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-gray-300 hover:text-green-300 p-2 rounded-lg transition-all duration-200 hover:bg-green-500/20 transform hover:scale-110"
            title="نسخ الكود"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      {/* العرض العادي محسّن */}
      {!isExpanded && (
        <div className="bg-gradient-to-br from-[#0a0e1a] via-[#0d1117] to-[#111827] p-6 font-mono text-sm overflow-auto max-h-96 leading-8 relative">
          {/* خلفية شبكية خفيفة */}
          <div className="absolute inset-0 opacity-5 bg-grid-pattern pointer-events-none"></div>
          
          <pre 
            className="whitespace-pre-wrap text-gray-100 m-0 relative z-10"
            style={{ 
              direction: 'ltr', 
              textAlign: 'left',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', monospace",
              fontSize: '14px',
              lineHeight: '1.7',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              letterSpacing: '0.3px'
            }}
            dangerouslySetInnerHTML={{ __html: colorizeCode }}
          />
        </div>
      )}

      {/* العرض الجانبي المتوسع */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-96">
          {/* محرر الإدخال - يسار */}
          <div className="bg-[#0d1117] border-r border-gray-600">
            <div className="p-2 bg-[#161b22] border-b border-gray-600">
              <span className="text-xs text-gray-400">📝 تحرير الكود</span>
            </div>
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              className="w-full h-80 p-3 bg-[#0d1117] text-gray-100 font-mono text-sm resize-none outline-none"
              style={{ 
                direction: 'ltr',
                fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace"
              }}
              placeholder="اكتب الكود هنا..."
            />
          </div>

          {/* معاينة الكود - يمين */}
          <div className="bg-[#0d1117]">
            <div className="p-2 bg-[#161b22] border-b border-gray-600">
              <span className="text-xs text-gray-400">👁️ معاينة فورية</span>
            </div>
            <div className="p-3 font-mono text-sm overflow-auto h-80 leading-7">
              <pre 
                className="whitespace-pre-wrap text-gray-100 m-0"
                style={{ 
                  direction: 'ltr', 
                  textAlign: 'left',
                  fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace"
                }}
              >
                {editableCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// تصدير CodeEditor للاستخدام في الملفات الأخرى
export { CodeEditor };

const تحليل_محتوى_الرسالة = (محتوى: string) => {
  // التحقق من أن المحتوى ليس undefined أو null
  if (!محتوى || typeof محتوى !== 'string') {
    console.warn('⚠️ محتوى غير صحيح تم تمريره لدالة تحليل المحتوى:', محتوى);
    return [{ type: 'text', content: '' }];
  }
  
  console.log('🔍 تحليل المحتوى:', محتوى.substring(0, 100) + '...');
  const نمط_كتلة_الكود = /```(\w+)?\n([\s\S]*?)```/g;
  const أجزاء: Array<{ type: string; content: string; language?: string }> = [];
  let آخر_فهرس = 0;
  let تطابق;

  while ((تطابق = نمط_كتلة_الكود.exec(محتوى)) !== null) {
    if (تطابق.index > آخر_فهرس) {
      أجزاء.push({ type: 'text', content: محتوى.slice(آخر_فهرس, تطابق.index) });
    }
    // تنظيف الكود من HTML قبل إضافته
    const كود_نظيف = تنظيف_HTML(تطابق[2].trim());
    أجزاء.push({ 
      type: 'code', 
      language: تطابق[1] || 'javascript', 
      content: كود_نظيف 
    });
    آخر_فهرس = تطابق.index + تطابق[0].length;
  }

  if (آخر_فهرس < محتوى.length) {
    أجزاء.push({ type: 'text', content: محتوى.slice(آخر_فهرس) });
  }

  console.log('📊 الأجزاء المحللة:', أجزاء.length, أجزاء.map(p => p.type));
  return أجزاء.length > 0 ? أجزاء : [{ type: 'text', content: محتوى }];
};

// للتوافق مع الكود الموجود
const parseMessageContent = تحليل_محتوى_الرسالة;

// =======================
// MESSAGE BUBBLE
// =======================

export const MessageBubble = ({ 
  message, 
  onDeepSearch, 
  onCopy, 
  onEdit, 
  onDelete 
}: { 
  message: Message; 
  onDeepSearch?: (content: string) => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-4 mb-6 animate-fadeIn group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
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
            <div className="prose prose-sm dark:prose-invert max-w-none
  prose-headings:text-purple-600 dark:prose-headings:text-purple-400
  prose-headings:font-bold prose-headings:mb-3
  prose-p:text-gray-800 dark:prose-p:text-gray-100
  prose-p:leading-relaxed prose-p:mb-4
  prose-code:bg-gray-100 dark:prose-code:bg-gray-800
  prose-code:text-purple-600 dark:prose-code:text-purple-400
  prose-code:px-2 prose-code:py-1 prose-code:rounded
  prose-code:font-mono prose-code:text-sm
  prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:rounded-xl
  prose-pre:overflow-x-auto
  prose-ol:list-decimal prose-ol:mr-6 prose-ol:space-y-2
  prose-ul:list-disc prose-ul:mr-6 prose-ul:space-y-2
  prose-li:text-gray-700 dark:prose-li:text-gray-200">
              {parseMessageContent(message.content).map((part, idx) => (
                part.type === 'code' ? (
                  <CodeEditor key={idx} code={part.content} language={part.language} />
                ) : (
                  <p key={idx} className="text-[17px] leading-7 whitespace-pre-wrap font-medium">
                    {part.content}
                  </p>
                )
              ))}
            </div>
            
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

// =======================
// SETTINGS MODAL
// =======================

export const SettingsModal = ({ 
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

// =======================
// SIDEBAR
// =======================

export const Sidebar = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onLogout,
  userName,
  isGuest,
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
}) => (
  <div
    className={`fixed right-0 top-0 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 z-50 ${
      isOpen ? "translate-x-0" : "translate-x-full"
    } w-80 border-l border-gray-200 dark:border-gray-700`}
  >
    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center shadow-xl">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-white text-lg">{userName}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">مستخدم نشط ✨</p>
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
      <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-4 px-2 flex items-center gap-2">
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
