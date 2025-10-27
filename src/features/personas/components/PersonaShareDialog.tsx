// src/components/personas/PersonaShareDialog.tsx
'use client';

import React, { useState } from 'react';
import { Persona } from '@/features/personas/types/persona.types';
import { Share2, Copy, Check, X, Link, Download, Mail } from 'lucide-react';

interface PersonaShareDialogProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function PersonaShareDialog({ 
  persona, 
  isOpen, 
  onClose,
  className = ''
}: PersonaShareDialogProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [shareUrl, setShareUrl] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      // Generate share URL (in a real app, this would be an actual URL)
      const url = `${window.location.origin}/personas/${persona.id}`;
      setShareUrl(url);
    }
  }, [isOpen, persona.id]);

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, item]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateShareText = () => {
    return `تحقق من هذه الشخصية الرائعة: ${persona.name}

${persona.description}

الفئة: ${persona.category}
النبرة: ${persona.tone}
التقييم: ${persona.rating > 0 ? `${persona.rating}/5` : 'غير مقيم'}

${shareUrl}`;
  };

  const generateSystemPrompt = () => {
    return `System Prompt للشخصية "${persona.name}":

${persona.system_prompt}

---
تم إنشاؤها بواسطة نظام إدارة الشخصيات`;
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                مشاركة الشخصية
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <div className="text-3xl">{persona.avatar}</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {persona.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {persona.category} • {persona.usage_count} استخدام
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Share URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              رابط المشاركة
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={() => copyToClipboard(shareUrl, 'url')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {copiedItems.has('url') ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedItems.has('url') ? 'تم النسخ!' : 'نسخ'}
              </button>
            </div>
          </div>

          {/* Share Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نص المشاركة
            </label>
            <div className="space-y-2">
              <textarea
                value={generateShareText()}
                readOnly
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
              />
              <button
                onClick={() => copyToClipboard(generateShareText(), 'text')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copiedItems.has('text') ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedItems.has('text') ? 'تم النسخ!' : 'نسخ النص'}
              </button>
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Prompt
            </label>
            <div className="space-y-2">
              <textarea
                value={generateSystemPrompt()}
                readOnly
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono resize-none"
              />
              <button
                onClick={() => copyToClipboard(generateSystemPrompt(), 'prompt')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {copiedItems.has('prompt') ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedItems.has('prompt') ? 'تم النسخ!' : 'نسخ System Prompt'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              مشاركة سريعة
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`شخصية AI: ${persona.name}`);
                  const body = encodeURIComponent(generateShareText());
                  window.open(`mailto:?subject=${subject}&body=${body}`);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
                إرسال بريد إلكتروني
              </button>
              
              <button
                onClick={() => {
                  const data = {
                    persona: {
                      name: persona.name,
                      description: persona.description,
                      category: persona.category,
                      system_prompt: persona.system_prompt,
                      created_at: new Date().toISOString()
                    }
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${persona.name.replace(/\s+/g, '_')}_persona.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                تحميل JSON
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              يمكنك مشاركة هذه الشخصية مع الآخرين
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

