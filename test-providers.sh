#!/bin/bash

# سكريبت لاختبار نظام المزودات المتعددة
# Multi-Provider AI Testing Script

echo "🤖 اختبار نظام المزودات المتعددة لـ عقول AI"
echo "=============================================="

# التحقق من تشغيل الخادم
echo "📡 التحقق من حالة الخادم..."
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$SERVER_STATUS" != "200" ]; then
    echo "❌ الخادم غير متصل. يرجى تشغيله بـ: npm run dev"
    exit 1
fi

echo "✅ الخادم متصل!"
echo ""

# اختبار النظام التلقائي
echo "🔄 اختبار النظام التلقائي (auto):"
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"مرحبا"}],"provider":"auto"}' \
  | jq -r '.message + " [المزود: " + .provider + "]'
echo ""

# اختبار Claude
echo "🤖 اختبار Claude AI:"
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"ما اسمك؟"}],"provider":"claude"}' \
  | jq -r '.message + " [المزود: " + .provider + "]'
echo ""

# اختبار OpenAI
echo "🧠 اختبار OpenAI:"
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"كيف حالك؟"}],"provider":"openai"}' \
  | jq -r '.message + " [المزود: " + .provider + "]'
echo ""

# اختبار محادثة متعددة الرسائل
echo "💬 اختبار محادثة متعددة الرسائل:"
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[
    {"role":"user","content":"السلام عليكم"}, 
    {"role":"assistant","content":"وعليكم السلام"}, 
    {"role":"user","content":"كيف يمكنني تعلم البرمجة؟"}
  ],"provider":"auto"}' \
  | jq -r '.message + " [المزود: " + .provider + "]'
echo ""

echo "✅ اكتمل الاختبار!"
echo ""
echo "📝 ملاحظات:"
echo "- إذا كان المزود 'local'، فهذا يعني عدم وجود مفاتيح API"
echo "- ضع مفاتيح API في .env.local للحصول على استجابات متقدمة"
echo "- النظام يعود تلقائياً للنظام المحلي في حالة فشل APIs"