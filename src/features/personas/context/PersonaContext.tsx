// Context لإدارة الشخصيات

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Persona } from '@/features/personas/types/persona.types';
import { PersonaService } from '@/features/personas/services/personaService';

interface PersonaContextType {
  // الشخصية المحددة حالياً
  currentPersona: Persona | null;
  setCurrentPersona: (persona: Persona | null) => void;
  
  // جميع الشخصيات
  personas: Persona[];
  setPersonas: (personas: Persona[]) => void;
  
  // تحميل الشخصيات
  loadPersonas: () => void;
  
  // إنشاء شخصية جديدة
  createPersona: (data: Partial<Persona>) => Persona;
  
  // تحديث شخصية
  updatePersona: (id: string, updates: Partial<Persona>) => Persona | null;
  
  // حذف شخصية
  deletePersona: (id: string) => boolean;
  
  // تسجيل استخدام
  recordUsage: (id: string) => void;
  
  // تقييم شخصية
  ratePersona: (id: string, rating: number) => boolean;
  
  // الحالة
  isLoading: boolean;
  error: string | null;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

interface PersonaProviderProps {
  children: ReactNode;
}

export function PersonaProvider({ children }: PersonaProviderProps) {
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تحميل الشخصيات
  const loadPersonas = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allPersonas = PersonaService.getAll();
      setPersonas(allPersonas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل الشخصيات');
    } finally {
      setIsLoading(false);
    }
  };

  // إنشاء شخصية جديدة
  const createPersona = (data: Partial<Persona>): Persona => {
    const newPersona = PersonaService.create(data, 'current_user'); // TODO: استخدام معرف المستخدم الحقيقي
    setPersonas(prev => [...prev, newPersona]);
    return newPersona;
  };

  // تحديث شخصية
  const updatePersona = (id: string, updates: Partial<Persona>): Persona | null => {
    const updated = PersonaService.update(id, updates);
    if (updated) {
      setPersonas(prev => prev.map(p => p.id === id ? updated : p));
      if (currentPersona?.id === id) {
        setCurrentPersona(updated);
      }
    }
    return updated;
  };

  // حذف شخصية
  const deletePersona = (id: string): boolean => {
    const success = PersonaService.delete(id);
    if (success) {
      setPersonas(prev => prev.filter(p => p.id !== id));
      if (currentPersona?.id === id) {
        setCurrentPersona(null);
      }
    }
    return success;
  };

  // تسجيل استخدام
  const recordUsage = (id: string) => {
    PersonaService.recordUsage(id);
    setPersonas(prev => 
      prev.map(p => 
        p.id === id ? { ...p, usage_count: p.usage_count + 1 } : p
      )
    );
  };

  // تقييم شخصية
  const ratePersona = (id: string, rating: number): boolean => {
    const success = PersonaService.rate(id, rating);
    if (success) {
      setPersonas(prev => 
        prev.map(p => 
          p.id === id ? { ...p, rating } : p
        )
      );
      if (currentPersona?.id === id) {
        setCurrentPersona(prev => prev ? { ...prev, rating } : null);
      }
    }
    return success;
  };

  // تحميل الشخصيات عند التحميل الأول
  useEffect(() => {
    loadPersonas();
  }, []);

  const value: PersonaContextType = {
    currentPersona,
    setCurrentPersona,
    personas,
    setPersonas,
    loadPersonas,
    createPersona,
    updatePersona,
    deletePersona,
    recordUsage,
    ratePersona,
    isLoading,
    error
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

// Hook لاستخدام Context
export function usePersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
}

