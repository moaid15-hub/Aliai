"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, LogIn, X, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export default function Home() {
  const router = useRouter();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Create animated particles
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 15
      });
    }
    setParticles(newParticles);

    // Load saved theme preference
    const savedTheme = localStorage.getItem('oqool_ai_theme');
    if (savedTheme !== null) {
      setIsDark(savedTheme === 'true');
    }
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    localStorage.setItem('oqool_ai_theme', isDark.toString());
  }, [isDark]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);

    try {
      // قاعدة البيانات التجريبية المحلية
      const validCredentials = [
        { email: 'admin@oqool.ai', password: '12345678', name: 'المدير العام' },
        { email: 'test@test.com', password: '12345678', name: 'مستخدم تجريبي' },
        { email: 'demo@demo.com', password: '123456', name: 'حساب تجريبي' },
        { email: 'guest@oqool.ai', password: '123456', name: 'ضيف' },
        { email: 'developer@oqool.ai', password: 'dev123', name: 'مطور' }
      ];

      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));

      const validUser = validCredentials.find(cred => 
        cred.email.toLowerCase() === formData.email.toLowerCase() && 
        cred.password === formData.password
      );

      if (validUser) {
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

        // Reset form and close modal
        setFormData({ email: '', password: '' });
        setError('');
        setIsLoginModalOpen(false);

        console.log('نجح تسجيل الدخول:', mockUserData);
        
        // Navigate to chat page
        router.push('/chat');
        return;
      }

      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة\n\n🔑 الحسابات التجريبية المتاحة:\n• admin@oqool.ai / 12345678\n• test@test.com / 12345678\n• demo@demo.com / 123456\n• guest@oqool.ai / 123456');

    } catch (err: any) {
      console.error('خطأ في تسجيل الدخول:', err);
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (email: string, password: string) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${isDark ? 'dark' : ''}`} style={{
      background: isDark 
        ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3a 50%, #0d1124 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 25%, #e2e8f0 50%, #f8fafc 75%, #ffffff 100%)',
      color: isDark ? '#fff' : '#0f172a'
    }}>
      {/* Custom Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Noto Sans Arabic', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes float-screen {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-center {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }

        @keyframes pulse-node {
          0%, 100% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-50%) scale(1.3); }
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #00d9ff;
          border-radius: 50%;
          animation: float 15s infinite;
        }

        .logo-icon {
          animation: pulse 2s infinite;
        }

        .holographic-screen {
          animation: float-screen 6s infinite ease-in-out;
        }

        .neural-icon {
          animation: rotate 20s linear infinite;
        }

        .neural-center {
          animation: pulse-center 2s infinite;
        }

        .neural-node {
          animation: pulse-node 2s infinite;
        }
      `}</style>

      {/* Animated Background */}
      <div className="fixed w-full h-full top-0 left-0 -z-10 opacity-30">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="flex justify-between items-center p-5 lg:px-12 backdrop-blur-md border-b sticky top-0 z-50" style={{
        background: isDark 
          ? 'rgba(0, 0, 0, 0.2)'
          : 'rgba(255, 255, 255, 0.2)',
        borderColor: isDark 
          ? 'rgba(6, 182, 212, 0.2)'
          : 'rgba(59, 130, 246, 0.2)'
      }}>
        <div className="flex items-center gap-4">
          <svg 
            className="logo-icon w-12 h-12" 
            viewBox="0 0 120 120" 
            fill="none"
          >
            <circle cx="60" cy="60" r="12" fill="#1E40AF"/>
            <line x1="60" y1="60" x2="60" y2="25" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="94" y2="37" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="110" y2="60" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="94" y2="83" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="60" y2="95" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="26" y2="83" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="10" y2="60" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="26" y2="37" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="60" cy="25" r="6" fill="#60A5FA"/>
            <circle cx="94" cy="37" r="6" fill="#60A5FA"/>
            <circle cx="110" cy="60" r="6" fill="#60A5FA"/>
            <circle cx="94" cy="83" r="6" fill="#60A5FA"/>
            <circle cx="60" cy="95" r="6" fill="#60A5FA"/>
            <circle cx="26" cy="83" r="6" fill="#60A5FA"/>
            <circle cx="10" cy="60" r="6" fill="#60A5FA"/>
            <circle cx="26" cy="37" r="6" fill="#60A5FA"/>
          </svg>
          <span 
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #00d9ff, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Oqool AI
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 217, 255, 0.2))';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 217, 255, 0.1))';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={isDark ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )}
          </button>
        </div>
        
        <nav className="hidden md:flex gap-10">
          <a href="#home" className={`${isDark ? 'text-white hover:text-cyan-400' : 'text-slate-800 hover:text-blue-600'} font-medium transition-all duration-300 relative group`}>
            الرئيسية
            <span className="absolute bottom-[-5px] left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <Link href="/chat" className={`${isDark ? 'text-white hover:text-cyan-400' : 'text-slate-800 hover:text-blue-600'} font-medium transition-all duration-300 relative group`}>
            الدردشة
            <span className="absolute bottom-[-5px] left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <a href="#contact" className={`${isDark ? 'text-white hover:text-cyan-400' : 'text-slate-800 hover:text-blue-600'} font-medium transition-all duration-300 relative group`}>
            تواصل معنا
            <span className="absolute bottom-[-5px] left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-between px-5 lg:px-12 gap-12 py-12" id="home">
        <div className="flex-1 max-w-2xl">
          <h1 
            className="text-6xl lg:text-7xl font-black mb-6 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #e879f9 0%, #c026d3 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            مستقبل الذكاء الاصطناعي العربي
          </h1>
          <p className={`text-xl lg:text-2xl mb-10 leading-relaxed ${isDark ? 'text-blue-200' : 'text-slate-700'}`}>
            عقول - منصة ذكاء اصطناعي متقدمة تمكنك من تحليل البيانات، توليد المحتوى، وبناء حلول ذكية بسهولة تامة.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Link 
              href="/chat"
              className="px-11 py-5 rounded-xl text-lg font-semibold text-white transition-all duration-300 transform hover:translate-y-[-3px] inline-block text-center"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
              }}
            >
              ابدأ مجاناً
            </Link>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-11 py-5 rounded-xl text-lg font-semibold text-white transition-all duration-300 transform hover:translate-y-[-3px]"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
              }}
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          <div 
            className="holographic-screen w-full max-w-lg h-96 rounded-3xl p-8 flex flex-col items-center justify-center backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05), rgba(59, 130, 246, 0.05))',
              border: '3px solid rgba(0, 217, 255, 0.4)',
              boxShadow: '0 0 50px rgba(0, 217, 255, 0.3), 0 0 80px rgba(59, 130, 246, 0.2)'
            }}
          >
            <div 
              className="text-3xl font-bold mb-10"
              style={{ 
                background: 'linear-gradient(135deg, #00d9ff, #e879f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(0, 217, 255, 0.5)'
              }}
            >
              Oqool AI
            </div>
            <div className="neural-icon relative w-60 h-60">
              <div 
                className="neural-center absolute w-15 h-15 rounded-full z-10"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60px',
                  height: '60px',
                  background: 'radial-gradient(circle, #00d9ff, #3B82F6, #c026d3)',
                  boxShadow: '0 0 50px #00d9ff, 0 0 80px #c026d3'
                }}
              />
              {[
                {angle: 0, length: 110}, {angle: 20, length: 75}, {angle: 40, length: 95}, {angle: 60, length: 85},
                {angle: 80, length: 105}, {angle: 100, length: 70}, {angle: 120, length: 100}, {angle: 140, length: 80},
                {angle: 160, length: 110}, {angle: 180, length: 75}, {angle: 200, length: 95}, {angle: 220, length: 85},
                {angle: 240, length: 105}, {angle: 260, length: 70}, {angle: 280, length: 100}, {angle: 300, length: 80},
                {angle: 320, length: 110}, {angle: 340, length: 90}
              ].map((branch, i) => (
                <div
                  key={i}
                  className="absolute h-1.5"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: `${branch.length}px`,
                    transform: `rotate(${branch.angle}deg)`,
                    transformOrigin: 'left center',
                    filter: 'blur(0.5px)'
                  }}
                >
                  <div 
                    className="w-full h-full rounded-sm"
                    style={{
                      background: 'linear-gradient(90deg, #c026d3 0%, #e879f9 50%, #00d9ff 100%)'
                    }}
                  />
                  <div 
                    className="neural-node absolute w-4.5 h-4.5 rounded-full"
                    style={{
                      right: '-9px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      background: 'radial-gradient(circle, #e879f9, #c026d3)',
                      boxShadow: '0 0 25px #e879f9',
                      animationDelay: `${i * 0.08}s`
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-5 lg:px-12" id="features" style={{
        background: isDark 
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.05)'
      }}>
        <h2 
          className="text-center text-5xl font-extrabold mb-5"
          style={{
            background: 'linear-gradient(135deg, #00d9ff, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          لماذا عقول؟
        </h2>
        <p className={`text-center text-xl mb-16 ${isDark ? 'text-blue-200' : 'text-slate-600'}`}>
          حلول ذكاء اصطناعي متقدمة مصممة خصيصاً للمحتوى العربي
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            { icon: '🧠', title: 'ذكاء متقدم', desc: 'نماذج ذكاء اصطناعي متطورة مدربة على فهم اللغة العربية والثقافة المحلية بشكل عميق' },
            { icon: '⚡', title: 'سرعة فائقة', desc: 'معالجة فورية لطلباتك مع استجابة سريعة ودقيقة في جميع المهام' },
            { icon: '🔒', title: 'أمان وخصوصية', desc: 'حماية متقدمة لبياناتك مع التزام كامل بمعايير الأمان والخصوصية العالمية' },
            { icon: '🎨', title: 'توليد محتوى', desc: 'إنشاء نصوص، صور، ومحتوى إبداعي عالي الجودة بضغطة زر واحدة' },
            { icon: '📊', title: 'تحليل البيانات', desc: 'أدوات تحليل قوية تساعدك على فهم بياناتك واتخاذ قرارات مستنيرة' },
            { icon: '🌐', title: 'دعم متعدد اللغات', desc: 'واجهة عربية بالكامل مع دعم للعديد من اللغات العالمية' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-10 rounded-3xl border transition-all duration-300 hover:transform hover:translate-y-[-10px] hover:shadow-2xl"
              style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.05), rgba(59, 130, 246, 0.05))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.9))',
                borderColor: isDark 
                  ? 'rgba(6, 182, 212, 0.2)'
                  : 'rgba(59, 130, 246, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = isDark 
                  ? '0 20px 50px rgba(0, 217, 255, 0.2)'
                  : '0 20px 50px rgba(59, 130, 246, 0.15)';
                e.currentTarget.style.borderColor = isDark 
                  ? 'rgba(6, 182, 212, 0.4)'
                  : 'rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = isDark 
                  ? 'rgba(6, 182, 212, 0.2)'
                  : 'rgba(59, 130, 246, 0.2)';
              }}
            >
              <div className="text-5xl mb-5">{feature.icon}</div>
              <h3 className={`text-2xl mb-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>{feature.title}</h3>
              <p className={`leading-relaxed ${isDark ? 'text-blue-200' : 'text-gray-600'}`}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        جميع الحقوق محفوظة © 2024 عقول
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl"
            style={{
              background: isDark 
                ? 'linear-gradient(145deg, rgba(10, 10, 20, 0.95), rgba(20, 20, 40, 0.95))'
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div 
                  className="p-4 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  <LogIn size={32} className="text-white" />
                </div>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>تسجيل الدخول</h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/30 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-blue-500/20 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }`}
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                    className={`w-full pl-12 pr-12 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-blue-500/20 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }`}
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading 
                    ? 'linear-gradient(135deg, #6B7280, #4B5563)' 
                    : 'linear-gradient(135deg, #3B82F6, #00d9ff)',
                  boxShadow: loading ? 'none' : '0 10px 30px rgba(59, 130, 246, 0.4)'
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </form>

            {/* Quick Login Section */}
            <div className={`mt-8 pt-6 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              <p className={`text-center text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Sparkles size={16} className="inline mr-2" />
                حسابات تجريبية للاختبار السريع
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'المدير', email: 'admin@oqool.ai', password: '12345678' },
                  { label: 'تجريبي', email: 'test@test.com', password: '12345678' },
                  { label: 'عرض توضيحي', email: 'demo@demo.com', password: '123456' },
                  { label: 'ضيف', email: 'guest@oqool.ai', password: '123456' }
                ].map((account, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillQuickLogin(account.email, account.password)}
                    className={`p-2 text-xs rounded-lg border transition-all ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-blue-500 hover:text-white hover:bg-gray-700/50'
                        : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
