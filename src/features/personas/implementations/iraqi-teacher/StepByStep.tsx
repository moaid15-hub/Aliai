/**
 * StepByStep Component  
 * مكون الشرح خطوة بخطوة
 */

import React, { useState } from 'react';
import './StepByStep.css';

interface Step {
  id: string;
  title: string;
  description: string;
  example?: string;
  tip?: string;
}

interface StepByStepProps {
  steps: Step[];
  title?: string;
  currentStep?: number;
  onStepComplete?: (stepId: string) => void;
  autoProgress?: boolean;
}

const StepByStep: React.FC<StepByStepProps> = ({
  steps,
  title = 'تعال نحل المسألة خطوة بخطوة',
  currentStep = 0,
  onStepComplete,
  autoProgress = false
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepComplete = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepIndex);
    setCompletedSteps(newCompleted);
    
    if (onStepComplete) {
      onStepComplete(steps[stepIndex].id);
    }

    if (autoProgress && stepIndex < steps.length - 1) {
      setTimeout(() => {
        setActiveStep(stepIndex + 1);
      }, 1000);
    }
  };

  const goToStep = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.has(stepIndex);
  };

  const getStepStatus = (stepIndex: number) => {
    if (isStepCompleted(stepIndex)) return 'completed';
    if (stepIndex === activeStep) return 'active';
    if (stepIndex < activeStep) return 'completed';
    return 'pending';
  };

  return (
    <div className="step-by-step">
      <div className="step-by-step__header">
        <h2 className="step-by-step__title">{title}</h2>
        <div className="step-by-step__progress">
          {completedSteps.size} من {steps.length} خطوات مكتملة
        </div>
      </div>

      <div className="step-by-step__navigation">
        {steps.map((step, index) => (
          <button
            key={step.id}
            className={`step-by-step__nav-btn step-by-step__nav-btn--${getStepStatus(index)}`}
            onClick={() => goToStep(index)}
          >
            <span className="step-by-step__nav-number">
              {isStepCompleted(index) ? '✅' : index + 1}
            </span>
            <span className="step-by-step__nav-title">
              {step.title}
            </span>
          </button>
        ))}
      </div>

      <div className="step-by-step__content">
        {steps[activeStep] && (
          <div className="step-by-step__step">
            <div className="step-by-step__step-header">
              <h3 className="step-by-step__step-title">
                الخطوة {activeStep + 1}: {steps[activeStep].title}
              </h3>
            </div>

            <div className="step-by-step__step-body">
              <p className="step-by-step__description">
                {steps[activeStep].description}
              </p>

              {steps[activeStep].example && (
                <div className="step-by-step__example">
                  <h4>مثال:</h4>
                  <p>{steps[activeStep].example}</p>
                </div>
              )}

              {steps[activeStep].tip && (
                <div className="step-by-step__tip">
                  <h4>💡 نصيحة:</h4>
                  <p>{steps[activeStep].tip}</p>
                </div>
              )}
            </div>

            <div className="step-by-step__actions">
              {activeStep > 0 && (
                <button 
                  className="step-by-step__btn step-by-step__btn--prev"
                  onClick={() => goToStep(activeStep - 1)}
                >
                  ← الخطوة السابقة
                </button>
              )}

              {!isStepCompleted(activeStep) && (
                <button 
                  className="step-by-step__btn step-by-step__btn--complete"
                  onClick={() => handleStepComplete(activeStep)}
                >
                  ✅ فهمت هذه الخطوة
                </button>
              )}

              {activeStep < steps.length - 1 && (
                <button 
                  className="step-by-step__btn step-by-step__btn--next"
                  onClick={() => goToStep(activeStep + 1)}
                >
                  الخطوة التالية →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepByStep;