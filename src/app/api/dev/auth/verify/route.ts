// 🔐 API: التحقق من API Key

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/developer/api-key-manager';
import { ApiResponse } from '@/types/developer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { api_key } = body;

    if (!api_key) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'API key is required',
      }, { status: 400 });
    }

    const result = verifyApiKey(api_key);

    if (!result.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid or expired API key',
      }, { status: 401 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        valid: true,
        key_id: result.key_id,
        permissions: result.permissions,
      },
      message: 'API key is valid',
    });

  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to verify API key',
    }, { status: 500 });
  }
}
