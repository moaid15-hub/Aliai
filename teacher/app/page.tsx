// app/page.tsx
// الصفحة الرئيسية للتطبيق

'use client'

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              أهلاً وسهلاً بكم في
              <span className="highlight"> المعلم العراقي الذكي</span>
            </h1>
            <p className="hero-description">
              نظام ذكي متطور يساعد الطلاب العراقيين في فهم المواد الدراسية
              <br />
              بطريقة تفاعلية ومبسطة باللهجة العراقية الأصيلة
            </p>
            <div className="hero-features">
              <div className="feature-item">
                <i className="fas fa-brain feature-icon"></i>
                <span>ذكاء اصطناعي متقدم</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-camera feature-icon"></i>
                <span>تحليل الصور التعليمية</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-step-forward feature-icon"></i>
                <span>شرح خطوة بخطوة</span>
              </div>
            </div>
            <div className="hero-actions">
              <a href="/personas/iraqi-teacher" className="btn btn-primary btn-large">
                <i className="fas fa-play"></i>
                ابدأ التعلم الآن
              </a>
              <a href="#features" className="btn btn-secondary btn-large">
                <i className="fas fa-info-circle"></i>
                اعرف أكثر
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="teacher-illustration">
              <div className="teacher-avatar-large">
                <i className="fas fa-user-graduate teacher-icon"></i>
              </div>
              <div className="floating-elements">
                <div className="floating-element math">
                  <i className="fas fa-calculator"></i>
                </div>
                <div className="floating-element science">
                  <i className="fas fa-atom"></i>
                </div>
                <div className="floating-element language">
                  <i className="fas fa-book"></i>
                </div>
                <div className="floating-element geography">
                  <i className="fas fa-globe"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">مميزات النظام</h2>
          <p className="section-description">
            نقدم لكم أحدث التقنيات في التعليم الذكي
          </p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <h3 className="feature-card-title">معلم عراقي أصيل</h3>
            <p className="feature-card-description">
              يتحدث باللهجة العراقية ويفهم ثقافة وطريقة تفكير الطلاب العراقيين
            </p>
            <ul className="feature-card-list">
              <li>لهجة بغدادية أصيلة</li>
              <li>فهم الثقافة العراقية</li>
              <li>أمثلة من البيئة المحلية</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <i className="fas fa-eye"></i>
            </div>
            <h3 className="feature-card-title">تحليل الصور الذكي</h3>
            <p className="feature-card-description">
              يمكنه قراءة وتحليل أي صورة تعليمية وشرحها بالتفصيل
            </p>
            <ul className="feature-card-list">
              <li>قراءة النصوص العربية</li>
              <li>تحليل الرسوم البيانية</li>
              <li>شرح المسائل الرياضية</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3 className="feature-card-title">جميع المراحل الدراسية</h3>
            <p className="feature-card-description">
              يدعم المنهج العراقي من الابتدائية حتى الثانوية
            </p>
            <ul className="feature-card-list">
              <li>المرحلة الابتدائية</li>
              <li>المرحلة المتوسطة</li>
              <li>المرحلة الثانوية</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <i className="fas fa-list-ol"></i>
            </div>
            <h3 className="feature-card-title">شرح خطوة بخطوة</h3>
            <p className="feature-card-description">
              يقسم المسائل المعقدة إلى خطوات بسيطة ومفهومة
            </p>
            <ul className="feature-card-list">
              <li>تبسيط المفاهيم</li>
              <li>أمثلة تطبيقية</li>
              <li>مراجعة وتقييم</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="subjects-section">
        <div className="section-header">
          <h2 className="section-title">المواد المدعومة</h2>
          <p className="section-description">
            نغطي جميع المواد الأساسية في المنهج العراقي
          </p>
        </div>
        
        <div className="subjects-grid">
          <div className="subject-card math">
            <i className="fas fa-calculator subject-icon"></i>
            <h3>الرياضيات</h3>
            <p>الجبر، الهندسة، التفاضل والتكامل</p>
          </div>
          
          <div className="subject-card science">
            <i className="fas fa-atom subject-icon"></i>
            <h3>العلوم</h3>
            <p>الفيزياء، الكيمياء، الأحياء</p>
          </div>
          
          <div className="subject-card arabic">
            <i className="fas fa-book subject-icon"></i>
            <h3>اللغة العربية</h3>
            <p>النحو، الصرف، الأدب، التعبير</p>
          </div>
          
          <div className="subject-card english">
            <i className="fas fa-language subject-icon"></i>
            <h3>اللغة الإنجليزية</h3>
            <p>القواعد، المفردات، المحادثة</p>
          </div>
          
          <div className="subject-card history">
            <i className="fas fa-landmark subject-icon"></i>
            <h3>التاريخ</h3>
            <p>التاريخ العراقي والعربي والعالمي</p>
          </div>
          
          <div className="subject-card geography">
            <i className="fas fa-globe subject-icon"></i>
            <h3>الجغرافية</h3>
            <p>جغرافية العراق والوطن العربي</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">مستعد للبداية؟</h2>
          <p className="cta-description">
            انضم إلى آلاف الطلاب العراقيين الذين يتعلمون مع المعلم الذكي
          </p>
          <a href="/personas/iraqi-teacher" className="btn btn-primary btn-large cta-button">
            <i className="fas fa-rocket"></i>
            ابدأ رحلتك التعليمية
          </a>
        </div>
        <div className="cta-stats">
          <div className="stat-item">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">طالب مستفيد</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50,000+</div>
            <div className="stat-label">سؤال تم حله</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">نسبة الرضا</div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Styles will be in globals.css