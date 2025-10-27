// 💬 مكون إدخال الأوامر

'use client';

import { useState } from 'react';
import { CommandType } from '@/types/developer';

interface CommandInputProps {
  onExecute: (type: CommandType, payload: Record<string, any>) => void;
  disabled?: boolean;
}

export default function CommandInput({ onExecute, disabled }: CommandInputProps) {
  const [commandType, setCommandType] = useState<CommandType>(CommandType.READ_FILE);
  const [path, setPath] = useState('');
  const [content, setContent] = useState('');

  const handleExecute = () => {
    if (!path.trim() && commandType !== CommandType.GIT_STATUS) {
      alert('الرجاء إدخال المسار');
      return;
    }

    const payload: Record<string, any> = {};

    switch (commandType) {
      case CommandType.READ_FILE:
      case CommandType.DELETE_FILE:
      case CommandType.LIST_FILES:
      case CommandType.CREATE_DIRECTORY:
        payload.path = path;
        break;
      case CommandType.WRITE_FILE:
        payload.path = path;
        payload.content = content;
        break;
      case CommandType.GIT_STATUS:
      case CommandType.GIT_PUSH:
      case CommandType.GIT_PULL:
        // لا يحتاج payload
        break;
      case CommandType.GIT_COMMIT:
        payload.message = content;
        break;
    }

    onExecute(commandType, payload);
  };

  const needsContent = [CommandType.WRITE_FILE, CommandType.GIT_COMMIT].includes(commandType);
  const needsPath = ![CommandType.GIT_STATUS, CommandType.GIT_PUSH, CommandType.GIT_PULL, CommandType.GIT_COMMIT].includes(commandType);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">💬 تنفيذ أمر</h3>

      <div className="space-y-4">
        {/* اختيار نوع الأمر */}
        <div>
          <label className="block text-sm font-medium mb-2">نوع الأمر</label>
          <select
            value={commandType}
            onChange={(e) => setCommandType(e.target.value as CommandType)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <optgroup label="الملفات">
              <option value={CommandType.READ_FILE}>📖 قراءة ملف</option>
              <option value={CommandType.WRITE_FILE}>✏️ كتابة ملف</option>
              <option value={CommandType.DELETE_FILE}>🗑️ حذف ملف</option>
              <option value={CommandType.LIST_FILES}>📋 عرض الملفات</option>
              <option value={CommandType.CREATE_DIRECTORY}>📁 إنشاء مجلد</option>
            </optgroup>
            <optgroup label="Git">
              <option value={CommandType.GIT_STATUS}>🔍 Git Status</option>
              <option value={CommandType.GIT_COMMIT}>💾 Git Commit</option>
              <option value={CommandType.GIT_PUSH}>⬆️ Git Push</option>
              <option value={CommandType.GIT_PULL}>⬇️ Git Pull</option>
            </optgroup>
          </select>
        </div>

        {/* إدخال المسار */}
        {needsPath && (
          <div>
            <label className="block text-sm font-medium mb-2">المسار</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="مثال: src/app/page.tsx"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>
        )}

        {/* إدخال المحتوى */}
        {needsContent && (
          <div>
            <label className="block text-sm font-medium mb-2">
              {commandType === CommandType.GIT_COMMIT ? 'رسالة الـ Commit' : 'المحتوى'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={commandType === CommandType.GIT_COMMIT ? 'مثال: إضافة ميزة جديدة' : 'محتوى الملف...'}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              disabled={disabled}
            />
          </div>
        )}

        {/* زر التنفيذ */}
        <button
          onClick={handleExecute}
          disabled={disabled}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {disabled ? '⏳ جاري التنفيذ...' : '▶️ تنفيذ الأمر'}
        </button>
      </div>
    </div>
  );
}
