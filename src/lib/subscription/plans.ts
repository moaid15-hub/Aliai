// تعريف الباقات الثلاث
export interface SubscriptionPlan {
  id: string;
  name: string;
  nameArabic: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  featuresArabic: string[];
  limits: {
    messagesPerDay: number;
    tokensPerMessage: number;
    imageUploads: number;
    voiceMinutes: number;
    aiModels: string[];
  };
  stripeProductId?: string;
  stripePriceId?: string;
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    nameArabic: 'مجاني',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Basic AI chat',
      '10 messages per day',
      'Limited image uploads',
      'Community support'
    ],
    featuresArabic: [
      'دردشة ذكية أساسية',
      '10 رسائل يومياً',
      'رفع صور محدود',
      'دعم المجتمع'
    ],
    limits: {
      messagesPerDay: 10,
      tokensPerMessage: 1000,
      imageUploads: 3,
      voiceMinutes: 5,
      aiModels: ['free-ai']
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    nameArabic: 'مميز',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Advanced AI with Gemini',
      '100 messages per day',
      'Unlimited image uploads',
      'Voice conversations',
      'Priority support'
    ],
    featuresArabic: [
      'ذكاء اصطناعي متقدم مع Gemini',
      '100 رسالة يومياً',
      'رفع صور غير محدود',
      'محادثات صوتية',
      'دعم أولوية'
    ],
    limits: {
      messagesPerDay: 100,
      tokensPerMessage: 4000,
      imageUploads: -1, // unlimited
      voiceMinutes: 60,
      aiModels: ['free-ai', 'gemini-pro']
    },
    stripeProductId: 'prod_premium',
    stripePriceId: 'price_premium_monthly',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameArabic: 'مؤسسي',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'All AI models (Gemini, Claude)',
      'Unlimited messages',
      'Advanced features',
      'Custom integrations',
      '24/7 dedicated support'
    ],
    featuresArabic: [
      'جميع نماذج الذكاء الاصطناعي',
      'رسائل غير محدودة',
      'ميزات متقدمة',
      'تكاملات مخصصة',
      'دعم مخصص 24/7'
    ],
    limits: {
      messagesPerDay: -1, // unlimited
      tokensPerMessage: 8000,
      imageUploads: -1, // unlimited
      voiceMinutes: -1, // unlimited
      aiModels: ['free-ai', 'gemini-pro', 'claude-3-opus']
    },
    stripeProductId: 'prod_enterprise',
    stripePriceId: 'price_enterprise_monthly'
  }
];

export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.id === planId);
};

export const getDefaultPlan = (): SubscriptionPlan => {
  return subscriptionPlans[0]; // Free plan
};

export const getPopularPlan = (): SubscriptionPlan => {
  return subscriptionPlans.find(plan => plan.popular) || subscriptionPlans[1];
};