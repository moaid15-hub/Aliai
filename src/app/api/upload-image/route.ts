// src/app/api/upload-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم إرفاق صورة'
      }, { status: 400 });
    }

    // تحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'نوع الملف غير مدعوم. استخدم JPG, PNG, أو WebP'
      }, { status: 400 });
    }

    // تحقق من حجم الملف (10MB كحد أقصى)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'حجم الملف كبير جداً. الحد الأقصى 10MB'
      }, { status: 400 });
    }

    // إنشاء مجلد uploads إذا لم يكن موجوداً
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // حفظ الصورة
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = join(uploadsDir, fileName);
    
    await writeFile(filePath, buffer);

    // إرجاع URL الصورة
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/${fileName}`;

    console.log('✅ تم رفع الصورة:', imageUrl);

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type
    });

  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل رفع الصورة'
    }, { status: 500 });
  }
}
