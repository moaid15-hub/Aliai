// components/personas/iraqi-teacher/TeacherAvatar.tsx
/**
 * TeacherAvatar Component
 * مكون صورة المعلم العراقي
 */

import React from 'react';
import './TeacherAvatar.css';

interface TeacherAvatarProps {
  mood?: 'happy' | 'thinking' | 'encouraging' | 'explaining';
  size?: 'small' | 'medium' | 'large';
  isAnimated?: boolean;
  teacherName?: string;
}

const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  mood = 'happy',
  size = 'medium',
  isAnimated = true,
  teacherName = 'الأستاذ أحمد'
}) => {
  const getAvatarEmoji = () => {
    switch (mood) {
      case 'thinking':
        return '🤔';
      case 'encouraging':
        return '😊';
      case 'explaining':
        return '👨‍🏫';
      default:
        return '😄';
    }
  };

  const getMoodMessage = () => {
    switch (mood) {
      case 'thinking':
        return 'خليني أفكر...';
      case 'encouraging':
        return 'شاطر حبيبي!';
      case 'explaining':
        return 'تعال أشرح لك';
      default:
        return 'أهلاً وسهلاً!';
    }
  };

  return (
    <div className={`teacher-avatar teacher-avatar--${size} ${
      isAnimated ? 'teacher-avatar--animated' : ''
    }`}>
      <div className="teacher-avatar__container">
        <div className="teacher-avatar__image">
          <span className="teacher-avatar__emoji">
            {getAvatarEmoji()}
          </span>
        </div>
        <div className="teacher-avatar__pulse"></div>
      </div>
      
      <div className="teacher-avatar__info">
        <div className="teacher-avatar__name">
          {teacherName}
        </div>
        <div className="teacher-avatar__message">
          {getMoodMessage()}
        </div>
      </div>
    </div>
  );
};

export default TeacherAvatar;