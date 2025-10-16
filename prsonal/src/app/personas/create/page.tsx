// src/app/personas/create/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PersonaCreator from '@/components/personas/PersonaCreator';
import { Persona } from '@/types/persona.types';

export default function CreatePersonaPage() {
  const router = useRouter();

  const handleSave = (persona: Persona) => {
    // Success message
    alert(`تم إنشاء الشخصية "${persona.name}" بنجاح! 🎉`);
    
    // Redirect to persona details
    router.push(`/personas/${persona.id}`);
  };

  const handleCancel = () => {
    router.push('/personas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <PersonaCreator
          mode="create"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

