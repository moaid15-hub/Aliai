'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectMessage, setRedirectMessage] = useState('');

  useEffect(() => {
    // فحص رسالة التوجيه
    const message = localStorage.getItem('redirectMessage');
    if (message) {
      setRedirectMessage(message);
      localStorage.removeItem('redirectMessage');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);

    try {
      // محاكاة API للتجربة - سيتم استبدالها بالـ API الحقيقي لاحقاً
      console.log('محاولة تسجيل الدخول:', { 
        email: formData.email,
        password: formData.password.length + ' أحرف'
      });

      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1500));

      // قائمة بيانات تجريبية مقبولة - قاعدة البيانات المحلية
      const validCredentials = [
        { email: 'admin@oqool.ai', password: '12345678', name: 'المدير العام' },
        { email: 'test@test.com', password: '12345678', name: 'مستخدم تجريبي' },
        { email: 'demo@demo.com', password: '123456', name: 'حساب تجريبي' },
        { email: 'user@example.com', password: 'password', name: 'مستخدم مثال' },
        { email: 'guest@oqool.ai', password: '123456', name: 'ضيف' },
        { email: 'developer@oqool.ai', password: 'dev123', name: 'مطور' },
        { email: 'tester@oqool.ai', password: 'test123', name: 'مختبر' }
      ];

      // البحث عن بيانات مطابقة
      const validUser = validCredentials.find(cred => 
        cred.email.toLowerCase() === formData.email.toLowerCase() && 
        cred.password === formData.password
      );

      if (validUser) {
        // بيانات صحيحة
        const mockUserData = {
          access_token: 'mock-token-' + Date.now(),
          user: {
            id: Math.floor(Math.random() * 1000),
            email: validUser.email,
            fullName: validUser.name
          }
        };

        localStorage.setItem('token', mockUserData.access_token);
        localStorage.setItem('user', JSON.stringify(mockUserData.user));

        console.log('نجح تسجيل الدخول:', mockUserData);
        window.location.href = '/chat/';
        return;
      }

      // بيانات خاطئة - عرض الحسابات المتاحة
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة\n\n🔑 الحسابات التجريبية المتاحة:\n• admin@oqool.ai / 12345678\n• test@test.com / 12345678\n• demo@demo.com / 123456\n• guest@oqool.ai / 123456\n• developer@oqool.ai / dev123');

      /* 
      // هذا هو الكود الحقيقي للـ API - معطل حالياً
      const response = await fetch('https://api.oqool.net/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('خطأ من الخادم:', response.status, errorText);
        throw new Error(`خطأ من الخادم (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/chat/';
      */

    } catch (err: any) {
      console.error('خطأ في تسجيل الدخول:', err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('خطأ في الاتصال: تأكد من اتصالك بالإنترنت أو أن الخادم يعمل');
      } else {
        setError(err.message || 'حدث خطأ غير متوقع');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Oqool AI
          </h1>
          <p className="text-gray-600">مرحباً بعودتك!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* رسالة ترحيبية للنظام التجريبي */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-right flex-1">
                <p className="text-green-800 font-medium mb-1">🎉 مرحباً بك في نظام عقول التجريبي!</p>
                <p className="text-green-700 text-sm">يمكنك تسجيل الدخول باستخدام أي من الحسابات التجريبية المتاحة</p>
              </div>
            </div>
          </div>

          {redirectMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-blue-800 text-right flex-1">{redirectMessage}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-right flex-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all text-right"
                  placeholder="example@email.com"
                  dir="ltr"
                  disabled={loading}
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all text-right"
                  placeholder="أدخل كلمة المرور"
                  dir="rtl"
                  disabled={loading}
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-left">
              <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                نسيت كلمة المرور؟
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ليس لديك حساب؟{' '}
              <a href="/auth/register" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                إنشاء حساب جديد
              </a>
            </p>
          </div>
        </div>

        {/* أزرار تسجيل دخول سريع */}
        <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200">
          <p className="text-sm text-gray-700 text-center mb-3 font-medium">
            🚀 تسجيل دخول سريع للتجربة
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setFormData({ email: 'admin@oqool.ai', password: '12345678' });
              }}
              className="w-full py-2 px-4 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-all duration-200 border border-purple-200"
            >
              👨‍💼 المدير العام
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ email: 'test@test.com', password: '12345678' });
              }}
              className="w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all duration-200 border border-blue-200"
            >
              👤 مستخدم تجريبي
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ email: 'demo@demo.com', password: '123456' });
              }}
              className="w-full py-2 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-all duration-200 border border-green-200"
            >
              🎯 حساب تجريبي
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            اضغط على أي زر لملء البيانات تلقائياً
          </p>
        </div>
      </div>
    </div>
  );
}
