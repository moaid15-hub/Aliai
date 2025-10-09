export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 Oqool AI
          </h1>
          <p className="text-gray-600">
            منصة الذكاء الاصطناعي المتكاملة
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}


