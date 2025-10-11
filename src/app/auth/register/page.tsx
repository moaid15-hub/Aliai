'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      // محاكاة API للتجربة - سيتم استبدالها بالـ API الحقيقي لاحقاً
      console.log('محاولة التسجيل:', { 
        fullName: formData.fullName, 
        email: formData.email,
        password: formData.password.length + ' أحرف'
      });

      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1500));

      // فحص البرائد المحظورة
      const blockedEmails = ['spam@test.com', 'blocked@test.com'];
      if (blockedEmails.includes(formData.email.toLowerCase())) {
        throw new Error('هذا البريد الإلكتروني غير مسموح');
      }

      // محاكاة نجاح التسجيل مع تسجيل دخول تلقائي
      const mockUserData = {
        access_token: 'mock-token-' + Date.now(),
        user: {
          id: Date.now(),
          fullName: formData.fullName,
          email: formData.email
        }
      };

      // حفظ البيانات وتسجيل الدخول مباشرة
      localStorage.setItem('token', mockUserData.access_token);
      localStorage.setItem('user', JSON.stringify(mockUserData.user));

      console.log('نجح التسجيل وتم تسجيل الدخول:', mockUserData);
      setSuccess(true);
      
      // الانتقال المباشر للدردشة
      setTimeout(() => {
        window.location.href = '/chat';
      }, 1500);

      /* 
      // هذا هو الكود الحقيقي للـ API - معطل حالياً
      const response = await fetch('https://api.oqool.net/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
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
      */

    } catch (err: any) {
      console.error('خطأ في التسجيل:', err);
      
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
          <p className="text-gray-600">إنشاء حساب جديد</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {success && (
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <p className="text-green-800 font-bold text-lg">🎉 مرحباً بك في Oqool AI!</p>
                <p className="text-green-700 font-medium">تم إنشاء حسابك وتسجيل دخولك بنجاح</p>
                <p className="text-green-600 text-sm mt-1">سيتم توجيهك للدردشة خلال ثوان... 🚀</p>
              </div>
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
                الاسم الكامل
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all text-right"
                  placeholder="أدخل اسمك الكامل"
                  dir="rtl"
                  disabled={loading}
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

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
                  placeholder="8 أحرف على الأقل"
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

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2 text-right">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all text-right"
                  placeholder="أعد إدخال كلمة المرور"
                  dir="rtl"
                  disabled={loading}
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري التسجيل...</span>
                </div>
              ) : (
                'إنشاء حساب'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              لديك حساب بالفعل؟{' '}
              <a href="/auth/login" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                تسجيل الدخول
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          💡 التسجيل مباشر بدون الحاجة لتأكيد البريد الإلكتروني
        </p>
      </div>
    </div>
  );
}
