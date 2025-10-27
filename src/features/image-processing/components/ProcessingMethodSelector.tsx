// مكون اختيار طريقة معالجة الصور

import { ImageProcessingMethod } from '@/features/image-processing/types/image-processing.types';

interface ProcessingMethodSelectorProps {
  selectedMethod: ImageProcessingMethod;
  onMethodChange: (method: ImageProcessingMethod) => void;
}

export function ProcessingMethodSelector({ 
  selectedMethod, 
  onMethodChange 
}: ProcessingMethodSelectorProps) {
  const methods = [
    {
      id: ImageProcessingMethod.AI_VISION,
      icon: '🧠',
      title: 'AI Vision',
      subtitle: 'Claude/GPT-4',
      features: [
        'يشوف الصورة كاملة',
        'يفهم الرسومات والمخططات',
        'يقرأ الخط حتى لو مو واضح',
        'الأفضل للرياضيات والرسومات',
      ],
      badge: 'الأقوى',
      color: '#9C27B0',
    },
    {
      id: ImageProcessingMethod.OCR,
      icon: '⚡',
      title: 'OCR',
      subtitle: 'استخراج النص فقط',
      features: [
        'يحول الصورة لنص',
        'أسرع',
        'أرخص',
        'يشتغل بس للنصوص الواضحة',
      ],
      badge: 'الأسرع',
      color: '#FF9800',
    },
    {
      id: ImageProcessingMethod.HYBRID,
      icon: '🎯',
      title: 'Hybrid',
      subtitle: 'الاثنين معاً',
      features: [
        'OCR أول شي (لو نجح)',
        'لو فشل → نستخدم AI Vision',
        'الأذكى لكن أعقد',
        'أفضل توازن بين السرعة والدقة',
      ],
      badge: 'موصى به',
      color: '#4CAF50',
    },
  ];

  return (
    <div className="processing-method-selector">
      <h3>اختر طريقة معالجة الصور:</h3>
      
      <div className="methods-grid">
        {methods.map(method => (
          <div
            key={method.id}
            className={`method-card ${selectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => onMethodChange(method.id)}
            style={{ '--method-color': method.color } as any}
          >
            <div className="method-header">
              <span className="method-icon">{method.icon}</span>
              {method.badge && (
                <span className="method-badge">{method.badge}</span>
              )}
            </div>
            
            <h4>{method.title}</h4>
            <p className="method-subtitle">{method.subtitle}</p>
            
            <ul className="method-features">
              {method.features.map((feature, index) => (
                <li key={index}>
                  <span className="feature-bullet">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            {selectedMethod === method.id && (
              <div className="selected-indicator">✓ محدد</div>
            )}
          </div>
        ))}
      </div>

      <div className="comparison-table">
        <h4>مقارنة سريعة:</h4>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>AI Vision</th>
              <th>OCR</th>
              <th>Hybrid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>السرعة</td>
              <td>🟡 متوسط</td>
              <td>🟢 سريع</td>
              <td>🟡 متوسط</td>
            </tr>
            <tr>
              <td>التكلفة</td>
              <td>🔴 عالي</td>
              <td>🟢 رخيص</td>
              <td>🟡 متوسط</td>
            </tr>
            <tr>
              <td>الدقة</td>
              <td>🟢 عالي جداً</td>
              <td>🟡 جيد</td>
              <td>🟢 عالي</td>
            </tr>
            <tr>
              <td>الرسومات</td>
              <td>🟢 ممتاز</td>
              <td>🔴 لا يدعم</td>
              <td>🟢 ممتاز</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


