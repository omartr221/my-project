import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export interface OCRResult {
  licensePlate: string | null;
  confidence: number;
  rawText: string;
}

// تحليل صورة واستخراج النص باستخدام Tesseract.js
export async function extractTextFromImage(base64Image: string): Promise<OCRResult> {
  try {
    console.log('🔍 بدء تحليل الصورة محلياً...');
    
    // تحويل base64 إلى buffer
    const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    // معالجة الصورة لتحسين جودة OCR
    const processedImage = await sharp(imageBuffer)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize()
      .threshold(128) // تحويل إلى أبيض وأسود واضح
      .sharpen({ sigma: 2 })
      .png()
      .toBuffer();

    // استخراج النص باستخدام Tesseract مع إعدادات محسنة
    const { data: { text, confidence } } = await Tesseract.recognize(
      processedImage,
      'eng', // الإنجليزية فقط للأرقام
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        tessedit_char_whitelist: '0123456789- ', // الأرقام والشرطات والمسافات فقط
        tessedit_pageseg_mode: '8', // كلمة واحدة
      }
    );

    console.log('📝 النص المستخرج:', text);
    console.log('🎯 مستوى الثقة:', confidence);

    // تنظيف النص واستخراج رقم اللوحة
    const extractedPlate = extractLicensePlateFromText(text);
    
    return {
      licensePlate: extractedPlate,
      confidence: confidence / 100, // تحويل إلى نسبة من 0 إلى 1
      rawText: text.trim()
    };

  } catch (error) {
    console.error('❌ خطأ في تحليل الصورة:', error);
    throw new Error('فشل في تحليل الصورة محلياً');
  }
}

// استخراج رقم اللوحة من النص مع تحسينات
function extractLicensePlateFromText(text: string): string | null {
  console.log('🔍 البحث عن أرقام اللوحة في النص:', text);
  
  // تنظيف النص وإزالة الرموز الغريبة
  let cleanText = text
    .replace(/[^\d\u0660-\u0669\s\-]/g, ' ') // الاحتفاظ بالأرقام العربية والإنجليزية والشرطات
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('📝 النص بعد التنظيف:', cleanText);
  
  // تحويل الأرقام العربية إلى إنجليزية
  cleanText = cleanText.replace(/[\u0660-\u0669]/g, (d) => String.fromCharCode(d.charCodeAt(0) - '\u0660'.charCodeAt(0) + '0'.charCodeAt(0)));
  
  // أنماط محسنة لاستخراج أرقام اللوحات
  const patterns = [
    // نمط 508-5020 أو 508 5020
    /(\d{3}[-\s]*\d{4})/g,
    // نمط 5020 (4 أرقام متتالية)
    /(\d{4})/g,
    // نمط 50 20 (رقمان منفصلان)
    /(\d{2}\s+\d{2})/g,
    // نمط 502 0 (3 أرقام ورقم)
    /(\d{3}\s+\d{1})/g,
    // أي مجموعة من 3-6 أرقام
    /(\d{3,6})/g
  ];

  const allMatches = [];
  
  for (const pattern of patterns) {
    const matches = cleanText.match(pattern);
    if (matches) {
      allMatches.push(...matches);
    }
  }

  if (allMatches.length > 0) {
    // ترتيب حسب الطول ثم حسب الأولوية
    const sortedMatches = allMatches
      .filter(match => match.replace(/\D/g, '').length >= 3) // على الأقل 3 أرقام
      .sort((a, b) => {
        const aDigits = a.replace(/\D/g, '');
        const bDigits = b.replace(/\D/g, '');
        
        // تفضيل الأرقام ذات 4 خانات
        if (aDigits.length === 4 && bDigits.length !== 4) return -1;
        if (bDigits.length === 4 && aDigits.length !== 4) return 1;
        
        // ثم حسب الطول
        return bDigits.length - aDigits.length;
      });
    
    const foundPlate = sortedMatches[0].replace(/\s+/g, '');
    console.log('✅ تم العثور على رقم اللوحة:', foundPlate);
    return foundPlate;
  }

  console.log('❌ لم يتم العثور على رقم لوحة في النص');
  return null;
}

// تحسين جودة الصورة للـ OCR
async function preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
  return await sharp(imageBuffer)
    .resize(1000, 800, { fit: 'inside', withoutEnlargement: true })
    .greyscale()
    .normalize()
    .threshold(128) // تحويل إلى أبيض وأسود
    .sharpen()
    .png()
    .toBuffer();
}