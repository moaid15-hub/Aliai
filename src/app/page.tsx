import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8 animate-bounce">
            <span className="text-8xl">🤖</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Oqool AI
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-700 mb-8 font-medium">
            منصة الذكاء الاصطناعي المتكاملة
          </p>
          
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            استمتع بتجربة محادثة ذكية مع دعم كامل للغة العربية واحصل على إجابات دقيقة وسريعة.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-medium text-lg shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              ابدأ مجاناً
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 font-medium text-lg shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">سريع وفوري</h3>
            <p className="text-gray-600">
              احصل على إجابات فورية مع دعم streaming للردود
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2">دعم العربية</h3>
            <p className="text-gray-600">
              واجهة كاملة باللغة العربية مع RTL support
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">آمن ومحمي</h3>
            <p className="text-gray-600">
              بياناتك محمية مع أعلى معايير الأمان
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-4">جاهز للبدء؟</p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-medium text-lg shadow-xl"
          >
            أنشئ حسابك الآن
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2025 Oqool AI. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </main>
  );
}
