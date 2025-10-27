"use client";

import { useEffect, useState } from 'react';

interface LandingPageProps {
  onTabChange?: (tab: string) => void;
}

export default function LandingPage({ onTabChange }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse -top-48 -left-48"></div>
        <div className="absolute w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000 -bottom-32 -right-32"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg viewBox="0 0 120 120" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="8" fill="white"/>
                  <line x1="60" y1="60" x2="60" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="85" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="95" y2="50" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="95" y2="70" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="85" y2="88" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="60" y2="100" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="35" y2="88" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="25" y2="70" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="25" y2="50" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="60" x2="35" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="60" cy="20" r="4" fill="white"/>
                  <circle cx="85" cy="32" r="4" fill="white"/>
                  <circle cx="95" cy="50" r="4" fill="white"/>
                  <circle cx="95" cy="70" r="4" fill="white"/>
                  <circle cx="85" cy="88" r="4" fill="white"/>
                  <circle cx="60" cy="100" r="4" fill="white"/>
                  <circle cx="35" cy="88" r="4" fill="white"/>
                  <circle cx="25" cy="70" r="4" fill="white"/>
                  <circle cx="25" cy="50" r="4" fill="white"/>
                  <circle cx="35" cy="32" r="4" fill="white"/>
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                علي أ.ي
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-300 hover:text-blue-400 transition-colors">المميزات</a>
              <a href="#models" className="text-slate-300 hover:text-blue-400 transition-colors">النماذج</a>
              <a href="#pricing" className="text-slate-300 hover:text-blue-400 transition-colors">الأسعار</a>
              <a href="#about" className="text-slate-300 hover:text-blue-400 transition-colors">عن المنصة</a>
              <button 
                onClick={() => onTabChange?.('chat')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                ابدأ الآن
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              علي أ.ي - مساعدك الذكي الشخصي
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            مساعد ذكي متقدم يمكنه الإجابة على أسئلتك، البحث في الإنترنت، تحليل المستندات، إنشاء الصور، 
            وحل المشاكل البرمجية. تجربة ذكاء اصطناعي متكاملة باللغة العربية مع دعم لأحدث التقنيات العالمية.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onTabChange?.('chat')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
            >
              جرب مجاناً
            </button>
            <a 
              href="#features"
              className="border-2 border-blue-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-500/10 transition-all duration-300"
            >
              اكتشف المزيد
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              لماذا تختار العقل الرقمي؟
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "ذكاء اصطناعي متقدم",
                description: "نماذج ذكاء اصطناعي حديثة مدربة على فهم اللغة العربية بعمق، توفر ردود دقيقة وذكية لجميع احتياجاتك."
              },
              {
                icon: "⚡",
                title: "معالجة فورية",
                description: "استجابة سريعة وفورية لجميع طلباتك مع أداء عالي يضمن تجربة سلسة ومريحة."
              },
              {
                icon: "🔒",
                title: "حماية وأمان",
                description: "التزام كامل بمعايير الأمان والخصوصية العالمية مع حماية متقدمة لجميع بياناتك."
              },
              {
                icon: "✨",
                title: "محتوى إبداعي",
                description: "إنشاء نصوص وصور ومحتوى إبداعي عالي الجودة بضغطة زر واحدة بكفاءة عالية."
              },
              {
                icon: "📊",
                title: "تحليل متقدم",
                description: "أدوات تحليل قوية تساعدك على فهم بياناتك واتخاذ قرارات مستنيرة بثقة."
              },
              {
                icon: "🌍",
                title: "واجهة عربية",
                description: "واجهة عربية بالكامل مصممة خصيصاً للمستخدم العربي مع دعم للعديد من اللغات العالمية."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white/5 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-200 mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section id="models" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              نماذج الذكاء الاصطناعي
            </span>
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "العقل GPT",
                description: "متخصص في الفهم العميق والإجابات الدقيقة مع قدرات استثنائية في معالجة اللغة العربية.",
                features: [
                  "فهم عميق للسياق",
                  "إجابات دقيقة ومفصلة", 
                  "دعم المحادثات الطويلة",
                  "معالجة متقدمة للنصوص"
                ]
              },
              {
                name: "Claude العقل",
                description: "يتميز بالتحليل المفصل والإجابات المتوازنة مع قدرات تحليلية استثنائية.",
                features: [
                  "تحليل متعمق ودقيق",
                  "إجابات متوازنة وشاملة",
                  "معالجة المستندات",
                  "تفكير منطقي متقدم"
                ]
              },
              {
                name: "DeepSeek العقل",
                description: "يركز على الحلول العملية والتفكير المنطقي مع أداء عالي في البرمجة والرياضيات.",
                features: [
                  "حلول عملية فعالة",
                  "تفكير منطقي قوي", 
                  "برمجة وتطوير متقدم",
                  "حل المسائل المعقدة"
                ]
              }
            ].map((model, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-2 border-transparent hover:border-blue-500 rounded-2xl p-8 transition-all duration-400 hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    {model.name}
                  </h3>
                  <p className="text-slate-300 mb-6 leading-relaxed">{model.description}</p>
                  <ul className="space-y-3">
                    {model.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-slate-400">
                        <span className="text-blue-400 font-bold text-lg ml-3">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              ابدأ رحلتك مع الذكاء الاصطناعي اليوم
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            انضم إلى آلاف المستخدمين الذين يستفيدون من قوة الذكاء الاصطناعي
          </p>
          <button 
            onClick={() => onTabChange?.('chat')}
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 px-10 py-4 rounded-xl font-bold text-xl hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
          >
            ابدأ مجاناً الآن
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-slate-900/80 border-t border-blue-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold text-slate-200 mb-6">عن العقل الرقمي</h4>
              <div className="space-y-3">
                <a href="#about" className="block text-slate-400 hover:text-blue-400 transition-colors">عن المنصة</a>
                <a href="#team" className="block text-slate-400 hover:text-blue-400 transition-colors">الفريق</a>
                <a href="#careers" className="block text-slate-400 hover:text-blue-400 transition-colors">الوظائف</a>
                <a href="#blog" className="block text-slate-400 hover:text-blue-400 transition-colors">المدونة</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-slate-200 mb-6">المنتجات</h4>
              <div className="space-y-3">
                <a href="/chat" className="block text-slate-400 hover:text-blue-400 transition-colors">المحادثة الذكية</a>
                <a href="#api" className="block text-slate-400 hover:text-blue-400 transition-colors">واجهة API</a>
                <a href="#enterprise" className="block text-slate-400 hover:text-blue-400 transition-colors">الحلول المؤسسية</a>
                <a href="#pricing" className="block text-slate-400 hover:text-blue-400 transition-colors">الأسعار</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-slate-200 mb-6">الدعم</h4>
              <div className="space-y-3">
                <a href="#help" className="block text-slate-400 hover:text-blue-400 transition-colors">مركز المساعدة</a>
                <a href="#docs" className="block text-slate-400 hover:text-blue-400 transition-colors">التوثيق</a>
                <a href="#contact" className="block text-slate-400 hover:text-blue-400 transition-colors">اتصل بنا</a>
                <a href="#status" className="block text-slate-400 hover:text-blue-400 transition-colors">حالة الخدمة</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-slate-200 mb-6">قانوني</h4>
              <div className="space-y-3">
                <a href="#privacy" className="block text-slate-400 hover:text-blue-400 transition-colors">سياسة الخصوصية</a>
                <a href="#terms" className="block text-slate-400 hover:text-blue-400 transition-colors">شروط الاستخدام</a>
                <a href="#cookies" className="block text-slate-400 hover:text-blue-400 transition-colors">سياسة الكوكيز</a>
                <a href="#security" className="block text-slate-400 hover:text-blue-400 transition-colors">الأمان</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-500/20 mt-12 pt-8 text-center text-slate-500">
            <p>© 2024 العقل الرقمي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}