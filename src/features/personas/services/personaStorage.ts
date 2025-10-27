// src/services/persona/personaStorage.ts

import { Persona } from '@/features/personas/types/persona.types';

const STORAGE_KEY = 'oqool_personas';

export class PersonaStorage {
  // حفظ جميع الشخصيات
  static saveAll(personas: Persona[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
    } catch (error) {
      console.error('Error saving personas:', error);
    }
  }

  // تحميل جميع الشخصيات
  static loadAll(): Persona[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const personas = JSON.parse(data);
      // تحويل التواريخ من string إلى Date
      return personas.map((p: any) => ({
        ...p,
        created_at: new Date(p.created_at),
        updated_at: new Date(p.updated_at)
      }));
    } catch (error) {
      console.error('Error loading personas:', error);
      return [];
    }
  }

  // حفظ شخصية واحدة
  static save(persona: Persona): void {
    const personas = this.loadAll();
    const index = personas.findIndex(p => p.id === persona.id);
    
    if (index >= 0) {
      personas[index] = persona;
    } else {
      personas.push(persona);
    }
    
    this.saveAll(personas);
  }

  // حذف شخصية
  static delete(personaId: string): void {
    const personas = this.loadAll();
    const filtered = personas.filter(p => p.id !== personaId);
    this.saveAll(filtered);
  }

  // الحصول على شخصية بالـ ID
  static getById(personaId: string): Persona | undefined {
    const personas = this.loadAll();
    return personas.find(p => p.id === personaId);
  }

  // مسح جميع الشخصيات
  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // تصدير الشخصيات
  static export(): string {
    const personas = this.loadAll();
    return JSON.stringify(personas, null, 2);
  }

  // استيراد الشخصيات
  static import(data: string): boolean {
    try {
      const personas = JSON.parse(data);
      if (!Array.isArray(personas)) return false;
      
      this.saveAll(personas);
      return true;
    } catch (error) {
      console.error('Error importing personas:', error);
      return false;
    }
  }
}


