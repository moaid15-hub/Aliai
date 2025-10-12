// ...existing code before view mode toggle...
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Menu, Plus, Clock, Moon, Sun, LogOut, User, Paperclip } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string; // Claude/OpenAI/local
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

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  let providerLabel = "";
  if (!isUser && message.provider) {
    if (message.provider === "claude") providerLabel = "aliai";
    else if (message.provider === "openai") providerLabel = "Muayadai";
    else if (message.provider === "local") providerLabel = "Aqlia Local";
    else providerLabel = `Aqlia ${message.provider}`;
  }
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
          isUser ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-gradient-to-br from-blue-500 to-cyan-500"
        }`}
      >
        {isUser ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
      </div>
      <div className={`flex flex-col max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ${
            isUser
              ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          {!isUser && providerLabel && (
            <span className="block mt-2 text-xs text-blue-500 dark:text-blue-300 font-semibold">{providerLabel}</span>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2" suppressHydrationWarning>
          {message.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
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

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    // أي إرسال جديد يلغي حالة سؤال الطالب إن كانت مفعلة
    setPendingMedStudentAsk(false);
    const attachmentText = selectedFiles.length
      ? `\n\n(مرفقات: ${selectedFiles.map((f) => f.name).slice(0, 3).join(", ")}${selectedFiles.length > 3 ? "+" + (selectedFiles.length - 3) + " أخرى" : ""})`
      : "";
    const contentToSend = inputValue + attachmentText;
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: contentToSend, timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setSelectedFiles([]);
    setIsTyping(true);
    try {
      // استدعاء AWS Lambda API مباشرة
      const res = await fetch("https://m6a2nksc08.execute-api.eu-west-1.amazonaws.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })), 
          model: selectedProvider === "openai" ? "gpt-4o-mini" : "claude-3-sonnet-20240229"
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل الاتصال بالخادم');
      }

      const data = await res.json();
      
      // Lambda يرجع { message, provider } مباشرة
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: data.message, 
        timestamp: new Date(), 
        provider: data.provider || (selectedProvider === "openai" ? "openai" : "claude")
      };
      setMessages([...newMessages, aiMsg]);
      setLastUsedProvider(data.provider || "unknown");
      
    } catch (e) {
      console.error("API Error:", e);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: getLocalAIResponse(userMessage.content), timestamp: new Date(), provider: "local" };
      setMessages([...newMessages, aiMsg]);
      setLastUsedProvider("local");
    } finally {
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
    window.location.href = "/auth/login";
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
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
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
