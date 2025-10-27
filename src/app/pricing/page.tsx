// صفحة عرض باقات الاشتراك والأسعار
'use client';

import React, { useState, useEffect } from 'react';
import { Check, Star, Crown, Zap, ArrowRight, MessageSquare, Image, Mic, Brain } from 'lucide-react';
import PricingCard from '@/components/pricing/PricingCard';
import { subscriptionPlans, SubscriptionPlan } from '@/lib/subscription/plans';

export default function PricingPage() {
  const [currentPlanId, setCurrentPlanId] = useState<string>('free');
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  // جلب خطة المستخدم الحالية
  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      // هنا سيكون استدعاء API لجلب خطة المستخدم الحالية
      // مؤقتاً سنستخدم الخطة المجانية
      setCurrentPlanId('free');
    } catch (error) {
      console.error('خطأ في جلب الخطة الحالية:', error);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlanId) return;

    setLoading(planId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // محاكاة التحميل
      
      if (planId === 'free') {
        // إلغاء الاشتراك والعودة للمجاني - هنا نحتاج API لإلغاء الاشتراك
        showToast('تم إلغاء الاشتراك بنجاح', 'success');
        setCurrentPlanId('free');
      } else {
        // توجيه لصفحة الدفع
        window.location.href = `/checkout?plan=${planId}`;
      }
    } catch (error) {
      console.error('خطأ في تغيير الخطة:', error);
      showToast('حدث خطأ في تغيير الخطة. حاول مرة أخرى.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // يمكن استخدام مكتبة toast أو تنفيذ نظام toast بسيط
    alert(message); // مؤقتاً
  };

  const filteredPlans = subscriptionPlans.filter(plan => plan.interval === billingInterval);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      
      {/* Header Section */}
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white mb-6">
            <Crown className="w-8 h-8" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            اختر الباقة المناسبة لك
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            ارتق بتجربتك مع الذكاء الاصطناعي واحصل على ميزات متقدمة تناسب احتياجاتك
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${billingInterval === 'month' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
              شهري
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${billingInterval === 'year' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
              سنوي
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">وفر 20%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {filteredPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentPlanId={currentPlanId}
              onSelectPlan={handleSelectPlan}
              loading={loading === plan.id}
            />
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            مقارنة شاملة للميزات
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">الميزة</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">مجاني</th>
                  <th className="text-center py-4 px-6 font-semibold text-blue-600 dark:text-blue-400">مميز</th>
                  <th className="text-center py-4 px-6 font-semibold text-purple-600 dark:text-purple-400">مؤسسي</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4 px-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    الرسائل اليومية
                  </td>
                  <td className="text-center py-4 px-6">10</td>
                  <td className="text-center py-4 px-6">100</td>
                  <td className="text-center py-4 px-6">∞</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4 px-6 flex items-center gap-2">
                    <Image className="w-5 h-5 text-green-500" />
                    رفع الصور
                  </td>
                  <td className="text-center py-4 px-6">3</td>
                  <td className="text-center py-4 px-6">∞</td>
                  <td className="text-center py-4 px-6">∞</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4 px-6 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-purple-500" />
                    الدقائق الصوتية
                  </td>
                  <td className="text-center py-4 px-6">5</td>
                  <td className="text-center py-4 px-6">60</td>
                  <td className="text-center py-4 px-6">∞</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-orange-500" />
                    نماذج الذكاء الاصطناعي
                  </td>
                  <td className="text-center py-4 px-6">أساسي</td>
                  <td className="text-center py-4 px-6">Gemini Pro</td>
                  <td className="text-center py-4 px-6">جميع النماذج</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          الأسئلة الشائعة
        </h2>
        
        <div className="space-y-6">
          <details className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
              هل يمكنني تغيير خطتي في أي وقت؟
            </summary>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. ستطبق التغييرات فوراً مع تعديل نسبي في الفاتورة.
            </p>
          </details>
          
          <details className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
              ما الذي يحدث إذا تجاوزت الحد المسموح؟
            </summary>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              إذا تجاوزت حدود خطتك، ستحتاج إما للانتظار حتى اليوم التالي أو ترقية خطتك للحصول على حدود أعلى.
            </p>
          </details>
          
          <details className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
              هل البيانات آمنة ومحمية؟
            </summary>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              نعم، نحن نلتزم بأعلى معايير الأمان وحماية البيانات. جميع المحادثات مشفرة ولا نشارك بياناتك مع أطراف ثالثة.
            </p>
          </details>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            جاهز للبدء؟
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            ابدأ رحلتك مع أقوى منصة ذكاء اصطناعي باللغة العربية
          </p>
          <button
            onClick={() => handleSelectPlan('premium')}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            ابدأ الآن
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}