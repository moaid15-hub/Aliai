# 🔐 Environment Variables المطلوبة

## كيفية الإعداد:

1. أنشئ ملف `.env.local` في المجلد الرئيسي للمشروع
2. انسخ المحتوى التالي في الملف
3. استبدل القيم بالمفاتيح الحقيقية

```env
# ============================================
# 🤖 AI Provider API Keys (مطلوبة)
# ============================================

# OpenAI API Key - احصل عليه من: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Claude (Anthropic) API Key - احصل عليه من: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# DeepSeek API Key - احصل عليه من: https://platform.deepseek.com/
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# 🔍 Search API Keys (مطلوبة للبحث)
# ============================================

# Google Search API Key - احصل عليه من: https://console.cloud.google.com/
GOOGLE_SEARCH_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Search Engine ID - احصل عليه من: https://cse.google.com/
GOOGLE_SEARCH_ENGINE_ID=xxxxxxxxxxxxxxxxx

# YouTube API Key - احصل عليه من: https://console.cloud.google.com/
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Tavily Search API Key - احصل عليه من: https://tavily.com/
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# 🌐 Optional Settings
# ============================================

NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 روابط الحصول على API Keys:

### 🤖 **AI Providers:**
- **OpenAI**: https://platform.openai.com/api-keys
- **Claude (Anthropic)**: https://console.anthropic.com/
- **DeepSeek**: https://platform.deepseek.com/

### 🔍 **Search APIs:**
- **Google Cloud Console**: https://console.cloud.google.com/
  - فعّل Custom Search API
  - فعّل YouTube Data API v3
- **Google Custom Search Engine**: https://cse.google.com/
- **Tavily Search**: https://tavily.com/

## ⚠️ ملاحظات مهمة:

1. **لا تشارك هذه المفاتيح علناً** - احفظها بأمان
2. **أضف `.env.local` إلى `.gitignore`** (مضاف تلقائياً في Next.js)
3. **أعد تشغيل الخادم** بعد إضافة المفاتيح:
   ```bash
   npm run dev
   ```
4. **للإنتاج (Production)**: أضف المفاتيح في Vercel Dashboard
   - راجع ملف `VERCEL_ENV_SETUP.md` للتفاصيل

## ✅ التحقق من نجاح الإعداد:

بعد إضافة المفاتيح وإعادة تشغيل الخادم:

1. افتح `http://localhost:3000/chat`
2. جرّب السؤال: **"ابحث عن الذكاء الاصطناعي"**
3. يجب أن ترى:
   - ✅ نتائج بحث من Google
   - ✅ نتائج من YouTube  
   - ✅ رد من AI

## 🆘 المساعدة:

إذا واجهت مشاكل:
- تحقق من صحة المفاتيح
- تحقق من عدم وجود مسافات زائدة
- راجع console.log للأخطاء
- تأكد من تفعيل الـ APIs في Google Cloud Console

