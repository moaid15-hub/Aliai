// components/personas/iraqi-teacher/index.ts
/**
 * Iraqi Teacher Components Exports
 * تصدير مكونات المعلم العراقي
 */

// تصدير المكونات الرئيسية
export { default as EncouragementBadge } from './EncouragementBadge';
export { default as ExplanationDisplay } from './ExplanationDisplay';
export { default as GradeSelector } from './GradeSelector';
export { default as ImagePreview } from './ImagePreview';
export { default as ImageUploader } from './ImageUploader';
export { default as StepByStep } from './StepByStep';
export { default as SubjectSelector } from './SubjectSelector';
export { default as TeacherAvatar } from './TeacherAvatar';
export { default as TeacherChat } from './TeacherChat';

// تصدير البيانات
export * from './data/dialectPhrases';
export * from './data/encouragementPhrases';
export * from './data/iraqiCurriculum';
export * from './data/iraqiTeacherData';

// دوال مساعدة للمكونات
export const IraqiTeacherUtils = {
  // دالة للحصول على تحية حسب الوقت
  getTimeBasedGreeting: () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير حبيبي';
    if (hour < 17) return 'مساء الخير حبيبي';
    return 'مساء النور حبيبي';
  },

  // دالة للحصول على رسالة تشجيع عشوائية
  getRandomEncouragement: () => {
    const messages = [
      'شاطر حبيبي!',
      'ممتاز جداً!',
      'يالله عاش!',
      'الله يوفقك!',
      'إبداع والله!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  },

  // دالة للتحقق من صحة البيانات
  validateGradeSubject: (grade: string, subject: string) => {
    // منطق التحقق
    return grade && subject && grade.length > 0 && subject.length > 0;
  }
};

export default IraqiTeacherUtils;