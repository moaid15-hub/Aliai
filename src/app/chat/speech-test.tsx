// مكون اختبار النطق السريع
"use client";

import React from 'react';
import TextToSpeech from './text-to-speech';

export const SpeechTestButton = () => {
  const testText = "مرحباً، هذا اختبار للنطق العربي. كيف حالك؟";
  
  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
        اختبار النطق:
      </span>
      <TextToSpeech 
        text={testText}
        className="scale-110"
      />
      <span className="text-xs text-blue-600 dark:text-blue-400 max-w-xs">
        {testText}
      </span>
    </div>
  );
};

export default SpeechTestButton;