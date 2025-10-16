// src/types/persona.types.ts

export type PersonaCategory = 
  | 'education'      // تعليم
  | 'professional'   // مهني
  | 'creative'       // إبداعي
  | 'technical'      // تقني
  | 'health'         // صحي
  | 'business'       // أعمال
  | 'entertainment'  // ترفيه
  | 'general';       // عام

export type PersonaTone = 
  | 'formal'         // رسمي
  | 'friendly'       // ودود
  | 'professional'   // احترافي
  | 'casual'         // عفوي
  | 'humorous'       // فكاهي
  | 'empathetic';    // متعاطف

export type PersonaLanguageStyle =
  | 'simple'         // بسيط
  | 'moderate'       // متوسط
  | 'advanced'       // متقدم
  | 'technical';     // تقني

export interface PersonaKnowledgeArea {
  id: string;
  name: string;
  description: string;
  expertise_level: 1 | 2 | 3 | 4 | 5; // 1=مبتدئ, 5=خبير
}

export interface PersonaBehavior {
  greeting_style: string;           // أسلوب التحية
  response_length: 'short' | 'medium' | 'long';
  use_examples: boolean;            // استخدام الأمثلة
  ask_clarifying_questions: boolean; // طرح أسئلة توضيحية
  provide_sources: boolean;         // تقديم المصادر
  use_emojis: boolean;              // استخدام الإيموجي
}

export interface Persona {
  id: string;
  name: string;
  avatar: string;                   // URL أو emoji
  description: string;
  category: PersonaCategory;
  tone: PersonaTone;
  language_style: PersonaLanguageStyle;
  
  // المعرفة والخبرة
  knowledge_areas: PersonaKnowledgeArea[];
  specializations: string[];        // التخصصات
  
  // السلوك
  behavior: PersonaBehavior;
  
  // System Prompt
  system_prompt: string;            // التعليمات للـ AI
  
  // الإحصائيات
  usage_count: number;              // عدد مرات الاستخدام
  rating: number;                   // التقييم (0-5)
  is_public: boolean;               // عامة أو خاصة
  is_featured: boolean;             // مميزة
  
  // البيانات الوصفية
  created_by: string;               // معرف المستخدم
  created_at: Date;
  updated_at: Date;
  tags: string[];                   // وسوم للبحث
}

export interface PersonaTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: PersonaCategory;
  template: Partial<Persona>;       // قالب جاهز
}

export interface PersonaFilters {
  category?: PersonaCategory;
  tone?: PersonaTone;
  language_style?: PersonaLanguageStyle;
  search?: string;
  is_public?: boolean;
  is_featured?: boolean;
  min_rating?: number;
}

export interface PersonaStats {
  total_personas: number;
  public_personas: number;
  private_personas: number;
  most_used: Persona[];
  recently_created: Persona[];
}


