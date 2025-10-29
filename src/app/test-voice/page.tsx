'use client'

import { TextToSpeech } from '@/components/voice/text-to-speech'
import { VoiceSearch } from '@/components/voice/voice-search'
import { useState, useEffect } from 'react'

export default function TestVoicePage() {
  const [searchResult, setSearchResult] = useState('')
  const [error, setError] = useState('')
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [testResult, setTestResult] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [recognitionSupported, setRecognitionSupported] = useState(false)

  useEffect(() => {
    // تعيين أن الكومبوننت mounted
    setIsMounted(true)

    // التحقق من دعم المتصفح
    setSpeechSupported('speechSynthesis' in window)
    setRecognitionSupported(
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    )

    // تحميل قائمة الأصوات
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      console.log('Loaded voices:', voices)
      setAvailableVoices(voices)
      setIsLoading(false)
    }

    // تحميل مباشر
    loadVoices()

    // وأيضاً عند تغيير الأصوات
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // اختبار مباشر للصوت
  const testBasicSpeech = () => {
    setTestResult('⏳ جاري الاختبار...')
    console.log('=== Starting basic speech test ===')

    try {
      // إلغاء أي صوت سابق
      window.speechSynthesis.cancel()

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance('مرحبا')

        utterance.onstart = () => {
          console.log('✅ Speech started!')
          setTestResult('✅ الصوت بدأ يشتغل!')
        }

        utterance.onend = () => {
          console.log('✅ Speech ended!')
          setTestResult('✅ الصوت اشتغل بنجاح!')
        }

        utterance.onerror = (e) => {
          console.error('❌ Speech error:', e)
          setTestResult(`❌ خطأ: ${e.error}`)
        }

        console.log('Speaking...')
        window.speechSynthesis.speak(utterance)

        // تحقق إضافي
        setTimeout(() => {
          const isPending = window.speechSynthesis.pending
          const isSpeaking = window.speechSynthesis.speaking
          console.log('Status check - pending:', isPending, 'speaking:', isSpeaking)

          if (!isPending && !isSpeaking) {
            setTestResult('⚠️ الصوت ما بدأ! تحقق من السماعات.')
          }
        }, 500)
      }, 100)

    } catch (e: any) {
      console.error('Exception:', e)
      setTestResult(`❌ Exception: ${e.message}`)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>اختبار نظام الصوت 🎤🔊</h1>

      {/* اختبار بسيط جداً */}
      <div style={{
        marginBottom: '40px',
        padding: '20px',
        border: '3px solid #4CAF50',
        borderRadius: '10px',
        background: '#e8f5e9'
      }}>
        <h2 style={{ marginBottom: '15px' }}>🔊 اختبار بسيط مباشر</h2>
        <p style={{ marginBottom: '15px' }}>
          اضغط الزر وشغل صوت الجهاز عالي:
        </p>
        <button
          onClick={testBasicSpeech}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔊 اختبر الصوت الآن
        </button>

        {testResult && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            background: testResult.startsWith('✅') ? '#c8e6c9' : '#ffccbc',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {testResult}
          </div>
        )}

        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#fff3e0',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>تأكد من:</strong>
          <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
            <li>صوت الجهاز مرفوع (مو صامت)</li>
            <li>السماعات شغالة</li>
            <li>المتصفح ما مكتوم</li>
          </ul>
        </div>
      </div>

      {/* Test Text to Speech */}
      <div style={{
        marginBottom: '40px',
        padding: '20px',
        border: '2px solid #ddd',
        borderRadius: '10px',
        background: '#f9f9f9'
      }}>
        <h2 style={{ marginBottom: '15px' }}>1️⃣ اختبار المكون (Component)</h2>
        <p style={{ marginBottom: '15px' }}>
          مرحباً! هذا اختبار لنظام النطق. اضغط زر السماعة لسماع هذا النص.
        </p>
        <TextToSpeech
          text="مرحباً! أنا العمو حيدر. هذا اختبار للصوت."
        />
      </div>

      {/* Test Voice Search */}
      <div style={{
        marginBottom: '40px',
        padding: '20px',
        border: '2px solid #ddd',
        borderRadius: '10px',
        background: '#f9f9f9'
      }}>
        <h2 style={{ marginBottom: '15px' }}>2️⃣ اختبار البحث الصوتي</h2>
        <VoiceSearch
          onSearchQuery={(query) => {
            setSearchResult(query)
            setError('')
          }}
          onError={(err) => {
            setError(err)
            setSearchResult('')
          }}
          language="ar-SA"
        />

        {searchResult && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            background: '#4caf50',
            color: 'white',
            borderRadius: '5px'
          }}>
            <strong>✅ سمعتك تقول:</strong> {searchResult}
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            background: '#f44336',
            color: 'white',
            borderRadius: '5px'
          }}>
            <strong>❌ خطأ:</strong> {error}
          </div>
        )}
      </div>

      {/* Browser Support Info */}
      <div style={{
        padding: '20px',
        border: '2px solid #ff9800',
        borderRadius: '10px',
        background: '#fff3e0',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '15px' }}>ℹ️ معلومات المتصفح</h2>
        {isMounted ? (
          <>
            <p>
              <strong>دعم النطق:</strong> {speechSupported ? '✅ مدعوم' : '❌ غير مدعوم'}
            </p>
            <p>
              <strong>دعم التعرف الصوتي:</strong> {recognitionSupported ? '✅ مدعوم' : '❌ غير مدعوم'}
            </p>
          </>
        ) : (
          <p>⏳ جاري التحقق من دعم المتصفح...</p>
        )}
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          <strong>نصيحة:</strong> أفضل المتصفحات: Chrome, Edge
        </p>
      </div>

      {/* Available Voices List */}
      <div style={{
        padding: '20px',
        border: '2px solid #2196F3',
        borderRadius: '10px',
        background: '#e3f2fd'
      }}>
        <h2 style={{ marginBottom: '15px' }}>🎙️ الأصوات المتاحة ({availableVoices.length})</h2>

        {isLoading ? (
          <p>⏳ جاري تحميل الأصوات...</p>
        ) : availableVoices.length === 0 ? (
          <div style={{ padding: '20px', background: '#ffebee', borderRadius: '8px', color: '#c62828' }}>
            <strong>⚠️ تحذير:</strong> لم يتم العثور على أي أصوات!
            <br /><br />
            <strong>هذا هو السبب في عدم سماع الصوت!</strong>
            <br /><br />
            جرب:
            <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
              <li>تحديث الصفحة</li>
              <li>استخدام Google Chrome</li>
              <li>تحميل أصوات من إعدادات النظام</li>
            </ul>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '15px', color: '#1565c0' }}>
              <strong>الأصوات العربية:</strong>
            </p>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              background: 'white',
              padding: '15px',
              borderRadius: '8px'
            }}>
              {availableVoices
                .filter(v => v.lang.startsWith('ar'))
                .map((voice, index) => (
                  <div key={index} style={{
                    padding: '10px',
                    marginBottom: '10px',
                    background: '#e8f5e9',
                    borderRadius: '5px',
                    borderLeft: '4px solid #4caf50'
                  }}>
                    <strong>✅ {voice.name}</strong>
                    <br />
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      اللغة: {voice.lang} | {voice.localService ? 'محلي' : 'عبر الإنترنت'}
                    </span>
                  </div>
                ))}

              {availableVoices.filter(v => v.lang.startsWith('ar')).length === 0 && (
                <div style={{
                  padding: '15px',
                  background: '#fff3e0',
                  borderRadius: '5px',
                  color: '#e65100'
                }}>
                  <strong>⚠️ لا توجد أصوات عربية!</strong>
                  <br />
                  سيتم استخدام صوت افتراضي (قد لا ينطق العربية بشكل صحيح)
                </div>
              )}

              <details style={{ marginTop: '20px' }}>
                <summary style={{ cursor: 'pointer', color: '#1565c0', marginBottom: '10px' }}>
                  عرض جميع الأصوات ({availableVoices.length})
                </summary>
                {availableVoices.map((voice, index) => (
                  <div key={index} style={{
                    padding: '8px',
                    marginBottom: '5px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}>
                    {voice.name} ({voice.lang})
                  </div>
                ))}
              </details>
            </div>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', color: '#2e7d32' }}>
          💡 <strong>نصيحة:</strong> افتح Console (F12) لرؤية رسائل مفصلة
        </p>
      </div>
    </div>
  )
}
