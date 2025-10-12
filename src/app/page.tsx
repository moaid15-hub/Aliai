'use client';

import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-blue-100/20 to-pink-100/20 animate-gradient"></div>
      
      {/* عناصر ديكورية */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* شعار الشركة */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl shadow-2xl mb-8 animate-pulse-slow">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          {/* العنوان */}
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-gradient bg-300% leading-tight">
            Oqool AI
          </h1>
          
          {/* الوصف */}
          <p className="text-gray-600 text-xl mb-6 leading-relaxed">
            مساعدك الذكي المدعوم بتقنية الذكاء الاصطناعي المتقدمة
          </p>
          
          <p className="text-gray-500 text-lg mb-8">
            تجربة تفاعلية ذكية باللغة العربية 🚀
          </p>
          
          {/* بيانات التجربة */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 text-right shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
              <p className="text-blue-800 font-bold text-lg">
                🚀 تجربة مباشرة - بدون تسجيل معقد!
              </p>
            </div>
            <div className="bg-white/70 rounded-xl p-4 space-y-3">
              <p className="text-blue-800 font-semibold text-center mb-2">
                📧 بيانات جاهزة للتجربة الفورية:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-blue-700 text-sm font-medium">👨‍💼 المدير العام</p>
                  <code className="text-blue-800 text-xs">admin@oqool.ai / 12345678</code>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <p className="text-purple-700 text-sm font-medium">👤 مستخدم تجريبي</p>
                  <code className="text-purple-800 text-xs">test@test.com / 12345678</code>
                </div>
              </div>
              <p className="text-blue-600 text-xs text-center mt-3">
                💡 أو أنشئ حساب جديد بأي بيانات تريدها - سيعمل فوراً!
              </p>
            </div>
          </div>
          
          {/* أزرار التنقل */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/auth/register"
              className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10">إنشاء حساب جديد</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            
            <a
              href="/auth/login"
              className="group px-8 py-4 bg-white text-purple-600 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-200 hover:border-purple-300 relative overflow-hidden"
            >
              <span className="relative z-10">تسجيل الدخول</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </div>
          
          {/* ميزات سريعة */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-purple-100">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold text-gray-800 mb-1">ذكاء اصطناعي متقدم</h3>
              <p className="text-sm text-gray-600">ردود ذكية ومفيدة</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-100">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="font-semibold text-gray-800 mb-1">دعم اللغة العربية</h3>
              <p className="text-sm text-gray-600">تجربة مصممة للعرب</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-pink-100">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-800 mb-1">سريع ومتجاوب</h3>
              <p className="text-sm text-gray-600">تفاعل فوري وسلس</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
