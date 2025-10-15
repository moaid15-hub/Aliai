// ============================================
// 🧪 اختبار Google Custom Search
// ============================================

async function testGoogleSearch() {
  console.log('🔍 اختبار Google Custom Search API...\n');

  const API_KEY = 'AIzaSyDWbfhkia7iDASoaXwrIQWtSvcT3IMgrs8';
  const SEARCH_ENGINE_ID = '735948eeea5c942c8';
  const QUERY = 'أفضل مطاعم في الرياض';

  try {
    // بناء URL
    const params = new URLSearchParams({
      key: API_KEY,
      cx: SEARCH_ENGINE_ID,
      q: QUERY,
      num: '5',
      lr: 'lang_ar',
      gl: 'sa',
      safe: 'medium'
    });

    const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;

    console.log('📡 جاري الاتصال بـ Google API...\n');

    const startTime = Date.now();
    const response = await fetch(url);
    const searchTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ خطأ في API:', response.status);
      console.error('📄 التفاصيل:', errorText);
      return;
    }

    const data = await response.json();

    console.log('✅ نجح الاتصال بـ Google Search API!\n');
    console.log('📊 الإحصائيات:');
    console.log(`   - الوقت: ${searchTime}ms`);
    console.log(`   - عدد النتائج: ${data.items?.length || 0}`);
    console.log(`   - إجمالي النتائج: ${data.searchInformation?.totalResults || '0'}`);
    console.log(`   - وقت البحث: ${data.searchInformation?.searchTime || '0'}s\n`);

    if (data.items && data.items.length > 0) {
      console.log('🎯 أول 3 نتائج:\n');
      data.items.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   🔗 ${item.link}`);
        console.log(`   📝 ${item.snippet}\n`);
      });
    }

    console.log('✅ Google Search يعمل بشكل ممتاز! 🎉\n');
    console.log('📝 الخطوة التالية: جرّب البحث من تطبيق Oqool AI');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 نصيحة: تأكد من اتصالك بالإنترنت');
    }
  }
}

// تشغيل الاختبار
testGoogleSearch();
