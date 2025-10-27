'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Download } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === 'javascript' ? 'js' : language === 'python' ? 'py' : language;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
  };

  return (
    <div style={{ background: '#1e1e1e', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        height: '60px', 
        background: 'rgba(255,255,255,0.05)', 
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'white'
          }}>
            {language}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            {code.split('\n').length} سطر
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleCopy} 
            title="نسخ"
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button 
            onClick={handleDownload} 
            title="تحميل"
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <Editor
        height="calc(100vh - 60px)"
        language={language}
        value={code}
        onChange={(val) => onChange(val || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: 'Fira Code, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
