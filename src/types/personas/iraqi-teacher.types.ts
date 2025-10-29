// src/types/iraqi-teacher.types.ts

/**
 * أنواع شخصية المعلم العراقي
 */

import { ProcessingResult } from './image-processing.types';

// ====================================
// الصفوف والمواد
// ====================================

export type Grade = '1' | '2' | '3' | '4' | '5' | '6';

export type Subject = 
  | 'math'          // رياضيات
  | 'arabic'        // عربي
  | 'science'       // علوم
  | 'social'        // اجتماعيات
  | 'english'       // إنجليزي
  | 'islamic'       // تربية إسلامية
  | 'general';      // عام

export interface SubjectInfo {
  id: Subject;
  nameArabic: string;
  nameDialect: string; // باللهجة العراقية
  icon: string;
  color: string;
}

export interface GradeInfo {
  id: Grade;
  nameArabic: string;
  nameDialect: string;
  ageRange: string;
  subjects: Subject[];
}

// ====================================
// المناهج العراقية
// ====================================

export interface CurriculumTopic {
  id: string;
  subject: Subject;
  grade: Grade;
  title: string;
  titleDialect: string;
  description: string;
  keywords: string[];
  examples: string[];
  commonMistakes: string[];
  teachingTips: string[];
}

export interface Curriculum {
  grade: Grade;
  subjects: {
    [key in Subject]?: CurriculumTopic[];
  };
}

// ====================================
// الطلبات والردود
// ====================================

export type RequestType = 
  | 'explain-homework'    // شرح واجب
  | 'explain-lesson'      // شرح درس
  | 'explain-concept'     // شرح مفهوم
  | 'solve-problem'       // حل مسألة
  | 'check-answer'        // تصحيح إجابة
  | 'general-question';   // سؤال عام

export interface StudentRequest {
  id: string;
  type: RequestType;
  subject?: Subject;
  grade?: Grade;
  message: string;
  image?: ProcessingResult; // إذا كان فيه صورة
  timestamp: Date;
}

export interface TeacherResponse {
  id: string;
  requestId: string;
  explanation: string; // الشرح بالعراقي
  steps?: ExplanationStep[]; // خطوات الشرح
  encouragement: string; // جملة تشجيع
  followUpQuestions?: string[]; // أسئلة للتأكد من الفهم
  relatedTopics?: string[]; // مواضيع ذات صلة
  timestamp: Date;
}

export interface ExplanationStep {
  stepNumber: number;
  title: string;
  description: string;
  example?: string;
  image?: string; // رابط صورة توضيحية
}

// ====================================
// اللهجة البغدادية
// ====================================

export interface DialectPhrase {
  standard: string; // الفصحى
  dialect: string;  // العراقي
  context: string;  // متى نستخدمها
}

export interface DialectConfig {
  greetings: DialectPhrase[];
  encouragement: DialectPhrase[];
  explanationStarters: DialectPhrase[];
  questionPhrases: DialectPhrase[];
  transitions: DialectPhrase[];
  closings: DialectPhrase[];
}

// ====================================
// شخصية المعلم
// ====================================

export interface TeacherPersona {
  id: string;
  name: string;
  nameDialect: string; // "عمو أحمد" مثلاً
  avatar: string;
  personality: {
    style: 'patient' | 'energetic' | 'calm'; // صبور
    tone: 'friendly' | 'formal' | 'playful'; // ودود
    humor: boolean; // يستخدم الفكاهة؟
  };
  specialties: Subject[];
  experience: string;
  motto: string; // شعاره
  mottoDialect: string;
}

// ====================================
// الجلسة
// ====================================

export interface TeachingSession {
  id: string;
  studentId?: string;
  grade?: Grade;
  subject?: Subject;
  startedAt: Date;
  lastActivityAt: Date;
  requests: StudentRequest[];
  responses: TeacherResponse[];
  learningProgress: {
    understoodTopics: string[];
    needsReview: string[];
    strengths: string[];
    weaknesses: string[];
  };
}

// ====================================
// الإعدادات
// ====================================

export interface TeacherSettings {
  useDialect: boolean; // استخدام اللهجة العراقية
  dialectLevel: 'full' | 'mixed' | 'minimal'; // مستوى اللهجة
  detailLevel: 'simple' | 'moderate' | 'detailed'; // مستوى التفصيل
  useEmojis: boolean;
  useEncouragement: boolean;
  maxExplanationLength: number;
  askFollowUpQuestions: boolean;
  provideExamples: boolean;
}

// ====================================
// System Prompt
// ====================================

export interface SystemPromptConfig {
  basePrompt: string;
  gradeSpecificPrompts: Record<Grade, string>;
  subjectSpecificPrompts: Record<Subject, string>;
  dialectInstructions: string;
  exampleConversations: Array<{
    student: string;
    teacher: string;
  }>;
}

// ====================================
// التحليلات (للمرحلة الثانية)
// ====================================

export interface StudentAnalytics {
  studentId: string;
  totalSessions: number;
  totalQuestions: number;
  subjectsAsked: Record<Subject, number>;
  averageResponseTime: number;
  satisfactionRate?: number;
  progressOverTime: Array<{
    date: Date;
    topic: string;
    understood: boolean;
  }>;
}
