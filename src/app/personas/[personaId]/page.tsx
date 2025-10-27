// @ts-nocheck
"use client";

/**
 * صفحة الشخصية الديناميكية
 * Dynamic Persona Page
 *
 * تعرض أي شخصية حسب personaId من الرابط
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TeacherChat from '@/features/personas/implementations/iraqi-teacher/TeacherChat';
import GradeSelector from '@/features/personas/implementations/iraqi-teacher/GradeSelector';
import SubjectSelector from '@/features/personas/implementations/iraqi-teacher/SubjectSelector';
import ImageUploader from '@/features/personas/implementations/iraqi-teacher/ImageUploader';
import { audioCache } from '@/lib/audio-cache';
import { freeTTS } from '@/lib/free-tts';

// ====================================
// Types & Interfaces
// ====================================

interface VideoSource {
  title: string;
  url: string;
  thumbnail?: string;
  author?: string;
  source?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'teacher' | 'student';
  timestamp: Date;
  type?: 'text' | 'encouragement' | 'explanation' | 'videos';
  videos?: VideoSource[];
}

interface Grade {
  id: string;
  name: string;
  description: string;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  grades: string[];
}

// ====================================
// System Prompt للمعلم العراقي
// ====================================

const TEACHER_SYSTEM_PROMPT = (grade?: string, subject?: string) => `أنت عمو أحمد، معلم عراقي من بغداد، متخصص في تعليم الصفوف الابتدائية (1-6).

🎯 شخصيتك:
- تتكلم باللهجة البغدادية الأصيلة 100%
- صبور هواية مع الأطفال
- حنون وودود مثل العم الكبير
- تشجع الطلاب دائماً

🗣️ طريقة الكلام (مهم جداً):
- استخدم "حبيبي"، "يبه"، "شاطر" في كل جملة
- استخدم "هواية" بدلاً من "كثير" أو "جداً"
- استخدم "شلون" بدلاً من "كيف"
- استخدم "شنو" بدلاً من "ماذا" أو "ما"
- استخدم "وين" بدلاً من "أين"
- استخدم "راح" بدلاً من "سوف" أو "سـ"
- استخدم "عدنه" بدلاً من "لدينا" أو "عندنا"
- استخدم "مو" بدلاً من "ليس" أو "لا"
- استخدم "آني" بدلاً من "أنا"
- قل "خلينه" بدلاً من "دعنا"
- قل "شوف" بدلاً من "انظر"
- قل "يلا" بدلاً من "هيا"

📚 أسلوب التدريس:
- ابدأ دائماً بـ "تعال حبيبي" أو "هلا يبه"
- اشرح بطريقة بسيطة هواية
- استخدم أمثلة من الحياة اليومية العراقية (دنانير، سيارات، دفاتر، تفاح)
- قسم المسألة لخطوات صغيرة
- اسأل "فهمت عليه؟" بعد كل شرح

📹 عندك ميزة الفيديوهات:
- لما الطالب يطلب فيديو (راويني فيدو، شوفني فيديو)
- راح يظهرله فيديوهات تعليمية تلقائياً
- قله: "تمام حبيبي! راح أجيبلك فيديوهات تعليمية عن [الموضوع]"
- لا تقل "مو أقدر" - لأنك تقدر!

✅ أمثلة صحيحة:
- "هلا حبيبي! تعال أشرحلك هاي المسألة بطريقة سهلة هواية"
- "شوف يبه، عدنه 5 تفاحات، ناخذ منهم 2، يباجي كم؟"
- "شاطر عليك! فهمتها كلش زين! 🌟"
- "مو مشكلة حبيبي، يلا نحاول مرة ثانية"

❌ لا تستخدم:
- لا تستخدم الفصحى أبداً
- لا تقل "جداً" - قل "هواية"
- لا تقل "سوف" - قل "راح"
- لا تقل "كيف" - قل "شلون"

الصف: ${grade || 'غير محدد'}
المادة: ${subject || 'غير محددة'}

تذكر: أنت عمو أحمد، معلم عراقي أصيل من بغداد. كل كلمة تقولها لازم تكون بلهجة بغداد!`;

// ====================================
// Main Component
// ====================================

export default function PersonaPage() {
  // ====================================
  // Params & Router
  // ====================================

  const params = useParams();
  const router = useRouter();
  const personaId = params.personaId as string;

  // التحقق من personaId - حالياً ندعم فقط iraqi-teacher
  useEffect(() => {
    if (personaId !== 'iraqi-teacher') {
      // TODO: في المستقبل ندعم شخصيات أخرى
      router.push('/');
    }
  }, [personaId, router]);

  // ====================================
  // State Management
  // ====================================

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'أهلاً حبيبي! أنا عمو أحمد، معلمك العراقي. شلونك اليوم؟ جاهز نتعلم سوا؟',
      sender: 'teacher',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | undefined>(undefined);
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(undefined);
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null);

  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Progress tracking for voice processing
  type VoiceProcessingStage = 'idle' | 'transcribing' | 'thinking' | 'generating_speech' | 'playing';
  const [processingStage, setProcessingStage] = useState<VoiceProcessingStage>('idle');

  // TTS Control States
  const [ttsMode, setTtsMode] = useState<'free' | 'paid'>('free'); // اختيار نوع الصوت
  const [selectedVoice, setSelectedVoice] = useState<string>(''); // اختيار الصوت العربي
  const [speechRate, setSpeechRate] = useState<number>(0.9); // سرعة الكلام
  const [isClient, setIsClient] = useState(false); // للتحقق من كوننا على الكلاينت

  // ====================================
  // Effects
  // ====================================

  // تحديد أننا على الكلاينت (لتجنب hydration error)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // اختيار أول صوت عربي تلقائياً (مع fallback)
  useEffect(() => {
    if (isClient && freeTTS && !selectedVoice) {
      const allVoices = freeTTS.getAvailableVoices();

      // محاولة 1: البحث عن صوت عربي
      const arabicVoices = allVoices.filter(v => v.lang.includes('ar'));

      if (arabicVoices.length > 0) {
        setSelectedVoice(arabicVoices[0].name);
        console.log('✅ تم اختيار صوت عربي:', arabicVoices[0].name);
      } else {
        // محاولة 2: البحث عن أصوات قد تدعم العربية
        const potentialVoices = allVoices.filter(v =>
          v.lang.includes('en') || // الإنجليزية قد تقرأ العربية
          v.lang.includes('de') || // الألمانية
          v.lang.includes('fr')    // الفرنسية
        );

        if (potentialVoices.length > 0) {
          setSelectedVoice(potentialVoices[0].name);
          console.log('⚠️ لا يوجد صوت عربي، استخدام:', potentialVoices[0].name);
        } else if (allVoices.length > 0) {
          // محاولة 3: أي صوت متاح
          setSelectedVoice(allVoices[0].name);
          console.log('⚠️ استخدام أول صوت متاح:', allVoices[0].name);
        }
      }
    }
  }, [isClient, selectedVoice]);

  // ====================================
  // Helper Functions
  // ====================================

  /**
   * تشغيل صوت تنبيه (beep)
   */
  const playBeep = (frequency: number = 800, duration: number = 200) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('لا يمكن تشغيل صوت التنبيه');
    }
  };

  /**
   * إضافة رسالة جديدة للدردشة
   */
  const addMessage = (text: string, sender: 'teacher' | 'student', type: Message['type'] = 'text', videos?: VideoSource[]) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      text,
      sender,
      timestamp: new Date(),
      type,
      videos
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  /**
   * إنشاء رسائل منسقة للـ API
   */
  const formatMessagesForAPI = (additionalMessage?: any) => {
    const systemMessage = {
      role: 'system',
      content: TEACHER_SYSTEM_PROMPT(selectedGrade?.name, selectedSubject?.name)
    };

    const conversationMessages = messages.map(msg => ({
      role: msg.sender === 'student' ? 'user' : 'assistant',
      content: msg.text
    }));

    const allMessages = [systemMessage, ...conversationMessages];

    if (additionalMessage) {
      allMessages.push(additionalMessage);
    }

    return allMessages;
  };

  /**
   * إرسال طلب للـ API
   */
  const sendToAPI = async (messages: any[], skipSearch: boolean = true) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        provider: 'claude-sonnet-4',
        skipSearch,
        forceAIResponse: skipSearch
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'فشل في الحصول على الرد');
    }

    return data;
  };

  // ====================================
  // Event Handlers
  // ====================================

  /**
   * معالجة إرسال رسالة نصية
   */
  const handleSendMessage = async (messageText: string) => {
    // إضافة رسالة الطالب
    addMessage(messageText, 'student', 'text');
    setIsTyping(true);

    // كشف إذا الطالب يطلب فيديوهات
    const lowerMessage = messageText.toLowerCase();
    const videoWords = ['فيديو', 'فيديوهات', 'فيدو', 'فيدوهات', 'فدو', 'فدوات', 'video'];
    const strongRequestWords = ['راويني', 'شوفني', 'ورني']; // كلمات قوية تطلب الفيديو مباشرة
    const allKeywords = [...videoWords, ...strongRequestWords];

    const requestsVideo = allKeywords.some(keyword => lowerMessage.includes(keyword));

    console.log('🔍 كشف طلب الفيديو:', {
      messageText,
      lowerMessage,
      requestsVideo,
      foundKeyword: allKeywords.find(kw => lowerMessage.includes(kw))
    });

    try {
      // إرسال الرسالة للـ AI
      const formattedMessages = formatMessagesForAPI({
        role: 'user',
        content: messageText
      });

      const data = await sendToAPI(formattedMessages, true);

      // إضافة رد المعلم
      addMessage(
        data.message || 'عذراً حبيبي، صار عندي مشكلة. جرب مرة ثانية',
        'teacher',
        'explanation'
      );

      // إذا الطالب طلب فيديوهات، ابحث في YouTube
      if (requestsVideo) {
        console.log('📹 البحث عن فيديوهات...');
        // إضافة رسالة مؤقتة للمستخدم
        addMessage('🔍 جاري البحث عن الفيديوهات...', 'teacher', 'text');

        try {
          await searchAndAddVideos(messageText, allKeywords);
        } catch (videoError) {
          console.error('❌ خطأ في البحث عن الفيديوهات:', videoError);
          addMessage('آسف حبيبي، صار خطأ في البحث عن الفيديوهات. جرب مرة ثانية', 'teacher', 'text');
        }
      } else {
        console.log('⏭️ لا يوجد طلب فيديو - تجاوز البحث');
      }
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      addMessage(
        'آسف حبيبي، صار خطأ. تأكد من الاتصال بالإنترنت وجرب مرة ثانية',
        'teacher',
        'text'
      );
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * البحث عن فيديوهات وإضافتها للدردشة
   */
  const searchAndAddVideos = async (messageText: string, videoKeywords: string[]) => {
    try {
      // استخراج الموضوع من السؤال بطريقة ذكية
      let searchQuery = '';

      // محاولة 1: البحث عن نمط "عن + الموضوع"
      const aboutPattern = /(?:عن|حول|بخصوص)\s+(.+?)(?:\s*$|\.)/i;
      const aboutMatch = messageText.match(aboutPattern);

      if (aboutMatch && aboutMatch[1]) {
        searchQuery = aboutMatch[1].trim();
        console.log('✅ استخراج الموضوع من "عن":', searchQuery);
      }

      // محاولة 2: البحث عن كلمات مفتاحية مباشرة
      if (!searchQuery || searchQuery.length < 3) {
        const topicKeywords = [
          'جمع', 'طرح', 'ضرب', 'قسمة', 'جدول',
          'حروف', 'قراءة', 'كتابة', 'إملاء',
          'جذور', 'تربيعية', 'الجذور التربيعية',
          'كسور', 'هندسة', 'مساحة', 'محيط'
        ];

        for (const keyword of topicKeywords) {
          if (messageText.toLowerCase().includes(keyword)) {
            searchQuery = keyword;
            console.log('✅ وجدت الكلمة المفتاحية:', keyword);
            break;
          }
        }
      }

      // محاولة 3: حذف كلمات الفيديو والطلب (النهج القديم كاحتياط)
      if (!searchQuery || searchQuery.length < 3) {
        searchQuery = messageText;
        const wordsToRemove = [
          ...videoKeywords,
          'اريد', 'ابي', 'ابغى', 'ودي', 'جيب', 'جيبلي', 'اعطني',
          'عن', 'حول', 'بخصوص', 'وين', 'اين'
        ];

        wordsToRemove.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          searchQuery = searchQuery.replace(regex, '').trim();
        });
      }

      // إذا كان الموضوع فارغ، ابحث في آخر رسائل المحادثة
      if (!searchQuery || searchQuery.length < 3) {
        console.log('⚠️ الموضوع فارغ، أبحث في المحادثة...');

        // ابحث في آخر 5 رسائل عن موضوع
        const recentMessages = messages.slice(-5).reverse();
        for (const msg of recentMessages) {
          if (msg.sender === 'student' && msg.text.length > 5) {
            // استخرج الكلمات المفتاحية
            const keywords = [
              'جمع', 'طرح', 'ضرب', 'قسمة', 'جدول',
              'حروف', 'قراءة', 'كتابة', 'إملاء',
              'جذور', 'التربيعية', 'الجذور التربيعية',
              'كسور', 'هندسة', 'مساحة', 'محيط'
            ];
            const found = keywords.find(kw => msg.text.includes(kw));
            if (found) {
              searchQuery = found;
              console.log('✅ وجدت الموضوع من المحادثة:', searchQuery);
              break;
            }
          }
        }

        // إذا ما لقينا موضوع، استخدم المادة المختارة
        if (!searchQuery || searchQuery.length < 3) {
          searchQuery = selectedSubject?.name || 'رياضيات';
          console.log('📚 استخدمت المادة المختارة:', searchQuery);
        }
      }

      // بناء استعلام بحث محسّن مع المادة والصف
      let enhancedQuery = searchQuery;

      // إضافة المادة إذا كانت مختارة ومو مكررة
      if (selectedSubject?.name && !enhancedQuery.includes(selectedSubject.name)) {
        enhancedQuery += ` ${selectedSubject.name}`;
      }

      // إضافة الصف إذا كان مختاراً
      if (selectedGrade?.name) {
        enhancedQuery += ` ${selectedGrade.name}`;
      }

      enhancedQuery += ' شرح للأطفال';

      console.log('🔍 البحث الأصلي:', searchQuery);
      console.log('🎯 البحث المحسّن:', enhancedQuery);

      const videoData = await sendToAPI([
        { role: 'user', content: enhancedQuery }
      ], false);

      console.log('📊 نتائج البحث:', videoData);

      if (videoData.sources && videoData.sources.length > 0) {
        const videos = videoData.sources.map((source: any) => ({
          title: source.title,
          url: source.url,
          thumbnail: source.thumbnail,
          author: source.author,
          source: source.source || 'YouTube'
        }));

        console.log('✅ تم العثور على فيديوهات:', videos.length);

        addMessage(
          `📹 لقيتلك ${videos.length} فيديو عن "${searchQuery}"`,
          'teacher',
          'videos',
          videos
        );
      } else {
        console.warn('⚠️ لم يتم العثور على فيديوهات');
        addMessage(
          `آسف حبيبي، ما لقيت فيديوهات عن "${searchQuery}". جرب موضوع ثاني أو اسألني سؤال وأنا أشرحلك!`,
          'teacher',
          'text'
        );
      }
    } catch (error) {
      console.error('خطأ في البحث عن الفيديوهات:', error);
    }
  };

  /**
   * معالجة رفع صورة
   */
  const handleImageUpload = async (file: File) => {
    // إنشاء URL للصورة لعرضها
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage({ file, url: imageUrl });

    // إضافة رسالة تلقائية
    addMessage(`📸 تم رفع صورة الواجب: ${file.name}`, 'student', 'text');
    setIsTyping(true);

    try {
      // تحويل الصورة إلى Base64
      const base64Image = await fileToBase64(file);

      // إرسال الصورة للـ AI
      const formattedMessages = formatMessagesForAPI({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'عمو أحمد، شوف هاي الصورة وساعدني بالحل'
          },
          {
            type: 'image_url',
            image_url: { url: base64Image }
          }
        ]
      });

      const data = await sendToAPI(formattedMessages, true);

      addMessage(
        data.message || 'شفت الصورة حبيبي! خليني أساعدك...',
        'teacher',
        'explanation'
      );
    } catch (error) {
      console.error('خطأ في معالجة الصورة:', error);
      addMessage(
        'آسف حبيبي، صار خطأ في قراءة الصورة. جرب مرة ثانية',
        'teacher',
        'text'
      );
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * تحويل ملف إلى Base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  /**
   * حذف الصورة المرفوعة
   */
  const handleRemoveImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.url);
      setUploadedImage(null);
    }
  };

  // ====================================
  // Voice Functions
  // ====================================

  /**
   * بدء التسجيل الصوتي
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        playBeep(600, 150); // صوت تنبيه لإنهاء التسجيل (نغمة منخفضة)
        await processVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(chunks);

      playBeep(1000, 150); // صوت تنبيه لبدء التسجيل (نغمة عالية)
      console.log('🎤 بدأ التسجيل...');
    } catch (error) {
      console.error('❌ خطأ في بدء التسجيل:', error);
      addMessage(
        'آسف حبيبي، ما قدرت أفتح الميكروفون. تأكد من السماحيات',
        'teacher',
        'text'
      );
    }
  };

  /**
   * إيقاف التسجيل
   */
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      console.log('⏹️ توقف التسجيل');
    }
  };

  /**
   * معالجة الرسالة الصوتية
   */
  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsTyping(true);
    setProcessingStage('transcribing');

    try {
      // 1. تحويل الصوت لنص (Speech-to-Text)
      console.log('🎤 إرسال الصوت لـ Whisper...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const sttResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const sttData = await sttResponse.json();

      if (!sttData.success || !sttData.text) {
        throw new Error('فشل في تحويل الصوت إلى نص');
      }

      const transcribedText = sttData.text;
      console.log('✅ النص المستخرج:', transcribedText);

      // إضافة رسالة الطالب
      addMessage(transcribedText, 'student', 'text');

      // كشف إذا الطالب يطلب فيديوهات (نفس منطق handleSendMessage)
      const lowerMessage = transcribedText.toLowerCase();
      const videoWords = ['فيديو', 'فيديوهات', 'فيدو', 'فيدوهات', 'فدو', 'فدوات', 'video'];
      const strongRequestWords = ['راويني', 'شوفني', 'ورني'];
      const allKeywords = [...videoWords, ...strongRequestWords];
      const requestsVideo = allKeywords.some(keyword => lowerMessage.includes(keyword));

      console.log('🔍 [صوتي] كشف طلب الفيديو:', {
        transcribedText,
        lowerMessage,
        requestsVideo,
        foundKeyword: allKeywords.find(kw => lowerMessage.includes(kw))
      });

      // 2. الحصول على رد من AI
      setProcessingStage('thinking');
      console.log('🤖 عمو أحمد يفكر...');

      const formattedMessages = formatMessagesForAPI({
        role: 'user',
        content: transcribedText
      });

      const aiData = await sendToAPI(formattedMessages, true);
      const teacherResponse = aiData.message || 'عذراً حبيبي، صار خطأ';

      // ✨ التحسين: عرض النص فوراً قبل تشغيل الصوت
      addMessage(teacherResponse, 'teacher', 'explanation');
      setIsTyping(false); // نوقف مؤشر الكتابة بعد عرض النص

      // إذا الطالب طلب فيديوهات، ابحث في YouTube
      if (requestsVideo) {
        console.log('📹 [صوتي] البحث عن فيديوهات...');
        addMessage('🔍 جاري البحث عن الفيديوهات...', 'teacher', 'text');

        try {
          await searchAndAddVideos(transcribedText, allKeywords);
        } catch (videoError) {
          console.error('❌ خطأ في البحث عن الفيديوهات:', videoError);
          addMessage('آسف حبيبي، صار خطأ في البحث عن الفيديوهات. جرب مرة ثانية', 'teacher', 'text');
        }
      }

      // 3. تحويل الرد لصوت (Text-to-Speech)
      setProcessingStage('generating_speech');
      console.log('🔊 تحويل الرد لصوت...');
      await playTextAsAudio(teacherResponse);

    } catch (error) {
      console.error('❌ خطأ في معالجة الرسالة الصوتية:', error);
      addMessage(
        'آسف حبيبي، صار خطأ في معالجة الصوت. جرب مرة ثانية',
        'teacher',
        'text'
      );
      setProcessingStage('idle');
    } finally {
      setIsTyping(false);
      setProcessingStage('idle');
    }
  };

  /**
   * تشغيل النص كصوت (مع دعم الصوت المجاني والمدفوع)
   */
  const playTextAsAudio = async (text: string) => {
    if (!text?.trim()) {
      console.warn('⚠️ Empty text');
      return;
    }

    try {
      setIsPlayingAudio(true);
      setProcessingStage('generating_speech');

      // ====================================
      // 🆓 الصوت المجاني (Web Speech API)
      // ====================================
      if (ttsMode === 'free') {
        if (!freeTTS) {
          console.error('❌ Free TTS not supported in this browser');
          setIsPlayingAudio(false);
          setProcessingStage('idle');
          return;
        }

        console.log('🆓 استخدام الصوت المجاني (Web Speech API)');
        setProcessingStage('playing');

        await freeTTS.speak(text, {
          rate: speechRate,
          pitch: 1.0,
          volume: 1.0,
          voiceName: selectedVoice || undefined
        });

        setIsPlayingAudio(false);
        setProcessingStage('idle');
        console.log('✅ انتهى تشغيل الصوت المجاني');
      }
      // ====================================
      // 💎 الصوت المدفوع (OpenAI TTS HD)
      // ====================================
      else {
        let audioBlob: Blob;

        // التحقق من Cache أولاً - يوفر تكاليف API
        const cachedAudio = audioCache.get(text);

        if (cachedAudio) {
          console.log('✅ استخدام الصوت من Cache - توفير في التكلفة!');
          audioBlob = cachedAudio;
        } else {
          console.log('💎 جلب الصوت المدفوع من OpenAI...');
          const response = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              voice: 'alloy'
            }),
          });

          if (!response.ok) {
            throw new Error('فشل في تحويل النص لصوت');
          }

          audioBlob = await response.blob();

          // حفظ في Cache - يوفر للمرات القادمة
          audioCache.set(text, audioBlob);
          console.log('💾 تم حفظ الصوت في Cache للتوفير');
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        // حفظ مرجع الصوت الحالي
        setCurrentAudio(audio);

        audio.onended = () => {
          setIsPlayingAudio(false);
          setProcessingStage('idle');
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };

        setProcessingStage('playing');
        await audio.play();
        console.log('🔊 تشغيل الصوت المدفوع...');
      }

    } catch (error) {
      console.error('❌ خطأ في تشغيل الصوت:', error);
      setIsPlayingAudio(false);
      setProcessingStage('idle');
      setCurrentAudio(null);
    }
  };

  /**
   * إيقاف الصوت الحالي (مجاني أو مدفوع)
   */
  const stopAudio = () => {
    // إيقاف الصوت المجاني
    if (ttsMode === 'free' && freeTTS) {
      freeTTS.stop();
      console.log('🛑 تم إيقاف الصوت المجاني');
    }

    // إيقاف الصوت المدفوع
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      console.log('🛑 تم إيقاف الصوت المدفوع');
    }

    setIsPlayingAudio(false);
    setProcessingStage('idle');
  };

  // ====================================
  // Render
  // ====================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-4">

        {/* ====================================
            Header Section
            ==================================== */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* عنوان الصفحة */}
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">👨‍🏫</div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                المعلم العراقي - عمو أحمد
              </h1>
              <p className="text-gray-600">
                معلم ابتدائي متخصص بالمنهج العراقي (الصفوف 1-6)
              </p>
            </div>
          </div>

          {/* اختيار الصف والمادة */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📚 اختر صفك الدراسي
              </label>
              <GradeSelector
                selectedGrade={selectedGrade}
                onGradeSelect={setSelectedGrade}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📖 اختر المادة
              </label>
              <SubjectSelector
                selectedSubject={selectedSubject}
                onSubjectSelect={setSelectedSubject}
                selectedGrade={selectedGrade?.id}
              />
            </div>
          </div>

          {/* رفع صورة الواجب */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📸 هل عندك صورة للواجب؟
            </label>
            <ImageUploader
              onImageUpload={handleImageUpload}
              maxSize={5 * 1024 * 1024}
              acceptedFormats={['image/jpeg', 'image/png', 'image/jpg']}
            />

            {/* عرض الصورة المرفوعة */}
            {uploadedImage && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-start gap-4">
                  <img
                    src={uploadedImage.url}
                    alt="صورة الواجب"
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-green-800 mb-1">
                      ✅ تم رفع الصورة بنجاح!
                    </p>
                    <p className="text-sm text-gray-600">
                      {uploadedImage.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      الحجم: {(uploadedImage.file.size / 1024).toFixed(1)} كيلوبايت
                    </p>
                    <button
                      onClick={handleRemoveImage}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold transition-colors"
                    >
                      🗑️ حذف الصورة
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====================================
            Chat Section
            ==================================== */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <TeacherChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            teacherName="عمو أحمد"
          />
        </div>

        {/* ====================================
            Voice Recording Button
            ==================================== */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-center gap-4">
            {/* زر التسجيل */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTyping || isPlayingAudio}
              className={`
                relative group
                w-20 h-20 rounded-full
                flex items-center justify-center
                transition-all duration-300
                ${isRecording
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700'
                }
                ${(isTyping || isPlayingAudio) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
                shadow-lg hover:shadow-xl
              `}
            >
              {isRecording ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="6" y="6" width="8" height="8" rx="1" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/>
                  <path d="M10 8a2 2 0 00-2 2v2a2 2 0 104 0v-2a2 2 0 00-2-2z"/>
                </svg>
              )}

              {/* Recording indicator */}
              {isRecording && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* زر إيقاف الصوت - يظهر فقط عندما يشتغل الصوت */}
            {isPlayingAudio && (
              <button
                onClick={stopAudio}
                className="
                  relative group
                  w-20 h-20 rounded-full
                  flex items-center justify-center
                  transition-all duration-300
                  bg-red-600 hover:bg-red-700
                  hover:scale-110
                  shadow-lg hover:shadow-xl
                "
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="6" y="6" width="8" height="8" rx="1" />
                </svg>

                {/* مؤشر التشغيل */}
                <span className="absolute -top-2 -right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
              </button>
            )}

            <div className="text-right flex-1">
              <p className="text-lg font-bold text-gray-800">
                {isRecording
                  ? '🎤 جاري التسجيل...'
                  : isPlayingAudio
                  ? '🔊 عمو أحمد يتكلم...'
                  : '🎙️ اضغط للتحدث مع عمو أحمد'}
              </p>
              <p className="text-sm text-gray-500">
                {isRecording
                  ? 'اضغط مرة ثانية لإنهاء التسجيل'
                  : isPlayingAudio
                  ? 'اضغط الزر الأحمر لإيقاف الصوت'
                  : 'تكلم واحصل على رد صوتي من المعلم!'
                }
              </p>

              {/* Progress Indicator */}
              {processingStage !== 'idle' && (
                <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2">
                    {processingStage === 'transcribing' && (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-sm font-semibold text-blue-700">🎤 معالجة الصوت...</span>
                      </>
                    )}
                    {processingStage === 'thinking' && (
                      <>
                        <div className="relative">
                          <div className="text-2xl animate-bounce">🤔</div>
                        </div>
                        <span className="text-sm font-semibold text-purple-700">عمو أحمد يفكر بالجواب...</span>
                      </>
                    )}
                    {processingStage === 'generating_speech' && (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                        <span className="text-sm font-semibold text-green-700">🔊 تجهيز الصوت...</span>
                      </>
                    )}
                    {processingStage === 'playing' && (
                      <>
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{animationDelay: '0ms'}}></div>
                          <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{animationDelay: '150ms'}}></div>
                          <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{animationDelay: '300ms'}}></div>
                        </div>
                        <span className="text-sm font-semibold text-green-700">🔊 عمو أحمد يتكلم...</span>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: processingStage === 'transcribing' ? '25%' :
                               processingStage === 'thinking' ? '50%' :
                               processingStage === 'generating_speech' ? '75%' :
                               processingStage === 'playing' ? '100%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====================================
            Voice Control Settings
            ==================================== */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            🎛️ إعدادات الصوت
          </h3>

          {/* اختيار نوع الصوت */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نوع الصوت:
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setTtsMode('free')}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-semibold transition-all
                  ${ttsMode === 'free'
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                🆓 صوت مجاني
              </button>
              <button
                onClick={() => setTtsMode('paid')}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-semibold transition-all
                  ${ttsMode === 'paid'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                💎 صوت مدفوع (HD)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {ttsMode === 'free'
                ? '✅ يستخدم متصفح الويب - مجاني تماماً'
                : '💰 يستخدم OpenAI - جودة عالية + Cache للتوفير'
              }
            </p>
          </div>

          {/* إعدادات الصوت المجاني */}
          {isClient && ttsMode === 'free' && freeTTS && (
            <>
              {/* اختيار الصوت */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اختر الصوت:
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {/* الأصوات العربية */}
                  {freeTTS.getAvailableVoices().filter(v => v.lang.includes('ar')).length > 0 && (
                    <optgroup label="🇸🇦 أصوات عربية">
                      {freeTTS.getAvailableVoices()
                        .filter(v => v.lang.includes('ar'))
                        .map(voice => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))
                      }
                    </optgroup>
                  )}

                  {/* باقي الأصوات */}
                  <optgroup label="🌍 أصوات أخرى (قد تدعم العربية)">
                    {freeTTS.getAvailableVoices()
                      .filter(v => !v.lang.includes('ar'))
                      .slice(0, 10) // أول 10 أصوات فقط
                      .map(voice => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))
                    }
                  </optgroup>
                </select>

                {/* تحذير إذا ما في أصوات عربية */}
                {freeTTS.getAvailableVoices().filter(v => v.lang.includes('ar')).length === 0 && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-semibold mb-2">
                      ⚠️ لا توجد أصوات عربية في هذا المتصفح
                    </p>
                    <p className="text-xs text-yellow-700 mb-2">
                      الصوت الحالي قد لا يقرأ العربية بشكل صحيح.
                    </p>
                    <button
                      onClick={() => setTtsMode('paid')}
                      className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      💎 التبديل للصوت المدفوع (صوت عربي احترافي)
                    </button>
                  </div>
                )}
              </div>

              {/* التحكم بالسرعة */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  سرعة الكلام: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>بطيء (0.5x)</span>
                  <span>عادي (1.0x)</span>
                  <span>سريع (1.5x)</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ====================================
            Footer - معلومات المواد
            ==================================== */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">
            📚 المواد التي أدرسها:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'الرياضيات', icon: '🔢' },
              { name: 'اللغة العربية', icon: '📖' },
              { name: 'العلوم', icon: '🔬' },
              { name: 'الاجتماعيات', icon: '🌍' },
              { name: 'الإنجليزي', icon: '🇬🇧' },
              { name: 'التربية الإسلامية', icon: '📿' }
            ].map((subject) => (
              <div
                key={subject.name}
                className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-2xl">{subject.icon}</span>
                <span className="font-semibold text-gray-700">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ====================================
            Tips Section
            ==================================== */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
          <h3 className="text-xl font-bold text-orange-900 mb-3 flex items-center gap-2">
            💡 نصائح للاستفادة القصوى:
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>اختر صفك ومادتك للحصول على شرح مناسب لمستواك</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>ارفع صورة الواجب وعمو أحمد راح يساعدك بالحل</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>اطلب فيديوهات تعليمية باستخدام "راويني فيديو عن..."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>اسأل أي سؤال واحصل على شرح باللهجة البغدادية الأصيلة</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
