"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Menu, Plus, Clock, Moon, Sun, LogOut, User, Paperclip, ExternalLink } from "lucide-react";

// كلمات مفتاحية للبحث الذكي
const searchKeywords = [
  // بحث مباشر
  'ابحث', 'search', 'بحث', 'ابحث لي', 'دور على',
  
  // آخر أخبار/معلومات
  'آخر', 'أخبار', 'جديد', 'حديث', 'معلومات عن',
  'latest', 'news', 'recent', 'update',
  
  // أسئلة تحتاج بحث
  'ما هو', 'من هو', 'متى', 'أين', 'كيف',
  'what is', 'who is', 'when', 'where', 'how',
  
  // مقارنات
  'قارن', 'مقارنة', 'الفرق بين', 'أفضل',
  'compare', 'difference', 'best',
  
  // أسعار/تواريخ
  'سعر', 'كم', 'تاريخ', 'موعد',
  'price', 'cost', 'date', 'when',
  
  // أحداث حالية
  'الآن', 'اليوم', 'حالياً', 'الوضع',
  'now', 'today', 'current', 'status'
];

// فحص إذا كان السؤال يحتاج بحث
const needsSearch = (query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  return searchKeywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
};



// وظيفة البحث المبسطة
const searchWeb = async (query: string) => {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: process.env.NEXT_PUBLIC_TAVILY_API_KEY || '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',
      query: query,
      max_results: 3
    })
  });

  const data = await response.json();
  return data;
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string; // Claude/OpenAI/local
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

interface AlternativeOption {
  provider: string; // 'openai' | 'claude'
  message: string;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl max-w-[100px] shadow-sm">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }}
        />
      ))}
    </div>
  </div>
);

// Message Bubble Component
const MessageBubble = ({ message, onDeepSearch }: { message: Message; onDeepSearch?: (content: string) => void }) => {
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
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* رسالة المستخدم */}
        {isUser ? (
          <div className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="w-full">
            {/* رد الذكاء الاصطناعي بدون مربع */}
            <div className="mb-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-white">{message.content}</p>
            </div>
            
            {/* المصادر تحت الرد */}
            {message.sources && message.sources.length > 0 && (
              <>
                <div className="px-4 pb-3 pt-3">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {message.sources.map((source: any, idx: number) => {
                      let domain = '';
                      try {
                        domain = new URL(source.url).hostname.replace('www.', '');
                      } catch (e) {
                        domain = 'مصدر';
                      }
                      
                      return (
                        <div key={idx} className="flex-shrink-0 w-40">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                          >
                            {/* صورة - شفافة */}
                            <div className="rounded-xl overflow-hidden border-2 border-gray-400 dark:border-gray-500 hover:border-purple-500 hover:shadow-lg transition-all duration-200 mb-2 bg-transparent backdrop-blur-sm">
                              <div className="aspect-video flex items-center justify-center relative">
                                <img 
                                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                                  alt=""
                                  className="w-8 h-8"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                                  {idx + 1}
                                </div>
                              </div>
                            </div>
                            
                            {/* نصوص */}
                            <span className="text-xs text-gray-900 dark:text-white font-bold block mb-1 truncate drop-shadow-sm">
                              {domain}
                            </span>
                            <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight font-medium">
                              {source.title}
                            </p>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* سؤال بسيط */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                      🔍 هل تريد بحث متقدم؟
                    </span>
                    <button
                      onClick={() => onDeepSearch && onDeepSearch(message.content)}
                      className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      نعم
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
          {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

const Sidebar = ({
  conversations,
  onNewChat,
  isOpen,
  onLogout,
  userName,
  isGuest,
}: {
  conversations: Conversation[];
  onNewChat: () => void;
  isOpen: boolean;
  onLogout: () => void;
  userName: string;
  isGuest: boolean;
}) => (
  <div
    className={`fixed right-0 top-0 h-full bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 z-50 ${
      isOpen ? "translate-x-0" : "translate-x-full"
    } w-80 border-l border-gray-200 dark:border-gray-700`}
  >
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-800 dark:text-white">{userName}</p>
          <p className="text-xs text-gray-500">مستخدم نشط</p>
        </div>
      </div>
      <button
        onClick={onNewChat}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>محادثة جديدة</span>
      </button>
    </div>

    <div className="p-4 overflow-y-auto h-[calc(100%-200px)]">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">المحادثات السابقة</h3>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            className="w-full p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-right group"
          >
            <div className="flex items-center justify-between">
              <Clock className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate flex-1 mr-2">{conv.title}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{conv.timestamp.toLocaleDateString("en-CA")}</p>
          </button>
        ))}
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {isGuest ? (
        <a
          href="/auth/login"
          className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <User className="w-5 h-5" />
          <span>تسجيل الدخول</span>
        </a>
      ) : (
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      )}
    </div>
  </div>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [userName, setUserName] = useState("مستخدم");
  const [isGuest, setIsGuest] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<"claude" | "openai" | "auto">("auto");
  const [lastUsedProvider, setLastUsedProvider] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pendingAlternatives, setPendingAlternatives] = useState<AlternativeOption[] | null>(null);
  const [pendingMedStudentAsk, setPendingMedStudentAsk] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations: Conversation[] = [
    { id: "1", title: "محادثة عن البرمجة", timestamp: new Date(2024, 9, 6) },
    { id: "2", title: "أسئلة تقنية", timestamp: new Date(2024, 9, 5) },
    { id: "3", title: "مساعدة في المشروع", timestamp: new Date(2024, 9, 4) },
  ];

  // وظيفة البحث الأوسع
  const deeperSearch = async (content: string) => {
    try {
      console.log('🔍 بحث أوسع للموضوع:', content);
      
      // استخراج الكلمات المفتاحية من المحتوى
      const keywords = content.split(' ').slice(0, 5).join(' ');
      const searchQuery = `${keywords} معلومات تفصيلية`;
      
      const searchResults = await searchWeb(searchQuery);
      
      if (searchResults.results && searchResults.results.length > 0) {
        const newSources = searchResults.results.map((result: any) => ({
          title: result.title,
          url: result.url,
          snippet: result.content
        }));
        
        // إضافة رسالة جديدة بالمصادر الإضافية
        const deeperMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: `إليك مصادر إضافية حول الموضوع:`,
          timestamp: new Date(),
          sources: newSources
        };
        
        setMessages(prev => [...prev, deeperMessage]);
      }
    } catch (error) {
      console.error('❌ فشل البحث الأوسع:', error);
    }
  };

  // Helper to build a personalized welcome each entry, based on time of day
  const buildWelcome = (name: string) => {
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "صباح الخير" : "مساء الخير";
  return `${greeting} أستاذ ${name}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    let name = "زائر";
    if (!token) {
      setIsGuest(true);
    } else {
      setIsGuest(false);
      if (user) {
        try {
          const userData = JSON.parse(user);
          name = userData.fullName || userData.full_name || "مستخدم تجريبي";
        } catch (e) {
          console.error("خطأ في قراءة بيانات المستخدم:", e);
          name = "مستخدم";
        }
      } else {
        name = "مستخدم";
      }
    }
    setUserName(name);
    // Set personalized welcome only once on mount when messages empty
    setMessages((prev) => (prev.length === 0 ? [{ id: Date.now().toString(), role: "assistant", content: buildWelcome(name), timestamp: new Date() }] : prev));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getLocalAIResponse = (txt: string) => `رد محلي: استلمت "${txt}"`;

  // دوال البحث الذكي
  const shouldSearch = (message: string): boolean => {
    const searchKeywords = [
      'ما هو', 'ما هي', 'كيف', 'متى', 'أين', 'لماذا', 'من',
      'اشرح', 'وضح', 'عرف', 'اذكر', 'قل لي',
      'أحدث', 'جديد', 'آخر', 'حديث', 'أخبار',
      'what', 'how', 'when', 'where', 'why', 'who',
      'explain', 'tell me', 'latest', 'recent', 'news'
    ];
    
    const messageLower = message.toLowerCase();
    return searchKeywords.some(keyword => messageLower.includes(keyword));
  };

  const formatSearchContext = (results: any[]): string => {
    if (!results || results.length === 0) return '';
    
    let context = '\n\n--- معلومات من البحث ---\n';
    results.slice(0, 3).forEach((result, index) => {
      context += `المصدر ${index + 1}: ${result.title}\n${result.content.substring(0, 200)}...\n\n`;
    });
    
    return context;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // 🔍 Web Search Integration
      console.log('🔍 البحث في الويب...');
      let searchContext = '';
      let sources: Array<{title: string, url: string, snippet: string}> = [];

      // فحص إذا كان السؤال يحتاج بحث
      const shouldSearch = needsSearch(currentInput);
      console.log('🤔 هل يحتاج السؤال لبحث؟', shouldSearch);

      if (shouldSearch) {
        try {
          console.log('🔍 بدء البحث باستخدام Tavily...');
          const searchResults = await searchWeb(currentInput);
          console.log('📊 نتائج البحث الخام:', searchResults);
          
          searchContext = searchResults.results?.map((result: any, index: number) => 
            `المصدر ${index + 1}: ${result.title}\n${result.content.substring(0, 300)}...`
          ).join('\n\n') || '';
          sources = searchResults.results?.map((result: any) => ({
            title: result.title,
            url: result.url,
            snippet: result.content
          })) || [];
          console.log('✅ تم العثور على', sources.length, 'مصادر');
          console.log('📝 محتوى البحث:', searchContext.substring(0, 200) + '...');
        } catch (searchError) {
          console.error('❌ فشل البحث:', searchError);
          console.warn('⚠️ الاستمرار بدون نتائج بحث');
        }
      } else {
        console.log('💬 سؤال عادي - لا يحتاج بحث');
      }

      // إرسال للـ API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...(searchContext ? [{
              role: 'system',
              content: `استخدم المعلومات التالية من البحث للإجابة بدقة:\n\n${searchContext}`
            }] : []),
            ...messages.map(m => ({ 
              role: m.role, 
              content: m.content 
            })),
            { role: 'user', content: currentInput }
          ],
          model: 'gpt-4o-mini',
          provider: 'openai'
        })
      });

      if (!response.ok) {
        throw new Error('فشل الاتصال بالخادم');
      }

      const data = await response.json();
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.message?.content || data.message || 'لم أتمكن من الحصول على رد',
        timestamp: new Date(),
        sources: sources // إضافة المصادر
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

    } catch (error) {
      console.error('❌ خطأ:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'عذراً، حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const chooseAlternative = (provider: string) => {
    if (!pendingAlternatives) return;
    const alt = pendingAlternatives.find((a) => a.provider === provider) || pendingAlternatives[0];
    if (!alt) return;
    const aiMsg: Message = {
      id: (Date.now() + 2).toString(),
      role: "assistant",
      content: alt.message,
      timestamp: new Date(),
      provider: alt.provider,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setLastUsedProvider(alt.provider);
    setPendingAlternatives(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login/";
  };

  const handleNewChat = () => {
    const welcome = buildWelcome(userName || "مستخدم");
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: welcome,
        timestamp: new Date(),
      },
    ]);
    setIsSidebarOpen(false);
    setInputValue("");
    setSelectedFiles([]);
  };

  const isWelcomeOnly = messages.length === 1 && messages[0].role === "assistant";

  const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    // allow re-picking the same file
    e.target.value = "";
  };

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
  <Sidebar conversations={conversations} onNewChat={handleNewChat} isOpen={isSidebarOpen} onLogout={handleLogout} userName={userName} isGuest={isGuest} />
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/95 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
                    aria-label={isDark ? "الوضع النهاري" : "الوضع الليلي"}
                  >
                    {isDark ? <Moon className="w-4 h-4 text-gray-300" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent font-sans">Aqlia AI</h1>
                </div>
                <div className="flex items-center gap-3">
                  {lastUsedProvider && (
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {lastUsedProvider === "claude"
                        ? "aliai"
                        : lastUsedProvider === "openai"
                        ? "Muayadai"
                        : lastUsedProvider === "local"
                        ? "Aqlia Local"
                        : "Aqlia " + lastUsedProvider}
                    </div>
                  )}
                </div>
              </div>
              {pendingMedStudentAsk && (
                <div className="max-w-4xl mx-auto px-6 -mt-3">
                  <div className="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-200">هل أنت طالب طب؟</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setInputValue('نعم'); setTimeout(() => handleSend(), 0); }}
                        className="px-3 py-1.5 text-xs rounded-full bg-green-600 text-white hover:opacity-90"
                      >نعم</button>
                      <button
                        onClick={() => { setInputValue('لا'); setTimeout(() => handleSend(), 0); }}
                        className="px-3 py-1.5 text-xs rounded-full bg-red-600 text-white hover:opacity-90"
                      >لا</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          {isGuest && (
            <div className="bg-amber-50 border-y border-amber-200 text-amber-800 text-sm px-4 py-2 text-center">
              أنت تستخدم وضع التجربة كزائر. <a href="/auth/login" className="underline font-medium">سجّل الدخول</a> أو <a href="/auth/register" className="underline font-medium">أنشئ حسابًا</a> لحفظ محادثاتك.
            </div>
          )}
          {isWelcomeOnly ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-xl px-6">
                {/* Direct greeting above input, plain text, no background */}
                <div
                  className="text-lg font-semibold text-center w-full mb-6"
                  style={{ direction: 'rtl', fontFamily: `'Amiri', 'Noto Kufi Arabic', 'Cairo', 'Tajawal', 'Arial', sans-serif` }}
                >
                  {buildWelcome(userName)}
                </div>
                <div className="flex items-end gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 focus-within:border-purple-500 dark:focus-within:border-purple-500 transition-all duration-200 p-4 mx-auto justify-center" style={{ maxWidth: 700, minWidth: 400, width: '100%' }}>
                  <label htmlFor="file-input-center" className="flex-shrink-0 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors" title="إرفاق ملفات">
                    <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </label>
                  <input id="file-input-center" type="file" className="hidden" multiple onChange={onFilesPicked} />
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 min-w-[400px] max-w-full resize-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base px-6 py-2 text-right rounded-2xl"
                    rows={2}
                    dir="rtl"
                  />
                  <button onClick={handleSend} disabled={!inputValue.trim() || isTyping} className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl disabled:opacity-50">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {(selectedFiles.length > 0) && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 text-center">
                    ملفات مرفقة: {selectedFiles.slice(0,2).map(f => f.name).join(", ")}{selectedFiles.length > 2 ? ` +${selectedFiles.length-2}` : ""}
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">اضغط Enter للإرسال • Shift+Enter لسطر جديد</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-blue-50/60 to-purple-50/60 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
                <div className="max-w-4xl mx-auto px-6 py-6">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} onDeepSearch={deeperSearch} />
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <TypingIndicator />
                    </div>
                  )}
                  {pendingAlternatives && (
                    <div className="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow">
                      <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 text-right">مقارنة النهجين</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingAlternatives.map((alt) => (
                          <div key={alt.provider} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {alt.provider === 'openai' ? 'نهج Muayadai' : alt.provider === 'claude' ? 'نهج aliai' : `نهج ${alt.provider}`}
                              </span>
                              <button onClick={() => chooseAlternative(alt.provider)} className="px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                اختر هذا
                              </button>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap max-h-56 overflow-auto">
                              {alt.message}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">اختر النهج الذي تفضله لإكمال الحوار بناءً عليه.</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="bg-white/95 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-700 shadow-lg">
                <div className="max-w-2xl mx-auto px-6 py-2 flex justify-center items-end">
                  <div className="relative w-full flex justify-center pointer-events-auto">
                    <div className="flex items-end gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 focus-within:border-purple-500 dark:focus-within:border-purple-500 transition-all duration-200 p-4 mx-auto justify-center" style={{ maxWidth: 800, minWidth: 400, width: '100%' }}>
                      <label htmlFor="file-input-footer" className="flex-shrink-0 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors" title="إرفاق ملفات">
                        <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </label>
                      <input id="file-input-footer" type="file" className="hidden" multiple onChange={onFilesPicked} />
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1 min-w-[400px] max-w-full resize-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base px-6 py-2 text-right rounded-2xl"
                        rows={2}
                        dir="rtl"
                      />
                      <button onClick={handleSend} disabled={!inputValue.trim() || isTyping} className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl disabled:opacity-50">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {(selectedFiles.length > 0) && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 text-center">
                      ملفات مرفقة: {selectedFiles.slice(0,2).map(f => f.name).join(", ")}{selectedFiles.length > 2 ? ` +${selectedFiles.length-2}` : ""}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">اضغط Enter للإرسال • Shift+Enter لسطر جديد</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
