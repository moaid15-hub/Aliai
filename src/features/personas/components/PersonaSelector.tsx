// src/components/personas/PersonaSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Persona, PersonaCategory } from '@/features/personas/types/persona.types';
import { PersonaService } from '@/features/personas/services/personaService';
import { Search, X, Sparkles, Star, TrendingUp } from 'lucide-react';

interface PersonaSelectorProps {
  onSelect: (persona: Persona | null) => void;
  selectedPersona?: Persona | null;
  onClose?: () => void;
}

export default function PersonaSelector({ onSelect, selectedPersona, onClose }: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PersonaCategory | 'all'>('all');
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);

  const categories = [
    { value: 'all' as const, label: 'الكل', icon: '🌟' },
    { value: 'education' as PersonaCategory, label: 'تعليم', icon: '📚' },
    { value: 'professional' as PersonaCategory, label: 'مهني', icon: '💼' },
    { value: 'creative' as PersonaCategory, label: 'إبداعي', icon: '🎨' },
    { value: 'technical' as PersonaCategory, label: 'تقني', icon: '💻' },
    { value: 'health' as PersonaCategory, label: 'صحي', icon: '⚕️' },
    { value: 'business' as PersonaCategory, label: 'أعمال', icon: '📈' },
  ];

  useEffect(() => {
    loadPersonas();
  }, []);

  useEffect(() => {
    filterPersonas();
  }, [personas, search, selectedCategory]);

  const loadPersonas = () => {
    const allPersonas = PersonaService.getAll();
    setPersonas(allPersonas);
  };

  const filterPersonas = () => {
    let filtered = personas;

    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // فلترة حسب البحث
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredPersonas(filtered);
  };

  const handleSelect = (persona: Persona) => {
    PersonaService.recordUsage(persona.id);
    onSelect(persona);
    if (onClose) onClose();
  };

  const getMostUsed = () => {
    return [...personas]
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 3);
  };

  const mostUsed = getMostUsed();

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">اختر شخصية</h2>
              <p className="text-white/80 text-sm">حدد الشخصية للمحادثة</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن شخصية..."
            className="w-full pr-11 pl-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            dir="rtl"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Default Option */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            onSelect(null);
            if (onClose) onClose();
          }}
          className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
            !selectedPersona
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🤖</div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">
                Oqool AI - الوضع الافتراضي
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                المساعد الذكي العام بدون شخصية محددة
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Most Used */}
      {!search && mostUsed.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              الأكثر استخداماً
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {mostUsed.map(persona => (
              <button
                key={persona.id}
                onClick={() => handleSelect(persona)}
                className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg hover:shadow-md transition-all border border-purple-200 dark:border-purple-800"
              >
                <div className="text-2xl mb-1">{persona.avatar}</div>
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {persona.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {persona.usage_count} مرة
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Personas List */}
      <div className="max-h-96 overflow-y-auto p-4">
        {filteredPersonas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 dark:text-gray-400">
              لم يتم العثور على شخصيات
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              جرّب البحث بكلمات مختلفة
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPersonas.map(persona => (
              <button
                key={persona.id}
                onClick={() => handleSelect(persona)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-right hover:shadow-md ${
                  selectedPersona?.id === persona.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{persona.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {persona.name}
                      </p>
                      {persona.rating > 0 && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">{persona.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {persona.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        {persona.category}
                      </span>
                      {persona.usage_count > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {persona.usage_count} استخدام
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

