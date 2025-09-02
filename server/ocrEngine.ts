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
    
    // معالجة محسنة للصورة مخصصة لأرقام اللوحات
    const processedImage = await sharp(imageBuffer)
      .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize() // توزيع أفضل للإضاءة
      .modulate({ brightness: 1.3, contrast: 1.8 }) // تباين عالي
      .sharpen({ sigma: 2, m1: 0.8, m2: 5 }) // حدة عالية
      .threshold(140) // تحويل لأبيض وأسود واضح
      .png()
      .toBuffer();

    // تجربة تحليل متعدد المراحل
    console.log('🔄 تجربة طرق مختلفة لاستخراج النص...');
    
    let bestResult = { text: '', confidence: 0 };
    
    // الطريقة الأولى: أرقام فقط مع تحسينات
    try {
      const result1 = await Tesseract.recognize(processedImage, 'eng', {
        tessedit_char_whitelist: '0123456789-',
        tessedit_pageseg_mode: '8', // كلمة واحدة
        tessedit_ocr_engine_mode: '1', // LSTM فقط
        preserve_interword_spaces: '0'
      });
      if (result1.data.confidence > bestResult.confidence) {
        bestResult = result1.data;
      }
    } catch (e) {}
    
    // الطريقة الثانية: كتلة نص واحدة
    try {
      const result2 = await Tesseract.recognize(processedImage, 'eng', {
        tessedit_char_whitelist: '0123456789- ',
        tessedit_pageseg_mode: '6',
        tessedit_ocr_engine_mode: '1'
      });
      if (result2.data.confidence > bestResult.confidence) {
        bestResult = result2.data;
      }
    } catch (e) {}
    
    // الطريقة الثالثة: تحليل عام محسن
    try {
      const result3 = await Tesseract.recognize(processedImage, 'eng', {
        tessedit_pageseg_mode: '7', // كتلة نص واحدة
        tessedit_ocr_engine_mode: '1'
      });
      if (result3.data.confidence > bestResult.confidence) {
        bestResult = result3.data;
      }
    } catch (e) {}
    
    // الطريقة الرابعة: خط واحد
    try {
      const result4 = await Tesseract.recognize(processedImage, 'eng', {
        tessedit_char_whitelist: '0123456789-',
        tessedit_pageseg_mode: '13' // خط نص خام
      });
      if (result4.data.confidence > bestResult.confidence) {
        bestResult = result4.data;
      }
    } catch (e) {}
    
    const { text, confidence } = bestResult;

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
  
  // أنماط محسنة للوحات السورية
  const patterns = [
    // نمط كامل للوحة سورية: 514-9847
    /(\d{3}[-\s]*\d{4})/g,
    // نمط عكسي: 9847-514
    /(\d{4}[-\s]*\d{3})/g,
    // 4 أرقام متتالية (الجزء الثاني من اللوحة)
    /(\d{4})/g,
    // 3 أرقام متتالية (الجزء الأول من اللوحة)  
    /(\d{3})/g,
    // أي مجموعة أرقام
    /(\d{2,6})/g
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