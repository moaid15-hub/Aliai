# نشر Frontend على Vercel

## متغيرات البيئة المطلوبة

يجب إضافة المتغيرات التالية في Vercel Dashboard:

### Production
```
NEXT_PUBLIC_API_URL=https://api.oqool.net
NEXT_PUBLIC_WS_URL=wss://api.oqool.net/ws
NODE_ENV=production
```

## خطوات النشر

1. افتح مشروعك في Vercel Dashboard
2. اذهب إلى Settings → Environment Variables
3. أضف المتغيرات المذكورة أعلاه
4. اضغط Save
5. أعد نشر المشروع (Redeploy)

## ملاحظات مهمة
- ✅ الكود الآن يتصل بـ Backend الحقيقي (api.oqool.net)
- ✅ تم إزالة جميع الردود التجريبية (mock responses)
- ✅ يجب ضبط المتغيرات في Vercel لكي يعمل بشكل صحيح
- ⚠️ لا تنسى إضافة CORS في Backend للسماح بـ oqool.net

## اختبار محلي
للتطوير المحلي:
```bash
cp .env.example .env.local
# عدّل .env.local إذا كنت تريد الاتصال بـ localhost
npm run dev
```
