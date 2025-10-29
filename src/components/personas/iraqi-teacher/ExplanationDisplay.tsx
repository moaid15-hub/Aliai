// components/personas/iraqi-teacher/ExplanationDisplay.tsx
/**
 * ExplanationDisplay Component
 * مكون عرض الشروحات بالأسلوب العراقي
 */

import React from 'react';
import './ExplanationDisplay.css';

interface ExplanationDisplayProps {
  title: string;
  content: string;
  steps?: string[];
  examples?: string[];
  tips?: string[];
  isVisible?: boolean;
  dialect?: 'formal' | 'baghdadi';
}

const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({
  title,
  content,
  steps = [],
  examples = [],
  tips = [],
  isVisible = true,
  dialect = 'baghdadi'
}) => {
  if (!isVisible) return null;

  const getDialectGreeting = () => {
    return dialect === 'baghdadi' ? 'شلونك حبيبي،' : 'مرحباً عزيزي الطالب،';
  };

  return (
    <div className="explanation-display">
      <div className="explanation-display__header">
        <h2 className="explanation-display__title">
          {getDialectGreeting()} {title}
        </h2>
      </div>

      <div className="explanation-display__content">
        <div className="explanation-display__main">
          <p className="explanation-display__description">
            {content}
          </p>
        </div>

        {steps.length > 0 && (
          <div className="explanation-display__section">
            <h3 className="explanation-display__section-title">
              🔢 الخطوات:
            </h3>
            <ol className="explanation-display__steps">
              {steps.map((step, index) => (
                <li key={index} className="explanation-display__step">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {examples.length > 0 && (
          <div className="explanation-display__section">
            <h3 className="explanation-display__section-title">
              💡 أمثلة:
            </h3>
            <ul className="explanation-display__examples">
              {examples.map((example, index) => (
                <li key={index} className="explanation-display__example">
                  {example}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tips.length > 0 && (
          <div className="explanation-display__section">
            <h3 className="explanation-display__section-title">
              🎯 نصائح مهمة:
            </h3>
            <ul className="explanation-display__tips">
              {tips.map((tip, index) => (
                <li key={index} className="explanation-display__tip">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="explanation-display__footer">
        <p className="explanation-display__encouragement">
          {dialect === 'baghdadi' 
            ? 'يالله حبيبي، أكيد راح تفهم! 💪' 
            : 'أنا متأكد أنك ستفهم الدرس بإذن الله! 📚'
          }
        </p>
      </div>
    </div>
  );
};

export default ExplanationDisplay;