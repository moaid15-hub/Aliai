// صفحة إتمام عملية الدفع
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ArrowLeft, CreditCard, Shield, Clock } from 'lucide-react';
import { subscriptionPlans, getPlanById } from '@/lib/subscription/plans';
import PlanBadge from '@/components/subscription/PlanBadge';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [planId, setPlanId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      setPlanId(planParam);
      const selectedPlan = getPlanById(planParam);
      setPlan(selectedPlan);
    } else {
      router.push('/pricing');
    }
  }, [searchParams, router]);

  const handleCheckout = async () => {
    if (!plan || !planId) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: planId,
          userId: 'demo-user', // في التطبيق الحقيقي سيكون من session
          email: 'user@example.com', // في التطبيق الحقيقي سيكون من المستخدم
          successUrl: `${window.location.origin}/dashboard?success=true&plan=${planId}`,
          cancelUrl: `${window.location.origin}/checkout?plan=${planId}&canceled=true`
        })
      });

      const data = await response.json();

      if (data.success && data.sessionUrl) {
        // توجيه للدفع
        window.location.href = data.sessionUrl;
      } else {
        setError(data.error || 'فشل في إنشاء جلسة الدفع');
      }

    } catch (error) {
      console.error('خطأ في الدفع:', error);
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const features = [
    'دفع آمن مع Stripe',
    'إلغاء في أي وقت',
    'فاتورة شهرية واضحة',
    'دعم فني 24/7'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إتمام الاشتراك
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            أنت على بُعد خطوة واحدة من ترقية تجربتك
          </p>
        </div>

        {/* Checkout Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          
          {/* Plan Summary */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                ملخص الباقة
              </h2>
              <PlanBadge planId={plan.id} size="md" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">اسم الباقة:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{plan.nameArabic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">السعر:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${plan.price} / {plan.interval === 'month' ? 'شهر' : 'سنة'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">الرسائل اليومية:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {plan.limits.messagesPerDay === -1 ? 'غير محدود' : plan.limits.messagesPerDay}
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ما ستحصل عليه:
            </h3>
            <div className="space-y-3">
              {plan.featuresArabic.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Features */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {searchParams.get('canceled') && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  تم إلغاء عملية الدفع. يمكنك المحاولة مرة أخرى.
                </p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  متابعة للدفع الآمن
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                مؤمن بـ SSL
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                إلغاء في أي وقت
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              بالضغط على "متابعة للدفع" أنت توافق على 
              <a href="#" className="text-blue-600 hover:underline mx-1">شروط الخدمة</a>
              و
              <a href="#" className="text-blue-600 hover:underline mx-1">سياسة الخصوصية</a>
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            أسئلة شائعة:
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">متى سيتم تجديد الاشتراك؟</p>
              <p className="text-gray-600 dark:text-gray-400">سيتم التجديد تلقائياً كل شهر في نفس التاريخ.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">هل يمكنني إلغاء الاشتراك؟</p>
              <p className="text-gray-600 dark:text-gray-400">نعم، يمكنك إلغاء الاشتراك في أي وقت من لوحة التحكم.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">ما هي طرق الدفع المقبولة؟</p>
              <p className="text-gray-600 dark:text-gray-400">نقبل جميع البطاقات الائتمانية الرئيسية عبر Stripe الآمن.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}