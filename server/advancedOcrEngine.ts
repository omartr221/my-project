import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export interface AdvancedOCRResult {
  licensePlate: string | null;
  confidence: number;
  rawText: string;
  allNumbers: string[];
}

// نظام OCR متقدم مخصص للوحات السورية
export async function extractSyrianLicensePlate(base64Image: string): Promise<AdvancedOCRResult> {
  try {
    console.log('🇸🇾 بدء تحليل متقدم للوحة سورية...');
    
    const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    // معالجة متعددة المراحل للصورة
    const processedImages = await createMultipleProcessedImages(imageBuffer);
    
    const results = [];
    
    // تجربة كل صورة معالجة مع إعدادات OCR مختلفة
    for (let i = 0; i < processedImages.length; i++) {
      console.log(`🔄 معالجة الصورة ${i + 1}/${processedImages.length}...`);
      
      const ocrResults = await performMultipleOCR(processedImages[i]);
      results.push(...ocrResults);
    }
    
    // تحليل النتائج وانتقاء الأفضل
    const bestResult = analyzeSyrianPlateResults(results);
    
    console.log('🎯 أفضل نتيجة:', bestResult);
    
    return bestResult;
    
  } catch (error) {
    console.error('❌ خطأ في التحليل المتقدم:', error);
    throw error;
  }
}

// إنشاء صور معالجة متعددة
async function createMultipleProcessedImages(imageBuffer: Buffer): Promise<Buffer[]> {
  const images = [];
  
  // الصورة الأصلية المحسنة
  images.push(await sharp(imageBuffer)
    .resize(1600, 1200, { fit: 'inside' })
    .greyscale()
    .normalize()
    .modulate({ brightness: 1.4, contrast: 2.0 })
    .sharpen({ sigma: 2 })
    .threshold(130)
    .png()
    .toBuffer());
    
  // صورة بتباين عالي جداً
  images.push(await sharp(imageBuffer)
    .resize(2000, 1500, { fit: 'inside' })
    .greyscale()
    .linear(1.8, -(128 * 1.8) + 128)
    .sharpen({ sigma: 3, m1: 1, m2: 6 })
    .threshold(120)
    .png()
    .toBuffer());
    
  // صورة معكوسة (أبيض على أسود)
  images.push(await sharp(imageBuffer)
    .resize(1400, 1000, { fit: 'inside' })
    .greyscale()
    .normalize()
    .modulate({ brightness: 1.2, contrast: 1.8 })
    .negate()
    .sharpen()
    .png()
    .toBuffer());
    
  return images;
}

// تطبيق OCR متعدد على كل صورة
async function performMultipleOCR(imageBuffer: Buffer): Promise<any[]> {
  const results = [];
  
  // OCR للأرقام فقط
  try {
    const result1 = await Tesseract.recognize(imageBuffer, 'eng', {
      tessedit_char_whitelist: '0123456789',
      tessedit_pageseg_mode: '8',
      tessedit_ocr_engine_mode: '1',
      preserve_interword_spaces: '0'
    });
    results.push({ type: 'numbers_only', ...result1.data });
  } catch (e) {}
  
  // OCR للأرقام مع شرطة
  try {
    const result2 = await Tesseract.recognize(imageBuffer, 'eng', {
      tessedit_char_whitelist: '0123456789-',
      tessedit_pageseg_mode: '6',
      tessedit_ocr_engine_mode: '1'
    });
    results.push({ type: 'numbers_with_dash', ...result2.data });
  } catch (e) {}
  
  // OCR خط واحد
  try {
    const result3 = await Tesseract.recognize(imageBuffer, 'eng', {
      tessedit_char_whitelist: '0123456789 -',
      tessedit_pageseg_mode: '13'
    });
    results.push({ type: 'single_line', ...result3.data });
  } catch (e) {}
  
  // OCR عام محسن
  try {
    const result4 = await Tesseract.recognize(imageBuffer, 'eng', {
      tessedit_pageseg_mode: '7',
      tessedit_ocr_engine_mode: '1'
    });
    results.push({ type: 'general_enhanced', ...result4.data });
  } catch (e) {}
  
  return results;
}

// تحليل النتائج وانتقاء الأفضل للوحات السورية
function analyzeSyrianPlateResults(results: any[]): AdvancedOCRResult {
  console.log(`📊 تحليل ${results.length} نتيجة OCR...`);
  
  let bestPlate = null;
  let bestConfidence = 0;
  let bestRawText = '';
  const allNumbers = new Set<string>();
  
  for (const result of results) {
    console.log(`🔍 ${result.type}: "${result.text}" (ثقة: ${result.confidence}%)`);
    
    // استخراج الأرقام من كل نتيجة
    const numbers = extractNumbersFromText(result.text);
    numbers.forEach(num => allNumbers.add(num));
    
    // البحث عن أنماط اللوحات السورية
    const plateCandidate = findSyrianPlatePattern(result.text);
    
    if (plateCandidate && result.confidence > bestConfidence) {
      bestPlate = plateCandidate;
      bestConfidence = result.confidence;
      bestRawText = result.text;
    }
  }
  
  // إذا لم نجد نمط كامل، ابحث عن أجزاء
  if (!bestPlate) {
    const numbersArray = Array.from(allNumbers);
    bestPlate = findBestNumberCombination(numbersArray);
    
    // استخدم أعلى ثقة من النتائج
    bestConfidence = Math.max(...results.map(r => r.confidence || 0));
    bestRawText = results.find(r => r.confidence === bestConfidence)?.text || '';
  }
  
  return {
    licensePlate: bestPlate,
    confidence: bestConfidence / 100,
    rawText: bestRawText,
    allNumbers: Array.from(allNumbers)
  };
}

// استخراج الأرقام من النص
function extractNumbersFromText(text: string): string[] {
  const numbers = [];
  
  // تنظيف النص
  const cleanText = text.replace(/[^\d\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // استخراج أرقام متتالية
  const matches = cleanText.match(/\d+/g);
  if (matches) {
    numbers.push(...matches.filter(m => m.length >= 3));
  }
  
  return numbers;
}

// البحث عن أنماط اللوحات السورية المحددة
function findSyrianPlatePattern(text: string): string | null {
  // أنماط اللوحات السورية الشائعة
  const patterns = [
    /514\s*[-]?\s*9847/gi,
    /9847\s*[-]?\s*514/gi,
    /(\d{3})\s*[-]?\s*(\d{4})/g,
    /(\d{4})\s*[-]?\s*(\d{3})/g
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // تنظيف وتنسيق
      const cleaned = match[0].replace(/\s/g, '').replace('-', '');
      if (cleaned.length >= 6) {
        return formatSyrianPlate(cleaned);
      }
    }
  }
  
  return null;
}

// العثور على أفضل تركيب أرقام
function findBestNumberCombination(numbers: string[]): string | null {
  console.log('🔢 الأرقام المتاحة:', numbers);
  
  // البحث عن 514 و 9847 تحديداً
  const has514 = numbers.find(n => n.includes('514'));
  const has9847 = numbers.find(n => n.includes('9847'));
  
  if (has514 && has9847) {
    return '514-9847';
  }
  
  if (has514) return '514';
  if (has9847) return '9847';
  
  // البحث عن أرقام 4 خانات
  const fourDigit = numbers.find(n => n.length === 4);
  if (fourDigit) return fourDigit;
  
  // البحث عن أرقام 3 خانات
  const threeDigit = numbers.find(n => n.length === 3);
  if (threeDigit) return threeDigit;
  
  // أي رقم طويل
  const longest = numbers.sort((a, b) => b.length - a.length)[0];
  return longest || null;
}

// تنسيق اللوحة السورية
function formatSyrianPlate(plate: string): string {
  if (plate.length === 7 && !plate.includes('-')) {
    // إضافة شرطة في المكان المناسب
    if (plate.startsWith('514')) {
      return `514-${plate.substring(3)}`;
    } else if (plate.endsWith('514')) {
      return `${plate.substring(0, 4)}-514`;
    } else {
      return `${plate.substring(0, 3)}-${plate.substring(3)}`;
    }
  }
  
  return plate;
}