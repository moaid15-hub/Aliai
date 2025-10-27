// ============================================
// 🆓 صوت مجاني باستخدام متصفح الويب
// ============================================

export class FreeTTS {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('FreeTTS works only in browser');
    }

    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  // تحميل الأصوات المتوفرة
  private loadVoices() {
    this.voices = this.synth.getVoices();

    // إذا الأصوات ما تحملت بعد
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  // اختيار أفضل صوت عربي
  private getArabicVoice(): SpeechSynthesisVoice | null {
    // البحث عن صوت عربي
    const arabicVoice = this.voices.find(voice =>
      voice.lang.includes('ar') ||
      voice.name.includes('Arabic') ||
      voice.name.includes('Hoda') ||
      voice.name.includes('Tarik') ||
      voice.name.includes('Maged')
    );

    return arabicVoice || null;
  }

  // تشغيل النص كصوت
  speak(text: string, options?: {
    rate?: number;      // السرعة (0.1 - 10) default: 1
    pitch?: number;     // النغمة (0 - 2) default: 1
    volume?: number;    // الصوت (0 - 1) default: 1
    voiceName?: string; // اسم الصوت المحدد
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      // إيقاف أي صوت حالي
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // الإعدادات
      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;

      // اختيار الصوت
      let selectedVoice: SpeechSynthesisVoice | null = null;

      // إذا في صوت محدد بالاسم، استخدمه
      if (options?.voiceName) {
        selectedVoice = this.voices.find(v => v.name === options.voiceName) || null;
        if (selectedVoice) {
          console.log('🔊 Using selected voice:', selectedVoice.name);
        }
      }

      // إذا ما لقينا صوت محدد، استخدم أول صوت عربي
      if (!selectedVoice) {
        selectedVoice = this.getArabicVoice();
        if (selectedVoice) {
          console.log('🔊 Using Arabic voice:', selectedVoice.name);
        } else {
          console.warn('⚠️ No Arabic voice found, using default');
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        // استخدم لغة الصوت المختار
        utterance.lang = selectedVoice.lang;
      } else {
        // fallback للعربية
        utterance.lang = 'ar-SA';
      }

      // Events
      utterance.onend = () => {
        console.log('✅ Speech finished');
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('❌ Speech error:', error);
        reject(error);
      };

      // تشغيل
      this.synth.speak(utterance);
    });
  }

  // إيقاف الصوت
  stop() {
    this.synth.cancel();
  }

  // إيقاف مؤقت
  pause() {
    this.synth.pause();
  }

  // استئناف
  resume() {
    this.synth.resume();
  }

  // التحقق من توفر الخدمة
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  // الحصول على قائمة الأصوات المتوفرة
  getAvailableVoices() {
    return this.voices;
  }
}

// تصدير instance واحد
export const freeTTS = FreeTTS.isSupported() ? new FreeTTS() : null;
