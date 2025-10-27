// ============================================
// 🛡️ نظام الحماية من المحتوى غير المناسب
// ============================================

// قائمة الكلمات المحظورة (عربي + إنجليزي)
const BLOCKED_KEYWORDS = [
  // محتوى جنسي - عربي
  'جنس', 'جنسي', 'جنسية', 'سكس', 'نيك', 'نياكة',
  'عاهرة', 'عاهرات', 'شرموطة', 'قحبة', 'متعة جنسية',
  'إباحي', 'إباحية', 'بورنو', 'أفلام إباحية',
  'عورة', 'عاري', 'عارية', 'تعري', 'عري',
  'فيديوهات جنسية', 'صور جنسية', 'محتوى للكبار',
  'xxx', 'adult', 'porn', 'sex', 'xxx videos',
  'نساء عاريات', 'رجال عراة', 'مشاهد ساخنة',
  'علاقة حميمة', 'علاقات غير شرعية',

  // كلمات بذيئة - لهجات عربية
  'طيز', 'زب', 'عير', 'اركعك من ور', 'كم بيه',
  'ابو العيوره', 'اخ الكحبه', 'كحاب', 'كحبه',
  'مناويج', 'لواطه', 'لواط', 'خلاعي', 'خلاعة',
  'رقص خلاعي', 'رقص ساخن',
  'انيجك', 'كس', 'زبوبه', 'كساسه', 'طيازه',

  // محتوى جنسي - إنجليزي
  'porn', 'pornography', 'xxx', 'adult content',
  'sex video', 'nude', 'naked', 'nsfw',
  'erotic', 'sexual', 'sex', 'sexuality',
  'strip', 'stripper', 'prostitute', 'escort',
  'hookup', 'dating app', 'onlyfans',

  // مواقع معروفة
  'pornhub', 'xvideos', 'xnxx', 'redtube',
  'youporn', 'brazzers', 'onlyfans',

  // كلمات مشبوهة إضافية
  'محارم', 'اغتصاب', 'تحرش جنسي', 'rape',
  'incest', 'pedophile', 'child abuse'
];

// كلمات تحذيرية (قد تكون مشبوهة حسب السياق)
const WARNING_KEYWORDS = [
  'أفلام', 'فيديوهات', 'صور', 'بنات', 'نساء',
  'girls', 'women', 'hot', 'sexy', 'beautiful',
  'dating', 'romance', 'love', 'relationship'
];

// مواقع محظورة
const BLOCKED_DOMAINS = [
  'pornhub.com', 'xvideos.com', 'xnxx.com',
  'redtube.com', 'youporn.com', 'brazzers.com',
  'onlyfans.com', 'chaturbate.com', 'livejasmin.com',
  'xhamster.com', 'tube8.com', 'spankwire.com',
  'keezmovies.com', 'extremetube.com'
];

// ============================================
// 🔍 فحص النص من المحتوى المحظور
// ============================================

export interface ContentFilterResult {
  isAllowed: boolean;
  reason?: string;
  blockedKeywords?: string[];
  severity: 'safe' | 'warning' | 'blocked';
}

export function filterContent(text: string): ContentFilterResult {
  const lowerText = text.toLowerCase().trim();

  // 1. فحص الكلمات المحظورة
  const foundBlockedKeywords = BLOCKED_KEYWORDS.filter(keyword =>
    lowerText.includes(keyword.toLowerCase())
  );

  if (foundBlockedKeywords.length > 0) {
    console.log('🛡️ محتوى محظور تم اكتشافه:', foundBlockedKeywords);
    return {
      isAllowed: false,
      reason: 'يحتوي على محتوى غير مناسب',
      blockedKeywords: foundBlockedKeywords,
      severity: 'blocked'
    };
  }

  // 2. فحص الكلمات التحذيرية
  const foundWarningKeywords = WARNING_KEYWORDS.filter(keyword =>
    lowerText.includes(keyword.toLowerCase())
  );

  if (foundWarningKeywords.length >= 2) {
    // إذا وُجدت كلمتين تحذيريتين أو أكثر، قد يكون مشبوهاً
    console.log('⚠️ محتوى مشبوه تم اكتشافه:', foundWarningKeywords);
    return {
      isAllowed: true, // نسمح لكن نحذر
      reason: 'محتوى قد يكون حساساً',
      blockedKeywords: foundWarningKeywords,
      severity: 'warning'
    };
  }

  // 3. المحتوى آمن
  return {
    isAllowed: true,
    severity: 'safe'
  };
}

// ============================================
// 🌐 فحص الروابط من المواقع المحظورة
// ============================================

export function filterURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    // فحص النطاقات المحظورة
    const isBlocked = BLOCKED_DOMAINS.some(blockedDomain =>
      domain.includes(blockedDomain)
    );

    if (isBlocked) {
      console.log('🛡️ موقع محظور تم اكتشافه:', domain);
      return false;
    }

    return true;
  } catch (error) {
    // في حالة خطأ في الرابط، نسمح به (ليس موقعاً محظوراً)
    return true;
  }
}

// ============================================
// 🧹 تنظيف نتائج البحث
// ============================================

export function filterSearchResults(results: any[]): any[] {
  if (!results || !Array.isArray(results)) {
    return [];
  }

  return results.filter(result => {
    // 1. فحص الرابط
    if (result.url && !filterURL(result.url)) {
      console.log('🛡️ تم حظر نتيجة بحث (رابط محظور):', result.url);
      return false;
    }

    // 2. فحص العنوان
    if (result.title) {
      const titleCheck = filterContent(result.title);
      if (!titleCheck.isAllowed) {
        console.log('🛡️ تم حظر نتيجة بحث (عنوان محظور):', result.title);
        return false;
      }
    }

    // 3. فحص الوصف
    if (result.snippet || result.content) {
      const contentCheck = filterContent(result.snippet || result.content);
      if (!contentCheck.isAllowed) {
        console.log('🛡️ تم حظر نتيجة بحث (محتوى محظور):', result.snippet || result.content);
        return false;
      }
    }

    return true;
  });
}

// ============================================
// 📝 رسالة الرفض
// ============================================

export function getBlockedMessage(): string {
  return `عذراً 🛡️

لا يمكنني مساعدتك في هذا الموضوع. نحن ملتزمون بتوفير محتوى آمن ومناسب للجميع.

إذا كان لديك سؤال آخر، أنا هنا لمساعدتك! 😊`;
}

// ============================================
// 🔒 رسالة التحذير
// ============================================

export function getWarningMessage(): string {
  return `⚠️ تنبيه: يرجى التأكد من أن سؤالك مناسب ولا يحتوي على محتوى غير لائق.

سأحاول مساعدتك، لكن يرجى الالتزام بسياسة المحتوى المناسب.`;
}

// ============================================
// 📊 تصدير الدوال
// ============================================

export default {
  filterContent,
  filterURL,
  filterSearchResults,
  getBlockedMessage,
  getWarningMessage
};
