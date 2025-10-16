// src/services/persona/personaService.ts

import { Persona, PersonaFilters, PersonaStats } from '@/types/persona.types';
import { PersonaStorage } from './personaStorage';
import { PERSONA_TEMPLATES } from './personaTemplates';

export class PersonaService {
  // إنشاء شخصية جديدة
  static create(data: Partial<Persona>, userId: string): Persona {
    const persona: Persona = {
      id: `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name || 'شخصية جديدة',
      avatar: data.avatar || '🤖',
      description: data.description || '',
      category: data.category || 'general',
      tone: data.tone || 'friendly',
      language_style: data.language_style || 'moderate',
      knowledge_areas: data.knowledge_areas || [],
      specializations: data.specializations || [],
      behavior: data.behavior || {
        greeting_style: 'مرحباً! كيف يمكنني مساعدتك؟',
        response_length: 'medium',
        use_examples: true,
        ask_clarifying_questions: false,
        provide_sources: false,
        use_emojis: false
      },
      system_prompt: data.system_prompt || 'أنت مساعد ذكي ومفيد.',
      usage_count: 0,
      rating: 0,
      is_public: data.is_public ?? false,
      is_featured: false,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
      tags: data.tags || []
    };

    PersonaStorage.save(persona);
    return persona;
  }

  // تحديث شخصية
  static update(personaId: string, updates: Partial<Persona>): Persona | null {
    const persona = PersonaStorage.getById(personaId);
    if (!persona) return null;

    const updated: Persona = {
      ...persona,
      ...updates,
      updated_at: new Date()
    };

    PersonaStorage.save(updated);
    return updated;
  }

  // حذف شخصية
  static delete(personaId: string): boolean {
    PersonaStorage.delete(personaId);
    return true;
  }

  // الحصول على شخصية
  static getById(personaId: string): Persona | undefined {
    return PersonaStorage.getById(personaId);
  }

  // الحصول على جميع الشخصيات
  static getAll(filters?: PersonaFilters): Persona[] {
    let personas = PersonaStorage.loadAll();

    if (!filters) return personas;

    // تطبيق الفلاتر
    if (filters.category) {
      personas = personas.filter(p => p.category === filters.category);
    }

    if (filters.tone) {
      personas = personas.filter(p => p.tone === filters.tone);
    }

    if (filters.is_public !== undefined) {
      personas = personas.filter(p => p.is_public === filters.is_public);
    }

    if (filters.is_featured) {
      personas = personas.filter(p => p.is_featured);
    }

    if (filters.min_rating) {
      personas = personas.filter(p => p.rating >= filters.min_rating);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      personas = personas.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return personas;
  }

  // تسجيل استخدام
  static recordUsage(personaId: string): void {
    const persona = PersonaStorage.getById(personaId);
    if (persona) {
      persona.usage_count++;
      PersonaStorage.save(persona);
    }
  }

  // تقييم الشخصية
  static rate(personaId: string, rating: number): boolean {
    if (rating < 0 || rating > 5) return false;
    
    const persona = PersonaStorage.getById(personaId);
    if (!persona) return false;

    persona.rating = rating;
    PersonaStorage.save(persona);
    return true;
  }

  // إحصائيات
  static getStats(userId: string): PersonaStats {
    const allPersonas = PersonaStorage.loadAll();
    const userPersonas = allPersonas.filter(p => p.created_by === userId);

    return {
      total_personas: userPersonas.length,
      public_personas: userPersonas.filter(p => p.is_public).length,
      private_personas: userPersonas.filter(p => !p.is_public).length,
      most_used: userPersonas
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 5),
      recently_created: userPersonas
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(0, 5)
    };
  }

  // إنشاء من قالب
  static createFromTemplate(templateId: string, userId: string): Persona | null {
    const template = PERSONA_TEMPLATES.find(t => t.id === templateId);
    if (!template) return null;

    return this.create(template.template, userId);
  }

  // نسخ شخصية
  static duplicate(personaId: string, userId: string): Persona | null {
    const original = PersonaStorage.getById(personaId);
    if (!original) return null;

    const duplicate = this.create({
      ...original,
      name: `${original.name} (نسخة)`,
      is_public: false,
      usage_count: 0,
      rating: 0
    }, userId);

    return duplicate;
  }

  // تحويل إلى System Prompt
  static generateSystemPrompt(persona: Persona): string {
    let prompt = persona.system_prompt;

    // إضافة معلومات السلوك
    if (persona.behavior.use_examples) {
      prompt += '\n- استخدم أمثلة عملية في شرحك';
    }
    if (persona.behavior.ask_clarifying_questions) {
      prompt += '\n- اطرح أسئلة توضيحية عند الحاجة';
    }
    if (persona.behavior.provide_sources) {
      prompt += '\n- قدم مصادر موثوقة عند الإمكان';
    }

    // إضافة الأسلوب
    prompt += `\n\nأسلوب الرد: ${persona.behavior.response_length === 'short' ? 'مختصر' : persona.behavior.response_length === 'long' ? 'مفصل' : 'متوسط'}`;
    prompt += `\nالنبرة: ${persona.tone}`;

    return prompt;
  }
}


