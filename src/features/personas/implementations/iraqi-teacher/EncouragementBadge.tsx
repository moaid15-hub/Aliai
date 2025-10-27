/**
 * EncouragementBadge Component
 * مكون شارة التشجيع بالأسلوب العراقي
 */

import React from 'react';
import './EncouragementBadge.css';

interface EncouragementBadgeProps {
  message: string;
  type?: 'success' | 'good' | 'excellent' | 'perfect';
  studentName?: string;
  isVisible?: boolean;
  onClose?: () => void;
}

const EncouragementBadge: React.FC<EncouragementBadgeProps> = ({
  message,
  type = 'good',
  studentName,
  isVisible = true,
  onClose
}) => {
  if (!isVisible) return null;

  const getBadgeIcon = () => {
    switch (type) {
      case 'perfect':
        return '🌟';
      case 'excellent':
        return '⭐';
      case 'success':
        return '✅';
      default:
        return '👏';
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case 'perfect':
        return 'gold';
      case 'excellent':
        return 'orange';
      case 'success':
        return 'green';
      default:
        return 'blue';
    }
  };

  const getPersonalizedMessage = () => {
    if (studentName) {
      return `${studentName}، ${message}`;
    }
    return message;
  };

  return (
    <div className={`encouragement-badge encouragement-badge--${getBadgeColor()}`}>
      <div className="encouragement-badge__content">
        <div className="encouragement-badge__icon">
          {getBadgeIcon()}
        </div>
        <div className="encouragement-badge__message">
          {getPersonalizedMessage()}
        </div>
        {onClose && (
          <button 
            className="encouragement-badge__close"
            onClick={onClose}
            aria-label="إغلاق"
          >
            ×
          </button>
        )}
      </div>
      <div className="encouragement-badge__shine"></div>
    </div>
  );
};

export default EncouragementBadge;