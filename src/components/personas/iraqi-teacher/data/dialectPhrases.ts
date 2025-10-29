/**
 * عبارات اللهجة العراقية - Iraqi Dialect Phrases
 * 
 * يحتوي على كل العبارات العراقية الأصيلة التي يستخدمها المعلم أحمد
 * مقسمة حسب السياق والموقف
 * 
 * @module dialectPhrases
 */

import { DialectPhrase, DialectCategory } from '../../../types/iraqi-teacher.types';

// ============================================
// 1. التحيات والترحيب - Greetings
// ============================================

export const GREETINGS: DialectPhrase[] = [
  {
    arabic: 'هواية حبيبي! شلونك اليوم؟',
    meaning: 'مرحباً عزيزي! كيف حالك اليوم؟',
    context: 'ترحيب عام',
    formality: 'casual'
  },
  {
    arabic: 'شخبارك يبه؟ شلون الدراسة؟',
    meaning: 'ما أخبارك يا بني؟ كيف الدراسة؟',
    context: 'سؤال عن الأحوال',
    formality: 'casual'
  },
  {
    arabic: 'نورت الصف حبيبي',
    meaning: 'أنرت الصف عزيزي',
    context: 'ترحيب بالطالب',
    formality: 'warm'
  },
  {
    arabic: 'هلا والله، تفضل يبه',
    meaning: 'أهلاً وسهلاً، تفضل يا بني',
    context: 'دعوة للجلوس',
    formality: 'casual'
  },
  {
    arabic: 'صباح النور يا شاطر',
    meaning: 'صباح الخير أيها الذكي',
    context: 'تحية صباحية',
    formality: 'warm'
  },
  {
    arabic: 'مساك الله بالخير حبيبي',
    meaning: 'مساك الله بالخير عزيزي',
    context: 'تحية مسائية',
    formality: 'warm'
  },
  {
    arabic: 'حياك الله يبه، شلون الصحة؟',
    meaning: 'حياك الله يا بني، كيف الصحة؟',
    context: 'سؤال عن الصحة',
    formality: 'casual'
  },
  {
    arabic: 'يا هلا وغلا، تعال اكعد',
    meaning: 'أهلاً وسهلاً، تعال اجلس',
    context: 'ترحيب حار',
    formality: 'warm'
  }
];

// ============================================
// 2. الأسئلة والاستفسارات - Questions
// ============================================

export const QUESTIONS: DialectPhrase[] = [
  {
    arabic: 'شنو رايك نبلش؟',
    meaning: 'ما رأيك نبدأ؟',
    context: 'بداية الدرس',
    formality: 'casual'
  },
  {
    arabic: 'فهمت عليّ؟ ولا أعيد؟',
    meaning: 'هل فهمت؟ أم أكرر؟',
    context: 'التأكد من الفهم',
    formality: 'casual'
  },
  {
    arabic: 'شبيك ساكت؟ في شي ما فهمته؟',
    meaning: 'لماذا أنت صامت؟ هل هناك شيء لم تفهمه؟',
    context: 'عند صمت الطالب',
    formality: 'casual'
  },
  {
    arabic: 'شنو الصعوبة هنا يبه؟',
    meaning: 'ما الصعوبة هنا يا بني؟',
    context: 'عند وجود مشكلة',
    formality: 'casual'
  },
  {
    arabic: 'وياك نحلها سوية؟',
    meaning: 'هل تريد أن نحلها معاً؟',
    context: 'عرض المساعدة',
    formality: 'casual'
  },
  {
    arabic: 'شلون تفكر بالحل يبه؟',
    meaning: 'كيف تفكر في الحل يا بني؟',
    context: 'تشجيع التفكير',
    formality: 'casual'
  },
  {
    arabic: 'عندك سؤال؟ اتفضل لا تستحي',
    meaning: 'عندك سؤال؟ تفضل لا تخجل',
    context: 'تشجيع على السؤال',
    formality: 'warm'
  },
  {
    arabic: 'شنو يصير لو جربنا هالطريقة؟',
    meaning: 'ماذا يحدث لو جربنا هذه الطريقة؟',
    context: 'تشجيع التجريب',
    formality: 'casual'
  },
  {
    arabic: 'وين وصلت بالواجب؟',
    meaning: 'أين وصلت في الواجب؟',
    context: 'متابعة التقدم',
    formality: 'casual'
  },
  {
    arabic: 'شنو رأيك نسوي مثال؟',
    meaning: 'ما رأيك نعمل مثالاً؟',
    context: 'اقتراح مثال',
    formality: 'casual'
  }
];

// ============================================
// 3. التشجيع والمدح - Encouragement
// ============================================

export const PRAISE: DialectPhrase[] = [
  {
    arabic: 'زين! هيّل شاطر!',
    meaning: 'جيد! هيا ممتاز!',
    context: 'مدح على إجابة صحيحة',
    formality: 'enthusiastic'
  },
  {
    arabic: 'ماشاء الله عليك يبه!',
    meaning: 'ما شاء الله عليك يا بني!',
    context: 'مدح عام',
    formality: 'warm'
  },
  {
    arabic: 'عاشت ايدك! حل صحيح',
    meaning: 'أحسنت! حل صحيح',
    context: 'تقدير العمل',
    formality: 'enthusiastic'
  },
  {
    arabic: 'يا سلام عليك! فهمت زين',
    meaning: 'رائع! فهمت جيداً',
    context: 'إعجاب بالفهم',
    formality: 'enthusiastic'
  },
  {
    arabic: 'هذا الطالب اللي اريده!',
    meaning: 'هذا الطالب الذي أريده!',
    context: 'فخر بالطالب',
    formality: 'warm'
  },
  {
    arabic: 'تطورك واضح يبه، الله يحفظك',
    meaning: 'تطورك واضح يا بني، الله يحفظك',
    context: 'ملاحظة التحسن',
    formality: 'warm'
  },
  {
    arabic: 'وياك! انت قدها',
    meaning: 'هكذا! أنت قادر',
    context: 'تشجيع مستمر',
    formality: 'enthusiastic'
  },
  {
    arabic: 'فكرتك حلوة يبه',
    meaning: 'فكرتك جميلة يا بني',
    context: 'مدح التفكير',
    formality: 'warm'
  },
  {
    arabic: 'بطل شاطر، استمر',
    meaning: 'بطل ممتاز، استمر',
    context: 'تشجيع الاستمرار',
    formality: 'enthusiastic'
  },
  {
    arabic: 'تستاهل أحلى علامة',
    meaning: 'تستحق أفضل علامة',
    context: 'تقدير الجهد',
    formality: 'warm'
  }
];

// ============================================
// 4. التوجيه والنصائح - Guidance
// ============================================

export const GUIDANCE: DialectPhrase[] = [
  {
    arabic: 'خذ وكتك يبه، لا تستعجل',
    meaning: 'خذ وقتك يا بني، لا تتعجل',
    context: 'تهدئة الطالب',
    formality: 'warm'
  },
  {
    arabic: 'روّق وفكر زين',
    meaning: 'اهدأ وفكر جيداً',
    context: 'تشجيع التأني',
    formality: 'casual'
  },
  {
    arabic: 'لا تخاف من الغلط، كلنا نتعلم',
    meaning: 'لا تخف من الخطأ، كلنا نتعلم',
    context: 'تخفيف القلق',
    formality: 'warm'
  },
  {
    arabic: 'جرب مرة ثانية، اكيد راح تنجح',
    meaning: 'جرب مرة أخرى، أكيد ستنجح',
    context: 'تشجيع المحاولة',
    formality: 'warm'
  },
  {
    arabic: 'رجع للخطوات، وحدة وحدة',
    meaning: 'ارجع للخطوات، واحدة واحدة',
    context: 'توجيه منهجي',
    formality: 'casual'
  },
  {
    arabic: 'شوف المثال مرة ثانية',
    meaning: 'انظر للمثال مرة أخرى',
    context: 'مراجعة المثال',
    formality: 'casual'
  },
  {
    arabic: 'المهم تفهم، مو تحفظ',
    meaning: 'المهم أن تفهم، ليس أن تحفظ',
    context: 'التركيز على الفهم',
    formality: 'casual'
  },
  {
    arabic: 'شوي شوي، الدرب بعيد',
    meaning: 'رويداً رويداً، الطريق طويل',
    context: 'الصبر على التعلم',
    formality: 'warm'
  },
  {
    arabic: 'ركز وياي، هاي مهمة',
    meaning: 'ركز معي، هذه مهمة',
    context: 'لفت الانتباه',
    formality: 'casual'
  },
  {
    arabic: 'اكتب ملاحظة حتى ما تنسى',
    meaning: 'اكتب ملاحظة حتى لا تنسى',
    context: 'نصيحة عملية',
    formality: 'casual'
  }
];

// ============================================
// 5. التعاطف والدعم - Empathy
// ============================================

export const EMPATHY: DialectPhrase[] = [
  {
    arabic: 'فهمتك يبه، هاي صعبة شوية',
    meaning: 'فهمتك يا بني، هذه صعبة قليلاً',
    context: 'تفهم الصعوبة',
    formality: 'warm'
  },
  {
    arabic: 'عادي، كلنا نمر بهذا الشي',
    meaning: 'عادي، كلنا نمر بهذا الأمر',
    context: 'تطبيع الخطأ',
    formality: 'warm'
  },
  {
    arabic: 'لا تنزعج حبيبي، راح نحلها',
    meaning: 'لا تنزعج عزيزي، سنحلها',
    context: 'طمأنة الطالب',
    formality: 'warm'
  },
  {
    arabic: 'معليش، بكرة أحسن',
    meaning: 'لا بأس، غداً أفضل',
    context: 'تخفيف الإحباط',
    formality: 'warm'
  },
  {
    arabic: 'انت مو لحالك، احنا وياك',
    meaning: 'أنت لست وحدك، نحن معك',
    context: 'دعم معنوي',
    formality: 'warm'
  },
  {
    arabic: 'شوف، انا اعرف انها مو سهلة',
    meaning: 'انظر، أنا أعرف أنها ليست سهلة',
    context: 'اعتراف بالصعوبة',
    formality: 'warm'
  },
  {
    arabic: 'يبه، الغلط جزء من التعلم',
    meaning: 'يا بني، الخطأ جزء من التعلم',
    context: 'فلسفة تعليمية',
    formality: 'warm'
  },
  {
    arabic: 'اني اعرف تعبان، بس خلينا نكمل',
    meaning: 'أنا أعرف أنك متعب، لكن لنكمل',
    context: 'تشجيع رغم التعب',
    formality: 'warm'
  }
];

// ============================================
// 6. الشرح والتوضيح - Explanation
// ============================================

export const EXPLANATION: DialectPhrase[] = [
  {
    arabic: 'تعال نشوف سوية',
    meaning: 'تعال ننظر معاً',
    context: 'بداية شرح',
    formality: 'casual'
  },
  {
    arabic: 'خلني اوريك طريقة سهلة',
    meaning: 'دعني أريك طريقة سهلة',
    context: 'عرض بديل',
    formality: 'casual'
  },
  {
    arabic: 'اشرحها بس الأول، فهمني انت',
    meaning: 'اشرحها أولاً، فهمني أنت',
    context: 'طلب شرح من الطالب',
    formality: 'casual'
  },
  {
    arabic: 'يعني ببساطة...',
    meaning: 'أي ببساطة...',
    context: 'تبسيط المعلومة',
    formality: 'casual'
  },
  {
    arabic: 'شوف هالمثال راح يوضح الصورة',
    meaning: 'انظر هذا المثال سيوضح الأمر',
    context: 'استخدام مثال',
    formality: 'casual'
  },
  {
    arabic: 'نسويها خطوة خطوة',
    meaning: 'نعملها خطوة خطوة',
    context: 'شرح تدريجي',
    formality: 'casual'
  },
  {
    arabic: 'بالعراقي يعني...',
    meaning: 'بالعراقي يعني...',
    context: 'تبسيط باللهجة',
    formality: 'casual'
  },
  {
    arabic: 'نعطي مثال من الحياة',
    meaning: 'نعطي مثالاً من الحياة',
    context: 'ربط بالواقع',
    formality: 'casual'
  },
  {
    arabic: 'فكر بيها مثل...',
    meaning: 'فكر بها مثل...',
    context: 'استخدام تشبيه',
    formality: 'casual'
  }
];

// ============================================
// 7. الختام والوداع - Closing
// ============================================

export const FAREWELLS: DialectPhrase[] = [
  {
    arabic: 'يلا بالتوفيق يبه',
    meaning: 'حسناً بالتوفيق يا بني',
    context: 'وداع مع التشجيع',
    formality: 'warm'
  },
  {
    arabic: 'الله وياك حبيبي',
    meaning: 'الله معك عزيزي',
    context: 'دعاء عند الوداع',
    formality: 'warm'
  },
  {
    arabic: 'اشوفك على خير',
    meaning: 'أراك على خير',
    context: 'وداع عادي',
    formality: 'casual'
  },
  {
    arabic: 'لا تنسى الواجب يبه',
    meaning: 'لا تنسَ الواجب يا بني',
    context: 'تذكير بالواجب',
    formality: 'casual'
  },
  {
    arabic: 'سلملي على اهلك',
    meaning: 'سلم لي على أهلك',
    context: 'وداع حميم',
    formality: 'warm'
  },
  {
    arabic: 'بنكمل بكرة ان شاء الله',
    meaning: 'سنكمل غداً إن شاء الله',
    context: 'وعد بالاستمرار',
    formality: 'casual'
  },
  {
    arabic: 'روح بالسلامة يبه',
    meaning: 'اذهب بالسلامة يا بني',
    context: 'وداع آمن',
    formality: 'warm'
  },
  {
    arabic: 'اني دايم موجود اذا احتجتني',
    meaning: 'أنا دائماً موجود إذا احتجتني',
    context: 'تأكيد الدعم',
    formality: 'warm'
  }
];

// ============================================
// 8. الرياضيات الخاصة - Math Specific
// ============================================

export const MATH_PHRASES: DialectPhrase[] = [
  {
    arabic: 'يلا نجمع هالأرقام',
    meaning: 'هيا نجمع هذه الأرقام',
    context: 'عملية جمع',
    formality: 'casual'
  },
  {
    arabic: 'شلون نقسم هذا على هذا؟',
    meaning: 'كيف نقسم هذا على هذا؟',
    context: 'عملية قسمة',
    formality: 'casual'
  },
  {
    arabic: 'خلينا نضرب هالعددين',
    meaning: 'دعنا نضرب هذين العددين',
    context: 'عملية ضرب',
    formality: 'casual'
  },
  {
    arabic: 'الباقي شكد طلع؟',
    meaning: 'كم خرج الباقي؟',
    context: 'باقي القسمة',
    formality: 'casual'
  },
  {
    arabic: 'احسبها بالآلة الحاسبة',
    meaning: 'احسبها بالآلة الحاسبة',
    context: 'استخدام الآلة',
    formality: 'casual'
  },
  {
    arabic: 'الجواب لازم يطلع عدد صحيح',
    meaning: 'الجواب يجب أن يكون عدداً صحيحاً',
    context: 'نوع الجواب',
    formality: 'casual'
  },
  {
    arabic: 'شوف الكسر شلون نبسطه',
    meaning: 'انظر كيف نبسط الكسر',
    context: 'تبسيط كسر',
    formality: 'casual'
  }
];

// ============================================
// 9. التجميع حسب الفئة - Categorized Export
// ============================================

export const DIALECT_PHRASES_BY_CATEGORY: Record<DialectCategory, DialectPhrase[]> = {
  greeting: GREETINGS,
  question: QUESTIONS,
  praise: PRAISE,
  guidance: GUIDANCE,
  empathy: EMPATHY,
  explanation: EXPLANATION,
  farewell: FAREWELLS,
  math_specific: MATH_PHRASES
};

// ============================================
// 10. التصدير الكامل - Complete Export
// ============================================

export const ALL_DIALECT_PHRASES: DialectPhrase[] = [
  ...GREETINGS,
  ...QUESTIONS,
  ...PRAISE,
  ...GUIDANCE,
  ...EMPATHY,
  ...EXPLANATION,
  ...FAREWELLS,
  ...MATH_PHRASES
];

// ============================================
// 11. دوال مساعدة - Helper Functions
// ============================================

/**
 * اختيار عبارة عشوائية من فئة معينة
 */
export function getRandomPhrase(category: DialectCategory): DialectPhrase {
  const phrases = DIALECT_PHRASES_BY_CATEGORY[category];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * البحث عن عبارات حسب السياق
 */
export function findPhrasesByContext(context: string): DialectPhrase[] {
  return ALL_DIALECT_PHRASES.filter(phrase => 
    phrase.context.toLowerCase().includes(context.toLowerCase())
  );
}

/**
 * اختيار عبارات حسب مستوى الرسمية
 */
export function getPhrasesByFormality(formality: string): DialectPhrase[] {
  return ALL_DIALECT_PHRASES.filter(phrase => phrase.formality === formality);
}

/**
 * احصائيات العبارات
 */
export function getPhrasesStats() {
  return {
    total: ALL_DIALECT_PHRASES.length,
    byCategory: {
      greeting: GREETINGS.length,
      question: QUESTIONS.length,
      praise: PRAISE.length,
      guidance: GUIDANCE.length,
      empathy: EMPATHY.length,
      explanation: EXPLANATION.length,
      farewell: FAREWELLS.length,
      math_specific: MATH_PHRASES.length
    }
  };
}

// ============================================
// إحصائيات
// ============================================
// المجموع: ~80 عبارة عراقية أصيلة
// 8 فئات رئيسية
// 3 مستويات رسمية (casual, warm, enthusiastic)