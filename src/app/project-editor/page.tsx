'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Upload,
  Folder,
  FileCode,
  Send,
  Download,
  Sparkles,
  User,
  Loader,
  CheckCircle,
} from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ProjectFile {
  path: string;
  name: string;
  content: string;
  type: string;
}

interface ProjectContext {
  totalFiles: number;
  structure: string[];
  currentFile: string | null;
  files: Array<{ path: string; preview: string }>;
}

const MAX_FILES_METADATA = 10;
const PREVIEW_CHAR_LIMIT = 500;

export default function ProjectEditorPage() {
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [code, setCode] = useState('// ارفع مشروعك أو اسحبه هنا');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: '👋 مرحباً! أنا مساعد Oqool الذكي. ارفع مشروعك وسأساعدك في تحسينه وتطويره!',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectStructure, setProjectStructure] = useState<Record<string, unknown> | null>(null);
  const [availableProviders, setAvailableProviders] = useState<
    Array<{ key: string; name: string; models: string[] }>
  >([]);
  const [selectedProvider, setSelectedProvider] = useState('claude');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/code-gen');
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.providers)) {
          setAvailableProviders(data.providers);
          if (data.providers.length > 0) {
            setSelectedProvider(data.providers[0].key);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch providers', error);
      }
    };

    fetchProviders();
  }, []);

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'text';

    const types: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      scss: 'css',
      json: 'json',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
    };

    return types[ext] || 'text';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const fileList: ProjectFile[] = [];
    const structure: Record<string, unknown> = {};

    for (const file of files) {
      const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      const content = await file.text();

      fileList.push({
        path,
        name: file.name,
        content,
        type: getFileType(file.name),
      });

      const parts = path.split('/');
      let current: Record<string, any> = structure;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = { type: 'file' };
        } else {
          current[part] = current[part] || { type: 'folder', children: {} };
          current = current[part].children;
        }
      });
    }

    setProjectFiles(fileList);
    setProjectStructure(structure);
    setSelectedFile(fileList[0]);
    setCode(fileList[0]?.content ?? '');

    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        content: `✅ تم رفع ${fileList.length} ملف بنجاح!\n\nالملفات:\n${fileList
          .slice(0, 5)
          .map((f) => `• ${f.path}`)
          .join('\n')}${fileList.length > 5 ? `\n... و ${fileList.length - 5} ملفات أخرى` : ''}`,
      },
    ]);
  };

  const buildProjectContext = (): ProjectContext | null => {
    if (!projectStructure) return null;

    return {
      totalFiles: projectFiles.length,
      structure: Object.keys(projectStructure),
      currentFile: selectedFile?.path ?? null,
      files: projectFiles.slice(0, MAX_FILES_METADATA).map((file) => ({
        path: file.path,
        preview: file.content.slice(0, PREVIEW_CHAR_LIMIT),
      })),
    };
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const projectContext = buildProjectContext();

      const response = await fetch('/api/code-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          currentCode: selectedFile ? code : undefined,
          projectContext,
          language: selectedFile?.type ?? 'javascript',
          provider: selectedProvider,
        }),
      });

      const data = await response.json();

      if (data.code) {
        setCode(data.code);
        if (selectedFile) {
          setProjectFiles((prev) =>
            prev.map((file) =>
              file.path === selectedFile.path ? { ...file, content: data.code } : file,
            ),
          );
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: `✨ تم تحديث ${selectedFile?.name ?? 'الملف الحالي'}!`,
          },
        ]);
      } else if (data.error) {
        setMessages((prev) => [...prev, { role: 'ai', content: `❌ ${data.error}` }]);
      }
    } catch (error) {
      console.error('Project editor error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: '❌ حدث خطأ في الاتصال. تأكد من إعداد مفاتيح الـ API بشكل صحيح.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownloadProject = () => {
    projectFiles.forEach((file) => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(url);
    });

    setMessages((prev) => [...prev, { role: 'ai', content: '✅ تم تحميل جميع الملفات المعدّلة!' }]);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Folder className="w-10 h-10 text-cyan-400" />
            Oqool AI - محرر المشاريع الذكي
          </h1>
          <p className="text-gray-400">ارفع مشروعك وسأساعدك في تطويره بذكاء اصطناعي متقدم</p>
        </div>

        {projectFiles.length === 0 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mb-6 border-4 border-dashed border-gray-700 rounded-2xl p-12 text-center cursor-pointer hover:border-cyan-500 hover:bg-gray-800/30 transition-all duration-300"
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-bold text-white mb-2">اسحب المشروع هنا أو اضغط للرفع</h3>
            <p className="text-gray-400">يدعم مجلدات المشروع الكاملة</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              // @ts-expect-error webkitdirectory ليست جزءاً من مواصفات DOM الرسمية لكنها مدعومة في المتصفحات المبنية على Chromium
              webkitdirectory="true"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {projectFiles.length > 0 && (
            <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Folder className="w-5 h-5 text-cyan-400" />
                  الملفات
                </h3>
                <button
                  onClick={handleDownloadProject}
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all"
                  title="تحميل المشروع"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-2 max-h-[700px] overflow-y-auto">
                {projectFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => {
                      setSelectedFile(file);
                      setCode(file.content);
                    }}
                    className={`w-full text-right p-3 rounded-lg transition-all ${
                      selectedFile?.path === file.path
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <div className="text-xs opacity-60 truncate mt-1">{file.path}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={`${projectFiles.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'} bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col h-[700px]`}
          >
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Oqool Assistant
                </h3>
                {availableProviders.length > 0 && (
                  <select
                    value={selectedProvider}
                    onChange={(event) => setSelectedProvider(event.target.value)}
                    className="bg-white/20 text-white text-sm px-3 py-1 rounded-lg border border-white/10 focus:outline-none"
                  >
                    {availableProviders.map((provider) => (
                      <option key={provider.key} value={provider.key} className="text-black">
                        {provider.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => (
                <div key={`${msg.role}-${index}`} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-700/50 text-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500">
                    <Loader className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className="bg-gray-700/50 rounded-2xl px-4 py-3">
                    <p className="text-sm text-gray-300">جاري التفكير...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-700 p-4 bg-gray-900/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اطلب أي تعديل..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !chatInput.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`${projectFiles.length > 0 ? 'lg:col-span-7' : 'lg:col-span-8'} bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden`}
          >
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold">{selectedFile ? selectedFile.name : 'المحرر'}</h3>
                {selectedFile && (
                  <span className="px-3 py-1 rounded-lg bg-cyan-600 text-white text-sm">{selectedFile.type}</span>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gray-900/50 border-l border-gray-700 flex flex-col items-center py-4 text-gray-500 text-sm font-mono">
                {Array.from({ length: lineCount }, (_, index) => (
                  <div key={index} className="leading-6 h-6">
                    {index + 1}
                  </div>
                ))}
              </div>

              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="w-full h-[600px] bg-transparent text-white font-mono text-base p-6 pr-16 focus:outline-none resize-none leading-6"
                style={{ caretColor: '#06b6d4', tabSize: 2 }}
                spellCheck={false}
              />
            </div>

            <div className="bg-gray-900 px-6 py-3 border-t border-gray-700 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-400">
                <span>{lineCount} سطر</span>
                <span>•</span>
                <span>{code.length} حرف</span>
                {projectFiles.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{projectFiles.length} ملف</span>
                  </>
                )}
              </div>
              <div className="text-cyan-400 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                جاهز
              </div>
            </div>
          </div>
        </div>

        {projectFiles.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: 'تحليل المشروع', prompt: 'احلل بنية المشروع وأخبرني بالتحسينات المقترحة' },
              { title: 'إصلاح الأخطاء', prompt: 'ابحث عن الأخطاء المحتملة وأصلحها' },
              { title: 'تحسين الأداء', prompt: 'حسّن أداء الكود واجعله أسرع' },
              { title: 'إضافة تعليقات', prompt: 'أضف تعليقات توضيحية للكود' },
            ].map((command) => (
              <button
                key={command.title}
                onClick={() => setChatInput(command.prompt)}
                className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl p-4 text-right transition-all duration-300"
              >
                <h4 className="text-white font-bold mb-2">{command.title}</h4>
                <p className="text-gray-400 text-sm">{command.prompt}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
