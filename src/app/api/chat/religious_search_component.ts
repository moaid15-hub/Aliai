// Religious Search Handler
// معالج البحث في الأسئلة الدينية

interface ReligiousSearchResult {
  text: string;
  source: string;
  reference?: string;
}

interface ReligiousSearchResponse {
  shiite_sources: ReligiousSearchResult[];
  sunni_source: ReligiousSearchResult;
}

/**
 * دالة للكشف عن الأسئلة الدينية
 */
function isReligiousQuestion(message: string): boolean {
  const religiousKeywords = [
    'حكم', 'حلال', 'حرام', 'جائز', 'يجوز',
    'صلاة', 'صيام', 'زكاة', 'حج', 'عمرة',
    'فتوى', 'شرع', 'فقه', 'مذهب',
    'وضوء', 'غسل', 'تيمم', 'طهارة',
    'نكاح', 'طلاق', 'ميراث', 'معاملات',
    'ربا', 'قرض', 'دين', 'شريعة'
  ];
  
  const messageLower = message.toLowerCase();
  return religiousKeywords.some(keyword => messageLower.includes(keyword));
}

/**
 * دالة البحث الديني (مثال - يجب استبدالها بالـ API الحقيقي)
 */
async function religiousSearch(query: string): Promise<ReligiousSearchResponse> {
  // هنا تستدعي API البحث الديني الخاص بك
  // هذا مثال توضيحي فقط
  
  // في الواقع، ستكون مثل:
  // const response = await fetch('YOUR_RELIGIOUS_API_ENDPOINT', {
  //   method: 'POST',
  //   body: JSON.stringify({ query })
  // });
  // return await response.json();
  
  // مثال توضيحي للنتائج:
  return {
    shiite_sources: [
      {
        text: "نتيجة من المصدر الشيعي الأول...",
        source: "السيد السيستاني",
        reference: "منهاج الصالحين، ج1، ص123"
      },
      {
        text: "نتيجة من المصدر الشيعي الثاني...",
        source: "السيد الخامنئي",
        reference: "أجوبة الاستفتاءات، رقم 456"
      }
    ],
    sunni_source: {
      text: "نتيجة من المصدر السني...",
      source: "المذاهب الأربعة",
      reference: "الفقه على المذاهب الأربعة، ج2، ص789"
    }
  };
}

/**
 * دالة تنسيق الرد الديني
 */
function formatReligiousResponse(
  query: string, 
  results: ReligiousSearchResponse
): string {
  const { shiite_sources, sunni_source } = results;
  
  let response = `خلني أبحث لك في المصادر الموثوقة 🕌\n\n`;
  response += `---\n\n`;
  
  // المصادر الشيعية
  response += `### 📚 من المصادر الشيعية:\n\n`;
  
  shiite_sources.forEach((source, index) => {
    response += `**الرأي ${index === 0 ? 'الأول' : 'الثاني'}:**\n`;
    response += `${source.text}\n`;
    response += `**المصدر:** ${source.source}`;
    if (source.reference) {
      response += ` - ${source.reference}`;
    }
    response += `\n\n`;
  });
  
  response += `---\n\n`;
  
  // المصدر السني
  response += `### 📖 من المصادر السنية:\n\n`;
  response += `${sunni_source.text}\n`;
  response += `**المصدر:** ${sunni_source.source}`;
  if (sunni_source.reference) {
    response += ` - ${sunni_source.reference}`;
  }
  response += `\n\n`;
  
  response += `---\n\n`;
  
  // خاتمة
  response += `💡 **ملاحظة:** هذه معلومات عامة من المصادر. للحالات الخاصة، يُفضل استشارة مرجع أو عالم دين موثوق.\n\n`;
  response += `تبي تفاصيل أكثر عن نقطة معينة؟ 😊`;
  
  return response;
}

/**
 * المعالج الرئيسي للرسائل
 */
async function handleUserMessage(message: string): Promise<string> {
  // تحقق إذا كان سؤال ديني
  if (isReligiousQuestion(message)) {
    try {
      // ابحث في المصادر الدينية
      const searchResults = await religiousSearch(message);
      
      // نسق الرد
      const formattedResponse = formatReligiousResponse(message, searchResults);
      
      return formattedResponse;
    } catch (error) {
      return `عذراً، حصل خطأ أثناء البحث في المصادر الدينية 😕\n\nممكن تعيد المحاولة؟ أو اسألني بطريقة مختلفة!`;
    }
  }
  
  // إذا مو سؤال ديني، رد عادي
  return `فهمتك! 😊\n\nكيف أقدر أساعدك؟`;
}

// مثال على الاستخدام
export {
  isReligiousQuestion,
  religiousSearch,
  formatReligiousResponse,
  handleUserMessage
};

// ============================================
// مثال على التطبيق في Chat Component
// ============================================

/*
// في Chat Window Component:

const handleSend = async () => {
  if (!inputValue.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: inputValue,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputValue('');
  setIsTyping(true);

  try {
    // استخدم المعالج
    const aiResponse = await handleUserMessage(inputValue);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  } catch (error) {
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'عذراً، حصل خطأ! ممكن تحاول مرة ثانية؟ 😅',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};
*/