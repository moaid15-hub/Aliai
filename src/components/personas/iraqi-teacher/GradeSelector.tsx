/**
 * GradeSelector Component
 * مكون اختيار الصف الدراسي
 */

import React, { useState } from 'react';
import './GradeSelector.css';

interface Grade {
  id: string;
  name: string;
  level: 'primary' | 'intermediate' | 'secondary';
}

interface GradeSelectorProps {
  onGradeSelect: (grade: Grade) => void;
  selectedGrade?: Grade;
  grades?: Grade[];
}

const defaultGrades: Grade[] = [
  { id: 'grade-1', name: 'الصف الأول الابتدائي', level: 'primary' },
  { id: 'grade-2', name: 'الصف الثاني الابتدائي', level: 'primary' },
  { id: 'grade-3', name: 'الصف الثالث الابتدائي', level: 'primary' },
  { id: 'grade-4', name: 'الصف الرابع الابتدائي', level: 'primary' },
  { id: 'grade-5', name: 'الصف الخامس الابتدائي', level: 'primary' },
  { id: 'grade-6', name: 'الصف السادس الابتدائي', level: 'primary' },
  { id: 'grade-7', name: 'الصف الأول المتوسط', level: 'intermediate' },
  { id: 'grade-8', name: 'الصف الثاني المتوسط', level: 'intermediate' },
  { id: 'grade-9', name: 'الصف الثالث المتوسط', level: 'intermediate' },
  { id: 'grade-10', name: 'الصف الأول الثانوي', level: 'secondary' },
  { id: 'grade-11', name: 'الصف الثاني الثانوي', level: 'secondary' },
  { id: 'grade-12', name: 'الصف الثالث الثانوي', level: 'secondary' },
];

const GradeSelector: React.FC<GradeSelectorProps> = ({
  onGradeSelect,
  selectedGrade,
  grades = defaultGrades
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'primary':
        return '🎈';
      case 'intermediate':
        return '📚';
      case 'secondary':
        return '🎓';
      default:
        return '📖';
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'primary':
        return 'الابتدائية';
      case 'intermediate':
        return 'المتوسطة';
      case 'secondary':
        return 'الثانوية';
      default:
        return '';
    }
  };

  const levels = ['primary', 'intermediate', 'secondary'];
  const filteredGrades = selectedLevel 
    ? grades.filter(grade => grade.level === selectedLevel)
    : grades;

  return (
    <div className="grade-selector">
      <h3 className="grade-selector__title">
        اختر صفك الدراسي حبيبي 📖
      </h3>

      <div className="grade-selector__levels">
        {levels.map(level => (
          <button
            key={level}
            className={`grade-selector__level ${
              selectedLevel === level ? 'grade-selector__level--active' : ''
            }`}
            onClick={() => setSelectedLevel(selectedLevel === level ? '' : level)}
          >
            <span className="grade-selector__level-icon">
              {getLevelIcon(level)}
            </span>
            <span className="grade-selector__level-name">
              {getLevelName(level)}
            </span>
          </button>
        ))}
      </div>

      <div className="grade-selector__grades">
        {filteredGrades.map(grade => (
          <button
            key={grade.id}
            className={`grade-selector__grade ${
              selectedGrade?.id === grade.id ? 'grade-selector__grade--selected' : ''
            }`}
            onClick={() => onGradeSelect(grade)}
          >
            <span className="grade-selector__grade-icon">
              {getLevelIcon(grade.level)}
            </span>
            <span className="grade-selector__grade-name">
              {grade.name}
            </span>
          </button>
        ))}
      </div>

      {selectedGrade && (
        <div className="grade-selector__confirmation">
          <p className="grade-selector__selected-text">
            اختيار ممتاز! صفك هو: <strong>{selectedGrade.name}</strong> 🌟
          </p>
        </div>
      )}
    </div>
  );
};

export default GradeSelector;