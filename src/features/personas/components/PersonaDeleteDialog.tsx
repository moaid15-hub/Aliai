// src/components/personas/PersonaDeleteDialog.tsx
'use client';

import React, { useState } from 'react';
import { Persona } from '@/features/personas/types/persona.types';
import { Trash2, X, AlertTriangle, Check } from 'lucide-react';

interface PersonaDeleteDialogProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (personaId: string) => void;
  className?: string;
}

export default function PersonaDeleteDialog({ 
  persona, 
  isOpen, 
  onClose,
  onConfirm,
  className = ''
}: PersonaDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const expectedText = persona.name;
  const isConfirmValid = confirmText === expectedText;

  React.useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setIsDeleting(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!isConfirmValid || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onConfirm(persona.id);
      setShowSuccess(true);
      
      // Close dialog after success animation
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error deleting persona:', error);
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {showSuccess ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              تم الحذف بنجاح!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              تم حذف الشخصية "{persona.name}" نهائياً
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    حذف الشخصية
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-1">
                    تحذير: هذا الإجراء لا يمكن التراجع عنه
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    سيتم حذف الشخصية وجميع البيانات المرتبطة بها نهائياً
                  </p>
                </div>
              </div>

              {/* Persona Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-6">
                <div className="text-3xl">{persona.avatar}</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {persona.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {persona.category} • {persona.usage_count} استخدام
                  </p>
                </div>
              </div>

              {/* Confirmation */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  للتأكيد، اكتب اسم الشخصية: <span className="font-bold text-red-600">{expectedText}</span>
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`اكتب "${expectedText}" هنا`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {confirmText && !isConfirmValid && (
                  <p className="text-sm text-red-600 mt-1">
                    الاسم غير صحيح
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {persona.usage_count}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    مرات الاستخدام
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {persona.rating > 0 ? persona.rating.toFixed(1) : 'غير مقيم'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    التقييم
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!isConfirmValid || isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      حذف نهائياً
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

