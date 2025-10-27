# 🤖 Developer Assistant

نظام متقدم للتحكم في مشاريعك المحلية من واجهة الويب!

## 🎯 ما هو Developer Assistant؟

Developer Assistant يسمح لك بالتحكم في ملفات مشروعك المحلي **مباشرة من المتصفح**:

- 📖 قراءة الملفات
- ✏️ كتابة وتعديل الملفات
- 🗑️ حذف الملفات
- 📋 عرض قائمة الملفات
- 🔍 عمليات Git (Status, Commit, Push)

## 📁 الهيكل المضاف

```
src/
├── types/
│   └── developer.ts              ✅ جميع الأنواع
│
├── lib/developer/
│   ├── api-key-manager.ts        ✅ إدارة API Keys
│   ├── security.ts               ✅ التأمين والتحقق
│   ├── command-parser.ts         ✅ تحليل الأوامر
│   └── file-operations.ts        ✅ عمليات الملفات
│
├── components/developer/
│   ├── DevAssistant.tsx          ✅ المكون الرئيسي
│   ├── SetupWizard.tsx           ✅ معالج الإعداد
│   ├── CommandInput.tsx          ✅ إدخال الأوامر
│   ├── ConnectionStatus.tsx      ✅ حالة الاتصال
│   └── ApiKeyManager.tsx         ✅ إدارة المفاتيح
│
├── app/
│   ├── developer/
│   │   ├── page.tsx              ✅ الصفحة الرئيسية
│   │   └── layout.tsx            ✅ Layout
│   │
│   └── api/dev/
│       ├── commands/
│       │   └── route.ts          ✅ تنفيذ الأوامر
│       └── auth/
│           ├── verify/
│           │   └── route.ts      ✅ التحقق من API Key
│           └── generate/
│               └── route.ts      ✅ توليد API Key
```

## 🚀 كيفية الاستخدام

### 1️⃣ **افتح صفحة Developer**

```
http://localhost:3000/developer
```

### 2️⃣ **اتبع معالج الإعداد**

سيتم توجيهك خلال 3 خطوات:
1. توليد API Key
2. تثبيت Dev Server (قريباً)
3. تشغيل Dev Server

### 3️⃣ **ابدأ بتنفيذ الأوامر!**

اختر نوع الأمر وأدخل المعلومات المطلوبة.

## 🎨 المميزات المتوفرة

### ✅ **الأوامر الآمنة** (لا تحتاج موافقة)
- 📖 قراءة ملف
- 📋 عرض قائمة الملفات
- 🔍 Git Status

### ⚠️ **الأوامر المتوسطة**
- ✏️ كتابة ملف
- 📁 إنشاء مجلد
- 💾 Git Commit

### 🔴 **الأوامر الخطرة** (تحتاج موافقة)
- 🗑️ حذف ملف
- ⬆️ Git Push
- ⬇️ Git Pull

## 🔐 الأمان

تم تطبيق عدة طبقات أمان:

1. **API Key Authentication**: كل طلب يحتاج API Key صالح
2. **Path Validation**: منع Path Traversal
3. **Content Sanitization**: تنظيف المحتوى الخطير
4. **Whitelist System**: فقط المسارات المسموحة
5. **Command Blocking**: منع الأوامر الخطرة

## 📦 الخطوة التالية: NPM Package

سيتم إنشاء `oqool-dev-server` كـ NPM Package منفصل يتم تثبيته في المشروع المحلي:

```bash
# تثبيت
npm install -g oqool-dev-server

# تشغيل
oqool-dev start --api-key your_api_key_here
```

## 🧪 الاختبار المحلي

```bash
# بناء المشروع
npm run build

# تشغيل في وضع التطوير
npm run dev

# فتح صفحة Developer
open http://localhost:3000/developer
```

## 💡 أمثلة الاستخدام

### قراءة ملف
```
نوع: قراءة ملف
المسار: src/app/page.tsx
```

### كتابة ملف
```
نوع: كتابة ملف
المسار: src/test.txt
المحتوى: مرحباً بالعالم!
```

### عرض الملفات
```
نوع: عرض الملفات
المسار: src/components
```

## 🎯 الحالة الحالية

### ✅ **مكتمل**
- [x] Types و Interfaces
- [x] API Routes للأوامر والمصادقة
- [x] مكتبات الأمان وعمليات الملفات
- [x] مكونات UI كاملة
- [x] صفحات Developer
- [x] Build ينجح بدون أخطاء

### ⏳ **قيد التطوير**
- [ ] NPM Package (oqool-dev-server)
- [ ] WebSocket للـ Real-time
- [ ] عمليات Git الكاملة
- [ ] نظام الموافقة على التعديلات

### 🔜 **المستقبل**
- [ ] دعم Multiple Projects
- [ ] Command History
- [ ] File Diff Viewer
- [ ] Terminal Output

## 🤝 المساهمة

أي أسئلة أو اقتراحات؟ افتح Issue أو Pull Request!

---

صُنع بـ ❤️ لجعل التطوير أسهل
