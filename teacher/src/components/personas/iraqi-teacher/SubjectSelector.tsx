/**
 * SubjectSelector Component
 * مكون اختيار المادة الدراسية
 */

import React, { useState } from 'react';
import './SubjectSelector.css';

interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  grades: string[];
}

interface SubjectSelectorProps {
  onSubjectSelect: (subject: Subject) => void;
  selectedSubject?: Subject;
  subjects?: Subject[];
  selectedGrade?: string;
}

const defaultSubjects: Subject[] = [
  {
    id: 'math',
    name: 'الرياضيات',
    icon: '🔢',
    description: 'الحساب والجبر والهندسة',
    grades: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  {
    id: 'arabic',
    name: 'اللغة العربية',
    icon: '📚',
    description: 'القراءة والكتابة والنحو',
    grades: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  {
    id: 'science',
    name: 'العلوم',
    icon: '🔬',
    description: 'الفيزياء والكيمياء والأحياء',
    grades: ['4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  {
    id: 'history',
    name: 'التاريخ',
    icon: '🏛️',
    description: 'تاريخ العراق والعالم',
    grades: ['5', '6', '7', '8', '9', '10', '11', '12']
  },
  {
    id: 'geography',
    name: 'الجغرافيا',
    icon: '🌍',
    description: 'جغرافية العراق والعالم',
    grades: ['5', '6', '7', '8', '9', '10', '11', '12']
  },
  {
    id: 'english',
    name: 'اللغة الإنجليزية',
    icon: '🗣️',
    description: 'تعلم اللغة الإنجليزية',
    grades: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  }
];

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  onSubjectSelect,
  selectedSubject,
  subjects = defaultSubjects,
  selectedGrade
}) => {
  const [filter, setFilter] = useState<string>('all');

  const getFilteredSubjects = () => {
    if (!selectedGrade) return subjects;
    return subjects.filter(subject => 
      subject.grades.includes(selectedGrade)
    );
  };

  const filteredSubjects = getFilteredSubjects();

  const getSubjectsByCategory = () => {
    const categories = {
      primary: filteredSubjects.filter(s => 
        ['math', 'arabic', 'science'].includes(s.id)
      ),
      secondary: filteredSubjects.filter(s => 
        ['history', 'geography', 'english'].includes(s.id)
      )
    };
    return categories;
  };

  const { primary, secondary } = getSubjectsByCategory();

  return (
    <div className="subject-selector">
      <div className="subject-selector__header">
        <h3 className="subject-selector__title">
          اختر المادة اللي تريد مساعدة فيها 📖
        </h3>
        {selectedGrade && (
          <p className="subject-selector__grade-info">
            مواد الصف {selectedGrade}
          </p>
        )}
      </div>

      {primary.length > 0 && (
        <div className="subject-selector__category">
          <h4 className="subject-selector__category-title">
            المواد الأساسية 📚
          </h4>
          <div className="subject-selector__grid">
            {primary.map(subject => (
              <button
                key={subject.id}
                className={`subject-selector__card ${
                  selectedSubject?.id === subject.id ? 'subject-selector__card--selected' : ''
                }`}
                onClick={() => onSubjectSelect(subject)}
              >
                <div className="subject-selector__card-icon">
                  {subject.icon}
                </div>
                <h5 className="subject-selector__card-name">
                  {subject.name}
                </h5>
                <p className="subject-selector__card-description">
                  {subject.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {secondary.length > 0 && (
        <div className="subject-selector__category">
          <h4 className="subject-selector__category-title">
            مواد أخرى 🌟
          </h4>
          <div className="subject-selector__grid">
            {secondary.map(subject => (
              <button
                key={subject.id}
                className={`subject-selector__card ${
                  selectedSubject?.id === subject.id ? 'subject-selector__card--selected' : ''
                }`}
                onClick={() => onSubjectSelect(subject)}
              >
                <div className="subject-selector__card-icon">
                  {subject.icon}
                </div>
                <h5 className="subject-selector__card-name">
                  {subject.name}
                </h5>
                <p className="subject-selector__card-description">
                  {subject.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSubject && (
        <div className="subject-selector__selection">
          <p className="subject-selector__selected-text">
            ممتاز! اخترت مادة <strong>{selectedSubject.name}</strong> 
            <span className="subject-selector__selected-icon">
              {selectedSubject.icon}
            </span>
          </p>
        </div>
      )}

      {filteredSubjects.length === 0 && selectedGrade && (
        <div className="subject-selector__empty">
          <p>لا توجد مواد متاحة لهذا الصف حالياً 😔</p>
        </div>
      )}
    </div>
  );
};

export default SubjectSelector;