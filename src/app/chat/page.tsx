'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Menu, Plus, Clock, Zap, Moon, Sun, LogOut, User } from 'lucide-react';

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

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
        isUser 
          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
          : 'bg-gradient-to-br from-blue-500 to-cyan-500'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>

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

const Sidebar = ({ 
  conversations, 
  onNewChat, 
  isOpen,
  onLogout,
  userName
}: { 
  conversations: Conversation[]; 
  onNewChat: () => void; 
  isOpen: boolean;
  onLogout: () => void;
  userName: string;
}) => (
  <div className={`fixed right-0 top-0 h-full bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 z-50 ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  } w-80 border-l border-gray-200 dark:border-gray-700`}>
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

    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <button
        onClick={onLogout}
        className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        <span>تسجيل الخروج</span>
      </button>
    </div>
  </div>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'أهلاً وسهلاً بك في Oqool AI! 🌟\n\nأنا مساعدك الذكي المطور خصيصاً للمستخدمين العرب. يمكنني مساعدتك في:\n\n💻 البرمجة وتطوير المواقع\n📚 التعليم والشرح\n✍️ كتابة وتحرير النصوص\n🔧 حل المشاكل التقنية\n🌍 الترجمة والتفسير\n💡 الأفكار والنصائح\n\nجرب أن تسألني عن أي موضوع! مثلاً:\n• "علمني البرمجة"\n• "كيف أطور موقع ويب؟"\n• "ما هو Next.js؟"\n\nما الذي تود أن نتحدث عنه اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [userName, setUserName] = useState('مستخدم');
  const [selectedProvider, setSelectedProvider] = useState<'claude' | 'openai' | 'auto'>('auto');
  const [lastUsedProvider, setLastUsedProvider] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations: Conversation[] = [
    { id: '1', title: 'محادثة عن البرمجة', timestamp: new Date(2024, 9, 6) },
    { id: '2', title: 'أسئلة تقنية', timestamp: new Date(2024, 9, 5) },
    { id: '3', title: 'مساعدة في المشروع', timestamp: new Date(2024, 9, 4) }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) {
      // إعادة توجيه لصفحة تسجيل الدخول مع رسالة
      localStorage.setItem('redirectMessage', 'يجب تسجيل الدخول أولاً للوصول للدردشة');
      window.location.href = '/auth/login';
      return;
    }

    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.fullName || userData.full_name || 'مستخدم تجريبي');
      } catch (e) {
        console.error('خطأ في قراءة بيانات المستخدم:', e);
        setUserName('مستخدم');
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // محاكي AI بسيط للتجربة المحلية
  const getAIResponse = (userMessage: string): string => {
    const responses: { [key: string]: string } = {
      'مرحبا': 'مرحباً بك! أنا Oqool AI، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
      'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته! أهلاً وسهلاً بك.',
      'ما اسمك': 'اسمي Oqool AI، وأنا مساعد ذكي مطور خصيصاً للمستخدمين العرب باستخدام تقنيات الذكاء الاصطناعي المتقدمة.',
      'كيف حالك': 'أنا بأفضل حال، شكراً لك! جاهز لمساعدتك في أي موضوع تقني أو تعليمي.',
      'ساعدني': 'بالطبع! أخبرني بالضبط ماذا تحتاج وسأقدم لك أفضل المساعدة الممكنة.',
      'البرمجة': 'البرمجة عالم رائع! 💻\n\nيمكنني مساعدتك في:\n• JavaScript & TypeScript\n• React & Next.js\n• Python & Django\n• HTML, CSS & Tailwind\n• Node.js & APIs\n\nما اللغة التي تريد أن نبدأ بها؟',
      'تطوير المواقع': 'تطوير المواقع مجال مثير! 🌐\n\nيشمل جانبين رئيسيين:\n\n🎨 Frontend:\n• React, Vue, Angular\n• HTML, CSS, JavaScript\n• UI/UX Design\n\n⚙️ Backend:\n• Node.js, Python, PHP\n• قواعد البيانات\n• APIs & الأمان\n\nأي جانب يهمك أكثر؟',
      'next.js': 'Next.js إطار عمل قوي جداً! 🚀\n\nمميزاته الرئيسية:\n• Server-Side Rendering (SSR)\n• Static Site Generation (SSG)\n• API Routes مدمجة\n• تحسين تلقائي للصور\n• دعم TypeScript\n• App Router الجديد\n\nهل تريد تعلم كيفية إنشاء مشروع Next.js؟',
      'react': 'React مكتبة رائعة لبناء الواجهات! ⚛️\n\nالمفاهيم الأساسية:\n• Components & JSX\n• State & Props\n• Hooks (useState, useEffect)\n• Event Handling\n• Conditional Rendering\n\nهل تريد شرح أحد هذه المفاهيم؟',
      'javascript': 'JavaScript لغة البرمجة الأكثر شعبية! ✨\n\nأساسيات مهمة:\n• Variables & Data Types\n• Functions & Arrow Functions\n• Arrays & Objects\n• Async/Await & Promises\n• DOM Manipulation\n• ES6+ Features\n\nما المفهوم الذي تريد أن نركز عليه؟',
      'css': 'CSS أداة التصميم السحرية! 🎨\n\nموضوعات متقدمة:\n• Flexbox & Grid Layout\n• Animations & Transitions\n• Responsive Design\n• CSS Variables\n• Pseudo-classes\n• Transform & Filters\n\nهل تريد أمثلة عملية على أي منها؟',
      'python': 'Python لغة برمجة قوية ومرنة! 🐍\n\nاستخدامات شائعة:\n• تطوير المواقع (Django, Flask)\n• تحليل البيانات (Pandas, NumPy)\n• الذكاء الاصطناعي (TensorFlow, PyTorch)\n• الأتمتة والسكريبتات\n• APIs & Web Scraping\n\nما المجال الذي يهمك؟',
      'شكرا': 'عفواً! 😊 أنا سعيد لأنني تمكنت من مساعدتك. لا تتردد في سؤالي عن أي شيء آخر!',
      'علمني': 'ممتاز! أحب التعليم 📚\n\nيمكنني تعليمك:\n• البرمجة من الصفر\n• تطوير المواقع\n• تصميم قواعد البيانات\n• أساسيات الأمن السيبراني\n• إدارة المشاريع التقنية\n\nما الموضوع الذي تريد أن نبدأ به؟',
    };

    const userLower = userMessage.toLowerCase().trim();
    
    // البحث عن كلمات مفتاحية
    for (const [keyword, response] of Object.entries(responses)) {
      if (userLower.includes(keyword)) {
        return response;
      }
    }

    // ردود عامة ذكية
    if (userMessage.includes('؟')) {
      return `سؤال مثير للاهتمام! بناءً على ما فهمت من "${userMessage}"، يمكنني القول أن هذا موضوع يستحق النقاش. هل يمكنك تقديم المزيد من التفاصيل؟`;
    }

    if (userMessage.length > 50) {
      return 'شكراً لك على هذه المعلومات المفصلة. أفهم ما تقصده، وهذا موضوع مهم يحتاج إلى دراسة متأنية. كيف يمكنني مساعدتك أكثر في هذا الأمر؟';
    }

    return `أشكرك على رسالتك: "${userMessage}". أنا هنا لمساعدتك! يمكنك سؤالي عن البرمجة، تطوير المواقع، أو أي موضوع تقني آخر.`;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(msg => ({ 
            role: msg.role, 
            content: msg.content 
          })),
          provider: selectedProvider 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // حفظ المزود المستخدم لعرضه للمستخدم
        setLastUsedProvider(data.provider || 'unknown');
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages([...newMessages, aiMessage]);
      } else {
        throw new Error(data.error || 'خطأ في الاستجابة');
      }
    } catch (error) {
      console.error('خطأ في API:', error);
      
      // استخدام النظام المحلي في حالة الخطأ
      const aiResponse = getAIResponse(userMessage.content);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages([...newMessages, aiMessage]);
      setLastUsedProvider('local');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  const handleNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'أهلاً وسهلاً بك في محادثة جديدة! 🌟\n\nأنا Oqool AI، جاهز لمساعدتك في أي موضوع تريده. سواء كان:\n\n💻 تعلم البرمجة\n🛠️ حل مشكلة تقنية\n📚 شرح مفهوم معين\n✍️ كتابة أو تحرير نص\n🔍 البحث عن معلومة\n\nما الذي تود أن نتحدث عنه في هذه المحادثة؟',
      timestamp: new Date()
    }]);
    setIsSidebarOpen(false);
    setInputValue('');
  };

  return (
    <div className={`${isDark ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
        <Sidebar 
          conversations={conversations}
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          onLogout={handleLogout}
          userName={userName}
        />

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
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

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Oqool AI
                  </h1>
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>

                <div className="flex items-center gap-3">
                  {lastUsedProvider && (
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {lastUsedProvider === 'claude' ? '🤖 Claude AI' : 
                       lastUsedProvider === 'openai' ? '🧠 OpenAI' : 
                       lastUsedProvider === 'local' ? '💻 محلي' : '⚙️ ' + lastUsedProvider}
                    </div>
                  )}
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as 'claude' | 'openai' | 'auto')}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    <option value="auto">🔄 تلقائي</option>
                    <option value="claude">🤖 Claude AI</option>
                    <option value="openai">🧠 OpenAI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

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

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="relative">
                <div className="flex items-end gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 focus-within:border-purple-500 dark:focus-within:border-purple-500 transition-all duration-200 p-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm px-2 py-1"
                    dir="rtl"
                  />
                  
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  اضغط Enter للإرسال • Shift+Enter لسطر جديد
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
