// components/voice/continuous-voice-chat.tsx
/**
 * Continuous Voice Chat Component
 * محادثة صوتية مستمرة - ضغطة واحدة لبدء المحادثة
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

interface ContinuousVoiceChatProps {
  onMessage: (message: string) => void
  onError?: (error: string) => void
  language?: string
  isTeacherSpeaking?: boolean
}

export const ContinuousVoiceChat: React.FC<ContinuousVoiceChatProps> = ({
  onMessage,
  onError,
  language = 'ar-SA',
  isTeacherSpeaking = false
}) => {
  const [isActive, setIsActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')

  const recognitionRef = useRef<any>(null)
  const shouldRestartRef = useRef(false)

  // إعداد التعرف الصوتي
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      onError?.('المتصفح لا يدعم التعرف الصوتي. جرب Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('🎤 بدأ الاستماع...')
      setIsListening(true)
      setTranscript('')
      setInterimTranscript('')
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      if (final) {
        console.log('✅ نص نهائي:', final)
        setTranscript(final)
        setInterimTranscript('')

        // إرسال الرسالة
        onMessage(final.trim())
      } else {
        setInterimTranscript(interim)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('❌ خطأ في التعرف الصوتي:', event.error)

      if (event.error === 'no-speech') {
        console.log('⚠️ لم يتم رصد كلام، إعادة المحاولة...')
        if (shouldRestartRef.current) {
          setTimeout(() => {
            if (shouldRestartRef.current) {
              startListening()
            }
          }, 1000)
        }
      } else if (event.error === 'aborted') {
        // تم الإلغاء عمداً
        setIsListening(false)
      } else {
        onError?.(`خطأ: ${event.error}`)
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      console.log('🔚 انتهى الاستماع')
      setIsListening(false)

      // إعادة التشغيل التلقائي إذا كانت المحادثة نشطة
      if (shouldRestartRef.current && !isTeacherSpeaking) {
        setTimeout(() => {
          if (shouldRestartRef.current && !isTeacherSpeaking) {
            console.log('🔄 إعادة تشغيل الاستماع...')
            startListening()
          }
        }, 500)
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [language, onMessage, onError])

  // إعادة التشغيل بعد انتهاء المعلم من الكلام
  useEffect(() => {
    if (isActive && !isTeacherSpeaking && !isListening) {
      console.log('🎤 المعلم انتهى من الكلام، بدء الاستماع مرة أخرى...')
      setTimeout(() => {
        if (isActive && !isTeacherSpeaking) {
          startListening()
        }
      }, 1000)
    }
  }, [isTeacherSpeaking, isActive])

  const startListening = () => {
    if (!recognitionRef.current || isListening) return

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error('خطأ في بدء الاستماع:', error)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }
    setIsListening(false)
  }

  const toggleConversation = () => {
    if (isActive) {
      // إيقاف المحادثة
      console.log('⏹️ إيقاف المحادثة')
      shouldRestartRef.current = false
      setIsActive(false)
      stopListening()
      setTranscript('')
      setInterimTranscript('')
    } else {
      // بدء المحادثة
      console.log('▶️ بدء المحادثة الصوتية')
      shouldRestartRef.current = true
      setIsActive(true)
      startListening()
    }
  }

  return (
    <div className="continuous-voice-chat">
      {/* زر التحكم الرئيسي */}
      <button
        onClick={toggleConversation}
        disabled={isTeacherSpeaking && isActive}
        className={`
          px-6 py-4 rounded-lg font-bold text-lg
          transition-all duration-300 transform
          hover:scale-105 active:scale-95
          flex items-center gap-3
          ${isActive
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/50'
          }
          ${isTeacherSpeaking && isActive ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          boxShadow: isActive
            ? '0 0 30px rgba(239, 68, 68, 0.5)'
            : '0 0 30px rgba(34, 197, 94, 0.5)'
        }}
      >
        {isActive ? (
          <>
            <MicOff className="w-6 h-6" />
            <span>إنهاء المحادثة</span>
          </>
        ) : (
          <>
            <Mic className="w-6 h-6" />
            <span>بدء محادثة صوتية</span>
          </>
        )}
      </button>

      {/* حالة المحادثة */}
      {isActive && (
        <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center gap-3 mb-2">
            {isTeacherSpeaking ? (
              <>
                <Volume2 className="w-5 h-5 text-blue-500 animate-pulse" />
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  🎙️ العمو حيدر يتكلم...
                </span>
              </>
            ) : isListening ? (
              <>
                <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  🎤 أنا أستمع... تكلم الآن
                </span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  ⏳ جاري التجهيز...
                </span>
              </>
            )}
          </div>

          {/* عرض النص المؤقت */}
          {(interimTranscript || transcript) && (
            <div className="mt-2 p-3 bg-white dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {transcript || interimTranscript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* تعليمات */}
      {!isActive && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <p>💡 اضغط لبدء محادثة صوتية مستمرة مع العمو حيدر</p>
        </div>
      )}
    </div>
  )
}

export default ContinuousVoiceChat
