import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface MaintenanceGuideRequest {
  carBrand: string;
  carPart: string;
}

interface MaintenanceGuideResponse {
  title: string;
  content: string;
  tools: string[];
  safetyTips: string[];
  estimatedTime: number;
  difficulty: "easy" | "medium" | "hard";
}

const CAR_PARTS_ARABIC = {
  engine: "المحرك",
  brakes: "الفرامل", 
  exhaust: "نظام العادم",
  transmission: "ناقل الحركة",
  suspension: "نظام التعليق",
  cooling: "نظام التبريد",
  electrical: "النظام الكهربائي",
  fuel: "نظام الوقود",
  air_conditioning: "المكيف",
  steering: "نظام التوجيه"
};

const BRAND_NAMES = {
  audi: "أودي",
  seat: "سيات", 
  skoda: "سكودا",
  volkswagen: "فولكس فاجن"
};

export async function generateMaintenanceGuide(request: MaintenanceGuideRequest): Promise<MaintenanceGuideResponse> {
  const partNameArabic = CAR_PARTS_ARABIC[request.carPart as keyof typeof CAR_PARTS_ARABIC] || request.carPart;
  const brandNameArabic = BRAND_NAMES[request.carBrand as keyof typeof BRAND_NAMES] || request.carBrand;

  const prompt = `أنت مساعد فني متخصص في صيانة السيارات الألمانية.
المطلوب: إنشاء دليل صيانة تفصيلي لـ ${partNameArabic} في سيارات ${brandNameArabic}.

يجب أن يشمل الدليل:
1. خطوات عملية واضحة ومفصلة للصيانة أو الإصلاح
2. قائمة بالأدوات المطلوبة لكل خطوة
3. نصائح السلامة المهمة أثناء العمل
4. الوقت المتوقع للإنجاز (بالدقائق)
5. مستوى الصعوبة (easy, medium, hard)

اكتب الرد باللغة العربية بطريقة مختصرة وواضحة للفني العربي.
استخدم الخبرة الفنية المتخصصة في السيارات الألمانية.

أرجع الجواب بصيغة JSON فقط:`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "أنت فني متخصص في صيانة السيارات الألمانية. أجب دائماً بصيغة JSON صحيحة باللغة العربية."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      title: result.title || `دليل صيانة ${partNameArabic} - ${brandNameArabic}`,
      content: result.content || result.steps || result.خطوات || '',
      tools: Array.isArray(result.tools) ? result.tools : 
             Array.isArray(result.الأدوات) ? result.الأدوات :
             (typeof result.tools === 'string' ? result.tools.split('\n').filter(Boolean) : []),
      safetyTips: Array.isArray(result.safetyTips) ? result.safetyTips :
                  Array.isArray(result.نصائح_السلامة) ? result.نصائح_السلامة :
                  Array.isArray(result.safety) ? result.safety :
                  (typeof result.safetyTips === 'string' ? result.safetyTips.split('\n').filter(Boolean) : []),
      estimatedTime: Number(result.estimatedTime || result.الوقت_المتوقع || result.time || 60),
      difficulty: ['easy', 'medium', 'hard'].includes(result.difficulty) ? result.difficulty : 'medium'
    };

  } catch (error) {
    console.error('خطأ في توليد دليل الصيانة:', error);
    throw new Error(`فشل في توليد دليل الصيانة: ${error.message}`);
  }
}