// API للبحث الديني - Religious Search API
import { NextRequest, NextResponse } from 'next/server';

interface ReligiousSearchResult {
  text: string;
  source: string;
  reference?: string;
}

interface ReligiousSearchResponse {
  shiite_sources: ReligiousSearchResult[];
  sunni_source: ReligiousSearchResult;
}

// قاعدة بيانات محلية للأحكام الدينية (يمكن استبدالها بـ API خارجي)
const religiousDatabase = {
  "البيرة": {
    shiite_sources: [
      {
        text: "شرب البيرة محرم قطعاً لأنها تحتوي على نسبة من الكحول، وكل ما أسكر قليله فكثيره حرام.",
        source: "فقه الإمام الخوئي",
        reference: "منهاج الصالحين - كتاب الأطعمة والأشربة"
      },
      {
        text: "المشروبات الكحولية بما فيها البيرة محرمة شرعاً، حتى لو كانت نسبة الكحول قليلة.",
        source: "فتاوى السيد السيستاني",
        reference: "المسائل المنتخبة - مسألة 432"
      }
    ],
    sunni_source: {
      text: "البيرة محرمة في المذاهب الأربعة لاحتوائها على الكحول، والنبي ﷺ قال: 'كل مسكر خمر وكل خمر حرام'.",
      source: "فقه المذاهب الأربعة",
      reference: "صحيح مسلم - كتاب الأشربة"
    }
  },
  "الخمر": {
    shiite_sources: [
      {
        text: "الخمر من أكبر الكبائر وهي محرمة قطعياً بنص القرآن الكريم والسنة النبوية.",
        source: "الفقه المقارن",
        reference: "القرآن الكريم - سورة المائدة آية 90"
      },
      {
        text: "شرب الخمر يوجب الحد الشرعي وهو من الذنوب التي تستوجب التوبة النصوح.",
        source: "كتب الفقه الإمامي",
        reference: "شرائع الإسلام - كتاب الحدود"
      }
    ],
    sunni_source: {
      text: "الخمر محرم بإجماع الأمة، وقد نزل تحريمه صريحاً في القرآن الكريم.",
      source: "إجماع الفقهاء",
      reference: "سورة المائدة: إنما الخمر والميسر... رجس من عمل الشيطان"
    }
  },
  "الصلاة": {
    shiite_sources: [
      {
        text: "الصلاة عمود الدين، من تركها فقد هدم دينه، وهي أول ما يحاسب عليه العبد يوم القيامة.",
        source: "الكافي للكليني",
        reference: "كتاب الصلاة - باب فضل الصلاة"
      },
      {
        text: "الصلوات الخمس واجبة على كل مكلف، والجمعة تسقط الظهر عند اجتماع شروطها.",
        source: "تحرير الوسيلة",
        reference: "كتاب الصلاة - فصل أعداد الفرائض"
      }
    ],
    sunni_source: {
      text: "الصلاة الركن الثاني من أركان الإسلام، وهي الفارق بين المؤمن والكافر كما ورد في الحديث.",
      source: "الفقه السني",
      reference: "حديث: بين الرجل وبين الشرك والكفر ترك الصلاة"
    }
  },
  "الزكاة": {
    shiite_sources: [
      {
        text: "الزكاة حق المال وطهارة للنفس، تجب في تسعة أشياء حسب المذهب الإمامي.",
        source: "فقه الإمام الصادق",
        reference: "كتاب الزكاة - الأموال التي تجب فيها الزكاة"
      },
      {
        text: "مصارف الزكاة ثمانية كما نص عليها القرآن، ولا يجوز دفعها لغير مستحقيها.",
        source: "الرسائل العملية",
        reference: "سورة التوبة آية 60"
      }
    ],
    sunni_source: {
      text: "الزكاة الركن الثالث من أركان الإسلام، تجب في المال النامي الذي حال عليه الحول.",
      source: "فقه الزكاة",
      reference: "القرآن والسنة - أحاديث الزكاة"
    }
  }
};

// دالة البحث في قاعدة البيانات
function searchInDatabase(query: string): ReligiousSearchResponse | null {
  const queryLower = query.toLowerCase();
  
  // البحث عن الكلمات المفتاحية
  for (const [key, value] of Object.entries(religiousDatabase)) {
    if (queryLower.includes(key.toLowerCase()) || 
        queryLower.includes('شرب') && key === 'البيرة' ||
        queryLower.includes('كحول') && key === 'البيرة' ||
        queryLower.includes('مسكر') && (key === 'البيرة' || key === 'الخمر')) {
      return value;
    }
  }
  
  return null;
}

// دالة البحث العامة للأسئلة غير المحددة
function getGeneralReligiousResponse(query: string): ReligiousSearchResponse {
  return {
    shiite_sources: [
      {
        text: `سؤالك "${query}" يتطلب مراجعة المصادر الفقهية المعتمدة والرسائل العملية للمراجع العظام.`,
        source: "المراجع الشيعية المعاصرة",
        reference: "للحصول على فتوى دقيقة، يُنصح بمراجعة مكتب المرجع مباشرة"
      },
      {
        text: `في المسائل الفقهية المعقدة مثل هذه، من المهم الرجوع للعلماء المختصين.`,
        source: "الحوزة العلمية",
        reference: "استشارة طلبة العلوم الدينية المؤهلين"
      }
    ],
    sunni_source: {
      text: `لسؤالك "${query}"، أنصح بمراجعة كتب الفقه المعتمدة في المذاهب الأربعة ودور الإفتاء.`,
      source: "دور الإفتاء المعتمدة",
      reference: "الأزهر الشريف - دار الإفتاء المصرية - المجامع الفقهية"
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'استعلام غير صحيح' },
        { status: 400 }
      );
    }

    console.log(`🔍 بحث ديني: "${query}"`);

    // ابحث في قاعدة البيانات المحلية أولاً
    let searchResult = searchInDatabase(query);
    
    // إذا لم نجد نتائج محددة، اعطِ رد عام
    if (!searchResult) {
      searchResult = getGeneralReligiousResponse(query);
    }

    return NextResponse.json({
      success: true,
      query: query,
      results: searchResult,
      source: 'local_database',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في API البحث الديني:', error);
    
    return NextResponse.json(
      { 
        error: 'خطأ في الخادم أثناء البحث',
        message: 'حاول مرة أخرى لاحقاً' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API البحث الديني جاهز',
    version: '1.0.0',
    endpoints: {
      search: 'POST /api/religious-search'
    },
    database_topics: Object.keys(religiousDatabase)
  });
}