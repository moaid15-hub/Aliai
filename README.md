# oqool - منصة الذكاء الاصطناعي العربية

![oqool](https://via.placeholder.com/800x400/6366f1/ffffff?text=oqool)

## 🚀 نظرة عامة

**oqool** هو مساعد ذكي متقدم مطور خصيصاً للمستخدمين العرب. يدعم عدة نماذج ذكاء اصطناعي ويوفر واجهة مستخدم عصرية وسهلة الاستخدام مع إمكانيات متقدمة للبحث والتفاعل.

## 🤖 النماذج المدعومة

- **oqool** (OpenAI) - متخصص في الفهم العميق والإجابات الدقيقة
- **Claude oqool** - يتميز بالتحليل المفصل والإجابات المتوازنة  
- **DeepSeek oqool** - يركز على الحلول العملية والتفكير المنطقي

### ✨ المميزات الرئيسية

- 🤖 **ذكاء اصطناعي متقدم**: ردود ذكية ومفيدة باللغة العربية
- 🌍 **دعم RTL كامل**: تصميم مثالي للغة العربية
- ⚡ **أداء عالي**: بناء على Next.js 14 مع تحسينات متقدمة
- 🎨 **تصميم حديث**: واجهة أنيقة مع تأثيرات تفاعلية
- 🔐 **نظام أمان**: مصادقة آمنة وحماية البيانات
- 📱 **متجاوب**: يعمل على جميع الأجهزة والشاشات

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 14.1.0** - إطار عمل React متقدم
- **React 18.2.0** - مكتبة واجهة المستخدم
- **TypeScript 5.3.3** - لغة برمجة قوية مع دعم الأنواع
- **Tailwind CSS 3.4.1** - إطار عمل CSS حديث

### أدوات التطوير
- **ESLint** - لضمان جودة الكود
- **PostCSS & Autoprefixer** - معالجة CSS متقدمة
- **Lucide React** - مكتبة أيقونات حديثة

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+ 
- npm أو yarn

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/moaid15-hub/nextjs-boilerplate.git

# الانتقال للمجلد
cd nextjs-boilerplate

# تثبيت الحزم
npm install

# تشغيل الخادم المحلي
npm run dev
```

المشروع سيعمل على: `http://localhost:3000`

### بيانات التجربة

للوصول للمنصة، استخدم البيانات التالية:

**تسجيل الدخول:**
- البريد الإلكتروني: `admin@oqool.ai`
- كلمة المرور: `12345678`

**إنشاء حساب جديد:**
- يمكن استخدام أي بيانات صحيحة (تجنب `test@test.com`)

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── globals.css          # الأنماط العامة
│   ├── layout.tsx           # التخطيط الأساسي
│   ├── page.tsx             # الصفحة الرئيسية
│   ├── auth/
│   │   ├── login/           # صفحة تسجيل الدخول
│   │   └── register/        # صفحة إنشاء الحساب
│   ├── chat/                # واجهة الدردشة الذكية
│   └── components/          # مكونات قابلة للإعادة الاستخدام
├── next.config.js           # إعدادات Next.js
├── tailwind.config.js       # إعدادات Tailwind
├── tsconfig.json           # إعدادات TypeScript
└── package.json            # حزم وسكريبتس
```

## 🎯 الميزات المتوفرة

### 1. نظام المصادقة
- ✅ تسجيل الدخول الآمن
- ✅ إنشاء حسابات جديدة
- ✅ التحقق من البيانات
- ✅ حماية المسارات

### 2. واجهة الدردشة
- ✅ محادثة تفاعلية مع AI
- ✅ ردود ذكية باللغة العربية
- ✅ مؤشرات الكتابة
- ✅ تاريخ المحادثات

### 3. التصميم
- ✅ واجهة حديثة وأنيقة
- ✅ تأثيرات تفاعلية
- ✅ تصميم متجاوب
- ✅ دعم الوضع الليلي (قيد التطوير)

## 🔧 سكريبتس متاحة

```bash
# تشغيل الخادم المحلي
npm run dev

# بناء المشروع للإنتاج
npm run build

# تشغيل المشروع المبني
npm run start

# فحص الكود
npm run lint
```

## 🌐 النشر

### Vercel (موصى به)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel
```

### Netlify

```bash
# بناء المشروع
npm run build

# رفع مجلد out/ إلى Netlify
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔮 خطط المستقبل

- [ ] **نظام Backend حقيقي**: API متكامل مع قاعدة بيانات
- [ ] **ذكاء اصطناعي متقدم**: تكامل مع GPT-4 أو Claude
- [ ] **حفظ المحادثات**: نظام قاعدة بيانات للمحادثات
- [ ] **تطبيق الجوال**: React Native أو Flutter
- [ ] **نظام الاشتراكات**: خطط مدفوعة ومجانية
- [ ] **API عام**: واجهة برمجة للمطورين

## 🤝 المساهمة

نرحب بالمساهمات! لإضافة ميزة أو إصلاح خطأ:

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📧 التواصل

- **المطور**: [moaid15-hub](https://github.com/moaid15-hub)
- **المشروع**: [nextjs-boilerplate](https://github.com/moaid15-hub/nextjs-boilerplate)

## 🙏 شكر وتقدير

- [Next.js](https://nextjs.org) - إطار العمل الأساسي
- [Tailwind CSS](https://tailwindcss.com) - نظام التصميم
- [Lucide](https://lucide.dev) - مكتبة الأيقونات
- [Vercel](https://vercel.com) - منصة النشر

---

<div align="center">
  
**صنع بـ ❤️ للمجتمع العربي**

[🌟 Star المشروع](https://github.com/moaid15-hub/nextjs-boilerplate) • [🐛 Report Bug](https://github.com/moaid15-hub/nextjs-boilerplate/issues) • [💡 Request Feature](https://github.com/moaid15-hub/nextjs-boilerplate/issues)

</div>