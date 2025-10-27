// صفحة لوحة التحكم الرئيسية
'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Image, Mic, Brain, TrendingUp, Calendar, 
  Settings, Crown, BarChart3, Clock, Zap, Gift 
} from 'lucide-react';
import UsageBar from '@/components/subscription/UsageBar';
import PlanBadge from '@/components/subscription/PlanBadge';

interface DashboardStats {
  totalMessages: number;
  totalImages: number;
  totalVoiceMinutes: number;
  currentPlan: string;
  usage: {
    messagesUsedToday: number;
    imagesUploadedToday: number;
    voiceMinutesUsedToday: number;
  };
  limits: {
    messagesPerDay: number;
    imageUploads: number;
    voiceMinutes: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // محاكاة بيانات تجريبية - في التطبيق الحقيقي سيكون هذا API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalMessages: 127,
        totalImages: 45,
        totalVoiceMinutes: 23,
        currentPlan: 'free',
        usage: {
          messagesUsedToday: 7,
          imagesUploadedToday: 2,
          voiceMinutesUsedToday: 3
        },
        limits: {
          messagesPerDay: 10,
          imageUploads: 3,
          voiceMinutes: 5
        }
      });
    } catch (error) {
      console.error('خطأ في جلب بيانات اللوحة:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">حدث خطأ في تحميل البيانات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                لوحة التحكم
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                مرحباً بك في منصة عقول للذكاء الاصطناعي
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <PlanBadge planId={stats.currentPlan} size="lg" />
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                الإعدادات
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Current Plan Alert */}
        {stats.currentPlan === 'free' && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    أنت تستخدم الخطة المجانية
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    ارتق لخطة مدفوعة للحصول على ميزات أكثر وحدود أعلى
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all">
                <Crown className="w-4 h-4" />
                ترقية الآن
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي الرسائل</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMessages}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي الصور</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalImages}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الدقائق الصوتية</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVoiceMinutes}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">نماذج الذكاء</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.currentPlan === 'free' ? '1' : stats.currentPlan === 'premium' ? '2' : '3'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Usage Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Daily Usage */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              الاستخدام اليومي
            </h2>
            
            <UsageBar
              label="Messages"
              labelArabic="الرسائل"
              current={stats.usage.messagesUsedToday}
              limit={stats.limits.messagesPerDay}
              color="blue"
            />
            
            <UsageBar
              label="Images"
              labelArabic="الصور"
              current={stats.usage.imagesUploadedToday}
              limit={stats.limits.imageUploads}
              color="green"
            />
            
            <UsageBar
              label="Voice"
              labelArabic="الصوت"
              current={stats.usage.voiceMinutesUsedToday}
              limit={stats.limits.voiceMinutes}
              unit=" دقيقة"
              color="purple"
            />
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              النشاط الأخير
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">محادثة جديدة</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">منذ 5 دقائق</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Image className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">رفع صورة</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">منذ 15 دقيقة</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Mic className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">تسجيل صوتي</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">منذ ساعة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            إجراءات سريعة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-right">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">محادثة جديدة</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ابدأ محادثة جديدة</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-right">
              <Image className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">تحليل صورة</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ارفع صورة للتحليل</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-right">
              <Crown className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">ترقية الباقة</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">احصل على ميزات أكثر</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors text-right">
              <Settings className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">الإعدادات</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">تخصيص التجربة</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}