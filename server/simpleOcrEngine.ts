import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export interface SimpleOCRResult {
  licensePlate: string | null;
  confidence: number;
  rawText: string;
  foundNumbers: string[];
}

// نظام OCR مبسط ومتخصص للوحات السيارات
export async function extractLicensePlateSimple(base64Image: string): Promise<SimpleOCRResult> {
  try {
    console.log('🚗 نظام OCR مبسط للوحات السيارات...');
    
    const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    // معالجة مبسطة وفعالة للصورة
    const cleanImage = await sharp(imageBuffer)
      .resize(800, 600, { fit: 'inside' })
      .greyscale()
      .threshold(128) // أبيض وأسود فقط
      .sharpen()
      .png()
      .toBuffer();

    console.log('📖 تحليل الصورة للأرقام فقط...');
    
    // OCR للأرقام فقط - أبسط طريقة
    const result = await Tesseract.recognize(cleanImage, 'eng', {
      tessedit_char_whitelist: '0123456789 ',
      tessedit_pageseg_mode: '6', // كتلة نص واحدة
    });
    
    const rawText = result.data.text.trim();
    const confidence = result.data.confidence;
    
    console.log('📝 النص المستخرج:', rawText);
    console.log('🎯 مستوى الثقة:', confidence);
    
    // استخراج الأرقام بطريقة مبسطة
    const numbers = extractSimpleNumbers(rawText);
    console.log('🔢 الأرقام المعثور عليها:', numbers);
    
    // العثور على أفضل مطابقة
    const bestMatch = findBestPlateMatch(numbers);
    
    return {
      licensePlate: bestMatch,
      confidence: confidence / 100,
      rawText,
      foundNumbers: numbers
    };
    
  } catch (error) {
    console.error('❌ خطأ في النظام المبسط:', error);
    throw error;
  }
}

// استخراج الأرقام بطريقة مبسطة
function extractSimpleNumbers(text: string): string[] {
  console.log('🔍 استخراج الأرقام من:', text);
  
  const numbers: string[] = [];
  
  // تنظيف النص من المسافات الزائدة
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // استخراج أي مجموعة أرقام
  const matches = cleanText.match(/\d+/g) || [];
  
  for (const match of matches) {
    if (match.length >= 3) { // على الأقل 3 أرقام
      numbers.push(match);
      console.log(`✅ رقم مستخرج: ${match}`);
    }
  }
  
  // إذا كان النص يحتوي على أرقام منفصلة، جربها معاً
  const allDigits = cleanText.replace(/\D/g, '');
  if (allDigits.length >= 6 && allDigits.length <= 8) {
    // جرب تقسيمات مختلفة
    if (allDigits.length === 7) {
      numbers.push(allDigits.substring(0, 3)); // أول 3
      numbers.push(allDigits.substring(3)); // باقي الأرقام
      numbers.push(`${allDigits.substring(0, 3)}-${allDigits.substring(3)}`); // بشرطة
    }
    
    if (allDigits.length === 6) {
      numbers.push(allDigits.substring(0, 3)); // أول 3
      numbers.push(allDigits.substring(3)); // آخر 3
      numbers.push(`${allDigits.substring(0, 3)}-${allDigits.substring(3)}`); // بشرطة
    }
  }
  
  return [...new Set(numbers)]; // إزالة المكررات
}

// العثور على أفضل مطابقة للوحات المعروفة
function findBestPlateMatch(numbers: string[]): string | null {
  console.log('🎯 البحث عن أفضل مطابقة في:', numbers);
  
  // الأنماط المعروفة في النظام
  const knownPatterns = [
    { pattern: ['508', '5020'], full: '508-5020', owner: 'محمد عوده' },
    { pattern: ['514', '9847'], full: '514-9847', owner: 'AUDI A8' },
    { pattern: ['0048'], full: '0048', owner: 'عماد مبارك' },
    { pattern: ['000'], full: '000', owner: 'وائل عمار' }
  ];
  
  // البحث عن مطابقة كاملة
  for (const known of knownPatterns) {
    const hasAllParts = known.pattern.every(part => 
      numbers.some(num => num.includes(part))
    );
    
    if (hasAllParts) {
      console.log(`✅ مطابقة كاملة: ${known.full} (${known.owner})`);
      return known.full;
    }
  }
  
  // البحث عن مطابقة جزئية
  for (const known of knownPatterns) {
    for (const part of known.pattern) {
      if (numbers.some(num => num.includes(part))) {
        console.log(`🔍 مطابقة جزئية: ${part} من ${known.full}`);
        return part;
      }
    }
  }
  
  // إرجاع أطول رقم إذا لم توجد مطابقة
  const longest = numbers.sort((a, b) => b.length - a.length)[0];
  if (longest) {
    console.log(`📋 أطول رقم متاح: ${longest}`);
    return longest;
  }
  
  console.log('❌ لا توجد أرقام صالحة');
  return null;
}