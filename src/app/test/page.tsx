export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
        <h1 className="text-4xl font-bold text-green-600 mb-4">✅ النظام يعمل!</h1>
        <p className="text-gray-700 text-xl mb-6">
          إذا رأيت هذه الصفحة، فـ Frontend يعمل بشكل صحيح!
        </p>
        <div className="space-y-3">
          <a 
            href="/" 
            className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            الصفحة الرئيسية
          </a>
          <a 
            href="/login" 
            className="block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            تسجيل الدخول
          </a>
          <a 
            href="/chat" 
            className="block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            صفحة Chat
          </a>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <p>Backend: http://localhost:8000</p>
          <p>Frontend: http://localhost:3000</p>
        </div>
      </div>
    </div>
  );
}
