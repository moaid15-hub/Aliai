// ============================================
// 🔐 API: التحقق من API Key (لـ oqool-code CLI)
// ============================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 400 });
    }

    // التحقق من API Key
    // في وضع التطوير، نقبل أي مفتاح يبدأ بـ oqool_
    const isValidFormat = /^oqool_[a-zA-Z0-9]{20,}$/.test(apiKey);

    if (!isValidFormat && apiKey !== 'dev_mode') {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format'
      }, { status: 401 });
    }

    // TODO: هنا يمكن التحقق من قاعدة البيانات
    // const user = await db.users.findByApiKey(apiKey);

    // في الوقت الحالي، نرجع نجاح للتطوير
    return NextResponse.json({
      success: true,
      userId: 'user_' + apiKey.slice(-8),
      email: 'user@oqool.net',
      plan: 'Free Plan',
      remainingMessages: 100
    });

  } catch (error: any) {
    console.error('Error verifying API key:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to verify API key'
    }, { status: 500 });
  }
}
