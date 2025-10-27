// @ts-nocheck
// src/components/personas/iraqi-teacher/data/iraqiCurriculum.ts

/**
 * المناهج العراقية للصفوف 1-6
 */

import { Curriculum, CurriculumTopic } from '../iraqi-teacher.types';

// ====================================
// منهج الصف الأول
// ====================================

const GRADE_1_CURRICULUM: Curriculum = {
  grade: '1',
  subjects: {
    math: [
      {
        id: 'g1-math-1',
        subject: 'math',
        grade: '1',
        title: 'الأعداد من 1 إلى 10',
        titleDialect: 'الأرقام من 1 لـ 10',
        description: 'تعلم العد والتعرف على الأرقام',
        keywords: ['عد', 'أرقام', 'واحد', 'عشرة'],
        examples: [
          'عد التفاح: 1، 2، 3',
          'كم إصبع عندك؟',
          'عد الكراسات',
        ],
        commonMistakes: [
          'الخلط بين 6 و 9',
          'نسيان الصفر',
        ],
        teachingTips: [
          'استخدم الأصابع',
          'العب لعبة العد',
          'ارسم الأرقام',
        ],
      },
      {
        id: 'g1-math-2',
        subject: 'math',
        grade: '1',
        title: 'الجمع البسيط (حتى 10)',
        titleDialect: 'الجمع (لحد 10)',
        description: 'جمع عددين صغيرين',
        keywords: ['جمع', 'زائد', 'وِ'],
        examples: [
          '2 + 3 = 5',
          'تفاحتين وتفاحة = 3',
        ],
        commonMistakes: [
          'العد الخاطئ',
        ],
        teachingTips: [
          'استخدم الأشياء الملموسة',
        ],
      },
    ],
    
    arabic: [
      {
        id: 'g1-arabic-1',
        subject: 'arabic',
        grade: '1',
        title: 'الحروف الهجائية',
        titleDialect: 'الحروف',
        description: 'تعلم الحروف العربية',
        keywords: ['حروف', 'ألف', 'باء'],
        examples: [
          'أ - ألف',
          'ب - باء',
        ],
        commonMistakes: [
          'الخلط بين الحروف المتشابهة',
        ],
        teachingTips: [
          'اكتب الحرف بإصبعك',
          'غني أغنية الحروف',
        ],
      },
    ],
    
    science: [
      {
        id: 'g1-science-1',
        subject: 'science',
        grade: '1',
        title: 'أجزاء الجسم',
        titleDialect: 'أعضاء الجسم',
        description: 'التعرف على أجزاء جسم الإنسان',
        keywords: ['يد', 'رجل', 'عين', 'أذن'],
        examples: [
          'هذه يدي',
          'هذه عيني',
        ],
        commonMistakes: [],
        teachingTips: [
          'أشر على جسمك',
        ],
      },
    ],
  },
};

// ====================================
// منهج الصف الثاني
// ====================================

const GRADE_2_CURRICULUM: Curriculum = {
  grade: '2',
  subjects: {
    math: [
      {
        id: 'g2-math-1',
        subject: 'math',
        grade: '2',
        title: 'الأعداد حتى 100',
        titleDialect: 'الأرقام لحد 100',
        description: 'الأعداد الكبيرة',
        keywords: ['عشرات', 'آحاد', 'مئة'],
        examples: ['50 = خمسين', '100 = مئة'],
        commonMistakes: ['قراءة الأعداد بالمقلوب'],
        teachingTips: ['استخدم النقود'],
      },
      {
        id: 'g2-math-2',
        subject: 'math',
        grade: '2',
        title: 'الجمع والطرح (حتى 100)',
        titleDialect: 'الجمع والطرح',
        description: 'عمليات أكبر',
        keywords: ['جمع', 'طرح', 'ناقص'],
        examples: ['25 + 30 = 55'],
        commonMistakes: ['نسيان العشرات'],
        teachingTips: ['اجمع بالخطوات'],
      },
    ],
  },
};

// ====================================
// منهج الصف الثالث
// ====================================

const GRADE_3_CURRICULUM: Curriculum = {
  grade: '3',
  subjects: {
    math: [
      {
        id: 'g3-math-1',
        subject: 'math',
        grade: '3',
        title: 'جدول الضرب',
        titleDialect: 'جدول الضرب',
        description: 'حفظ جداول الضرب',
        keywords: ['ضرب', 'مرات', 'في', 'جدول'],
        examples: ['5 × 3 = 15', 'خمسة ثلاث مرات'],
        commonMistakes: ['عدم الحفظ'],
        teachingTips: ['احفظ جدول جدول', 'استخدم الأغاني'],
      },
    ],
    
    english: [
      {
        id: 'g3-english-1',
        subject: 'english',
        grade: '3',
        title: 'الحروف الإنجليزية',
        titleDialect: 'حروف الإنجليزي',
        description: 'تعلم الأبجدية',
        keywords: ['A', 'B', 'C', 'alphabet'],
        examples: ['A for Apple', 'B for Book'],
        commonMistakes: ['النطق الخاطئ'],
        teachingTips: ['ردد معي'],
      },
    ],
  },
};

// ====================================
// منهج الصف الرابع
// ====================================

const GRADE_4_CURRICULUM: Curriculum = {
  grade: '4',
  subjects: {
    math: [
      {
        id: 'g4-math-1',
        subject: 'math',
        grade: '4',
        title: 'القسمة',
        titleDialect: 'القسمة',
        description: 'تقسيم الأعداد',
        keywords: ['قسمة', 'تقسيم', 'على'],
        examples: ['20 ÷ 5 = 4'],
        commonMistakes: ['الخلط مع الضرب'],
        teachingTips: ['وزع الأشياء بالتساوي'],
      },
      {
        id: 'g4-math-2',
        subject: 'math',
        grade: '4',
        title: 'الكسور البسيطة',
        titleDialect: 'الكسور',
        description: 'النصف والربع',
        keywords: ['نصف', 'ربع', 'ثلث', 'كسر'],
        examples: ['1/2 = نصف', '1/4 = ربع'],
        commonMistakes: ['عدم فهم المعنى'],
        teachingTips: ['قسم التفاحة'],
      },
    ],
  },
};

// ====================================
// منهج الصف الخامس
// ====================================

const GRADE_5_CURRICULUM: Curriculum = {
  grade: '5',
  subjects: {
    math: [
      {
        id: 'g5-math-1',
        subject: 'math',
        grade: '5',
        title: 'الكسور العشرية',
        titleDialect: 'الكسور العشرية',
        description: 'الفاصلة العشرية',
        keywords: ['فاصلة', 'عشري', 'عشرة', 'مئة'],
        examples: ['0.5 = نصف', '0.25 = ربع'],
        commonMistakes: ['مكان الفاصلة'],
        teachingTips: ['استخدم النقود'],
      },
    ],
    
    science: [
      {
        id: 'g5-science-1',
        subject: 'science',
        grade: '5',
        title: 'النظام الشمسي',
        titleDialect: 'الكواكب',
        description: 'الشمس والكواكب',
        keywords: ['شمس', 'كواكب', 'قمر', 'نجوم'],
        examples: ['الأرض كوكبنا', 'الشمس نجم'],
        commonMistakes: ['الخلط بين الكواكب'],
        teachingTips: ['ارسم النظام الشمسي'],
      },
    ],
  },
};

// ====================================
// منهج الصف السادس
// ====================================

const GRADE_6_CURRICULUM: Curriculum = {
  grade: '6',
  subjects: {
    math: [
      {
        id: 'g6-math-1',
        subject: 'math',
        grade: '6',
        title: 'النسبة المئوية',
        titleDialect: 'المئوية (البرسنت)',
        description: 'حساب النسبة المئوية',
        keywords: ['نسبة', 'مئوية', '%', 'بالمئة'],
        examples: ['50% = نصف', '25% = ربع'],
        commonMistakes: ['الخطأ في الحساب'],
        teachingTips: ['استخدم أمثلة من الحياة'],
      },
    ],
    
    social: [
      {
        id: 'g6-social-1',
        subject: 'social',
        grade: '6',
        title: 'تاريخ العراق',
        titleDialect: 'تاريخ العراق',
        description: 'الحضارات القديمة',
        keywords: ['بابل', 'آشور', 'سومر', 'بغداد'],
        examples: ['حضارة بابل', 'حضارة سومر'],
        commonMistakes: [],
        teachingTips: ['استخدم القصص'],
      },
    ],
  },
};

// ====================================
// تصدير جميع المناهج
// ====================================

export const IRAQI_CURRICULUM: Record<string, Curriculum> = {
  '1': GRADE_1_CURRICULUM,
  '2': GRADE_2_CURRICULUM,
  '3': GRADE_3_CURRICULUM,
  '4': GRADE_4_CURRICULUM,
  '5': GRADE_5_CURRICULUM,
  '6': GRADE_6_CURRICULUM,
};

// ====================================
// دوال مساعدة
// ====================================

/**
 * الحصول على منهج صف معين
 */
export function getCurriculumByGrade(gradeId: string): Curriculum | undefined {
  return IRAQI_CURRICULUM[gradeId];
}

/**
 * البحث عن موضوع معين
 */
export function findTopic(
  gradeId: string,
  subjectId: string,
  keyword: string
): CurriculumTopic | undefined {
  const curriculum = IRAQI_CURRICULUM[gradeId];
  if (!curriculum) return undefined;

  const subjects = curriculum.subjects[subjectId as keyof typeof curriculum.subjects];
  if (!subjects) return undefined;

  return subjects.find((topic) =>
    topic.keywords.some((k) => keyword.includes(k))
  );
}

/**
 * الحصول على كل المواضيع في مادة معينة
 */
export function getTopicsBySubject(
  gradeId: string,
  subjectId: string
): CurriculumTopic[] {
  const curriculum = IRAQI_CURRICULUM[gradeId];
  if (!curriculum) return [];

  return curriculum.subjects[subjectId as keyof typeof curriculum.subjects] || [];
}