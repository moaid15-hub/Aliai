// src/components/personas/PersonaCreator.tsx
'use client';

import React, { useState } from 'react';
import { Persona, PersonaCategory, PersonaTone, PersonaLanguageStyle, PersonaKnowledgeArea, PersonaBehavior } from '@/types/persona.types';
import { PersonaService } from '@/services/persona/personaService';
import { PERSONA_TEMPLATES } from '@/services/persona/personaTemplates';
import { Sparkles, Brain, MessageCircle, Settings, Save, X, Plus, Trash2, Star } from 'lucide-react';

interface PersonaCreatorProps {
  onSave?: (persona: Persona) => void;
  onCancel?: () => void;
  initialData?: Partial<Persona>;
  mode?: 'create' | 'edit';
}

export default function PersonaCreator({ 
  onSave, 
  onCancel, 
  initialData,
  mode = 'create' 
}: PersonaCreatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [useTemplate, setUseTemplate] = useState(false);
  
  // البيانات الأساسية
  const [name, setName] = useState(initialData?.name || '');
  const [avatar, setAvatar] = useState(initialData?.avatar || '🤖');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<PersonaCategory>(initialData?.category || 'general');
  const [tone, setTone] = useState<PersonaTone>(initialData?.tone || 'friendly');
  const [languageStyle, setLanguageStyle] = useState<PersonaLanguageStyle>(initialData?.language_style || 'moderate');
  
  // المعرفة
  const [knowledgeAreas, setKnowledgeAreas] = useState<PersonaKnowledgeArea[]>(initialData?.knowledge_areas || []);
  const [specializations, setSpecializations] = useState<string[]>(initialData?.specializations || []);
  const [newSpecialization, setNewSpecialization] = useState('');
  
  // السلوك
  const [behavior, setBehavior] = useState<PersonaBehavior>(initialData?.behavior || {
    greeting_style: 'مرحباً! كيف يمكنني مساعدتك؟',
    response_length: 'medium',
    use_examples: true,
    ask_clarifying_questions: false,
    provide_sources: false,
    use_emojis: false
  });
  
  // System Prompt
  const [systemPrompt, setSystemPrompt] = useState(initialData?.system_prompt || '');
  
  // الإعدادات
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? false);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');

  // الخطوات
  const steps = [
    { id: 0, title: 'المعلومات الأساسية', icon: Sparkles },
    { id: 1, title: 'المعرفة والتخصصات', icon: Brain },
    { id: 2, title: 'السلوك والأسلوب', icon: MessageCircle },
    { id: 3, title: 'الإعدادات المتقدمة', icon: Settings }
  ];

  // الإيموجيات المقترحة
  const suggestedEmojis = [
    '🤖', '👨‍💼', '👩‍🏫', '👨‍⚕️', '⚖️', '💻', '🎨', '✍️', 
    '💪', '🧠', '📊', '🎯', '💡', '🔬', '🎭', '🎵'
  ];

  // الفئات
  const categories: { value: PersonaCategory; label: string; icon: string }[] = [
    { value: 'education', label: 'تعليم', icon: '📚' },
    { value: 'professional', label: 'مهني', icon: '💼' },
    { value: 'creative', label: 'إبداعي', icon: '🎨' },
    { value: 'technical', label: 'تقني', icon: '💻' },
    { value: 'health', label: 'صحي', icon: '⚕️' },
    { value: 'business', label: 'أعمال', icon: '📈' },
    { value: 'entertainment', label: 'ترفيه', icon: '🎭' },
    { value: 'general', label: 'عام', icon: '🌟' }
  ];

  // النبرات
  const tones: { value: PersonaTone; label: string; description: string }[] = [
    { value: 'formal', label: 'رسمي', description: 'أسلوب رسمي واحترافي' },
    { value: 'friendly', label: 'ودود', description: 'أسلوب ودود ومريح' },
    { value: 'professional', label: 'احترافي', description: 'أسلوب احترافي متوازن' },
    { value: 'casual', label: 'عفوي', description: 'أسلوب عفوي وبسيط' },
    { value: 'humorous', label: 'فكاهي', description: 'أسلوب مرح وخفيف' },
    { value: 'empathetic', label: 'متعاطف', description: 'أسلوب متعاطف وداعم' }
  ];

  // تحميل من قالب
  const loadTemplate = (templateId: string) => {
    const template = PERSONA_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const t = template.template;
    setName(t.name || '');
    setAvatar(t.avatar || '🤖');
    setDescription(t.description || '');
    setCategory(t.category || 'general');
    setTone(t.tone || 'friendly');
    setLanguageStyle(t.language_style || 'moderate');
    setKnowledgeAreas(t.knowledge_areas || []);
    setSpecializations(t.specializations || []);
    setBehavior(t.behavior || behavior);
    setSystemPrompt(t.system_prompt || '');
    setTags(t.tags || []);
    setUseTemplate(false);
  };

  // إضافة مجال معرفة
  const addKnowledgeArea = () => {
    const newArea: PersonaKnowledgeArea = {
      id: Date.now().toString(),
      name: '',
      description: '',
      expertise_level: 3
    };
    setKnowledgeAreas([...knowledgeAreas, newArea]);
  };

  // حذف مجال معرفة
  const removeKnowledgeArea = (id: string) => {
    setKnowledgeAreas(knowledgeAreas.filter(area => area.id !== id));
  };

  // تحديث مجال معرفة
  const updateKnowledgeArea = (id: string, updates: Partial<PersonaKnowledgeArea>) => {
    setKnowledgeAreas(
      knowledgeAreas.map(area => 
        area.id === id ? { ...area, ...updates } : area
      )
    );
  };

  // إضافة تخصص
  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  // إضافة وسم
  const addTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // توليد System Prompt
  const generateSystemPrompt = () => {
    let prompt = `أنت ${name || 'مساعد ذكي'}. `;
    prompt += `تتحدث بنبرة ${tone === 'formal' ? 'رسمية' : tone === 'friendly' ? 'ودودة' : tone === 'professional' ? 'احترافية' : tone === 'casual' ? 'عفوية' : tone === 'humorous' ? 'فكاهية' : 'متعاطفة'}. `;
    
    if (description) {
      prompt += `${description} `;
    }

    if (knowledgeAreas.length > 0) {
      prompt += `\n\nمجالات خبرتك:\n`;
      knowledgeAreas.forEach(area => {
        if (area.name) {
          prompt += `- ${area.name}: ${area.description} (مستوى الخبرة: ${area.expertise_level}/5)\n`;
        }
      });
    }

    prompt += `\n\nسلوكك في الرد:`;
    prompt += `\n- طول الإجابة: ${behavior.response_length === 'short' ? 'مختصر' : behavior.response_length === 'long' ? 'مفصل' : 'متوسط'}`;
    if (behavior.use_examples) prompt += '\n- استخدم أمثلة عملية في شرحك';
    if (behavior.ask_clarifying_questions) prompt += '\n- اطرح أسئلة توضيحية عند الحاجة';
    if (behavior.provide_sources) prompt += '\n- قدم مصادر موثوقة عند الإمكان';
    if (behavior.use_emojis) prompt += '\n- استخدم الإيموجي لجعل الردود أكثر حيوية';

    setSystemPrompt(prompt);
  };

  // التحقق من صحة الخطوة
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return name.trim() !== '' && description.trim() !== '';
      case 1:
        return true; // اختياري
      case 2:
        return behavior.greeting_style.trim() !== '';
      case 3:
        return systemPrompt.trim() !== '';
      default:
        return false;
    }
  };

  // الحفظ
  const handleSave = () => {
    const personaData: Partial<Persona> = {
      name,
      avatar,
      description,
      category,
      tone,
      language_style: languageStyle,
      knowledge_areas: knowledgeAreas,
      specializations,
      behavior,
      system_prompt: systemPrompt,
      is_public: isPublic,
      tags
    };

    if (mode === 'edit' && initialData?.id) {
      const updated = PersonaService.update(initialData.id, personaData);
      if (updated && onSave) {
        onSave(updated);
      }
    } else {
      const created = PersonaService.create(personaData, 'current_user'); // TODO: استخدام معرف المستخدم الحقيقي
      if (onSave) {
        onSave(created);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {mode === 'edit' ? 'تعديل الشخصية' : 'إنشاء شخصية جديدة'}
            </h2>
            <p className="text-purple-100 mt-1">
              اصنع شخصية مخصصة للذكاء الاصطناعي
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Steps Progress */}
        <div className="mt-6 flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-white text-purple-600 scale-110'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-800 text-purple-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className={`text-xs mt-2 ${isActive ? 'font-semibold' : ''}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-purple-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-white transition-all duration-500 ${
                        isCompleted ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[500px]">
        {/* الخطوة 0: المعلومات الأساسية */}
        {currentStep === 0 && (
          <div className="space-y-6">
            {/* اختيار قالب */}
            {mode === 'create' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <button
                  onClick={() => setUseTemplate(!useTemplate)}
                  className="w-full flex items-center justify-between text-right"
                >
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      هل تريد البدء من قالب جاهز؟
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      اختر قالباً جاهزاً وعدّل عليه حسب حاجتك
                    </p>
                  </div>
                  <Star className={`w-6 h-6 ${useTemplate ? 'text-yellow-500 fill-yellow-500' : 'text-blue-400'}`} />
                </button>

                {useTemplate && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {PERSONA_TEMPLATES.map(template => (
                      <button
                        key={template.id}
                        onClick={() => loadTemplate(template.id)}
                        className="p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition-all text-center"
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* الاسم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الاسم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: معلم رياضيات"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                dir="rtl"
              />
            </div>

            {/* الأيقونة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الأيقونة (emoji)
              </label>
              <div className="flex items-center gap-3">
                <div className="text-5xl">{avatar}</div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                    maxLength={2}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedEmojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setAvatar(emoji)}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* الوصف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الوصف <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصفاً مختصراً للشخصية..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white resize-none"
                dir="rtl"
              />
            </div>

            {/* الفئة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الفئة
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 border-2 rounded-xl transition-all text-center ${
                      category === cat.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* النبرة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                النبرة
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tones.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`p-4 border-2 rounded-xl transition-all text-right ${
                      tone === t.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{t.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* مستوى اللغة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                مستوى اللغة
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'simple', label: 'بسيط' },
                  { value: 'moderate', label: 'متوسط' },
                  { value: 'advanced', label: 'متقدم' },
                  { value: 'technical', label: 'تقني' }
                ].map(level => (
                  <button
                    key={level.value}
                    onClick={() => setLanguageStyle(level.value as PersonaLanguageStyle)}
                    className={`flex-1 py-2 px-4 border-2 rounded-lg transition-all ${
                      languageStyle === level.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* الخطوة 1: المعرفة والتخصصات */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* مجالات المعرفة */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  مجالات المعرفة
                </label>
                <button
                  onClick={addKnowledgeArea}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  إضافة مجال
                </button>
              </div>

              <div className="space-y-3">
                {knowledgeAreas.map(area => (
                  <div key={area.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={area.name}
                        onChange={(e) => updateKnowledgeArea(area.id, { name: e.target.value })}
                        placeholder="اسم المجال"
                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                        dir="rtl"
                      />
                      <input
                        type="text"
                        value={area.description}
                        onChange={(e) => updateKnowledgeArea(area.id, { description: e.target.value })}
                        placeholder="الوصف"
                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                        dir="rtl"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                          مستوى الخبرة: {area.expertise_level}/5
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={area.expertise_level}
                          onChange={(e) => updateKnowledgeArea(area.id, { expertise_level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                          className="w-full"
                        />
                      </div>
                      <button
                        onClick={() => removeKnowledgeArea(area.id)}
                        className="mr-3 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {knowledgeAreas.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    لم تضف أي مجالات معرفة بعد
                  </div>
                )}
              </div>
            </div>

            {/* التخصصات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                التخصصات
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                  placeholder="أضف تخصصاً..."
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                  dir="rtl"
                />
                <button
                  onClick={addSpecialization}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                  >
                    <span>{spec}</span>
                    <button
                      onClick={() => setSpecializations(specializations.filter((_, i) => i !== index))}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* الخطوة 2: السلوك والأسلوب */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* أسلوب التحية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                أسلوب التحية <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={behavior.greeting_style}
                onChange={(e) => setBehavior({ ...behavior, greeting_style: e.target.value })}
                placeholder="مثال: مرحباً! أنا هنا لمساعدتك..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                dir="rtl"
              />
            </div>

            {/* طول الرد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                طول الرد
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'short', label: 'مختصر' },
                  { value: 'medium', label: 'متوسط' },
                  { value: 'long', label: 'مفصل' }
                ].map(length => (
                  <button
                    key={length.value}
                    onClick={() => setBehavior({ ...behavior, response_length: length.value as 'short' | 'medium' | 'long' })}
                    className={`flex-1 py-2 px-4 border-2 rounded-lg transition-all ${
                      behavior.response_length === length.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {length.label}
                  </button>
                ))}
              </div>
            </div>

            {/* السلوكيات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                السلوكيات
              </label>
              <div className="space-y-3">
                {[
                  { key: 'use_examples', label: 'استخدام الأمثلة', desc: 'تقديم أمثلة عملية في الشرح' },
                  { key: 'ask_clarifying_questions', label: 'طرح أسئلة توضيحية', desc: 'السؤال لفهم أفضل' },
                  { key: 'provide_sources', label: 'تقديم المصادر', desc: 'إضافة مراجع وروابط' },
                  { key: 'use_emojis', label: 'استخدام الإيموجي', desc: 'جعل الردود أكثر حيوية' }
                ].map(option => (
                  <label
                    key={option.key}
                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={behavior[option.key as keyof PersonaBehavior] as boolean}
                      onChange={(e) => setBehavior({ ...behavior, [option.key]: e.target.checked })}
                      className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* الخطوة 3: الإعدادات المتقدمة */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* System Prompt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  System Prompt <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={generateSystemPrompt}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  توليد تلقائي
                </button>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="التعليمات التي ستُرسل لنموذج الذكاء الاصطناعي..."
                rows={12}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white resize-none font-mono text-sm"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                هذا النص سيُستخدم لتوجيه سلوك الذكاء الاصطناعي
              </p>
            </div>

            {/* الوسوم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الوسوم (Tags)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="أضف وسماً..."
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                  dir="rtl"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* الخصوصية */}
            <div>
              <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    جعل الشخصية عامة
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    السماح للمستخدمين الآخرين باستخدام ونسخ هذه الشخصية
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Footer - الأزرار */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              إلغاء
            </button>
          )}
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              السابق
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid()}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!systemPrompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {mode === 'edit' ? 'حفظ التعديلات' : 'إنشاء الشخصية'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


