"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Menu, Plus, Clock, Moon, Sun, LogOut, User, Paperclip, ExternalLink, Search, Zap, Brain } from "lucide-react";

// كلمات مفتاحية للبحث الذكي
const searchKeywords = [
  'ابحث', 'search', 'بحث', 'ابحث لي', 'دور على',
  'آخر', 'أخبار', 'جديد', 'حديث', 'معلومات عن',
  'latest', 'news', 'recent', 'update',
  'ما هو', 'من هو', 'متى', 'أين', 'كيف',
  'what is', 'who is', 'when', 'where', 'how',
  'قارن', 'مقارنة', 'الفرق بين', 'أفضل',
  'compare', 'difference', 'best',
  'سعر', 'كم', 'تاريخ', 'موعد',
  'price', 'cost', 'date', 'when',
  'الآن', 'اليوم', 'حالياً', 'الوضع',
  'now', 'today', 'current', 'status'
];

const needsSearch = (query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  return searchKeywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
};

const searchWeb = async (query: string) => {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: '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',
      query: query,
      max_results: 3
    })
  });
  return await response.json();
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

const getProviderDisplayName = (provider?: string): string => {
  const providers: Record<string, string> = {
    'deepseek': 'DeepSeek AI',
    'openai': 'Muayad AI',
    'claude': 'Claude AI',
    'local': 'Aqlia Local',
    'search': 'Tavily Search',
    'error': 'System Error'
  };
  return providers[provider || ''] || 'AI Assistant';
};

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-5 py-4 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 rounded-3xl shadow-lg border border-purple-100 dark:border-purple-800/30">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full animate-bounce shadow-sm"
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

const MessageBubble = ({ message, onDeepSearch }: { message: Message; onDeepSearch?: (content: string) => void }) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={`flex gap-4 mb-6 animate-fadeIn ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl transform transition-transform hover:scale-105 ${
        isUser 
          ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500' 
          : 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500'
      }`}>
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <Brain className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {isUser ? (
          <div className="group relative">
            <div className="rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white rounded-br-md px-6 py-4 transform hover:-translate-y-0.5">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {/* AI Response */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-100 font-normal">
                {message.content}
              </p>
            </div>
            
            {/* Sources Section */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <Search className="w-4 h-4" />
                  <span>مصادر المعلومات</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {message.sources.map((source: any, idx: number) => {
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
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
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
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                              مصدر {idx + 1}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
                
                {/* Deep Search Button */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onDeepSearch && onDeepSearch(message.content)}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span>بحث متقدم</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Metadata */}
        <div className="flex items-center gap-2 mt-2 px-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          {!isUser && message.provider && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm ${
                message.provider === 'deepseek' 
                  ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 dark:from-orange-900/40 dark:to-orange-800/40 dark:text-orange-300'
                  : message.provider === 'openai'
                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300'
                  : message.provider === 'claude'
                  ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900/40 dark:to-purple-800/40 dark:text-purple-300'
                  : message.provider === 'search'
                  ? 'bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 dark:from-cyan-900/40 dark:to-cyan-800/40 dark:text-cyan-300'
                  : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300'
              }`}>
                {getProviderDisplayName(message.provider)}
              </span>
            </>
          )}
        </div>
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
    className={`fixed right-0 top-0 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 z-50 ${
      isOpen ? "translate-x-0" : "translate-x-full"
    } w-80 border-l border-gray-200 dark:border-gray-700`}
  >
    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-xl">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-white text-lg">{userName}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">مستخدم نشط ✨</p>
        </div>
      </div>
      <button
        onClick={onNewChat}
        className="w-full px-5 py-3.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
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
          <button
            key={conv.id}
            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-200 text-right group border border-transparent hover:border-purple-200 dark:hover:border-purple-800 shadow-sm hover:shadow-md"
          >
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
              {conv.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {conv.timestamp.toLocaleDateString("en-CA")}
            </p>
          </button>
        ))}
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
      {isGuest ? (
        <a
          href="/auth/login"
          className="w-full px-5 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
        >
          <User className="w-5 h-5" />
          <span>تسجيل الدخول</span>
        </a>
      ) : (
        <button
          onClick={onLogout}
          className="w-full px-5 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations: Conversation[] = [
    { id: "1", title: "محادثة عن البرمجة", timestamp: new Date(2024, 9, 6) },
    { id: "2", title: "أسئلة تقنية", timestamp: new Date(2024, 9, 5) },
    { id: "3", title: "مساعدة في المشروع", timestamp: new Date(2024, 9, 4) },
  ];

  const deeperSearch = async (content: string) => {
    try {
      const keywords = content.split(' ').slice(0, 5).join(' ');
      const searchQuery = `${keywords} معلومات تفصيلية`;
      const searchResults = await searchWeb(searchQuery);
      
      if (searchResults.results && searchResults.results.length > 0) {
        const newSources = searchResults.results.map((result: any) => ({
          title: result.title,
          url: result.url,
          snippet: result.content
        }));
        
        const deeperMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `إليك مصادر إضافية ومعلومات أعمق حول الموضوع:`,
          timestamp: new Date(),
          provider: 'search',
          sources: newSources
        };
        
        setMessages(prev => [...prev, deeperMessage]);
      }
    } catch (error) {
      console.error('❌ فشل البحث الأوسع:', error);
    }
  };

  const buildWelcome = (name: string) => {
    return `السلام عليكم ${name}`;
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
          name = userData.fullName || userData.full_name || "مستخدم";
        } catch (e) {
          console.error("خطأ في قراءة بيانات المستخدم:", e);
          name = "مستخدم";
        }
      }
    }
    
    setUserName(name);
    setMessages([{ 
      id: Date.now().toString(), 
      role: "assistant", 
      content: buildWelcome(name), 
      timestamp: new Date() 
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      let searchContext = '';
      let sources: Array<{title: string, url: string, snippet: string}> = [];

      if (needsSearch(currentInput)) {
        try {
          const searchResults = await searchWeb(currentInput);
          searchContext = searchResults.results?.map((result: any, index: number) => 
            `المصدر ${index + 1}: ${result.title}\n${result.content.substring(0, 300)}...`
          ).join('\n\n') || '';
          sources = searchResults.results?.map((result: any) => ({
            title: result.title,
            url: result.url,
            snippet: result.content
          })) || [];
        } catch (searchError) {
          console.error('❌ فشل البحث:', searchError);
        }
      }

      // Simulated response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: searchContext 
          ? `بناءً على البحث، إليك ما وجدته:\n\n${currentInput}`
          : `شكراً لسؤالك: ${currentInput}`,
        timestamp: new Date(),
        provider: 'openai',
        sources: sources
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('❌ خطأ:', error);
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/auth/login/";
  };

  const handleNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: "assistant",
      content: buildWelcome(userName),
      timestamp: new Date(),
    }]);
    setIsSidebarOpen(false);
    setInputValue("");
    setSelectedFiles([]);
  };

  const isWelcomeOnly = messages.length === 1 && messages[0].role === "assistant";

  const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    e.target.value = "";
  };

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
        <Sidebar 
          conversations={conversations} 
          onNewChat={handleNewChat} 
          isOpen={isSidebarOpen} 
          onLogout={handleLogout} 
          userName={userName} 
          isGuest={isGuest} 
        />
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="max-w-5xl mx-auto px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 shadow-sm transform hover:scale-105"
                  >
                    {isDark ? <Moon className="w-5 h-5 text-yellow-400" /> : <Sun className="w-5 h-5 text-orange-500" />}
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                  <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    Aqlia AI
                  </h1>
                  <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                </div>
                
                <div className="w-32" />
              </div>
            </div>
          </div>

          {/* Body */}
          {isWelcomeOnly ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="w-full max-w-3xl">
                <div className="text-center mb-12 space-y-4">
                  <div className="inline-block p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl shadow-2xl mb-6">
                    <Brain className="w-16 h-16 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white" style={{ direction: 'rtl' }}>
                    {buildWelcome(userName).split('\n')[0]}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                    اسألني أي شيء وسأساعدك بأفضل ما لدي! 🚀
                  </p>
                </div>
                
                <div className="flex items-end gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-200 dark:border-purple-800 focus-within:border-purple-400 dark:focus-within:border-purple-600 transition-all duration-300 p-5">
                  <label 
                    htmlFor="file-input-center" 
                    className="flex-shrink-0 p-3 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-all duration-200 transform hover:scale-110" 
                    title="إرفاق ملفات"
                  >
                    <Paperclip className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                    className="flex-1 resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base px-4 py-3 rounded-2xl"
                    rows={2}
                    dir="rtl"
                  />
                  
                  <button 
                    onClick={handleSend} 
                    disabled={!inputValue.trim() || isTyping} 
                    className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center font-medium">
                    📎 {selectedFiles.length} ملف مرفق
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center font-medium">
                  اضغط <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> للإرسال • 
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mx-1">Shift+Enter</kbd> لسطر جديد
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-6 py-8">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} onDeepSearch={deeperSearch} />
                  ))}
                  {isTyping && (
                    <div className="flex gap-4 mb-6">
                      <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-xl">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <TypingIndicator />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                <div className="max-w-4xl mx-auto px-6 py-6">
                  <div className="flex items-end gap-3 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-gray-200 dark:border-gray-700 focus-within:border-purple-400 dark:focus-within:border-purple-600 transition-all duration-300 p-5">
                    <label 
                      htmlFor="file-input-footer" 
                      className="flex-shrink-0 p-3 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-all duration-200 transform hover:scale-110" 
                      title="إرفاق ملفات"
                    >
                      <Paperclip className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                      className="flex-1 resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base px-4 py-3 rounded-2xl"
                      rows={2}
                      dir="rtl"
                    />
                    
                    <button 
                      onClick={handleSend} 
                      disabled={!inputValue.trim() || isTyping} 
                      className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center font-medium">
                      📎 {selectedFiles.length} ملف مرفق
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
