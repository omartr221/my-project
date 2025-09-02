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
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer();

    // استخراج النص باستخدام Tesseract
    const { data: { text, confidence } } = await Tesseract.recognize(
      processedImage,
      'ara+eng', // العربية والإنجليزية
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
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

// استخراج رقم اللوحة من النص
function extractLicensePlateFromText(text: string): string | null {
  console.log('🔍 البحث عن أرقام اللوحة في النص:', text);
  
  // تنظيف النص
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // أنماط أرقام اللوحات السورية المختلفة
  const patterns = [
    // نمط 508-5020 أو 508 5020
    /(\d{3}[-\s]*\d{4})/g,
    // نمط 5020 (4 أرقام)
    /(\d{4})/g,
    // نمط 50820 (5 أرقام)
    /(\d{5})/g,
    // نمط 508520 (6 أرقام)
    /(\d{6})/g,
    // نمط مع حروف سورية
    /(\d{2,4}[-\s]*\d{2,4})/g
  ];

  for (const pattern of patterns) {
    const matches = cleanText.match(pattern);
    if (matches && matches.length > 0) {
      // إرجاع أطول رقم تم العثور عليه
      const sortedMatches = matches.sort((a, b) => b.length - a.length);
      const foundPlate = sortedMatches[0];
      console.log('✅ تم العثور على رقم اللوحة:', foundPlate);
      return foundPlate;
    }
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