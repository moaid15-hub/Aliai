// components/personas/iraqi-teacher/TeacherChat.tsx
/**
 * TeacherChat Component
 * مكون محادثة المعلم العراقي
 */

import React, { useState, useRef, useEffect } from 'react';
import { TextToSpeech } from '@/components/voice/text-to-speech';
import { Mic, MicOff, Send, Square, Image as ImageIcon, X } from 'lucide-react';
import './TeacherChat.css';

interface Message {
  id: string;
  text: string;
  sender: 'teacher' | 'student';
  timestamp: Date;
  type?: 'text' | 'encouragement' | 'explanation';
  image?: string; // base64 image
}

interface TeacherChatProps {
  messages: Message[];
  onSendMessage?: (message: string, image?: string) => void;
  isTyping?: boolean;
  isSpeaking?: boolean; // هل المعلم يتحدث الآن
  teacherName?: string;
  lastTeacherMessageId?: string; // ID الرسالة الأخيرة للتشغيل التلقائي
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  voiceMode?: 'free' | 'premium'; // نوع الصوت
  stopAllAudioRef?: React.MutableRefObject<() => void>; // دالة إيقاف شاملة
}

const TeacherChat: React.FC<TeacherChatProps> = ({
  messages,
  onSendMessage,
  isTyping = false,
  isSpeaking = false,
  teacherName = 'الأستاذ أحمد',
  lastTeacherMessageId,
  onSpeakStart,
  onSpeakEnd,
  voiceMode = 'premium',
  stopAllAudioRef
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [audioLevel, setAudioLevel] = useState(0); // مستوى الصوت للـ waveform
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // صورة مرفقة
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioStopFunctionsRef = useRef<(() => void)[]>([]); // قائمة دوال إيقاف الصوت
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>(''); // تخزين النص المسموع

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    console.log('📤 تم الضغط على زر الإرسال');
    console.log('📝 النص:', inputValue);
    console.log('📷 صورة:', selectedImage ? 'موجودة' : 'لا توجد');

    // السماح بالإرسال إذا كان هناك نص أو صورة
    if ((inputValue.trim() || selectedImage) && onSendMessage) {
      const messageText = inputValue.trim() || 'حل هذه المسألة'; // نص افتراضي إذا كانت صورة فقط
      console.log('✅ إرسال الرسالة:', messageText);
      onSendMessage(messageText, selectedImage || undefined);
      setInputValue('');
      setSelectedImage(null); // مسح الصورة بعد الإرسال
    } else {
      console.warn('⚠️ لا يوجد نص أو صورة للإرسال');
    }
  };

  // معالجة رفع الصورة
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار ملف صورة');
        return;
      }

      // التحقق من حجم الملف (أقل من 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الرجاء اختيار صورة أصغر من 5MB');
        return;
      }

      // تحويل الصورة إلى base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        console.log('✅ تم رفع الصورة');
      };
      reader.readAsDataURL(file);
    }
  };

  // حذف الصورة المحددة
  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-IQ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // إعداد Audio Context للـ VAD
  const setupAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;

      // بدء مراقبة مستوى الصوت
      monitorAudioLevel();

      console.log('✅ Audio Context initialized for VAD');
      return true;
    } catch (error) {
      console.error('❌ خطأ في إعداد Audio Context:', error);
      return false;
    }
  };

  // مراقبة مستوى الصوت (للـ VAD و Waveform)
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkAudio = () => {
      analyser.getByteFrequencyData(dataArray);

      // حساب متوسط مستوى الصوت
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average);

      // VAD - كشف الصمت
      const SILENCE_THRESHOLD = 10; // عتبة الصمت
      const SILENCE_DURATION = 1500; // 1.5 ثانية صمت

      if (isListening) {
        if (average < SILENCE_THRESHOLD) {
          // بدء عداد الصمت
          if (!silenceTimeoutRef.current) {
            silenceTimeoutRef.current = setTimeout(() => {
              console.log('🔇 تم كشف الصمت - إيقاف التسجيل');
              stopListeningAndSend();
            }, SILENCE_DURATION);
          }
        } else {
          // إلغاء عداد الصمت إذا تحدث المستخدم
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkAudio);
    };

    checkAudio();
  };

  // إيقاف الاستماع وإرسال النص تلقائياً
  const stopListeningAndSend = () => {
    console.log('🛑 إيقاف الاستماع وإرسال النص');

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);

    // تنظيف Audio Context
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // إرسال النص المسموع تلقائياً
    setTimeout(() => {
      const textToSend = transcriptRef.current.trim();
      console.log('📤 النص للإرسال:', textToSend);

      if (textToSend && onSendMessage) {
        console.log('✅ إرسال تلقائي:', textToSend);
        onSendMessage(textToSend);
        transcriptRef.current = ''; // مسح النص
        setInputValue(''); // مسح مربع النص
      } else {
        console.log('⚠️ لا يوجد نص للإرسال');
      }
    }, 100); // تأخير صغير للتأكد من اكتمال التعرف
  };

  // إعداد التعرف الصوتي
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = true; // تغيير إلى continuous للعمل مع VAD
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      console.log('🎤 سمعت:', transcript);

      // حفظ النص في ref و عرضه
      transcriptRef.current = transcriptRef.current + ' ' + transcript;
      setInputValue(transcriptRef.current.trim());
    };

    recognition.onerror = (event: any) => {
      console.error('❌ خطأ في الميكروفون:', event.error);
      setIsListening(false);
      stopListeningAndSend();
    };

    recognition.onend = () => {
      console.log('✅ انتهى التسجيل من recognition.onend');
      // لا نفعل شيء هنا لأن stopListeningAndSend سيتولى الإرسال
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // تشغيل/إيقاف الميكروفون مع VAD
  const toggleVoiceInput = async () => {
    console.log('🎤 تم الضغط على زر الميكروفون');

    if (!recognitionRef.current) {
      console.error('❌ التعرف الصوتي غير مدعوم');
      alert('المتصفح لا يدعم التعرف الصوتي. جرب Chrome.');
      return;
    }

    if (isListening) {
      console.log('⏹️ إيقاف شامل - الاستماع والصوت');

      // إيقاف الاستماع
      stopListeningAndSend();

      // إرسال حدث لإيقاف كل الأصوات
      window.dispatchEvent(new CustomEvent('stopAllAudio'));

      // إيقاف Browser TTS أيضاً
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // تنظيف Audio Context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } else {
      try {
        console.log('▶️ بدء الاستماع مع VAD');

        // مسح النص القديم
        transcriptRef.current = '';
        setInputValue('');

        // إعداد Audio Context للـ VAD
        const audioReady = await setupAudioContext();
        if (!audioReady) {
          alert('خطأ في تشغيل الميكروفون. تأكد من السماح بالوصول للميكروفون.');
          return;
        }

        // بدء التعرف الصوتي
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('خطأ في بدء الميكروفون:', error);
        alert('خطأ في تشغيل الميكروفون. تأكد من السماح بالوصول للميكروفون.');
      }
    }
  };

  return (
    <div className="teacher-chat">
      <div className="teacher-chat__header">
        <div className="teacher-chat__teacher-info">
          <span className="teacher-chat__avatar">👨‍🏫</span>
          <div className="teacher-chat__teacher-name">
            {teacherName}
          </div>
          <div className="teacher-chat__status">
            {isTyping ? 'يكتب...' : 'متصل'}
          </div>
        </div>

        {/* مؤشرات الحالة المرئية */}
        {isListening && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
            color: 'white',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(244, 67, 54, 0.5)',
            animation: 'pulse 1.5s infinite',
            zIndex: 100
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              background: 'white',
              borderRadius: '50%',
              animation: 'blink 1s infinite'
            }}></span>
            🎤 جاري الاستماع...
          </div>
        )}

        {/* مؤشر المعالجة (Processing) */}
        {!isListening && isTyping && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
            color: 'white',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(255, 152, 0, 0.5)',
            animation: 'pulse 1.5s infinite',
            zIndex: 100
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              background: 'white',
              borderRadius: '50%',
              animation: 'blink 1s infinite'
            }}></span>
            ⚙️ يفكر ويكتب...
          </div>
        )}

        {/* مؤشر التحدث (Speaking) */}
        {!isListening && !isTyping && isSpeaking && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(76, 175, 80, 0.5)',
            animation: 'pulse 1.5s infinite',
            zIndex: 100
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              background: 'white',
              borderRadius: '50%',
              animation: 'blink 1s infinite'
            }}></span>
            🔊 يتحدث الآن...
          </div>
        )}
      </div>

      <div className="teacher-chat__messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`teacher-chat__message teacher-chat__message--${message.sender}`}
          >
            <div className="teacher-chat__message-content">
              <div className="teacher-chat__message-header">
                <div className="teacher-chat__message-text">
                  {/* عرض الصورة المرفقة إذا كانت موجودة */}
                  {message.image && (
                    <div style={{
                      marginBottom: '8px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      maxWidth: '300px'
                    }}>
                      <img
                        src={message.image}
                        alt="Attached"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  )}
                  {message.text}
                </div>
                {message.sender === 'teacher' && (
                  <div className="teacher-chat__message-voice">
                    <TextToSpeech
                      text={message.text}
                      className="voice-mini"
                      autoPlay={message.id === lastTeacherMessageId}
                      onSpeakStart={onSpeakStart}
                      onSpeakEnd={onSpeakEnd}
                      voiceMode={voiceMode}
                    />
                  </div>
                )}
              </div>
              <div className="teacher-chat__message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="teacher-chat__message teacher-chat__message--teacher">
            <div className="teacher-chat__typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {onSendMessage && (
        <div className="teacher-chat__input-area">
          {/* مؤشر Waveform عند الاستماع */}
          {isListening && (
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '12px',
              background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
              borderRadius: '16px',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.3)'
            }}>
              {[...Array(30)].map((_, i) => {
                const barHeight = Math.max(
                  6,
                  Math.min(45, (audioLevel / 2) * Math.random() + audioLevel / 3)
                );
                return (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: `${barHeight}px`,
                      background: 'white',
                      borderRadius: '3px',
                      transition: 'height 0.1s ease',
                      opacity: 0.9
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* معاينة الصورة المرفقة */}
          {selectedImage && (
            <div style={{
              width: '100%',
              marginBottom: '12px',
              position: 'relative',
              background: 'white',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}>
              <button
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(244, 67, 54, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="حذف الصورة"
              >
                <X size={18} />
              </button>
              <img
                src={selectedImage}
                alt="Selected"
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '12px'
                }}
              />
            </div>
          )}

          {/* مربع الإدخال مع الأزرار بداخله */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '20px',
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            width: '100%'
          }}>
            {/* زر الميكروفون - داخل المربع */}
            <button
              onClick={toggleVoiceInput}
              className={`teacher-chat__voice-button-inside ${isListening ? 'listening' : ''}`}
              style={{
                padding: '12px',
                background: isListening
                  ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)'
                  : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '6px',
                minWidth: '48px',
                height: '48px',
                boxShadow: isListening
                  ? '0 0 20px rgba(244, 67, 54, 0.6)'
                  : '0 2px 8px rgba(76, 175, 80, 0.4)',
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
              title={isListening ? 'إيقاف الاستماع' : 'ابدأ التحدث'}
            >
              {isListening ? <Square size={24} /> : <Mic size={24} />}
            </button>

            {/* زر رفع الصورة - داخل المربع */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '6px',
                minWidth: '48px',
                height: '48px',
                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="رفع صورة"
            >
              <ImageIcon size={24} />
            </button>

            {/* مربع النص */}
            <textarea
              className="teacher-chat__input-modern"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب سؤالك هنا..."
              rows={1}
              style={{
                flex: 1,
                padding: '14px 12px',
                border: 'none',
                background: 'transparent',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />

            {/* زر الإرسال - داخل المربع */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() && !selectedImage}
              style={{
                padding: '12px',
                background: (!inputValue.trim() && !selectedImage)
                  ? '#cbd5e0'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: (inputValue.trim() || selectedImage) ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '6px',
                minWidth: '48px',
                height: '48px',
                boxShadow: (inputValue.trim() || selectedImage)
                  ? '0 2px 8px rgba(102, 126, 234, 0.4)'
                  : 'none',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim() || selectedImage) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="إرسال"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherChat;