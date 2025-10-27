// ===================================
// رسائل عقول AI المخصصة
// ===================================

export const OQOOL_RESPONSES = {
  // رسائل الترحيب
  welcomeMessages: [
    "أهلاً! 😊\n\nأنا عقول، مساعدك الذكي. تكلم معي بكل راحة!\n\nإيش اللي تحتاجه اليوم؟",
    "مرحبا! 👋\n\nأنا عقول وجاي عشان أساعدك بكل شيء تحتاجه!\n\nوش نبدأ فيه؟",
    "أهلين! 💙\n\nأنا عقول، رفيق محادثتك الذكي. استرح وتكلم معي زي ما تبي!\n\nإيش في بالك نسويه؟"
  ],

  // ردود عند عدم الفهم
  clarificationMessages: [
    "ممكن توضح أكثر؟ عشان أقدر أساعدك بشكل أفضل! 😊",
    "ما فهمت عليك تماماً، ممكن تشرح أكثر؟ 🤔",
    "عذراً، ممكن تعيد الجملة بطريقة ثانية؟ أبي أفهم عليك زين! 💙"
  ],

  // رسائل التشجيع  
  encouragementMessages: [
    "تسلم! إنت في الطريق الصح 💪",
    "والله شيء حلو! كمّل كذا 🚀",
    "ممتاز! هذا اللي نبيه منك 👏"
  ],

  // رسائل الاعتذار
  apologyMessages: [
    "آسف على الإطالة! 😅",
    "معذرة! أحاول أساعدك بأفضل شكل 💙",
    "آسف إذا كان ردي طويل شوي! 😊"
  ],

  // رسائل عدم المعرفة
  unknownMessages: [
    "ما عندي معلومة دقيقة عن هذا للأسف 😕\n\nلكن ممكن أساعدك تبحث عنها، أو أعطيك اتجاه عام؟",
    "صراحة ما أعرف عن هذا الموضوع كثير 🤷‍♂️\n\nتبي نبحث عنه مع بعض؟",
    "هذا خارج نطاق معرفتي حالياً 😅\n\nلكن ممكن أوجهك للمصادر الصحيحة!"
  ],

  // نصائح ودية
  friendlyTips: [
    "نصيحة: خذ استراحة كل فترة، الراحة مهمة! ☕",
    "فكرة: جرّب تكسر المشكلة لأجزاء صغيرة، بيكون أسهل! 🧩",
    "تلميحة: ما تخاف تجرب، الأخطاء جزء من التعلم! 🌱"
  ]
};

// دالة لاختيار رسالة عشوائية من مجموعة
export function getRandomMessage(messageArray: string[]): string {
  const randomIndex = Math.floor(Math.random() * messageArray.length);
  return messageArray[randomIndex];
}

// دالة للحصول على رسالة ترحيب
export function getWelcomeMessage(): string {
  return getRandomMessage(OQOOL_RESPONSES.welcomeMessages);
}

// دالة للحصول على رسالة توضيح
export function getClarificationMessage(): string {
  return getRandomMessage(OQOOL_RESPONSES.clarificationMessages);
}

// دالة للحصول على رسالة تشجيع
export function getEncouragementMessage(): string {
  return getRandomMessage(OQOOL_RESPONSES.encouragementMessages);
}

// دالة للحصول على رسالة اعتذار
export function getApologyMessage(): string {
  return getRandomMessage(OQOOL_RESPONSES.apologyMessages);
}

// دالة للحصول على رسالة عدم معرفة
export function getUnknownMessage(): string {
  return getRandomMessage(OQOOL_RESPONSES.unknownMessages);
}

// دالة للحصول على نصيحة ودية
export function getFriendlyTip(): string {
  return getRandomMessage(OQOOL_RESPONSES.friendlyTips);
}