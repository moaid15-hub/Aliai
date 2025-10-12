# دليل إضافة الدومين المخصص oqool.net إلى AWS Amplify

## المطلوب
- الدومين: `oqool.net`
- الوصول إلى إعدادات DNS عند مزود الدومين (GoDaddy, Namecheap, إلخ)

## الخطوات المطلوبة:

### 1. إضافة الدومين في AWS Amplify Console

1. **افتح AWS Amplify Console:**
   ```
   https://console.aws.amazon.com/amplify/
   ```

2. **اختر تطبيقك** (nextjs-boilerplate)

3. **اضغط على "Domain management"** في القائمة الجانبية

4. **اضغط "Add domain"**

5. **أدخل الدومين:**
   - Domain: `oqool.net`
   - اختر "I don't own this domain yet" أو "I already own this domain"

6. **إعداد Subdomains:**
   - `oqool.net` → dev (main branch)
   - `www.oqool.net` → dev (main branch)

### 2. الحصول على DNS Records

بعد إضافة الدومين، ستحصل على:

#### للدومين الرئيسي (oqool.net):
```
Type: A
Name: @
Value: [AWS IP Address]
```

#### للدومين الفرعي (www.oqool.net):
```
Type: CNAME  
Name: www
Value: [AWS CNAME Value]
```

### 3. إضافة DNS Records عند مزود الدومين

1. **انتقل إلى لوحة تحكم مزود الدومين** (GoDaddy, Namecheap, إلخ)

2. **اذهب إلى DNS Management**

3. **أضف/عدّل Records:**

   **A Record:**
   - Type: `A`
   - Host: `@` (أو اتركه فارغ)
   - Points to: [AWS IP من Amplify]
   - TTL: `600` (أو Auto)

   **CNAME Record:**
   - Type: `CNAME`
   - Host: `www`
   - Points to: [AWS CNAME من Amplify]
   - TTL: `600` (أو Auto)

### 4. انتظار التحقق

- **الوقت المطلوب:** 24-48 ساعة
- **التحقق:** AWS ستتحقق تلقائياً من DNS
- **شهادة SSL:** ستُنشأ تلقائياً

### 5. اختبار الدومين

بعد اكتمال التحقق:
```
https://oqool.net
https://www.oqool.net
```

## ملاحظات مهمة:

1. **احتفظ بالدومين القديم** حتى يعمل الجديد بالكامل
2. **تأكد من أن DNS propagation مكتمل** باستخدام:
   ```
   nslookup oqool.net
   ```
3. **شهادة SSL ستكون مجانية** من AWS Certificate Manager

## مزودي الدومين الشائعين:

### GoDaddy:
- DNS Management → Manage DNS → Add Record

### Namecheap:
- Advanced DNS → Add New Record

### Cloudflare:
- DNS → Add record

---

## الحالة الحالية لموقعك:
- **الدومين الحالي:** `https://dev.d1crctfeiqoa3y.amplifyapp.com`
- **الدومين المطلوب:** `https://oqool.net`
- **النوع:** Next.js مع AI Chat
- **المنصة:** AWS Amplify

ستبقى كلا الدومينين يعملان حتى تقرر إيقاف الدومين المؤقت.