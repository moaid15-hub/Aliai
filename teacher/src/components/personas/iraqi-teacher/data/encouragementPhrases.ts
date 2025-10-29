/**
 * عبارات التشجيع العراقية - Iraqi Encouragement Phrases
 * 
 * نظام تشجيع متدرج حسب أداء الطالب ومستواه
 * يحتوي على عبارات للنجاح، المحاولة، التحسن، والدعم
 * 
 * @module encouragementPhrases
 * @path src/components/personas/iraqi-teacher/data/encouragementPhrases.ts
 */

import { 
  EncouragementPhrase, 
  PerformanceLevel,
  EncouragementType 
} from '../../../types/iraqi-teacher.types';

// ============================================
// 1. تشجيع النجاح الكامل - Perfect Success
// ============================================

export const PERFECT_SUCCESS: EncouragementPhrase[] = [
  {
    phrase: 'ماشاء الله! ١٠٠٪ صح! انت بطل حقيقي يبه! 🌟',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '🌟',
    useCase: 'حل كامل بدون أخطاء'
  },
  {
    phrase: 'يا سلام عليك! كل شي صح! عاشت ايدك حبيبي! 👏',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '👏',
    useCase: 'أداء ممتاز'
  },
  {
    phrase: 'وياااك! فوق الممتاز! انت فخر للصف! 🏆',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '🏆',
    useCase: 'تفوق استثنائي'
  },
  {
    phrase: 'هذا الشاطر اللي اعرفه! شغل احترافي يبه! ⭐',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '⭐',
    useCase: 'عمل احترافي'
  },
  {
    phrase: 'الله يحفظك! حل نموذجي! انت مثال للطلاب! 🎯',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '🎯',
    useCase: 'حل نموذجي'
  },
  {
    phrase: 'براڤو عليك! ما شاء الله شغل متقن! 💪',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '💪',
    useCase: 'إتقان العمل'
  },
  {
    phrase: 'يا ابن الحلال! كلشي مضبوط! تستاهل أحسن جايزة! 🎁',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '🎁',
    useCase: 'عمل مضبوط تماماً'
  }
];

// ============================================
// 2. تشجيع الأداء الجيد - Good Performance
// ============================================

export const GOOD_PERFORMANCE: EncouragementPhrase[] = [
  {
    phrase: 'زين جداً يبه! شغل حلو! بس خلينا نصلح هاي الصغيرة 👍',
    performanceLevel: 'good',
    type: 'success',
    emoji: '👍',
    useCase: 'أداء جيد مع أخطاء بسيطة'
  },
  {
    phrase: 'ممتاز حبيبي! فاهم زين، بس انتبه لهاي النقطة 📝',
    performanceLevel: 'good',
    type: 'success',
    emoji: '📝',
    useCase: 'فهم جيد مع ملاحظة'
  },
  {
    phrase: 'شغل حلو! قريب من الكامل! نكمل شوية ونخلص 😊',
    performanceLevel: 'good',
    type: 'success',
    emoji: '😊',
    useCase: 'قريب من الإجابة الكاملة'
  },
  {
    phrase: 'تمام! على الطريق الصح! خلينا نحسن هاي 🎯',
    performanceLevel: 'good',
    type: 'success',
    emoji: '🎯',
    useCase: 'اتجاه صحيح'
  },
  {
    phrase: 'حلو يبه! فهمت الفكرة، بس انتبه للتفاصيل 🔍',
    performanceLevel: 'good',
    type: 'success',
    emoji: '🔍',
    useCase: 'فهم عام جيد'
  },
  {
    phrase: 'زين! اكو تحسن واضح! نكمل بنفس الروح 💫',
    performanceLevel: 'good',
    type: 'progress',
    emoji: '💫',
    useCase: 'ملاحظة تحسن'
  },
  {
    phrase: 'شغل منظم وحلو! نضبط بعض النقاط ويصير توب ✨',
    performanceLevel: 'good',
    type: 'success',
    emoji: '✨',
    useCase: 'عمل منظم'
  }
];

// ============================================
// 3. تشجيع المحاولة - Effort Recognition
// ============================================

export const EFFORT_RECOGNITION: EncouragementPhrase[] = [
  {
    phrase: 'شفت المجهود يبه! هذا اللي اريده! نكمل سوية 💪',
    performanceLevel: 'average',
    type: 'effort',
    emoji: '💪',
    useCase: 'تقدير المجهود'
  },
  {
    phrase: 'حاولت زين حبيبي! خلينا نصلح ونتعلم من الغلط 📚',
    performanceLevel: 'average',
    type: 'effort',
    emoji: '📚',
    useCase: 'محاولة جيدة'
  },
  {
    phrase: 'تفكيرك صح! بس التطبيق يحتاج شوية تمرين 🎓',
    performanceLevel: 'average',
    type: 'effort',
    emoji: '🎓',
    useCase: 'تفكير صحيح'
  },
  {
    phrase: 'اشوف الجهد واضح! نكمل بنفس الحماس 🔥',
    performanceLevel: 'average',
    type: 'effort',
    emoji: '🔥',
    useCase: 'جهد واضح'
  },
  {
    phrase: 'محاولة شجاعة يبه! الغلط جزء من التعلم 🌱',
    performanceLevel: 'average',
    type: 'effort',
    emoji: '🌱',
    useCase: 'محاولة جريئة'
  },
  {
    phrase: 'ما استسلمت، وهذا اللي يهمني! نعيد سوية 🤝',
    performanceLevel: 'average',
    type: 'effort',
    emoji: '🤝',
    useCase: 'عدم استسلام'
  },
  {
    phrase: 'عندك روح التحدي! خلينا نشتغل على الضعف 💡',
    performanceLevel: 'average',
    type: 'effort',
    emoji: '💡',
    useCase: 'روح التحدي'
  }
];

// ============================================
// 4. دعم عند الضعف - Support for Struggle
// ============================================

export const SUPPORT_PHRASES: EncouragementPhrase[] = [
  {
    phrase: 'لا تنزعج يبه، كلنا نتعلم! خلينا نبدأ من جديد 🌟',
    performanceLevel: 'needs_improvement',
    type: 'support',
    emoji: '🌟',
    useCase: 'صعوبة واضحة'
  },
  {
    phrase: 'عادي حبيبي، ما في مشكلة! راح نفهمها سوية 🤗',
    performanceLevel: 'needs_improvement',
    type: 'support',
    emoji: '🤗',
    useCase: 'طمأنة الطالب'
  },
  {
    phrase: 'الموضوع صعب شوية، بس انت قدها! نسويها خطوة خطوة 🎯',
    performanceLevel: 'needs_improvement',
    type: 'support',
    emoji: '🎯',
    useCase: 'صعوبة الموضوع'
  },
  {
    phrase: 'فهمتك يبه، خلينا نغير الطريقة ونشوف 🔄',
    performanceLevel: 'needs_improvement',
    type: 'support',
    emoji: '🔄',
    useCase: 'تغيير الأسلوب'
  },
  {
    phrase: 'لا تشيل هم، اني وياك لين ما تفهم! 🫱🏻‍🫲🏻',
    performanceLevel: 'needs_improvement',
    type: 'support',
    emoji: '🫱🏻‍🫲🏻',
    useCase: 'دعم مستمر'
  },
  {
    phrase: 'كل بداية صعبة حبيبي، بس ببطء راح توصل 🚀',
    performanceLevel: 'needs_improvement',
    type: 'support',
    emoji: '🚀',
    useCase: 'تشجيع البداية'
  },
  {
    phrase: 'ما تخلي الغلط يحبطك، هذا طريق التعلم 🛤️',
    performanceLevel: 'needs_improvement',
    type: 'support',
    emoji: '🛤️',
    useCase: 'التعامل مع الخطأ'
  },
  {
    phrase: 'انت ما قصرت يبه، بس الدرس يحتاج مراجعة 📖',
    performanceLevel: 'needs_improvement',
    type: 'support',
    emoji: '📖',
    useCase: 'حاجة للمراجعة'
  }
];

// ============================================
// 5. تشجيع التحسن - Progress Recognition
// ============================================

export const PROGRESS_PHRASES: EncouragementPhrase[] = [
  {
    phrase: 'شفت! احسن من المرة اللي فاتت! استمر 📈',
    performanceLevel: 'good',
    type: 'progress',
    emoji: '📈',
    useCase: 'مقارنة إيجابية'
  },
  {
    phrase: 'تطورك واضح يبه! هذا يفرحني! 😊',
    performanceLevel: 'good',
    type: 'progress',
    emoji: '😊',
    useCase: 'تطور ملحوظ'
  },
  {
    phrase: 'من هنا لهنا! فرق كبير حبيبي! 🎊',
    performanceLevel: 'good',
    type: 'progress',
    emoji: '🎊',
    useCase: 'فرق كبير'
  },
  {
    phrase: 'يا سلام! شوف شلون تحسنت! 🌟',
    performanceLevel: 'good',
    type: 'progress',
    emoji: '🌟',
    useCase: 'تحسن مفاجئ'
  },
  {
    phrase: 'الشغل على نفسك ظاهر! ماشاء الله 🌺',
    performanceLevel: 'good',
    type: 'progress',
    emoji: '🌺',
    useCase: 'جهد ذاتي'
  },
  {
    phrase: 'من يوم ليوم تزيد! كذا اريدك! 🔝',
    performanceLevel: 'good',
    type: 'progress',
    emoji: '🔝',
    useCase: 'تحسن يومي'
  },
  {
    phrase: 'الممارسة عطت نتيجة! شفت؟ 💯',
    performanceLevel: 'good',
    type: 'progress',
    emoji: '💯',
    useCase: 'نتيجة الممارسة'
  }
];

// ============================================
// 6. تشجيع الإبداع - Creativity Encouragement
// ============================================

export const CREATIVITY_PHRASES: EncouragementPhrase[] = [
  {
    phrase: 'فكرتك جديدة وحلوة يبه! ما فكرت بيها! 💡',
    performanceLevel: 'excellent',
    type: 'creativity',
    emoji: '💡',
    useCase: 'فكرة إبداعية'
  },
  {
    phrase: 'طريقتك مختلفة وشغالة! ابداااع! 🎨',
    performanceLevel: 'excellent',
    type: 'creativity',
    emoji: '🎨',
    useCase: 'طريقة مبتكرة'
  },
  {
    phrase: 'شفت شلون حليتها بطريقتك؟ ذكي! 🧠',
    performanceLevel: 'excellent',
    type: 'creativity',
    emoji: '🧠',
    useCase: 'حل ذكي'
  },
  {
    phrase: 'هاي مو بالكتاب! انت مفكر حقيقي! 🌈',
    performanceLevel: 'excellent',
    type: 'creativity',
    emoji: '🌈',
    useCase: 'تفكير خارج الصندوق'
  },
  {
    phrase: 'خلاقة يبه! حتى انا تعلمت منك! 🎓',
    performanceLevel: 'excellent',
    type: 'creativity',
    emoji: '🎓',
    useCase: 'إبداع تعليمي'
  }
];

// ============================================
// 7. تشجيع الأسئلة - Question Encouragement
// ============================================

export const QUESTION_ENCOURAGEMENT: EncouragementPhrase[] = [
  {
    phrase: 'سؤال حلو يبه! الفضولي يتعلم اكثر 🤔',
    performanceLevel: 'good',
    type: 'curiosity',
    emoji: '🤔',
    useCase: 'سؤال جيد'
  },
  {
    phrase: 'سؤالك ذكي! خلني افكر ويّاك 💭',
    performanceLevel: 'good',
    type: 'curiosity',
    emoji: '💭',
    useCase: 'سؤال ذكي'
  },
  {
    phrase: 'شاطر! اللي يسأل ما يضيع 🔍',
    performanceLevel: 'good',
    type: 'curiosity',
    emoji: '🔍',
    useCase: 'تشجيع السؤال'
  },
  {
    phrase: 'ممتاز انك تسأل! هذا دليل فهم 🎯',
    performanceLevel: 'good',
    type: 'curiosity',
    emoji: '🎯',
    useCase: 'قيمة السؤال'
  },
  {
    phrase: 'عندك حق تسأل! خلينا نكتشف سوية 🧭',
    performanceLevel: 'good',
    type: 'curiosity',
    emoji: '🧭',
    useCase: 'استكشاف مشترك'
  }
];

// ============================================
// 8. تشجيع المثابرة - Perseverance
// ============================================

export const PERSEVERANCE_PHRASES: EncouragementPhrase[] = [
  {
    phrase: 'ما استسلمت! هذي الروح اللي اريدها! 💪',
    performanceLevel: 'average',
    type: 'perseverance',
    emoji: '💪',
    useCase: 'عدم استسلام'
  },
  {
    phrase: 'حاولت اكثر من مرة! هذا صحيح! 🔄',
    performanceLevel: 'average',
    type: 'perseverance',
    emoji: '🔄',
    useCase: 'محاولات متعددة'
  },
  {
    phrase: 'شفت الإصرار عندك يبه! كمل 🏃',
    performanceLevel: 'average',
    type: 'perseverance',
    emoji: '🏃',
    useCase: 'إصرار واضح'
  },
  {
    phrase: 'ما يئست! الصبر مفتاح الفرج 🔑',
    performanceLevel: 'average',
    type: 'perseverance',
    emoji: '🔑',
    useCase: 'صبر وتحمل'
  },
  {
    phrase: 'كل محاولة تقربك للحل! استمر 🎯',
    performanceLevel: 'average',
    type: 'perseverance',
    emoji: '🎯',
    useCase: 'تشجيع الاستمرار'
  }
];

// ============================================
// 9. تشجيع العمل الجماعي - Teamwork (للمستقبل)
// ============================================

export const TEAMWORK_PHRASES: EncouragementPhrase[] = [
  {
    phrase: 'شغل جماعي حلو! هذا التعاون 🤝',
    performanceLevel: 'good',
    type: 'collaboration',
    emoji: '🤝',
    useCase: 'عمل جماعي'
  },
  {
    phrase: 'ساعدت صاحبك! هذا اخلاق ❤️',
    performanceLevel: 'good',
    type: 'collaboration',
    emoji: '❤️',
    useCase: 'مساعدة الآخرين'
  },
  {
    phrase: 'فكرتكم المشتركة احسن! 🌟',
    performanceLevel: 'good',
    type: 'collaboration',
    emoji: '🌟',
    useCase: 'تعاون إبداعي'
  }
];

// ============================================
// 10. عبارات خاصة بالمواد - Subject Specific
// ============================================

export const MATH_ENCOURAGEMENT: EncouragementPhrase[] = [
  {
    phrase: 'الحسبة صح! دماغك رياضي 🧮',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '🧮',
    useCase: 'رياضيات صحيحة'
  },
  {
    phrase: 'الخطوات مرتبة! شغل هندسي 📐',
    performanceLevel: 'good',
    type: 'success',
    emoji: '📐',
    useCase: 'ترتيب منطقي'
  },
  {
    phrase: 'حليت المسألة! عالم رياضيات صغير 🔢',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '🔢',
    useCase: 'حل مسألة'
  }
];

export const ARABIC_ENCOURAGEMENT: EncouragementPhrase[] = [
  {
    phrase: 'خطك حلو يبه! واضح ومرتب ✍️',
    performanceLevel: 'good',
    type: 'success',
    emoji: '✍️',
    useCase: 'جودة الخط'
  },
  {
    phrase: 'القراءة صحيحة! صوتك واضح 📖',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '📖',
    useCase: 'قراءة صحيحة'
  },
  {
    phrase: 'الإملاء صح! شاطر بالعربي 📝',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '📝',
    useCase: 'إملاء صحيح'
  }
];

export const SCIENCE_ENCOURAGEMENT: EncouragementPhrase[] = [
  {
    phrase: 'ملاحظتك علمية! عالم صغير 🔬',
    performanceLevel: 'excellent',
    type: 'curiosity',
    emoji: '🔬',
    useCase: 'ملاحظة علمية'
  },
  {
    phrase: 'تجربتك نجحت! هذا بحث حقيقي 🧪',
    performanceLevel: 'excellent',
    type: 'success',
    emoji: '🧪',
    useCase: 'تجربة ناجحة'
  },
  {
    phrase: 'فهمت الظاهرة! عقل علمي 🌍',
    performanceLevel: 'good',
    type: 'success',
    emoji: '🌍',
    useCase: 'فهم علمي'
  }
];

// ============================================
// 11. التجميع حسب مستوى الأداء
// ============================================

export const PHRASES_BY_PERFORMANCE: Record<PerformanceLevel, EncouragementPhrase[]> = {
  excellent: [
    ...PERFECT_SUCCESS,
    ...CREATIVITY_PHRASES,
    ...MATH_ENCOURAGEMENT.filter(p => p.performanceLevel === 'excellent'),
    ...ARABIC_ENCOURAGEMENT.filter(p => p.performanceLevel === 'excellent'),
    ...SCIENCE_ENCOURAGEMENT.filter(p => p.performanceLevel === 'excellent')
  ],
  good: [
    ...GOOD_PERFORMANCE,
    ...PROGRESS_PHRASES,
    ...QUESTION_ENCOURAGEMENT,
    ...TEAMWORK_PHRASES
  ],
  average: [
    ...EFFORT_RECOGNITION,
    ...PERSEVERANCE_PHRASES
  ],
  needs_improvement: [
    ...SUPPORT_PHRASES
  ]
};

// ============================================
// 12. التجميع حسب نوع التشجيع
// ============================================

export const PHRASES_BY_TYPE: Record<EncouragementType, EncouragementPhrase[]> = {
  success: [
    ...PERFECT_SUCCESS,
    ...GOOD_PERFORMANCE,
    ...MATH_ENCOURAGEMENT,
    ...ARABIC_ENCOURAGEMENT,
    ...SCIENCE_ENCOURAGEMENT
  ],
  effort: EFFORT_RECOGNITION,
  progress: PROGRESS_PHRASES,
  support: SUPPORT_PHRASES,
  creativity: CREATIVITY_PHRASES,
  curiosity: QUESTION_ENCOURAGEMENT,
  perseverance: PERSEVERANCE_PHRASES,
  collaboration: TEAMWORK_PHRASES
};

// ============================================
// 13. التصدير الكامل
// ============================================

export const ALL_ENCOURAGEMENT_PHRASES: EncouragementPhrase[] = [
  ...PERFECT_SUCCESS,
  ...GOOD_PERFORMANCE,
  ...EFFORT_RECOGNITION,
  ...SUPPORT_PHRASES,
  ...PROGRESS_PHRASES,
  ...CREATIVITY_PHRASES,
  ...QUESTION_ENCOURAGEMENT,
  ...PERSEVERANCE_PHRASES,
  ...TEAMWORK_PHRASES,
  ...MATH_ENCOURAGEMENT,
  ...ARABIC_ENCOURAGEMENT,
  ...SCIENCE_ENCOURAGEMENT
];

// ============================================
// 14. دوال مساعدة - Helper Functions
// ============================================

/**
 * اختيار عبارة تشجيع حسب مستوى الأداء
 */
export function getEncouragementByPerformance(
  level: PerformanceLevel
): EncouragementPhrase {
  const phrases = PHRASES_BY_PERFORMANCE[level];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * اختيار عبارة تشجيع حسب النوع
 */
export function getEncouragementByType(
  type: EncouragementType
): EncouragementPhrase {
  const phrases = PHRASES_BY_TYPE[type];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * اختيار عبارة تشجيع مخصصة
 */
export function getCustomEncouragement(
  level: PerformanceLevel,
  type: EncouragementType
): EncouragementPhrase | null {
  const phrases = ALL_ENCOURAGEMENT_PHRASES.filter(
    p => p.performanceLevel === level && p.type === type
  );
  return phrases.length > 0 
    ? phrases[Math.floor(Math.random() * phrases.length)]
    : null;
}

/**
 * اختيار عبارة تشجيع حسب المادة
 */
export function getSubjectSpecificEncouragement(
  subject: 'math' | 'arabic' | 'science'
): EncouragementPhrase {
  let phrases: EncouragementPhrase[] = [];
  
  switch(subject) {
    case 'math':
      phrases = MATH_ENCOURAGEMENT;
      break;
    case 'arabic':
      phrases = ARABIC_ENCOURAGEMENT;
      break;
    case 'science':
      phrases = SCIENCE_ENCOURAGEMENT;
      break;
  }
  
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * اختيار عبارة حسب درجة النجاح (0-100)
 */
export function getEncouragementByScore(score: number): EncouragementPhrase {
  let level: PerformanceLevel;
  
  if (score >= 90) {
    level = 'excellent';
  } else if (score >= 70) {
    level = 'good';
  } else if (score >= 50) {
    level = 'average';
  } else {
    level = 'needs_improvement';
  }
  
  return getEncouragementByPerformance(level);
}

/**
 * إحصائيات العبارات
 */
export function getEncouragementStats() {
  return {
    total: ALL_ENCOURAGEMENT_PHRASES.length,
    byPerformance: {
      excellent: PHRASES_BY_PERFORMANCE.excellent.length,
      good: PHRASES_BY_PERFORMANCE.good.length,
      average: PHRASES_BY_PERFORMANCE.average.length,
      needs_improvement: PHRASES_BY_PERFORMANCE.needs_improvement.length
    },
    byType: {
      success: PHRASES_BY_TYPE.success.length,
      effort: PHRASES_BY_TYPE.effort.length,
      progress: PHRASES_BY_TYPE.progress.length,
      support: PHRASES_BY_TYPE.support.length,
      creativity: PHRASES_BY_TYPE.creativity.length,
      curiosity: PHRASES_BY_TYPE.curiosity.length,
      perseverance: PHRASES_BY_TYPE.perseverance.length,
      collaboration: PHRASES_BY_TYPE.collaboration.length
    },
    bySubject: {
      math: MATH_ENCOURAGEMENT.length,
      arabic: ARABIC_ENCOURAGEMENT.length,
      science: SCIENCE_ENCOURAGEMENT.length
    }
  };
}

/**
 * الحصول على مجموعة عبارات متنوعة
 */
export function getVariedEncouragement(count: number = 3): EncouragementPhrase[] {
  const shuffled = [...ALL_ENCOURAGEMENT_PHRASES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
