// src/components/personas/PersonaExportImport.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Persona } from '@/features/personas/types/persona.types';
import { PersonaStorage } from '@/features/personas/services/personaStorage';
import { Download, Upload, FileText, Check, AlertCircle, X } from 'lucide-react';

interface PersonaExportImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (importedPersonas: Persona[]) => void;
  className?: string;
}

export default function PersonaExportImport({ 
  isOpen, 
  onClose,
  onImport,
  className = ''
}: PersonaExportImportProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab('export');
      setImportStatus('idle');
      setImportMessage('');
      setImportedCount(0);
    }
  }, [isOpen]);

  const handleExport = () => {
    try {
      const exportedData = PersonaStorage.export();
      const blob = new Blob([JSON.stringify(exportedData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personas_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the imported data
        if (!Array.isArray(data)) {
          throw new Error('الملف يجب أن يحتوي على مصفوفة من الشخصيات');
        }

        // Validate each persona
        const validPersonas: Persona[] = [];
        for (const item of data) {
          if (typeof item === 'object' && 
              item.id && 
              item.name && 
              item.description && 
              item.category && 
              item.tone && 
              item.language_style) {
            validPersonas.push(item as Persona);
          }
        }

        if (validPersonas.length === 0) {
          throw new Error('لم يتم العثور على شخصيات صحيحة في الملف');
        }

        // Import the personas
        PersonaStorage.import(content);
        setImportStatus('success');
        setImportMessage(`تم استيراد ${validPersonas.length} شخصية بنجاح`);
        setImportedCount(validPersonas.length);
        onImport?.(validPersonas);

      } catch (error) {
        setImportStatus('error');
        setImportMessage(error instanceof Error ? error.message : 'حدث خطأ أثناء الاستيراد');
      }
    };

    reader.readAsText(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              تصدير واستيراد الشخصيات
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Download className="w-4 h-4" />
              تصدير
            </div>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Upload className="w-4 h-4" />
              استيراد
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'export' ? (
            /* Export Tab */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  تصدير الشخصيات
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  قم بتحميل نسخة احتياطية من جميع شخصياتك
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  ما يتم تصديره:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• جميع الشخصيات المحفوظة</li>
                  <li>• إعدادات كل شخصية</li>
                  <li>• إحصائيات الاستخدام</li>
                  <li>• التقييمات والوسوم</li>
                </ul>
              </div>

              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                تحميل النسخة الاحتياطية
              </button>
            </div>
          ) : (
            /* Import Tab */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  استيراد الشخصيات
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  قم برفع ملف JSON يحتوي على الشخصيات
                </p>
              </div>

              {/* Import Status */}
              {importStatus !== 'idle' && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  importStatus === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {importStatus === 'success' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`text-sm font-medium ${
                    importStatus === 'success' 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {importMessage}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  متطلبات الملف:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• ملف JSON صالح</li>
                  <li>• مصفوفة من الشخصيات</li>
                  <li>• كل شخصية تحتوي على الحقول المطلوبة</li>
                  <li>• سيتم استبدال الشخصيات الموجودة بنفس المعرف</li>
                </ul>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={handleImportClick}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Upload className="w-5 h-5" />
                اختيار ملف JSON
              </button>

              {importedCount > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    تم استيراد {importedCount} شخصية بنجاح
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeTab === 'export' 
                ? 'النسخة الاحتياطية تحتوي على جميع بياناتك'
                : 'تأكد من صحة الملف قبل الاستيراد'
              }
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

