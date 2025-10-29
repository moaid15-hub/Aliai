# 🎙️ دليل ملفات الصوت - عمو أحمد

هذا الدليل يوضح **جميع الملفات** المتعلقة بالصوت وشخصية المعلم العراقي (عمو أحمد).

---

## 📂 هيكل الملفات

```
/media/amir/Boot/aliai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── speech-to-text/
│   │   │   │   └── route.ts                    ⭐ تحويل الصوت → نص
│   │   │   └── text-to-speech/
│   │   │       └── route.ts                    ⭐ تحويل النص → صوت
│   │   └── teacher/
│   │       └── page.tsx                        ⭐ الصفحة الرئيسية لعمو أحمد
│   └── features/
│       └── personas/
│           └── implementations/
│               └── iraqi-teacher/              📁 جميع ملفات عمو أحمد
│                   ├── TeacherAvatar.tsx       🖼️ صورة عمو أحمد
│                   ├── TeacherChat.tsx         💬 واجهة الدردشة
│                   ├── VideoCard.tsx           📹 بطاقة الفيديوهات
│                   ├── GradeSelector.tsx       🎓 اختيار الصف
│                   ├── SubjectSelector.tsx     📚 اختيار المادة
│                   ├── ImageUploader.tsx       📸 رفع الصور
│                   ├── data/
│                   │   └── iraqiTeacherData.ts 📊 بيانات الصفوف والمواد
│                   ├── iraqi-teacher.types.ts  📝 أنواع البيانات
│                   └── iraqi-teacher-config.ts ⚙️ إعدادات عمو أحمد
```

---

## 🎯 الملفات الرئيسية للصوت

### 1️⃣ **API: تحويل الصوت إلى نص (Speech-to-Text)**
📍 **المسار:** `/src/app/api/speech-to-text/route.ts`

**الوظيفة:**
- يستقبل تسجيل صوتي من الطالب
- يرسله إلى OpenAI Whisper API
- يرجع النص المستخرج

**التقنية المستخدمة:**
- OpenAI Whisper API
- يدعم اللغة العربية بدقة عالية

**مثال على الاستخدام:**
```typescript
const formData = new FormData();
formData.append('audio', audioBlob, 'audio.webm');

const response = await fetch('/api/speech-to-text', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data.text); // النص المستخرج
```

---

### 2️⃣ **API: تحويل النص إلى صوت (Text-to-Speech)**
📍 **المسار:** `/src/app/api/text-to-speech/route.ts`

**الوظيفة:**
- يستقبل نص من رد عمو أحمد
- يحوله إلى صوت باستخدام OpenAI TTS
- يرجع ملف صوتي

**التقنية المستخدمة:**
- OpenAI TTS API
- الصوت المستخدم: `alloy` (يمكن تغييره)

**الأصوات المتاحة:**
- `alloy` (الحالي - متوازن)
- `echo` (ذكوري عميق)
- `fable` (نسائي ناعم)
- `onyx` (ذكوري قوي)
- `nova` (نسائي طاقوي)
- `shimmer` (نسائي ناعم)

**مثال على الاستخدام:**
```typescript
const response = await fetch('/api/text-to-speech', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'هلا حبيبي! شلونك اليوم؟',
    voice: 'alloy'
  }),
});

const audioBlob = await response.blob();
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();
```

---

### 3️⃣ **الصفحة الرئيسية لعمو أحمد**
📍 **المسار:** `/src/app/teacher/page.tsx`

**الوظيفة:**
- الصفحة الرئيسية الكاملة لعمو أحمد
- تحتوي على جميع وظائف الصوت

**الوظائف الصوتية الموجودة:**
```typescript
// 1. بدء التسجيل
startRecording()

// 2. إيقاف التسجيل
stopRecording()

// 3. معالجة الرسالة الصوتية (كامل المسار)
processVoiceMessage(audioBlob)
  ├─→ تحويل الصوت لنص (Whisper)
  ├─→ إرسال للـ AI (Claude)
  ├─→ تحويل الرد لصوت (TTS)
  └─→ تشغيل الصوت

// 4. تشغيل النص كصوت
playTextAsAudio(text)

// 5. إيقاف الصوت
stopAudio()

// 6. تشغيل صوت تنبيه
playBeep(frequency, duration)
```

**مراحل معالجة الصوت:**
```typescript
type VoiceProcessingStage =
  | 'idle'              // جاهز
  | 'transcribing'      // 🎤 معالجة الصوت...
  | 'thinking'          // 🤔 عمو أحمد يفكر...
  | 'generating_speech' // 🔊 تجهيز الصوت...
  | 'playing'           // 🔊 عمو أحمد يتكلم...
```

---

## 🗣️ شخصية عمو أحمد

### 📍 **المسار:** `/src/app/teacher/page.tsx` (السطور 56-106)

**System Prompt الكامل:**
```typescript
const TEACHER_SYSTEM_PROMPT = (grade?: string, subject?: string) => `
أنت عمو أحمد، معلم عراقي من بغداد، متخصص في تعليم الصفوف الابتدائية (1-6).

🎯 شخصيتك:
- تتكلم باللهجة البغدادية الأصيلة 100%
- صبور هواية مع الأطفال
- حنون وودود مثل العم الكبير
- تشجع الطلاب دائماً

🗣️ طريقة الكلام:
- استخدم "حبيبي"، "يبه"، "شاطر"
- استخدم "هواية" بدلاً من "كثير"
- استخدم "شلون" بدلاً من "كيف"
- ... إلخ

الصف: ${grade || 'غير محدد'}
المادة: ${subject || 'غير محددة'}
`;
```

**الملف الكامل موجود في السطور 56-106 من:**
`/src/app/teacher/page.tsx`

---

## 🎨 مكونات الواجهة

### 1. **TeacherChat.tsx**
📍 `/src/features/personas/implementations/iraqi-teacher/TeacherChat.tsx`
- واجهة الدردشة
- عرض الرسائل
- صندوق الإدخال

### 2. **TeacherAvatar.tsx**
📍 `/src/features/personas/implementations/iraqi-teacher/TeacherAvatar.tsx`
- صورة عمو أحمد 👨‍🏫
- الرسوم المتحركة

### 3. **VideoCard.tsx**
📍 `/src/features/personas/implementations/iraqi-teacher/VideoCard.tsx`
- بطاقات عرض فيديوهات YouTube
- تظهر عند طلب فيديوهات تعليمية

---

## ⚙️ ملفات الإعدادات

### 1. **iraqiTeacherData.ts**
📍 `/src/features/personas/implementations/iraqi-teacher/data/iraqiTeacherData.ts`

**يحتوي على:**
- قائمة الصفوف (1-6)
- قائمة المواد (رياضيات، عربي، علوم، إلخ)
- بيانات عمو أحمد

### 2. **iraqi-teacher.types.ts**
📍 `/src/features/personas/implementations/iraqi-teacher/iraqi-teacher.types.ts`

**أنواع البيانات:**
```typescript
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
```

---

## 🔑 المتغيرات البيئية المطلوبة

يجب أن تكون موجودة في `.env.local`:

```env
# مطلوب للصوت
OPENAI_API_KEY=sk-...           # Whisper + TTS

# مطلوب للذكاء الاصطناعي
ANTHROPIC_API_KEY=sk-ant-...    # Claude Sonnet 4

# مطلوب لفيديوهات YouTube
YOUTUBE_API_KEY=...
```

---

## 📊 مسار تدفق الصوت الكامل

```mermaid
1. المستخدم يضغط زر التسجيل
   ↓
2. startRecording() - بدء التسجيل
   - playBeep(1000) 🔔 صوت عالي
   ↓
3. المستخدم يتكلم 🎤
   ↓
4. المستخدم يضغط مرة ثانية
   ↓
5. stopRecording() - إيقاف التسجيل
   - playBeep(600) 🔔 صوت منخفض
   ↓
6. processVoiceMessage(audioBlob)
   ├─→ Stage: 'transcribing' 🎤
   │   POST /api/speech-to-text
   │   Whisper API → النص
   │
   ├─→ Stage: 'thinking' 🤔
   │   POST /api/chat
   │   Claude AI → رد عمو أحمد
   │   ✨ عرض النص فوراً في الدردشة
   │
   ├─→ Stage: 'generating_speech' 🔊
   │   POST /api/text-to-speech
   │   OpenAI TTS → ملف صوتي
   │
   └─→ Stage: 'playing' 🔊
       playTextAsAudio()
       تشغيل الصوت

7. المستخدم يمكنه الضغط على الزر الأحمر 🔴
   ↓
8. stopAudio() - إيقاف الصوت فوراً
```

---

## 🎯 أهم الوظائف في page.tsx

### الوظائف الصوتية:

| الوظيفة | الموقع | الوصف |
|---------|--------|-------|
| `startRecording()` | سطر 441 | بدء التسجيل الصوتي |
| `stopRecording()` | سطر 527 | إيقاف التسجيل |
| `processVoiceMessage()` | سطر 538 | المعالجة الكاملة للصوت |
| `playTextAsAudio()` | سطر 661 | تحويل النص لصوت وتشغيله |
| `stopAudio()` | سطر 707 | إيقاف الصوت الحالي |
| `playBeep()` | سطر 149 | تشغيل صوت تنبيه |

### الوظائف الأخرى:

| الوظيفة | الموقع | الوصف |
|---------|--------|-------|
| `handleSendMessage()` | سطر 241 | إرسال رسالة نصية |
| `searchAndAddVideos()` | سطر 307 | البحث عن فيديوهات |
| `handleImageUpload()` | سطر 420 | رفع صورة الواجب |

---

## 🛠️ كيف تعدل الصوت؟

### 1. تغيير صوت عمو أحمد:

افتح: `/src/app/teacher/page.tsx`

**السطر 670:**
```typescript
body: JSON.stringify({
  text,
  voice: 'alloy' // غيّر هنا 👈
}),
```

**الخيارات:**
- `alloy` - الحالي (متوازن) ✅
- `echo` - ذكوري عميق
- `onyx` - ذكوري قوي (ممكن يكون أفضل لعمو أحمد!)
- `nova` - نسائي

### 2. تغيير أصوات التنبيه (beep):

**السطر 465 (بدء التسجيل):**
```typescript
playBeep(1000, 150); // النغمة، المدة بالملي ثانية
```

**السطر 455 (إنهاء التسجيل):**
```typescript
playBeep(600, 150);
```

### 3. تعديل شخصية عمو أحمد:

**السطور 56-106:**
عدّل الـ System Prompt لتغيير:
- اللهجة
- أسلوب التدريس
- الكلمات المستخدمة

---

## 📱 كيف تصل للصفحة؟

**URL:** `http://localhost:3000/teacher`

---

## 🐛 تشخيص المشاكل

### المشكلة: الصوت لا يعمل
✅ **الحل:**
1. تأكد من وجود `OPENAI_API_KEY` في `.env.local`
2. افتح Browser Console (F12) وشاهد الأخطاء
3. تأكد من السماحيات للميكروفون

### المشكلة: الصوت بطيء
✅ **الحل:**
- هذا طبيعي! المسار يستغرق 6-8 ثواني:
  - Whisper: ~1-2 ثانية
  - Claude AI: ~2-3 ثواني
  - TTS: ~1-2 ثانية
  - تشغيل: فوري ✨

### المشكلة: النص المستخرج خطأ
✅ **الحل:**
- Whisper قد يفهم بعض الكلمات بشكل خاطئ
- حاول التحدث بوضوح أكثر
- لا يوجد حل برمجي حالياً - هذه دقة Whisper API

---

## 📝 ملاحظات مهمة

1. **جميع ملفات الصوت مؤقتة** - لا يتم حفظها على السيرفر
2. **الصوت يُنشأ في الوقت الفعلي** - كل مرة جديد
3. **الصوت يستخدم عرض الإنترنت** - ~200-400 KB لكل رد

---

## 🎉 ملخص

**الملفات الأساسية للصوت:**
1. `/src/app/api/speech-to-text/route.ts` - Whisper API
2. `/src/app/api/text-to-speech/route.ts` - OpenAI TTS
3. `/src/app/teacher/page.tsx` - كل المنطق الصوتي

**الشخصية:**
- `/src/app/teacher/page.tsx` (السطور 56-106) - System Prompt

**الواجهة:**
- `/src/features/personas/implementations/iraqi-teacher/` - جميع المكونات

---

**آخر تحديث:** 2025-10-23
**الإصدار:** 2.0 (مع زر الإيقاف ومؤشرات التقدم)
