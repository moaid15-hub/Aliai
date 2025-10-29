// app/personas/iraqi-teacher/page.tsx
// صفحة المعلم العراقي الذكي

'use client'

import { useState, useEffect } from 'react'

// Import components
import { TeacherAvatar } from '../../../src/components/personas/iraqi-teacher/TeacherAvatar'
import { ImageUploader } from '../../../src/components/personas/iraqi-teacher/ImageUploader'
import { ImagePreview } from '../../../src/components/personas/iraqi-teacher/ImagePreview'
import { GradeSelector } from '../../../src/components/personas/iraqi-teacher/GradeSelector'
import { SubjectSelector } from '../../../src/components/personas/iraqi-teacher/SubjectSelector'
import { TeacherChat } from '../../../src/components/personas/iraqi-teacher/TeacherChat'
import { StepByStep } from '../../../src/components/personas/iraqi-teacher/StepByStep'
import { ExplanationDisplay } from '../../../src/components/personas/iraqi-teacher/ExplanationDisplay'
import { EncouragementBadge } from '../../../src/components/personas/iraqi-teacher/EncouragementBadge'

// Import types
import { 
  IraqiGrade, 
  IraqiSubject, 
  TeacherMood,
  ProcessingStep 
} from '../../../src/types/personas/iraqi-teacher.types'

export default function IraqiTeacherPage() {
  // State management
  const [selectedGrade, setSelectedGrade] = useState<IraqiGrade>('الصف السادس الابتدائي')
  const [selectedSubject, setSelectedSubject] = useState<IraqiSubject>('الرياضيات')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('')
  const [currentMood, setCurrentMood] = useState<TeacherMood>('happy')
  const [explanation, setExplanation] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([])
  const [showEncouragement, setShowEncouragement] = useState<boolean>(false)

  // Teacher data
  const teacherData = {
    name: 'العمو حيدر',
    title: 'مدرس رياضيات',
    avatar: '/api/placeholder/120/120',
    status: 'online' as const,
    mood: currentMood,
    stats: {
      studentsHelped: 1250,
      questionsAnswered: 3420,
      successRate: 98
    }
  }

  // Handle image upload
  const handleImageUpload = (file: File) => {
    setUploadedImage(file)
    const url = URL.createObjectURL(file)
    setImagePreviewUrl(url)
    
    // Simulate processing
    simulateProcessing()
  }

  // Handle image removal
  const handleImageRemove = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setUploadedImage(null)
    setImagePreviewUrl('')
    setExplanation('')
    setProcessingSteps([])
  }

  // Simulate AI processing
  const simulateProcessing = () => {
    setIsProcessing(true)
    
    const steps: ProcessingStep[] = [
      {
        id: 1,
        title: 'تحليل الصورة',
        description: 'العمو حيدر يشوف الصورة ويحلل محتوياتها',
        status: 'current',
        details: 'استخدام تقنيات الرؤية الحاسوبية لفهم الصورة'
      },
      {
        id: 2,
        title: 'استخراج النصوص',
        description: 'قراءة النصوص والمعادلات الموجودة',
        status: 'upcoming',
        details: 'تقنية OCR لاستخراج النصوص العربية والإنجليزية'
      },
      {
        id: 3,
        title: 'فهم المسألة',
        description: 'تحليل نوع المسألة والمطلوب حلها',
        status: 'upcoming',
        details: 'الذكاء الاصطناعي يحدد نوع المسألة والاستراتيجية المناسبة'
      },
      {
        id: 4,
        title: 'إعداد الشرح',
        description: 'تحضير شرح مفصل باللهجة العراقية',
        status: 'upcoming',
        details: 'صياغة الحل بطريقة بسيطة ومفهومة'
      }
    ]
    
    setProcessingSteps(steps)
    
    // Simulate step progression
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      
      setProcessingSteps(prevSteps => 
        prevSteps.map((step, index) => ({
          ...step,
          status: index < currentStep ? 'completed' : 
                 index === currentStep ? 'current' : 'upcoming'
        }))
      )
      
      if (currentStep >= steps.length) {
        clearInterval(interval)
        setIsProcessing(false)
        
        // Set sample explanation
        setExplanation(`
          **أهلاً وسهلاً حبيبي!** 👋

          شفت صورتك وفهمت المسألة الي تريد حلها. هاي مسألة رياضيات حلوة!

          ## خلينا نحلها سوا خطوة بخطوة:

          **الخطوة الأولى:** نشوف شنو معطى عندنا
          - العدد الأول: 45
          - العدد الثاني: 28
          - المطلوب: الجمع

          **الخطوة الثانية:** نرتب الأرقام
          ```
            45
          + 28
          ----
          ```

          **الخطوة الثالثة:** نجمع من اليمين
          - 5 + 8 = 13 (نكتب 3 ونحمل 1)
          - 4 + 2 + 1 = 7

          **النتيجة:** 73

          **مبروك عليك!** 🎉 حليت المسألة صح. هذا الطريقة اسمها "الجمع بالحمل".

          لو عندك أي سؤال ثاني، أنا هنا أساعدك! 😊
        `)
        
        setShowEncouragement(true)
      }
    }, 2000)
  }

  // Handle mood change
  const handleMoodChange = (mood: TeacherMood) => {
    setCurrentMood(mood)
  }

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  return (
    <div className="iraqi-teacher-page">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-chalkboard-teacher"></i>
          المعلم العراقي الذكي
        </h1>
        <p className="page-description">
          مرحبا بيك عند العمو حيدر! ارفع صورة السؤال وخليني أساعدك تتعلم
        </p>
      </div>

      <div className="teacher-interface">
        {/* Teacher Avatar Section */}
        <div className="teacher-section">
          <TeacherAvatar
            {...teacherData}
            onMoodChange={handleMoodChange}
          />
          
          {showEncouragement && (
            <EncouragementBadge
              type="success"
              message="أحسنت! وصلت للحل الصحيح 🎉"
              onClose={() => setShowEncouragement(false)}
            />
          )}
        </div>

        {/* Controls Section */}
        <div className="controls-section">
          <div className="selectors-row">
            <GradeSelector
              selectedGrade={selectedGrade}
              onGradeSelect={setSelectedGrade}
            />
            
            <SubjectSelector
              selectedSubject={selectedSubject}
              onSubjectSelect={setSelectedSubject}
              selectedGrade={selectedGrade}
            />
          </div>

          <div className="upload-section">
            <ImageUploader
              onImageUpload={handleImageUpload}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
            />
          </div>

          {uploadedImage && (
            <div className="preview-section">
              <ImagePreview
                imageFile={uploadedImage}
                imageUrl={imagePreviewUrl}
                onRemove={handleImageRemove}
              />
            </div>
          )}
        </div>

        {/* Processing Section */}
        {(isProcessing || processingSteps.length > 0) && (
          <div className="processing-section">
            <StepByStep
              steps={processingSteps}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* Explanation Section */}
        {explanation && !isProcessing && (
          <div className="explanation-section">
            <ExplanationDisplay
              content={explanation}
              isLoading={false}
            />
          </div>
        )}

        {/* Chat Section */}
        <div className="chat-section">
          <TeacherChat
            teacherName={teacherData.name}
            teacherAvatar={teacherData.avatar}
            teacherStatus={teacherData.status}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
          />
        </div>
      </div>
    </div>
  )
}