'use client';

import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import './chat.css';
import { sendToAIIntelligent } from './chat/ai-service';
import { Message as AIMessage, Conversation, Settings, ToastData, SearchResult } from '@/lib/types';
import { search, SearchSource } from '@/lib/search';
import { needsSearch, getSearchMode } from './chat/search';
import VoiceSearch from './chat/voice-search';
import TextToSpeech from './chat/text-to-speech';
import { AI_PROVIDERS, STORAGE_KEYS, saveToStorage, loadFromStorage, copyToClipboard, exportConversation } from './chat/config';
import { CodeEditor } from './chat/ui-components';
import SearchResultPreview, { SearchResultSkeleton } from '@/components/search-result-preview';
import SearchResults from './chat/search/SearchResults';
import { SearchCardProps } from './chat/search/SearchCard';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  time: string;
  searchResults?: SearchCardProps[];
  searchQuery?: string;
  searchMeta?: {
    totalResults: number;
    searchTime: number;
    sources: string[];
    cached: boolean;
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatMode, setIsChatMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeIcon, setActiveIcon] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string>('auto');
  const [isVoiceSearchVisible, setIsVoiceSearchVisible] = useState(false);
  const [voiceSearchSupported, setVoiceSearchSupported] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [visibleResultsCount, setVisibleResultsCount] = useState<Record<string, number>>({});
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});
  const [greeting, setGreeting] = useState('');
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // الوضع الليلي هو الافتراضي
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentsInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // تحديد التحية حسب الوقت
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let greetingText = '';

      if (hour >= 5 && hour < 12) {
        greetingText = 'صبحكم الله بالخير';
      } else if (hour >= 12 && hour < 17) {
        greetingText = 'مساء الخير';
      } else if (hour >= 17 && hour < 21) {
        greetingText = 'مساء الخير';
      } else {
        greetingText = 'مساء الخير';
      }

      setGreeting(greetingText);
    };

    updateGreeting();
    // تحديث التحية كل دقيقة
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // تهيئة دعم البحث الصوتي
  useEffect(() => {
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

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    setToast({ message, type });
    if (type !== 'loading') {
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  const handleAttachmentsChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    showToast(`تم اختيار ${files.length} ملف`, 'success');
    // يمكن إضافة معالجة الملفات المختارة هنا
  }, [showToast]);

  const handleImagesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    showToast(`تم اختيار ${files.length} صورة`, 'success');
    window.open('/image-processing', '_blank');
  }, [showToast]);

  const handleCameraChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    showToast('تم التقاط الصورة بنجاح', 'success');
    window.open('/restore-photo', '_blank');
  }, [showToast]);

  const getCurrentTime = useCallback(() => {
    return new Date().toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const sendMessage = async (customMessage?: string) => {
    const message = (customMessage || inputValue).trim();
    if (!message) return;

    setSearchResults([]);
    setSearchQuery('');

    if (!isChatMode) {
      setIsChatMode(true);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      time: getCurrentTime()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // تحويل الرسائل للنوع المطلوب
      const aiMessages: Array<{ role: string; content: string }> = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // إرسال للذكاء الاصطناعي الحقيقي
      const result = await sendToAIIntelligent(aiMessages, message, isSearchEnabled);

      // إذا احتوت النتيجة على بيانات بحث، حضّرها
      const resultData = result as any;
      let hasSearchResults = false;

      // إنشاء رسالة AI الأساسية
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.success ? result.message : `خطأ: ${result.error || 'فشل في الاتصال'}`,
        time: getCurrentTime()
      };

      console.log('🔍 Frontend: msg.content =', aiMessage.content.substring(0, 200));

      // دعم صيغتين: searchData (من ai-service) و sources (من /api/chat)
      if (result.success && (resultData.searchData || resultData.sources)) {
        let searchResults = [];
        let searchQuery = message;
        let searchMeta: any = {};

        // الصيغة 1: searchData من ai-service.ts
        if (resultData.searchData?.results) {
          searchResults = resultData.searchData.results;
          searchQuery = resultData.searchData.query || message;
          searchMeta = {
            totalResults: resultData.searchData.totalResults,
            searchTime: resultData.searchData.searchTime || 0,
            sources: resultData.searchData.sources || ['web'],
            cached: resultData.searchData.cached || false
          };
        }
        // الصيغة 2: sources من /api/chat/route.ts
        else if (resultData.sources && Array.isArray(resultData.sources)) {
          searchResults = resultData.sources;
          searchQuery = resultData.searchMetadata?.query || message;
          searchMeta = {
            totalResults: resultData.searchMetadata?.totalResults || resultData.sources.length,
            searchTime: resultData.searchMetadata?.searchTime || 0,
            sources: resultData.searchMetadata?.sources || ['web'],
            cached: false
          };
        }

        // تحويل النتائج للصيغة المطلوبة
        if (searchResults.length > 0) {
          aiMessage.searchResults = searchResults.map((r: any) => ({
            title: r.title,
            url: r.url,
            snippet: r.snippet,
            source: r.source || r.displayLink,
            thumbnail: r.thumbnail,
            displayLink: r.displayLink,
            author: r.author,
            publishDate: r.publishDate,
            relevanceScore: r.relevanceScore,
            video: r.video
          }));

          aiMessage.searchQuery = searchQuery;
          aiMessage.searchMeta = searchMeta;

          // الاحتفاظ بالمحتوى الأصلي من Backend (يحتوي على المقدمة)
          // aiMessage.content يحتوي بالفعل على الرسالة من result.message
        }
      }

      setIsTyping(false);
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.',
        time: getCurrentTime()
      };

      setIsTyping(false);
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await sendMessage();
    }
  };

  const handleQuickButton = (text: string) => {
    const prompts: { [key: string]: string } = {
      'فكّر معي': 'ساعدني في التفكير في ',
      'علّمني': 'علّمني عن ',
      'تلخيص سريع': 'لخص لي ',
      'قارن بين': 'قارن لي بين ',
      'اقترح حلول': 'اقترح حلول لـ ',
      'راجع وصحح': 'راجع وصحح ',
      'تذكيرات ذكية': 'أنشئ تذكير لـ ',
      'اشرح بالفيديو': 'اشرح لي بالفيديو عن ',
      'اسأل الخبراء': 'أريد استشارة خبير في '
    };
    setInputValue(prompts[text] || 'مرحباً');
  };

  // دوال الأزرار
  const handleIconClick = (iconIndex: number, title: string) => {
    setActiveIcon(iconIndex);
    
    switch(title) {
      case 'كتابة':
        showToast('وضع الكتابة مُفعّل');
        break;
        
      case 'مرفقات':
        handleFileUpload();
        break;
        
      case 'صور':
        handleImageUpload();
        break;
        
      case 'كاميرا':
        handleCameraCapture();
        break;
        
      case 'ويب':
        handleWebSearch();
        break;
        
      case 'بحث':
        handleSearch();
        break;
        
      case 'موقع':
        handleLocation();
        break;
        
      default:
        showToast(`تم تفعيل ${title}`, 'info');
    }
  };

  // رفع الملفات
  const handleFileUpload = useCallback(() => {
    attachmentsInputRef.current?.click();
  }, []);

  // رفع الصور
  const handleImageUpload = useCallback(() => {
    imagesInputRef.current?.click();
  }, []);

  // فتح الكاميرا
  const handleCameraCapture = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  // البحث في الويب
  const handleWebSearch = useCallback(async () => {
    if (!inputValue.trim()) {
      showToast('أدخل نص للبحث في الويب', 'error');
      return;
    }
    
    const query = inputValue.trim();
    showToast('جاري البحث في الويب...', 'loading');
    setSearchQuery(query);
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const results = await search(query, { sources: [SearchSource.GOOGLE], maxResults: 10 }) as any;
      if (results && results.results && results.results.length > 0) {
        showToast(`تم العثور على ${results.results.length} نتيجة`, 'success');
        setSearchResults(results.results);
        // إضافة النتائج للشات
        const searchMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `🌐 نتائج البحث عن "${query}":\n\n${results.results.slice(0, 3).map((r: any) => `• ${r.title}\n${r.snippet}\n${r.url}`).join('\n\n')}`,
          time: getCurrentTime()
        };
        setMessages(prev => [...prev, searchMessage]);
      } else {
        showToast('لم يتم العثور على نتائج', 'info');
      }
    } catch (error) {
      showToast('فشل البحث في الويب', 'error');
      setSearchResults([]);
    }
    finally {
      setIsSearching(false);
    }
  }, [getCurrentTime, inputValue, showToast]);

  // البحث العام
  const handleSearch = () => {
    if (inputValue.trim()) {
      sendMessage();
    } else {
      showToast('أدخل نص للبحث', 'error');
    }
  };

  // 🔥 البحث المتقدم العميق
  const handleDeepSearch = async (query: string) => {
    if (!query.trim()) {
      showToast('لا يوجد نص للبحث المتقدم', 'error');
      return;
    }

    showToast('🔍 بحث متقدم جاري...', 'loading');
    setIsSearching(true);

    try {
      // استخدام الوضع العميق من النظام الذكي
      const deepMode = getSearchMode('deep');
      console.log('🔥 Deep Search Mode:', deepMode);

      // بحث عميق مع طلب نتائج أكثر (50) حتى نحصل على تنوع كافي من كل مصدر
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `ابحث عن ${query}` }],
          provider: 'openai',
          maxResults: 50, // طلب نتائج كثيرة، API سيصنفها: 3 يوتيوب + 2 جوجل + 2 ويكي + 2 ستاك
          searchMode: 'deep'
        })
      });

      if (!response.ok) throw new Error('فشل البحث');

      const data = await response.json();

      if (data.success && data.sources) {
        showToast(`✅ تم العثور على ${data.sources.length} نتيجة متقدمة`, 'success');

        // إضافة رسالة نتائج البحث المتقدم
        const deepSearchMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `🔥 نتائج البحث المتقدم المتنوعة عن: "${query}"
✨ ${data.sources.length} نتيجة من مصادر متعددة: YouTube, Google, Wikipedia & StackOverflow`,
          time: getCurrentTime(),
          searchResults: data.sources,
          searchQuery: query,
          searchMeta: {
            totalResults: data.sources.length,
            searchTime: 0,
            sources: ['youtube', 'google', 'wikipedia', 'stackoverflow'],
            cached: false
          }
        };

        setMessages(prev => [...prev, deepSearchMessage]);

        // تعيين العدد الافتراضي المعروض لهذه الرسالة (8 نتائج)
        setVisibleResultsCount(prev => ({
          ...prev,
          [deepSearchMessage.id]: 8
        }));
      } else {
        showToast('لم يتم العثور على نتائج متقدمة', 'info');
      }
    } catch (error) {
      console.error('Deep search error:', error);
      showToast('فشل البحث المتقدم', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // زيادة عدد النتائج المعروضة
  const handleShowMoreResults = (messageId: string) => {
    setVisibleResultsCount(prev => ({
      ...prev,
      [messageId]: (prev[messageId] || 8) + 8
    }));
  };

  // التبديل بين عرض الرد كامل أو مختصر
  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // الموقع الجغرافي
  const handleLocation = () => {
    if (navigator.geolocation) {
      showToast('جاري تحديد الموقع...', 'loading');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          showToast(`📍 تم تحديد موقعك: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 'success');
          
          // إضافة معلومات الموقع للشات
          setInputValue(`موقعي الحالي: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          showToast('فشل في تحديد الموقع', 'error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      showToast('المتصفح لا يدعم تحديد الموقع', 'error');
    }
  };

  // دوال التنقل
  const navigateToHome = () => {
    window.location.href = '/';
    showToast('العودة للصفحة الرئيسية', 'info');
  };

  const navigateToTeacher = () => {
    window.location.href = '/teacher';
    showToast('انتقال لصفحة المعلم العراقي', 'info');
  };

  const navigateToPricing = () => {
    window.location.href = '/pricing';
    showToast('انتقال لصفحة الأسعار', 'info');
  };

  const navigateToImageProcessing = () => {
    window.location.href = '/image-processing';
    showToast('انتقال لمعالجة الصور', 'info');
  };

  const navigateToRestorePhoto = () => {
    window.location.href = '/restore-photo';
    showToast('انتقال لاستعادة الصور', 'info');
  };

  const openCodeEditor = () => {
    window.location.href = '/code-editor';
    showToast('انتقال لمحرر الكود', 'info');
  };

  const navigateToDashboard = () => {
    window.location.href = '/dashboard';
    showToast('انتقال للوحة التحكم', 'info');
  };

  return (
    <>
      <input
        ref={attachmentsInputRef}
        type="file"
        multiple
        accept="*/*"
        style={{ display: 'none' }}
        onChange={handleAttachmentsChange}
      />
      <input
        ref={imagesInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImagesChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCameraChange}
      />
      {/* Sidebar */}
      <div className="sidebar">
        <div 
          className="sidebar-icon" 
          style={{ marginBottom: '15px' }} 
          title="الصفحة الرئيسية"
          onClick={navigateToHome}
        >
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="12" fill="#3b82f6"/>
            <line x1="60" y1="60" x2="60" y2="20" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="85" y2="32" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="95" y2="50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="95" y2="70" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="85" y2="88" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="60" y2="100" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="35" y2="88" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="25" y2="70" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="25" y2="50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="35" y2="32" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            {[
              [60, 20], [85, 32], [95, 50], [95, 70], [85, 88],
              [60, 100], [35, 88], [25, 70], [25, 50], [35, 32]
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4" fill="#3b82f6"/>
            ))}
          </svg>
        </div>

        <div className="sidebar-divider"></div>

        {[
          { title: 'المعلم العراقي', path: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222', action: navigateToTeacher },
          { title: 'الأسعار', path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', action: navigateToPricing },
          { title: 'معالج الصور', path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', action: navigateToImageProcessing },
          { title: 'استعادة الصور', path: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', action: navigateToRestorePhoto },
          { title: 'محرر الكود', path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', action: openCodeEditor },
          { title: 'لوحة التحكم', path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', action: navigateToDashboard }
        ].map((icon, i) => (
          <div 
            key={i} 
            className={`sidebar-icon ${i === 0 ? 'active' : ''}`} 
            title={icon.title}
            onClick={icon.action}
            style={{ cursor: 'pointer' }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon.path}/>
            </svg>
          </div>
        ))}

        <div className="sidebar-divider"></div>

        {/* زر تعطيل/تفعيل البحث */}
        <div
          className="sidebar-icon"
          onClick={() => {
            setIsSearchEnabled(!isSearchEnabled);
            showToast(
              isSearchEnabled ? '🚫 تم تعطيل البحث - الذكاء الاصطناعي فقط' : '🔍 تم تفعيل البحث على الويب',
              isSearchEnabled ? 'info' : 'success'
            );
          }}
          title={isSearchEnabled ? "تعطيل البحث (ذكاء اصطناعي فقط)" : "تفعيل البحث على الويب"}
          style={{
            cursor: 'pointer',
            backgroundColor: isSearchEnabled ? '#10b981' : '#ef4444',
            transition: 'all 0.3s ease'
          }}
        >
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
            {isSearchEnabled ? (
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2" fill="none"/>
            ) : (
              <>
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2" fill="none"/>
                <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2"/>
              </>
            )}
          </svg>
        </div>

        {/* زر الوضع النهاري/الليلي */}
        <div
          className="sidebar-icon"
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            showToast(
              !isDarkMode ? '🌙 تم التبديل للوضع الليلي' : '☀️ تم التبديل للوضع النهاري',
              'success'
            );
          }}
          title={isDarkMode ? "التبديل للوضع النهاري ☀️" : "التبديل للوضع الليلي 🌙"}
          style={{
            cursor: 'pointer',
            backgroundColor: isDarkMode ? '#1e293b' : '#f59e0b',
            transition: 'all 0.3s ease'
          }}
        >
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
            {isDarkMode ? (
              // أيقونة الشمس (في الوضع الليلي - اضغط للتبديل للنهاري)
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            ) : (
              // أيقونة القمر (في الوضع النهاري - اضغط للتبديل لليلي)
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            )}
          </svg>
        </div>
      </div>

      {/* Top Icons */}
      <div className="top-icons">
        <div className="top-icon user-avatar">
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isChatMode ? 'chat-mode' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className={`logo-container ${isChatMode ? 'hidden' : ''}`}>
          <div className="logo-text" style={{ direction: 'ltr' }}>
            {'OqoolAI'.split('').map((char, index) => (
              <span
                key={index}
                className="logo-letter"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: 'inline-block'
                }}
              >
                {char}
              </span>
            ))}
          </div>
          <div className="greeting-text">
            {greeting}
          </div>
        </div>

        {/* عنوان الصفحة في وضع الدردشة */}
        {isChatMode && (
          <div style={{
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto 20px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px'
            }}>
              ابحث عن أي شيء
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#888',
              fontWeight: '400'
            }}>
              اسأل، ابحث، واستكشف مع الذكاء الاصطناعي المتقدم
            </p>
          </div>
        )}

        {/* Chat Messages */}
        <div className={`chat-messages ${isChatMode ? 'active' : ''}`}>
          {(isSearching || searchResults.length > 0) && (
            <div className="search-results-preview" style={{ marginBottom: '16px' }}>
              {isSearching ? (
                <SearchResultSkeleton />
              ) : (
                <SearchResultPreview
                  results={searchResults}
                  query={searchQuery}
                  onResultClick={(result) => window.open(result.url, '_blank')}
                />
              )}
            </div>
          )}

          {messages.map((msg, msgIndex) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div className="message-avatar">
                {msg.type === 'user' ? 'أنت' : (
                  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px' }}>
                    <circle cx="60" cy="60" r="14" fill="#fbbf24"/>
                    <line x1="60" y1="60" x2="60" y2="20" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="60" y1="60" x2="85" y2="32" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="60" y1="60" x2="95" y2="50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="60" y1="60" x2="95" y2="70" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="60" y1="60" x2="85" y2="88" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="60" y1="60" x2="60" y2="100" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="60" y1="60" x2="35" y2="88" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="60" y1="60" x2="25" y2="70" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="60" y1="60" x2="25" y2="50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="60" y1="60" x2="35" y2="32" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    {[
                      [60, 20], [85, 32], [95, 50], [95, 70], [85, 88],
                      [60, 100], [35, 88], [25, 70], [25, 50], [35, 32]
                    ].map(([cx, cy], i) => (
                      <circle key={i} cx={cx} cy={cy} r="6" fill="#fbbf24"/>
                    ))}
                  </svg>
                )}
              </div>
              <div style={{ width: '100%' }}>
                {/* عرض نتائج البحث أولاً */}
                {msg.searchResults && msg.searchResults.length > 0 && (() => {
                  // تحديد عدد النتائج المعروضة
                  const isDeepSearch = msg.searchResults.length > 2;
                  const defaultVisible = isDeepSearch ? 8 : 2;
                  const visibleCount = visibleResultsCount[msg.id] || defaultVisible;
                  const visibleResults = msg.searchResults.slice(0, visibleCount);
                  const hasMore = visibleCount < msg.searchResults.length;

                  return (
                    <div style={{ marginTop: '8px' }}>
                      <SearchResults
                        query={msg.searchQuery || ''}
                        results={visibleResults}
                        totalResults={msg.searchMeta?.totalResults}
                        searchTime={msg.searchMeta?.searchTime}
                        sources={msg.searchMeta?.sources}
                        cached={msg.searchMeta?.cached}
                      />

                      {/* أزرار التحكم */}
                      <div className="flex justify-center gap-3 pt-1">
                        {/* زر عرض المزيد */}
                        {hasMore && (
                          <button
                            onClick={() => handleShowMoreResults(msg.id)}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <svg
                              className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            <span>عرض المزيد ({msg.searchResults.length - visibleCount} متبقية)</span>
                          </button>
                        )}

                        {/* زر البحث المتقدم (يظهر فقط للبحث العادي) */}
                        {!isDeepSearch && (
                          <button
                            onClick={() => handleDeepSearch(msg.searchQuery || msg.content)}
                            disabled={isSearching}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <svg
                              className="w-4 h-4 group-hover:rotate-12 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>بحث متقدم</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* عرض النص من AI بشكل بسيط */}
                {msg.content && msg.content.trim() !== '' && (() => {
                  const isExpanded = expandedMessages[msg.id];
                  const shouldTruncate = msg.content.length > 1500;
                  const displayContent = shouldTruncate && !isExpanded
                    ? msg.content.substring(0, 1500) + '...'
                    : msg.content;

                  return (
                    <div>
                      <div style={{
                        marginTop: msg.searchResults ? '8px' : '0',
                        color: isDarkMode ? '#e2e8f0' : '#000000',
                        fontSize: '15px',
                        lineHeight: '2.2',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {displayContent}
                      </div>

                      {shouldTruncate && (
                        <button
                          onClick={() => toggleMessageExpansion(msg.id)}
                          style={{
                            marginTop: '12px',
                            color: '#60a5fa',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            textDecoration: 'underline'
                          }}
                        >
                          {isExpanded ? 'أقل ↑' : 'المزيد... ↓'}
                        </button>
                      )}
                    </div>
                  );
                })()}

                <div className="message-time">{msg.time}</div>

                {/* أزرار تفاعلية ومحتوى إضافي - فقط لآخر رد AI */}
                {msg.type === 'ai' && msg.content && msgIndex === messages.length - 1 && (
                  <div style={{ marginTop: '16px' }}>
                    {/* أزرار التفاعل */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginBottom: '12px'
                    }}>
                      {/* نسخ */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          // يمكن إضافة toast notification هنا
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#888',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#fbbf24';
                          e.currentTarget.style.color = '#fbbf24';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#334155';
                          e.currentTarget.style.color = '#888';
                        }}
                        title="نسخ النص"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        نسخ
                      </button>

                      {/* مفيد */}
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#888',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.color = '#10b981';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#334155';
                          e.currentTarget.style.color = '#888';
                        }}
                        title="مفيد"
                      >
                        👍 مفيد
                      </button>

                      {/* حفظ */}
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#888',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#f59e0b';
                          e.currentTarget.style.color = '#f59e0b';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#334155';
                          e.currentTarget.style.color = '#888';
                        }}
                        title="حفظ"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        حفظ
                      </button>

                      {/* مشاركة */}
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#888',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#fbbf24';
                          e.currentTarget.style.color = '#fbbf24';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#334155';
                          e.currentTarget.style.color = '#888';
                        }}
                        title="مشاركة"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        مشاركة
                      </button>
                    </div>

                    {/* مواضيع ذات صلة */}
                    <div style={{
                      background: 'rgba(94, 180, 235, 0.05)',
                      border: '1px solid rgba(94, 180, 235, 0.15)',
                      borderRadius: '12px',
                      padding: '12px',
                      marginTop: '12px'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#3b82f6',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        مواضيع ذات صلة
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        {['اشرح أكثر عن هذا الموضوع', 'ما هي التطبيقات العملية؟', 'هل هناك أمثلة إضافية؟'].map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setInputValue('');
                              sendMessage(question);
                            }}
                            style={{
                              textAlign: 'right',
                              padding: '8px 12px',
                              background: '#1e293b',
                              border: '1px solid #334155',
                              borderRadius: '8px',
                              color: '#b0b0b0',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#fbbf24';
                              e.currentTarget.style.color = '#fbbf24';
                              e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#334155';
                              e.currentTarget.style.color = '#b0b0b0';
                              e.currentTarget.style.background = '#1e293b';
                            }}
                          >
                            💡 {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <div className="message-avatar">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px' }}>
                  <circle cx="60" cy="60" r="14" fill="#fbbf24"/>
                  <line x1="60" y1="60" x2="60" y2="20" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="85" y2="32" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="95" y2="50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="95" y2="70" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="85" y2="88" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="60" y2="100" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="35" y2="88" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="25" y2="70" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="25" y2="50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="35" y2="32" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  {[
                    [60, 20], [85, 32], [95, 50], [95, 70], [85, 88],
                    [60, 100], [35, 88], [25, 70], [25, 50], [35, 32]
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="6" fill="#fbbf24"/>
                  ))}
                </svg>
              </div>
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Search Container */}
        <div className={`search-container ${isChatMode ? 'chat-mode' : ''}`}>
          <div className="search-box">
            
            {/* زر الإرسال */}
            <div 
              className="search-icon send-button"
              title="إرسال"
              onClick={() => sendMessage()}
              style={{ 
                backgroundColor: inputValue.trim() ? '#3b82f6' : '#666',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </div>

            <input 
              type="text" 
              className="search-input" 
              placeholder="اسأل أي شيء..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />

            <div className="search-icons-inside">
              <div className="actions-menu-container">
                <div 
                  className="search-icon"
                  title="خيارات إضافية"
                  onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </div>
                {isActionsMenuOpen && (
                  <div className="actions-menu">
                    {[
                      { title: 'مرفقات', path: 'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13' },
                      { title: 'صور', path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                      { title: 'كاميرا', path: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
                      { title: 'ويب', path: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
                      { title: 'بحث', path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                      { title: 'موقع', path: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }
                    ].map((icon, i) => (
                      <div 
                        key={i} 
                        className="search-icon"
                        title={icon.title}
                        onClick={() => {
                          handleIconClick(i + 1, icon.title);
                          setIsActionsMenuOpen(false);
                        }}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon.path}/>
                        </svg>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* زر البحث الصوتي */}
              {voiceSearchSupported && (
                <div 
                  className="search-icon voice-button"
                  title={isVoiceSearchVisible ? 'إيقاف البحث الصوتي' : 'بدء البحث الصوتي'}
                  onClick={() => setIsVoiceSearchVisible(!isVoiceSearchVisible)}
                  style={{ 
                    backgroundColor: isVoiceSearchVisible ? '#ef4444' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                  </svg>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Quick Actions */}
        <div className={`quick-actions ${isChatMode ? 'hidden' : ''}`}>
          {[
            { text: 'فكّر معي', path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
            { text: 'علّمني', path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { text: 'تلخيص سريع', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { text: 'قارن بين', path: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
            { text: 'اقترح حلول', path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
            { text: 'راجع وصحح', path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
            { text: 'تذكيرات ذكية', path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { text: 'اشرح بالفيديو', path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            { text: 'اسأل الخبراء', path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
          ].map((btn, i) => (
            <button 
              key={i} 
              className="quick-btn"
              onClick={() => handleQuickButton(btn.text)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={btn.path}/>
              </svg>
              {btn.text}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl animate-fadeIn flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' :
          toast.type === 'error' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' :
          toast.type === 'info' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' :
          'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        }`}>
          <span className="font-semibold">{toast.message}</span>
          {toast.type !== 'loading' && (
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Voice Search Component */}
      {isVoiceSearchVisible && voiceSearchSupported && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-2 border-gray-200">
            <VoiceSearch
              onSearchQuery={(query) => {
                setIsVoiceSearchVisible(false);
                setInputValue(query);
                showToast(`🎤 تم التعرف على: "${query}"`);
              }}
              onError={(error) => {
                console.error('Voice search error:', error);
                showToast(error, 'error');
                setIsVoiceSearchVisible(false);
              }}
              language="ar-SA"
              disabled={isTyping}
            />
          </div>
        </div>
      )}



      {/* Bottom Info */}
      <div className="bottom-info">
        <a 
          onClick={() => showToast('مركز المساعدة قيد التطوير', 'info')} 
          style={{ cursor: 'pointer' }}
        >؟</a>
        <a 
          onClick={() => showToast('الإعدادات قيد التطوير', 'info')} 
          style={{ cursor: 'pointer' }}
        >⚙</a>
        <a 
          onClick={() => {
            showToast('🚀 النظام متصل وجاهز للعمل!', 'success');
            console.log('📊 حالة النظام:');
            console.log('✅ الخادم: متصل');
            console.log('✅ الذكاء الاصطناعي: متصل');
            console.log('✅ البحث الصوتي: متوفر');
            console.log('✅ البحث في الويب: متوفر');
            console.log('✅ معالجة الصور: متوفرة');
            console.log('✅ الشخصيات: متوفرة');
          }} 
          style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold' }}
        >🔗</a>
      </div>
    </>
  );
}