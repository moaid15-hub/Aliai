'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Download, Play, Code2, Maximize2, Send, Sparkles, User } from 'lucide-react';

// تعريف النوع للرسائل
interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function CodeEditorWithChat() {
  const [code, setCode] = useState(`// اكتب طلبك في الشات وسأكتب لك الكود!
function example() {
  console.log("مرحباً!");
}`);
  
  const [language, setLanguage] = useState('javascript');
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'مرحباً! 👋 اكتب طلبك وسأكتب لك الكود مباشرة!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', color: 'from-yellow-400 to-orange-500' },
    { value: 'python', label: 'Python', color: 'from-blue-400 to-cyan-500' },
    { value: 'html', label: 'HTML', color: 'from-orange-400 to-red-500' },
    { value: 'css', label: 'CSS', color: 'from-purple-400 to-pink-500' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));
        
        eval(code);
        
        console.log = originalLog;
        setOutput(logs.join('\n') || 'تم التنفيذ بنجاح ✓');
      } catch (error: any) {
        setOutput(`خطأ: ${error?.message || 'خطأ غير معروف'}`);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput;
    setChatInput('');
    
    // إضافة رسالة المستخدم
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/code-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          currentCode: code
        })
      });

      const data = await response.json();

      if (data.code) {
        setCode(data.code);
        setLanguage(data.language || 'javascript');
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: 'تم! الكود جاهز ✨' 
        }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: `خطأ: ${data.error}` 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'عذراً، حدث خطأ في الاتصال. تأكد من إضافة API endpoint.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Code2 className="w-10 h-10 text-cyan-400" />
            محرر الأكواد مع Claude
          </h1>
          <p className="text-gray-400">اكتب طلبك في الدردشة وسأكتب لك الكود!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Section - على اليسار */}
          <div className="lg:col-span-4 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col h-[700px]">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 border-b border-gray-700">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                الدردشة
              </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-700/50 text-gray-100'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="bg-gray-700/50 rounded-2xl px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-700 p-4 bg-gray-900/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب طلبك هنا..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !chatInput.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Editor Section - في المنتصف */}
          <div className="lg:col-span-5 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        language === lang.value
                          ? `bg-gradient-to-r ${lang.color} text-white shadow-lg scale-105`
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300"
                    title="نسخ"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  
                  {language === 'javascript' && (
                    <button
                      onClick={handleRun}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all duration-300 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      تشغيل
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gray-900/50 border-l border-gray-700 flex flex-col items-center py-4 text-gray-500 text-sm font-mono">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="leading-6 h-6">
                    {i + 1}
                  </div>
                ))}
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-[540px] bg-transparent text-white font-mono text-base p-6 pr-16 focus:outline-none resize-none leading-6"
                style={{
                  caretColor: '#06b6d4',
                  tabSize: 2
                }}
                spellCheck={false}
              />
            </div>

            {/* Status Bar */}
            <div className="bg-gray-900 px-6 py-3 border-t border-gray-700 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-400">
                <span>{lineCount} سطر</span>
                <span>•</span>
                <span>{code.length} حرف</span>
              </div>
              <div className="text-cyan-400 font-medium">
                جاهز ✓
              </div>
            </div>
          </div>

          {/* Output Section - على اليمين */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-green-400" />
                المخرجات
              </h3>
            </div>
            
            <div className="p-6">
              {output ? (
                <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  {output}
                </pre>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>اضغط "تشغيل" لرؤية النتائج</p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="px-6 pb-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
                <h4 className="text-cyan-400 font-bold mb-3 text-sm">💡 نصائح سريعة</h4>
                <ul className="text-gray-400 text-xs space-y-2">
                  <li>• اكتب طلبك في الدردشة</li>
                  <li>• سأكتب لك الكود مباشرة</li>
                  <li>• يمكنك تعديل الكود بنفسك</li>
                  <li>• اضغط تشغيل لاختبار JS</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'دالة بسيطة', prompt: 'اكتب دالة تحسب مربع العدد' },
            { title: 'زر HTML', prompt: 'اعمل زر أزرق بنص "اضغط هنا"' },
            { title: 'حلقة', prompt: 'اكتب حلقة تطبع الأرقام من 1 إلى 10' }
          ].map((example, i) => (
            <button
              key={i}
              onClick={() => {
                setChatInput(example.prompt);
              }}
              className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl p-4 text-right transition-all duration-300"
            >
              <h4 className="text-white font-bold mb-2">{example.title}</h4>
              <p className="text-gray-400 text-sm">{example.prompt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}