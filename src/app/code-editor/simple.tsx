'use client';

import React, { useState } from 'react';
import { Upload, FileCode, Send, Download, Sparkles, Loader, CheckCircle } from 'lucide-react';

export default function SimpleCodeEditor() {
  const [code, setCode] = useState('// مرحباً بك في محرر الكود الذكي\n// اكتب كودك هنا أو ارفع ملف\n\nfunction hello() {\n    console.log("Hello, World!");\n}\n\nhello();');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isLoading) return;
    
    setIsLoading(true);
    // محاكاة استدعاء API
    setTimeout(() => {
      setCode(prev => prev + '\n\n// تم إضافة تعديل بناءً على: ' + chatInput);
      setChatInput('');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Chat Panel */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            مساعد الكود الذكي
          </h2>
        </div>
        
        <div className="flex-1 p-4">
          <div className="text-gray-300 text-sm mb-4">
            👋 مرحباً! أنا مساعدك الذكي لكتابة وتحسين الكود.
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="اطلب أي تعديل..."
              className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
            />
            <button
              onClick={handleChatSubmit}
              disabled={isLoading || !chatInput.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded disabled:opacity-50"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold text-xl">
              محرر الكود المتطور
            </h1>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center gap-2">
                <Upload className="w-4 h-4" />
                رفع ملف
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2">
                <Download className="w-4 h-4" />
                تحميل
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-gray-900 text-white font-mono text-sm p-6 focus:outline-none resize-none"
            style={{ fontFamily: '"Fira Code", monospace' }}
          />
        </div>

        <div className="bg-gray-800 px-6 py-3 border-t border-gray-700 flex items-center justify-between text-sm text-gray-400">
          <div>
            {code.split('\n').length} سطر • {code.length} حرف
          </div>
          <div className="text-cyan-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            جاهز
          </div>
        </div>
      </div>
    </div>
  );
}