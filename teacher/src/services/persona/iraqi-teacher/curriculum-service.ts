/**
 * خدمة المناهج الدراسية - Curriculum Service
 * 
 * يدير المناهج العراقية للصفوف 1-6
 * يقدم الشروحات والتمارين حسب المنهج
 * 
 * @module curriculum-service
 * @path src/services/persona/iraqi-teacher/curriculum-service.ts
 */

import {
  Grade,
  Subject,
  CurriculumTopic,
  LessonPlan,
  Exercise,
  StudentLevel,
  LearningObjective
} from '../../../types/iraqi-teacher.types';

import {
  IRAQI_CURRICULUM,
  GRADE_1_CURRICULUM,
  GRADE_2_CURRICULUM,
  GRADE_3_CURRICULUM,
  GRADE_4_CURRICULUM,
  GRADE_5_CURRICULUM,
  GRADE_6_CURRICULUM,
  getTopicsForGrade,
  getTopicsBySubject,
  findTopicById
} from '../../../components/personas/iraqi-teacher/data/iraqiCurriculum';

// ============================================
// 1. الواجهات المحلية
// ============================================

interface TopicSearchOptions {
  grade?: Grade;
  subject?: Subject;
  difficulty?: 'easy' | 'medium' | 'hard';
  keyword?: string;
}

interface LessonContext {
  grade: Grade;
  subject: Subject;
  topic: string;
  studentLevel: StudentLevel;
  previousTopics?: string[];
}

interface ExerciseGenerator {
  generate: (topic: CurriculumTopic, count: number) => Exercise[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// ============================================
// 2. فئة خدمة المناهج
// ============================================

export class CurriculumService {
  private currentGrade: Grade = 1;
  private currentSubject: Subject = 'math';
  private completedTopics: Set<string> = new Set();
  private studentProgress: Map<string, number> = new Map();
  
  /**
   * تعيين الصف الدراسي
   */
  setGrade(grade: Grade): void {
    this.currentGrade = grade;
  }
  
  /**
   * تعيين المادة
   */
  setSubject(subject: Subject): void {
    this.currentSubject = subject;
  }
  
  // ============================================
  // 3. البحث في المنهج
  // ============================================
  
  /**
   * البحث عن مواضيع
   */
  searchTopics(options: TopicSearchOptions): CurriculumTopic[] {
    let topics: CurriculumTopic[] = [];
    
    // حسب الصف
    if (options.grade) {
      topics = getTopicsForGrade(options.grade);
    } else {
      topics = Object.values(IRAQI_CURRICULUM).flat();
    }
    
    // حسب المادة
    if (options.subject) {
      topics = topics.filter(t => t.subject === options.subject);
    }
    
    // حسب الصعوبة
    if (options.difficulty) {
      topics = topics.filter(t => t.difficulty === options.difficulty);
    }
    
    // حسب الكلمة المفتاحية
    if (options.keyword) {
      const keyword = options.keyword.toLowerCase();
      topics = topics.filter(t => 
        t.title.toLowerCase().includes(keyword) ||
        t.description.toLowerCase().includes(keyword)
      );
    }
    
    return topics;
  }
  
  /**
   * الحصول على موضوع بالمعرف
   */
  getTopicById(id: string): CurriculumTopic | undefined {
    return findTopicById(id);
  }
  
  /**
   * الحصول على مواضيع الصف الحالي
   */
  getCurrentGradeTopics(): CurriculumTopic[] {
    return getTopicsForGrade(this.currentGrade);
  }
  
  /**
   * الحصول على مواضيع المادة الحالية
   */
  getCurrentSubjectTopics(): CurriculumTopic[] {
    return getTopicsBySubject(this.currentGrade, this.currentSubject);
  }
  
  // ============================================
  // 4. إنشاء خطط الدروس
  // ============================================
  
  /**
   * إنشاء خطة درس
   */
  createLessonPlan(context: LessonContext): LessonPlan {
    const topics = this.searchTopics({
      grade: context.grade,
      subject: context.subject,
      keyword: context.topic
    });
    
    if (topics.length === 0) {
      throw new Error('Topic not found in curriculum');
    }
    
    const topic = topics[0];
    
    return {
      id: `lesson-${topic.id}`,
      title: topic.title,
      subject: topic.subject,
      grade: context.grade,
      duration: 45,
      objectives: this.generateObjectives(topic),
      introduction: this.generateIntroduction(topic),
      mainContent: this.generateMainContent(topic),
      examples: this.generateExamples(topic),
      exercises: this.generateExercises(topic, 5),
      summary: this.generateSummary(topic),
      homework: this.generateHomework(topic)
    };
  }
  
  /**
   * توليد أهداف التعلم
   */
  private generateObjectives(topic: CurriculumTopic): LearningObjective[] {
    const objectives: LearningObjective[] = [
      {
        id: `obj-${topic.id}-1`,
        description: `فهم مفهوم ${topic.title}`,
        type: 'understand',
        bloomLevel: 'understand'
      },
      {
        id: `obj-${topic.id}-2`,
        description: `تطبيق ${topic.title} في حل المسائل`,
        type: 'apply',
        bloomLevel: 'apply'
      }
    ];
    
    if (topic.difficulty === 'hard') {
      objectives.push({
        id: `obj-${topic.id}-3`,
        description: `تحليل المسائل المعقدة في ${topic.title}`,
        type: 'analyze',
        bloomLevel: 'analyze'
      });
    }
    
    return objectives;
  }
  
  /**
   * توليد مقدمة
   */
  private generateIntroduction(topic: CurriculumTopic): string {
    return `اليوم راح نتعلم عن ${topic.title}. ${topic.description}`;
  }
  
  /**
   * توليد المحتوى الرئيسي
   */
  private generateMainContent(topic: CurriculumTopic): string {
    let content = topic.description + '\n\n';
    
    if (topic.prerequisites && topic.prerequisites.length > 0) {
      content += `قبل ما نبلش، لازم تكون فاهم:\n`;
      topic.prerequisites.forEach(prereq => {
        content += `- ${prereq}\n`;
      });
      content += '\n';
    }
    
    content += 'خلينا نشرح الموضوع خطوة خطوة:\n\n';
    
    // إضافة خطوات حسب الموضوع
    if (topic.subject === 'math') {
      content += this.generateMathContent(topic);
    } else if (topic.subject === 'arabic') {
      content += this.generateArabicContent(topic);
    } else if (topic.subject === 'science') {
      content += this.generateScienceContent(topic);
    }
    
    return content;
  }
  
  /**
   * محتوى رياضيات
   */
  private generateMathContent(topic: CurriculumTopic): string {
    let content = '';
    
    if (topic.title.includes('جمع')) {
      content = `
الجمع يعني نضيف أرقام مع بعض.
مثلاً: ٢ + ٣ = ٥
يعني لو عندك تفاحتين وجبت ٣ تفاحات زيادة، يصير عندك ٥ تفاحات.

القاعدة الأساسية:
- نبدأ من الرقم الأول
- نعد للأمام بمقدار الرقم الثاني
- الناتج هو المجموع
      `;
    } else if (topic.title.includes('طرح')) {
      content = `
الطرح يعني نشيل أرقام.
مثلاً: ٥ - ٢ = ٣
يعني لو عندك ٥ تفاحات وأكلت ٢، يبقى عندك ٣ تفاحات.

القاعدة الأساسية:
- نبدأ من الرقم الأول (الأكبر)
- نعد للخلف بمقدار الرقم الثاني
- الناتج هو الفرق
      `;
    } else if (topic.title.includes('ضرب')) {
      content = `
الضرب هو جمع متكرر.
مثلاً: ٣ × ٤ = ١٢
يعني ٣ + ٣ + ٣ + ٣ = ١٢

جدول الضرب مهم جداً، لازم نحفظه زين!
      `;
    } else if (topic.title.includes('قسمة')) {
      content = `
القسمة هي توزيع بالتساوي.
مثلاً: ١٢ ÷ ٣ = ٤
يعني لو عندك ١٢ تفاحة وتريد توزعها على ٣ أطفال بالتساوي، كل واحد ياخذ ٤ تفاحات.
      `;
    }
    
    return content;
  }
  
  /**
   * محتوى عربي
   */
  private generateArabicContent(topic: CurriculumTopic): string {
    return `
سنتعلم اليوم ${topic.title} بطريقة سهلة وممتعة.
اللغة العربية لغتنا الجميلة، ولازم نتعلمها زين.
    `;
  }
  
  /**
   * محتوى علوم
   */
  private generateScienceContent(topic: CurriculumTopic): string {
    return `
اليوم راح نكتشف ${topic.title}.
العلوم تساعدنا نفهم العالم من حولنا.
    `;
  }
  
  /**
   * توليد أمثلة
   */
  private generateExamples(topic: CurriculumTopic): string[] {
    const examples: string[] = [];
    
    if (topic.subject === 'math') {
      if (topic.title.includes('جمع')) {
        examples.push('مثال ١: ٣ + ٢ = ٥');
        examples.push('مثال ٢: ٧ + ٤ = ١١');
        examples.push('مثال ٣: ٥ + ٥ = ١٠');
      } else if (topic.title.includes('طرح')) {
        examples.push('مثال ١: ٨ - ٣ = ٥');
        examples.push('مثال ٢: ١٠ - ٤ = ٦');
        examples.push('مثال ٣: ٩ - ٦ = ٣');
      }
    }
    
    return examples;
  }
  
  // ============================================
  // 5. توليد التمارين
  // ============================================
  
  /**
   * توليد تمارين
   */
  generateExercises(
    topic: CurriculumTopic,
    count: number = 5
  ): Exercise[] {
    
    const exercises: Exercise[] = [];
    
    for (let i = 0; i < count; i++) {
      const exercise = this.generateSingleExercise(topic, i + 1);
      if (exercise) {
        exercises.push(exercise);
      }
    }
    
    return exercises;
  }
  
  /**
   * توليد تمرين واحد
   */
  private generateSingleExercise(
    topic: CurriculumTopic,
    number: number
  ): Exercise | null {
    
    if (topic.subject === 'math') {
      return this.generateMathExercise(topic, number);
    } else if (topic.subject === 'arabic') {
      return this.generateArabicExercise(topic, number);
    }
    
    return null;
  }
  
  /**
   * توليد تمرين رياضيات
   */
  private generateMathExercise(
    topic: CurriculumTopic,
    number: number
  ): Exercise {
    
    let question = '';
    let answer = '';
    let solution = '';
    
    if (topic.title.includes('جمع')) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const result = a + b;
      
      question = `${a} + ${b} = ؟`;
      answer = result.toString();
      solution = `${a} + ${b} = ${result}`;
    } else if (topic.title.includes('طرح')) {
      const a = Math.floor(Math.random() * 10) + 5;
      const b = Math.floor(Math.random() * 5) + 1;
      const result = a - b;
      
      question = `${a} - ${b} = ؟`;
      answer = result.toString();
      solution = `${a} - ${b} = ${result}`;
    } else if (topic.title.includes('ضرب')) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const result = a * b;
      
      question = `${a} × ${b} = ؟`;
      answer = result.toString();
      solution = `${a} × ${b} = ${result}`;
    } else if (topic.title.includes('قسمة')) {
      const b = Math.floor(Math.random() * 5) + 2;
      const result = Math.floor(Math.random() * 10) + 1;
      const a = b * result;
      
      question = `${a} ÷ ${b} = ؟`;
      answer = result.toString();
      solution = `${a} ÷ ${b} = ${result}`;
    }
    
    return {
      id: `ex-${topic.id}-${number}`,
      question,
      answer,
      solution,
      type: 'calculation',
      difficulty: topic.difficulty,
      points: topic.difficulty === 'easy' ? 1 : topic.difficulty === 'medium' ? 2 : 3
    };
  }
  
  /**
   * توليد تمرين عربي
   */
  private generateArabicExercise(
    topic: CurriculumTopic,
    number: number
  ): Exercise {
    
    return {
      id: `ex-${topic.id}-${number}`,
      question: 'اكتب جملة مفيدة',
      answer: '',
      type: 'writing',
      difficulty: topic.difficulty,
      points: 2
    };
  }
  
  /**
   * توليد ملخص
   */
  private generateSummary(topic: CurriculumTopic): string {
    return `
تعلمنا اليوم ${topic.title}:
- ${topic.description}
- شفنا أمثلة وحلينا تمارين
- المهم نتمرن زين حتى نفهم الموضوع

لو عندك أي سؤال، اني موجود!
    `;
  }
  
  /**
   * توليد واجب منزلي
   */
  private generateHomework(topic: CurriculumTopic): string {
    return `
الواجب البيتي:
١. راجع الدرس زين
٢. حل التمارين الموجودة
٣. جرب تسوي أمثلة بنفسك

بالتوفيق يبه! 📚
    `;
  }
  
  // ============================================
  // 6. التقدم والإحصائيات
  // ============================================
  
  /**
   * تسجيل إكمال موضوع
   */
  markTopicCompleted(topicId: string, score: number): void {
    this.completedTopics.add(topicId);
    this.studentProgress.set(topicId, score);
  }
  
  /**
   * فحص إكمال موضوع
   */
  isTopicCompleted(topicId: string): boolean {
    return this.completedTopics.has(topicId);
  }
  
  /**
   * الحصول على درجة موضوع
   */
  getTopicScore(topicId: string): number {
    return this.studentProgress.get(topicId) || 0;
  }
  
  /**
   * الحصول على التقدم الإجمالي
   */
  getOverallProgress(grade: Grade, subject: Subject): {
    completed: number;
    total: number;
    percentage: number;
    averageScore: number;
  } {
    
    const topics = getTopicsBySubject(grade, subject);
    const completed = topics.filter(t => 
      this.completedTopics.has(t.id)
    ).length;
    
    const scores = Array.from(this.studentProgress.values());
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
    
    return {
      completed,
      total: topics.length,
      percentage: (completed / topics.length) * 100,
      averageScore
    };
  }
  
  /**
   * الحصول على المواضيع التالية
   */
  getNextTopics(count: number = 3): CurriculumTopic[] {
    const allTopics = this.getCurrentSubjectTopics();
    const remaining = allTopics.filter(t => 
      !this.completedTopics.has(t.id)
    );
    
    return remaining.slice(0, count);
  }
  
  /**
   * الحصول على المواضيع الموصى بها
   */
  getRecommendedTopics(): CurriculumTopic[] {
    const next = this.getNextTopics(1);
    if (next.length === 0) return [];
    
    const nextTopic = next[0];
    
    // إضافة مواضيع مشابهة
    const similar = this.searchTopics({
      subject: nextTopic.subject,
      difficulty: nextTopic.difficulty
    }).filter(t => 
      t.id !== nextTopic.id && 
      !this.completedTopics.has(t.id)
    );
    
    return [nextTopic, ...similar.slice(0, 2)];
  }
  
  // ============================================
  // 7. إعادة تعيين
  // ============================================
  
  /**
   * إعادة تعيين التقدم
   */
  resetProgress(): void {
    this.completedTopics.clear();
    this.studentProgress.clear();
  }
  
  /**
   * تصدير التقدم
   */
  exportProgress(): string {
    return JSON.stringify({
      completed: Array.from(this.completedTopics),
      progress: Array.from(this.studentProgress.entries())
    });
  }
  
  /**
   * استيراد التقدم
   */
  importProgress(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      this.completedTopics = new Set(parsed.completed);
      this.studentProgress = new Map(parsed.progress);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================
// 8. دوال مساعدة عامة
// ============================================

export function createCurriculumService(): CurriculumService {
  return new CurriculumService();
}

export function getTopicsForGradeAndSubject(
  grade: Grade,
  subject: Subject
): CurriculumTopic[] {
  return getTopicsBySubject(grade, subject);
}

export default CurriculumService;