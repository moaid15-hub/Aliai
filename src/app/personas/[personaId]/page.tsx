// src/app/personas/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Persona } from '@/types/persona.types';
import { PersonaService } from '@/services/persona/personaService';
import { 
  ArrowRight, Edit, Trash2, Copy, Share2, Star, 
  TrendingUp, Clock, Tag, MessageCircle, Sparkles,
  ChevronDown, ChevronUp, Code
} from 'lucide-react';

export default function PersonaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    loadPersona();
  }, [params.id]);

  const loadPersona = () => {
    const id = params.id as string;
    const loaded = PersonaService.getById(id);
    if (loaded) {
      setPersona(loaded);
      setUserRating(loaded.rating);
    }
  };

  const handleEdit = () => {
    router.push(`/personas/${persona?.id}/edit`);
  };

  const handleDelete = () => {
    if (!persona) return;
    
    const confirmed = confirm(`هل أنت متأكد من حذف الشخصية "${persona.name}"؟`);
    if (confirmed) {
      PersonaService.delete(persona.id);
      router.push('/personas');
    }
  };

  const handleDuplicate = () => {
    if (!persona) return;
    
    const duplicate = PersonaService.duplicate(persona.id, 'current_user_id');
    if (duplicate) {
      alert(`تم نسخ الشخصية بنجاح! 📋`);
      router.push(`/personas/${duplicate.id}`);
    }
  };

  const handleRate = (rating: number) => {
    if (!persona) return;
    
    PersonaService.rate(persona.id, rating);
    setUserRating(rating);
    loadPersona();
  };

  const handleUse = () => {
    if (!persona) return;
    
    PersonaService.recordUsage(persona.id);
    // Navigate to chat with this persona
    router.push(`/chat?persona=${persona.id}`);
  };

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
        <div className="text-center">
          <div className="text-8xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            الشخصية غير موجودة
          </h2>
          <button
            onClick={() => router.push('/personas')}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            العودة للمعرض
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/personas')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة للمعرض</span>
        </button>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="text-8xl">{persona.avatar}</div>
                
                {/* Info */}
                <div className="text-white">
                  <h1 className="text-4xl font-bold mb-2">{persona.name}</h1>
                  <p className="text-white/90 text-lg mb-4 max-w-2xl">
                    {persona.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    {persona.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-current text-yellow-400" />
                        <span className="font-bold">{persona.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>{persona.usage_count} استخدام</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{new Date(persona.created_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleUse}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                استخدم هذه الشخصية
              </button>
              
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all font-medium"
              >
                <Edit className="w-5 h-5" />
                تعديل
              </button>
              
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all font-medium"
              >
                <Copy className="w-5 h-5" />
                نسخ
              </button>
              
              <button
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-all font-medium"
              >
                <Share2 className="w-5 h-5" />
                مشاركة
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
              >
                <Trash2 className="w-5 h-5" />
                حذف
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Rating */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                قيّم هذه الشخصية
              </h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRate(rating)}
                    className={`transition-all ${
                      rating <= userRating
                        ? 'text-yellow-500 scale-110'
                        : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
                <span className="mr-3 text-gray-600 dark:text-gray-400">
                  {userRating > 0 ? `${userRating} / 5` : 'لم يتم التقييم بعد'}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                  الفئة
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium">
                    {persona.category}
                  </span>
                </div>
              </div>

              {/* Tone */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                  النبرة
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
                    {persona.tone}
                  </span>
                </div>
              </div>

              {/* Language Style */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                  مستوى اللغة
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium">
                    {persona.language_style}
                  </span>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                  الخصوصية
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg font-medium ${
                    persona.is_public
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {persona.is_public ? 'عامة' : 'خاصة'}
                  </span>
                </div>
              </div>
            </div>

            {/* Knowledge Areas */}
            {persona.knowledge_areas.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  مجالات المعرفة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {persona.knowledge_areas.map(area => (
                    <div
                      key={area.id}
                      className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                    >
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                        {area.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {area.description}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <Star
                            key={level}
                            className={`w-4 h-4 fill-current ${
                              level <= area.expertise_level
                                ? 'text-yellow-500'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations */}
            {persona.specializations.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  التخصصات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {persona.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Behavior */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                السلوك والأسلوب
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    أسلوب التحية
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    "{persona.behavior.greeting_style}"
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">طول الرد</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {persona.behavior.response_length === 'short' ? 'مختصر' :
                       persona.behavior.response_length === 'long' ? 'مفصّل' : 'متوسط'}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الأمثلة</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {persona.behavior.use_examples ? '✓' : '✗'}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الأسئلة</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {persona.behavior.ask_clarifying_questions ? '✓' : '✗'}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الإيموجي</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {persona.behavior.use_emojis ? '✓' : '✗'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <button
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    System Prompt
                  </h3>
                </div>
                {showSystemPrompt ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              
              {showSystemPrompt && (
                <div className="mt-3 p-4 bg-gray-900 dark:bg-black rounded-xl">
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap overflow-x-auto" dir="ltr">
                    {persona.system_prompt}
                  </pre>
                </div>
              )}
            </div>

            {/* Tags */}
            {persona.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    الوسوم
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {persona.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
