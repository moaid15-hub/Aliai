#!/bin/bash

# ============================================
# 📦 سكريبت النسخ الاحتياطي السريع
# ============================================

echo "🔄 جاري إنشاء نسخة احتياطية..."

# إنشاء اسم الملف بالتاريخ والوقت الحالي
BACKUP_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="backups/aliai-backup-$BACKUP_DATE.tar.gz"

# إنشاء مجلد backups إذا لم يكن موجوداً
mkdir -p backups

# إنشاء النسخة الاحتياطية
tar -czf "$BACKUP_FILE" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='backups' \
  --exclude='.git' \
  src/ \
  package.json \
  package-lock.json \
  tsconfig.json \
  next.config.js \
  tailwind.config.js \
  postcss.config.js \
  .env.local 2>/dev/null

# التحقق من نجاح العملية
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "✅ تم إنشاء النسخة الاحتياطية بنجاح!"
    echo "📁 الملف: $BACKUP_FILE"
    echo "📊 الحجم: $BACKUP_SIZE"
    echo ""
    echo "📋 لعرض المحتويات:"
    echo "   tar -tzf $BACKUP_FILE"
    echo ""
    echo "🔄 للاسترجاع:"
    echo "   tar -xzf $BACKUP_FILE"
else
    echo "❌ فشل إنشاء النسخة الاحتياطية"
    exit 1
fi
