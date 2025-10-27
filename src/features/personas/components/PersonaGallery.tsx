// src/components/personas/PersonaGallery.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Persona, PersonaFilters as PersonaFiltersType } from '@/features/personas/types/persona.types';
import { PersonaService } from '@/features/personas/services/personaService';
import { PersonaProvider } from '@/features/personas/context/PersonaContext';
import PersonaList from './PersonaList';
import PersonaFilters from './PersonaFilters';
import PersonaPreview from './PersonaPreview';
import PersonaStats from './PersonaStats';
import PersonaTemplateSelector from './PersonaTemplateSelector';
import PersonaExportImport from './PersonaExportImport';
import { PersonaTemplate } from '@/features/personas/types/persona.types';
import { 
  Plus, Sparkles, Grid, List, BarChart3, 
  Download, Upload, Search, Filter, X 
} from 'lucide-react';

export default function PersonaGallery() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [filters, setFilters] = useState<PersonaFiltersType>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'stats'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPersonas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [personas, filters, searchTerm]);

  const loadPersonas = () => {
    setLoading(true);
    try {
      const allPersonas = PersonaService.getAll();
      setPersonas(allPersonas);
    } catch (error) {
      console.error('Error loading personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...personas];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(persona =>
        persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        persona.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(persona => persona.category === filters.category);
    }

    // Tone filter
    if (filters.tone) {
      filtered = filtered.filter(persona => persona.tone === filters.tone);
    }

    // Language style filter
    if (filters.language_style) {
      filtered = filtered.filter(persona => persona.language_style === filters.language_style);
    }

    // Rating filter
    if (filters.min_rating) {
      filtered = filtered.filter(persona => persona.rating >= filters.min_rating!);
    }

    // Public filter
    if (filters.is_public !== undefined) {
      filtered = filtered.filter(persona => persona.is_public === filters.is_public);
    }

    // Featured filter
    if (filters.is_featured !== undefined) {
      filtered = filtered.filter(persona => persona.is_featured === filters.is_featured);
    }

    setFilteredPersonas(filtered);
  };

  const handlePersonaClick = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  const handlePersonaUse = (persona: Persona) => {
    PersonaService.recordUsage(persona.id);
    // التنقل إلى صفحة الشخصية الديناميكية
    router.push(`/personas/${persona.id}`);
  };

  const handleTemplateSelect = (template: PersonaTemplate) => {
    router.push(`/personas/create?template=${template.id}`);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleImport = (importedPersonas: Persona[]) => {
    loadPersonas();
    setShowExportImport(false);
  };

  return (
    <PersonaProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  معرض الشخصيات
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filteredPersonas.length} من أصل {personas.length} شخصية
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  قوالب جاهزة
                </button>
                <button
                  onClick={() => {
                    const isConfirmed = confirm(
                      '⚠️ تحذير: إنشاء الشخصيات مخصص للمطورين فقط!\n\n' +
                      '• يتطلب معرفة تقنية بالـ System Prompts\n' +
                      '• التعديل الخاطئ قد يؤثر على الأداء\n\n' +
                      'هل أنت متأكد من أنك مطور وتريد المتابعة؟'
                    );
                    if (isConfirmed) {
                      router.push('/personas/create');
                    }
                  }}
                  className="relative flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors group"
                  title="للمطورين فقط - يتطلب معرفة تقنية"
                >
                  <Plus className="w-5 h-5" />
                  إنشاء شخصية
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">⚠️</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    للمطورين فقط - يتطلب معرفة تقنية
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن شخصية..."
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-2">
                {/* View Mode Buttons */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('stats')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'stats'
                        ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    showFilters
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  فلاتر
                </button>

                {/* Export/Import Button */}
                <button
                  onClick={() => setShowExportImport(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            {showFilters && (
              <div className="w-80 flex-shrink-0">
                <PersonaFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={handleClearFilters}
                />
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {viewMode === 'stats' ? (
                <PersonaStats
                  stats={{
                    total_personas: personas.length,
                    public_personas: personas.filter(p => p.is_public).length,
                    private_personas: personas.filter(p => !p.is_public).length,
                    most_used: personas
                      .sort((a, b) => b.usage_count - a.usage_count)
                      .slice(0, 10),
                    recently_created: personas
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 10)
                  }}
                />
              ) : selectedPersona ? (
                <PersonaPreview
                  persona={selectedPersona}
                  onUse={handlePersonaUse}
                  onToggleExpanded={() => setSelectedPersona(null)}
                />
              ) : (
                <PersonaList
                  personas={filteredPersonas}
                  onPersonaClick={handlePersonaClick}
                  onPersonaUse={handlePersonaUse}
                  loading={loading}
                  compact={viewMode === 'list'}
                  emptyMessage={
                    personas.length === 0
                      ? "لا توجد شخصيات بعد. ابدأ بإنشاء شخصيتك الأولى!"
                      : "لا توجد شخصيات تطابق معايير البحث"
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showTemplateSelector && (
          <PersonaTemplateSelector
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}

        {showExportImport && (
          <PersonaExportImport
            isOpen={showExportImport}
            onClose={() => setShowExportImport(false)}
            onImport={handleImport}
          />
        )}
      </div>
    </PersonaProvider>
  );
}

