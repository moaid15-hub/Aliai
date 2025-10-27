// @ts-nocheck
// src/components/personas/iraqi-teacher/data/iraqiTeacherData.ts

/**
 * بيانات المعلم العراقي الأساسية
 */

import { GradeInfo, SubjectInfo } from './iraqi-teacher.types';

// ====================================
// معلومات الصفوف (1-6)
// ====================================

export const GRADES_DATA: Record<string, GradeInfo> = {
  '1': {
    id: '1',
    nameArabic: 'الصف الأول الابتدائي',
    nameDialect: 'الصف الأول',
    ageRange: '6-7 سنوات',
    subjects: ['math', 'arabic', 'science', 'islamic', 'general'],
  },
  
  '2': {
    id: '2',
    nameArabic: 'الصف الثاني الابتدائي',
    nameDialect: 'الصف الثاني',
    ageRange: '7-8 سنوات',
    subjects: ['math', 'arabic', 'science', 'social', 'islamic', 'general'],
  },
  
  '3': {
    id: '3',
    nameArabic: 'الصف الثالث الابتدائي',
    nameDialect: 'الصف الثالث',
    ageRange: '8-9 سنوات',
    subjects: ['math', 'arabic', 'science', 'social', 'english', 'islamic', 'general'],
  },
  
  '4': {
    id: '4',
    nameArabic: 'الصف الرابع الابتدائي',
    nameDialect: 'الصف الرابع',
    ageRange: '9-10 سنوات',
    subjects: ['math', 'arabic', 'science', 'social', 'english', 'islamic', 'general'],
  },
  
  '5': {
    id: '5',
    nameArabic: 'الصف الخامس الابتدائي',
    nameDialect: 'الصف الخامس',
    ageRange: '10-11 سنة',
    subjects: ['math', 'arabic', 'science', 'social', 'english', 'islamic', 'general'],
  },
  
  '6': {
    id: '6',
    nameArabic: 'الصف السادس الابتدائي',
    nameDialect: 'الصف السادس',
    ageRange: '11-12 سنة',
    subjects: ['math', 'arabic', 'science', 'social', 'english', 'islamic', 'general'],
  },
};

// ====================================
// معلومات المواد
// ====================================

export const SUBJECTS_DATA: Record<string, SubjectInfo> = {
  math: {
    id: 'math',
    nameArabic: 'الرياضيات',
    nameDialect: 'الرياضيات (الحساب)',
    icon: '🔢',
    color: '#3B82F6', // أزرق
  },
  
  arabic: {
    id: 'arabic',
    nameArabic: 'اللغة العربية',
    nameDialect: 'العربي',
    icon: '📖',
    color: '#10B981', // أخضر
  },
  
  science: {
    id: 'science',
    nameArabic: 'العلوم',
    nameDialect: 'العلوم',
    icon: '🔬',
    color: '#8B5CF6', // بنفسجي
  },
  
  social: {
    id: 'social',
    nameArabic: 'الاجتماعيات',
    nameDialect: 'الاجتماعيات',
    icon: '🌍',
    color: '#F59E0B', // برتقالي
  },
  
  english: {
    id: 'english',
    nameArabic: 'اللغة الإنجليزية',
    nameDialect: 'الإنجليزي',
    icon: '🇬🇧',
    color: '#EF4444', // أحمر
  },
  
  islamic: {
    id: 'islamic',
    nameArabic: 'التربية الإسلامية',
    nameDialect: 'الإسلامية',
    icon: '☪️',
    color: '#059669', // أخضر غامق
  },
  
  general: {
    id: 'general',
    nameArabic: 'عام',
    nameDialect: 'سؤال عام',
    icon: '💡',
    color: '#6B7280', // رمادي
  },
};

// ====================================
// الأخطاء الشائعة لكل مادة
// ====================================

export const COMMON_MISTAKES = {
  math: [
    'نسيان علامة الجمع أو الطرح',
    'الخلط بين الضرب والجمع',
    'عدم حفظ جدول الضرب',
    'الخطأ في ترتيب العمليات',
    'نسيان الأصفار',
  ],
  
  arabic: [
    'الخلط بين التاء المربوطة والهاء',
    'نسيان الهمزة',
    'الخطأ في كتابة الألف اللينة',
    'الخلط بين الضاد والظاء',
    'عدم التفريق بين ال الشمسية والقمرية',
  ],
  
  science: [
    'الخلط بين الحيوانات الفقرية واللافقرية',
    'عدم فهم دورة الماء',
    'الخطأ في تصنيف النباتات',
    'عدم معرفة أجزاء النبات',
  ],
  
  english: [
    'نطق الحروف بشكل خاطئ',
    'الخلط بين a و an',
    'نسيان s في الجمع',
    'الخطأ في ترتيب الجملة',
  ],
};

// ====================================
// نصائح تدريسية لكل صف
// ====================================

export const TEACHING_TIPS_BY_GRADE = {
  '1': [
    'استخدم الألعاب والرسومات',
    'كرر المعلومة بطرق مختلفة',
    'الصبر الصبر الصبر!',
    'شجع حتى على أصغر إنجاز',
    'اجعل التعليم ممتع',
  ],
  
  '2': [
    'استخدم القصص القصيرة',
    'اربط المعلومة بحياته اليومية',
    'شجعه على السؤال',
    'استخدم الأمثلة الملموسة',
  ],
  
  '3': [
    'ابدأ ببناء عادات الدراسة',
    'شجعه على القراءة',
    'استخدم التجارب البسيطة',
    'اجعله يشرح بكلامه',
  ],
  
  '4': [
    'شجعه على التفكير النقدي',
    'استخدم المشاريع الصغيرة',
    'اربط المواد ببعضها',
    'علمه كيف يتعلم',
  ],
  
  '5': [
    'شجع الاستقلالية في التعلم',
    'استخدم أمثلة من الحياة الواقعية',
    'ناقشه كصديق',
    'حضره للمرحلة المتوسطة',
  ],
  
  '6': [
    'ركز على المهارات الأساسية',
    'راجع كل ما تعلمه',
    'شجعه على البحث والاستكشاف',
    'جهزه للمرحلة القادمة',
  ],
};

// ====================================
// أمثلة لكل مادة (من الحياة اليومية)
// ====================================

export const REAL_LIFE_EXAMPLES = {
  math: [
    'عد التفاح في السلة',
    'قسم الحلوى مع أخوتك',
    'احسب فلوس المصروف',
    'قيس طولك بالمسطرة',
    'احسب الوقت للصلاة',
  ],
  
  arabic: [
    'اقرأ لافتات الشوارع',
    'اكتب قائمة التسوق',
    'اقرأ قصة قبل النوم',
    'اكتب رسالة لصديقك',
    'احفظ آية قرآنية',
  ],
  
  science: [
    'لاحظ النباتات في الحديقة',
    'راقب الطقس كل يوم',
    'لاحظ الحيوانات في الشارع',
    'جرب زراعة نبتة',
    'راقب القمر كل ليلة',
  ],
  
  social: [
    'زر معالم بغداد',
    'اسأل جدك عن تاريخ العائلة',
    'تعرف على محافظات العراق',
    'شاهد خريطة العراق',
    'تعلم عن العلم العراقي',
  ],
  
  english: [
    'اقرأ الكلمات الإنجليزية على المنتجات',
    'شاهد كرتون إنجليزي بسيط',
    'تعلم أسماء الألوان بالإنجليزي',
    'غني أغنية إنجليزية بسيطة',
    'سمي الأشياء في البيت بالإنجليزي',
  ],
};

// ====================================
// الكلمات المفتاحية لكشف الموضوع
// ====================================

export const TOPIC_KEYWORDS = {
  math: {
    addition: ['جمع', 'زائد', 'وِ', 'اجمع', 'احسب المجموع'],
    subtraction: ['طرح', 'ناقص', 'منو', 'اطرح', 'الباقي'],
    multiplication: ['ضرب', 'مرات', 'في', 'اضرب', 'جدول'],
    division: ['قسمة', 'تقسيم', 'اقسم', 'كل واحد'],
    fractions: ['كسر', 'نصف', 'ربع', 'ثلث', 'كسور'],
  },
  
  arabic: {
    reading: ['قراءة', 'اقرأ', 'نطق', 'كلمة', 'جملة'],
    writing: ['كتابة', 'اكتب', 'إملاء', 'خط'],
    grammar: ['فعل', 'اسم', 'حرف', 'قواعد', 'نحو'],
  },
  
  science: {
    plants: ['نبات', 'نبتة', 'شجرة', 'ورقة', 'جذر', 'زهرة'],
    animals: ['حيوان', 'حيوانات', 'طير', 'سمك', 'حشرة'],
    human_body: ['جسم', 'عين', 'يد', 'رجل', 'أعضاء'],
    weather: ['طقس', 'مطر', 'شمس', 'غيم', 'برد', 'حر'],
  },
};

// ====================================
// دوال مساعدة
// ====================================

/**
 * الحصول على معلومات الصف
 */
export function getGradeInfo(gradeId: string): GradeInfo | undefined {
  return GRADES_DATA[gradeId];
}

/**
 * الحصول على معلومات المادة
 */
export function getSubjectInfo(subjectId: string): SubjectInfo | undefined {
  return SUBJECTS_DATA[subjectId];
}

/**
 * الحصول على قائمة كل الصفوف
 */
export function getAllGrades(): GradeInfo[] {
  return Object.values(GRADES_DATA);
}

/**
 * الحصول على قائمة كل المواد
 */
export function getAllSubjects(): SubjectInfo[] {
  return Object.values(SUBJECTS_DATA);
}

/**
 * التحقق من توفر المادة في الصف
 */
export function isSubjectAvailableInGrade(
  subjectId: string,
  gradeId: string
): boolean {
  const grade = GRADES_DATA[gradeId];
  if (!grade) return false;
  return grade.subjects.includes(subjectId as any);
}

/**
 * كشف الموضوع من النص
 */
export function detectTopicFromText(text: string): {
  subject?: string;
  topic?: string;
} {
  const lowerText = text.toLowerCase();
  
  // البحث في الكلمات المفتاحية
  for (const [subject, topics] of Object.entries(TOPIC_KEYWORDS)) {
    for (const [topic, keywords] of Object.entries(topics)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return { subject, topic };
        }
      }
    }
  }
  
  return {};
}

/**
 * الحصول على أمثلة من الحياة اليومية
 */
export function getRealLifeExamples(subjectId: string): string[] {
  return REAL_LIFE_EXAMPLES[subjectId as keyof typeof REAL_LIFE_EXAMPLES] || [];
}

/**
 * الحصول على الأخطاء الشائعة
 */
export function getCommonMistakes(subjectId: string): string[] {
  return COMMON_MISTAKES[subjectId as keyof typeof COMMON_MISTAKES] || [];
}

/**
 * الحصول على نصائح التدريس للصف
 */
export function getTeachingTips(gradeId: string): string[] {
  return TEACHING_TIPS_BY_GRADE[gradeId as keyof typeof TEACHING_TIPS_BY_GRADE] || [];
}