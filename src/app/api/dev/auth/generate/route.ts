// 🔑 API: توليد API Key جديد

import { NextRequest, NextResponse } from 'next/server';
import { generateApiKey } from '@/lib/developer/api-key-manager';
import { ApiResponse } from '@/types/developer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, permissions = ['*'] } = body;

    if (!name) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name is required',
      }, { status: 400 });
    }

    const result = generateApiKey(name, permissions);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: result.id,
        key: result.key,
      },
      message: 'API key generated successfully. Save it securely!',
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to generate API key',
    }, { status: 500 });
  }
}
