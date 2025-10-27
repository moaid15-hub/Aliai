// API endpoint لفحص حالة الاشتراك
import { NextRequest, NextResponse } from 'next/server';
import { subscriptionChecker } from '@/lib/subscription/checker';
import { usageLimitService } from '@/lib/subscription/limits';

export async function GET(request: NextRequest) {
  try {
    // استخراج معرف المستخدم من headers أو session
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب', errorArabic: 'معرف المستخدم مطلوب' },
        { status: 401 }
      );
    }

    // هنا يجب جلب بيانات الاشتراك من قاعدة البيانات
    // مؤقتاً سنستخدم بيانات تجريبية
    const mockSubscription = {
      userId: userId,
      planId: 'free', // يجب جلبها من قاعدة البيانات
      status: 'active' as const,
      startDate: new Date(),
      usage: {
        messagesUsedToday: 5,
        imagesUploadedToday: 1,
        voiceMinutesUsedToday: 2,
        lastResetDate: new Date().toDateString()
      }
    };

    // فحص الصلاحيات والحدود
    const limits = subscriptionChecker.getCurrentLimits(mockSubscription);
    const warningMessage = subscriptionChecker.getWarningMessage(mockSubscription);
    const isExpiringSoon = subscriptionChecker.isSubscriptionExpiringSoon(mockSubscription);

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          planId: mockSubscription.planId,
          status: mockSubscription.status,
          isActive: subscriptionChecker.isSubscriptionActive(mockSubscription),
          isExpiringSoon
        },
        limits: {
          canSendMessage: limits.canSendMessage,
          canUploadImage: limits.canUploadImage,
          canUseVoice: limits.canUseVoice,
          remainingMessages: limits.remainingMessages,
          remainingImages: limits.remainingImages,
          remainingVoiceMinutes: limits.remainingVoiceMinutes,
          resetDate: limits.resetDate
        },
        usage: mockSubscription.usage,
        warningMessage
      }
    });

  } catch (error) {
    console.error('خطأ في فحص الاشتراك:', error);
    return NextResponse.json(
      { 
        error: 'فشل في فحص حالة الاشتراك',
        errorArabic: 'فشل في فحص حالة الاشتراك'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, type, amount = 1 } = body;

    if (!userId || !action || !type) {
      return NextResponse.json(
        { error: 'بيانات غير مكتملة', errorArabic: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    // جلب بيانات الاشتراك (مؤقتاً بيانات تجريبية)
    const mockSubscription = {
      userId: userId,
      planId: 'free',
      status: 'active' as const,
      startDate: new Date(),
      usage: {
        messagesUsedToday: 5,
        imagesUploadedToday: 1,
        voiceMinutesUsedToday: 2,
        lastResetDate: new Date().toDateString()
      }
    };

    if (action === 'check_permission') {
      let permission;
      
      switch (type) {
        case 'message':
          permission = await subscriptionChecker.checkMessagePermission(mockSubscription);
          break;
        case 'image':
          permission = await subscriptionChecker.checkImageUploadPermission(mockSubscription);
          break;
        case 'voice':
          permission = await subscriptionChecker.checkVoicePermission(mockSubscription);
          break;
        case 'ai_model':
          const modelId = body.modelId || 'free-ai';
          permission = await subscriptionChecker.checkAIModelPermission(mockSubscription, modelId);
          break;
        default:
          return NextResponse.json(
            { error: 'نوع فحص غير صحيح', errorArabic: 'نوع فحص غير صحيح' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        permission,
        currentLimits: subscriptionChecker.getCurrentLimits(mockSubscription)
      });
    }

    if (action === 'update_usage') {
      // تحديث إحصائيات الاستخدام
      const updatedSubscription = subscriptionChecker.updateUsage(
        mockSubscription, 
        type as 'message' | 'image' | 'voice', 
        amount
      );

      // هنا يجب حفظ البيانات المحدثة في قاعدة البيانات
      
      return NextResponse.json({
        success: true,
        data: {
          updatedUsage: updatedSubscription.usage,
          currentLimits: subscriptionChecker.getCurrentLimits(updatedSubscription)
        }
      });
    }

    return NextResponse.json(
      { error: 'إجراء غير صحيح', errorArabic: 'إجراء غير صحيح' },
      { status: 400 }
    );

  } catch (error) {
    console.error('خطأ في معالجة طلب الاشتراك:', error);
    return NextResponse.json(
      { 
        error: 'فشل في معالجة الطلب',
        errorArabic: 'فشل في معالجة الطلب'
      },
      { status: 500 }
    );
  }
}