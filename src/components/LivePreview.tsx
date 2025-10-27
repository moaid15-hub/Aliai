'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

interface LivePreviewProps {
  code: string;
  language: string;
  className?: string;
}

export default function LivePreview({ code, language, className = '' }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updatePreview();
  }, [code, language]);

  const updatePreview = () => {
    if (!iframeRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const iframe = iframeRef.current;
      const document = iframe.contentDocument;
      
      if (!document) {
        setError('فشل في الوصول لوثيقة المعاينة');
        setLoading(false);
        return;
      }

      let html = '';
      
      if (language === 'html') {
        html = code;
      } else if (language === 'jsx' || language === 'tsx') {
        html = `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>معاينة React</title>
              <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
              <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: #f8f9fa;
                  direction: rtl;
                }
                #root {
                  max-width: 800px;
                  margin: 0 auto;
                }
                .error {
                  background: #fee;
                  border: 1px solid #fcc;
                  color: #c33;
                  padding: 10px;
                  border-radius: 4px;
                  margin: 10px 0;
                }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                try {
                  ${code}
                } catch (error) {
                  document.getElementById('root').innerHTML = 
                    '<div class="error">خطأ في الكود: ' + error.message + '</div>';
                }
              </script>
            </body>
          </html>
        `;
      } else if (language === 'css') {
        html = `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>معاينة CSS</title>
              <style>
                ${code}
                
                /* إضافات للعرض */
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  margin: 0;
                  padding: 20px;
                  direction: rtl;
                }
                .preview-content {
                  max-width: 800px;
                  margin: 0 auto;
                }
              </style>
            </head>
            <body>
              <div class="preview-content">
                <h1>معاينة CSS</h1>
                <div class="demo-content">
                  <p>هذا نص تجريبي لعرض تأثير CSS</p>
                  <button>زر تجريبي</button>
                  <div class="card">
                    <h3>كارت تجريبي</h3>
                    <p>محتوى الكارت</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
      } else if (language === 'javascript') {
        html = `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>معاينة JavaScript</title>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: #f8f9fa;
                  direction: rtl;
                }
                .console {
                  background: #1e1e1e;
                  color: #d4d4d4;
                  padding: 15px;
                  border-radius: 8px;
                  font-family: 'Courier New', monospace;
                  margin-top: 20px;
                  min-height: 100px;
                  white-space: pre-wrap;
                }
                .error {
                  color: #ff6b6b;
                }
                .success {
                  color: #51cf66;
                }
              </style>
            </head>
            <body>
              <h1>معاينة JavaScript</h1>
              <div id="output"></div>
              <div id="console" class="console"></div>
              <script>
                // إعادة توجيه console.log
                const originalLog = console.log;
                const originalError = console.error;
                const consoleDiv = document.getElementById('console');
                
                console.log = function(...args) {
                  consoleDiv.innerHTML += '<div class="success">▶ ' + args.join(' ') + '</div>';
                  originalLog.apply(console, args);
                };
                
                console.error = function(...args) {
                  consoleDiv.innerHTML += '<div class="error">✖ ' + args.join(' ') + '</div>';
                  originalError.apply(console, args);
                };
                
                try {
                  ${code}
                } catch (error) {
                  console.error('خطأ في التنفيذ: ' + error.message);
                }
              </script>
            </body>
          </html>
        `;
      } else {
        html = `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>معاينة</title>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: #f8f9fa;
                  direction: rtl;
                }
                pre {
                  background: #1e1e1e;
                  color: #d4d4d4;
                  padding: 15px;
                  border-radius: 8px;
                  overflow-x: auto;
                }
              </style>
            </head>
            <body>
              <h1>معاينة الكود</h1>
              <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
            </body>
          </html>
        `;
      }

      document.open();
      document.write(html);
      document.close();
      
      // إضافة مستمع للأخطاء
      iframe.contentWindow?.addEventListener('error', (event) => {
        setError(`خطأ في المعاينة: ${event.message}`);
      });
      
      setTimeout(() => setLoading(false), 500);
      
    } catch (err) {
      setError('خطأ في عرض المعاينة');
      console.error('Preview error:', err);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    updatePreview();
  };

  const handleOpenInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow && iframeRef.current?.contentDocument) {
      newWindow.document.write(iframeRef.current.contentDocument.documentElement.outerHTML);
      newWindow.document.close();
    }
  };

  return (
    <div className={`live-preview bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
            معاينة مباشرة
          </span>
          {loading && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              جاري التحديث...
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded transition-colors disabled:opacity-50"
            title="تحديث المعاينة"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          
          <button
            onClick={handleOpenInNewTab}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            title="فتح في تبويب جديد"
          >
            <ExternalLink className="w-3 h-3" />
            فتح
          </button>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {/* Preview Frame */}
      <div className="relative h-96">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title="معاينة مباشرة"
        />
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              جاري تحديث المعاينة...
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            {language === 'html' && '🌐 معاينة HTML'}
            {(language === 'jsx' || language === 'tsx') && '⚛️ معاينة React'}
            {language === 'css' && '🎨 معاينة CSS'}
            {language === 'javascript' && '⚡ معاينة JavaScript'}
          </span>
          <span>
            آخر تحديث: {new Date().toLocaleTimeString('ar')}
          </span>
        </div>
      </div>
    </div>
  );
}