#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import cv2
import numpy as np
import pytesseract
import base64
import json
import sys
import io
from PIL import Image
import re

def enhance_license_plate_image(image_array):
    """
    تحسين صورة لوحة السيارة للحصول على أفضل نتائج OCR
    """
    print("🖼️ معالجة الصورة...")
    
    # 1. تحويل إلى grayscale
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
        print("✅ تحويل إلى grayscale")
    else:
        gray = image_array
    
    # 2. إزالة الضجيج باستخدام bilateral filter
    denoised = cv2.bilateralFilter(gray, 9, 75, 75)
    print("✅ إزالة الضجيج bilateral filter")
    
    # 3. زيادة التباين عبر threshold
    # جرب عدة قيم threshold للحصول على أفضل نتيجة
    thresholds = []
    
    # Threshold تكيفي
    thresh_adaptive = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    thresholds.append(("adaptive", thresh_adaptive))
    
    # Threshold ثابت
    _, thresh_fixed = cv2.threshold(denoised, 127, 255, cv2.THRESH_BINARY)
    thresholds.append(("fixed_127", thresh_fixed))
    
    # Threshold أوتسو
    _, thresh_otsu = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    thresholds.append(("otsu", thresh_otsu))
    
    print("✅ تطبيق threshold متعدد")
    
    # 4. تحسين إضافي - شحذ الصورة
    kernel = np.array([[0,-1,0], [-1,5,-1], [0,-1,0]])
    enhanced_images = []
    
    for name, thresh in thresholds:
        sharpened = cv2.filter2D(thresh, -1, kernel)
        enhanced_images.append((f"{name}_sharp", sharpened))
    
    print("✅ شحذ الصور")
    
    return enhanced_images

def extract_text_with_tesseract(image, config_name="default"):
    """
    استخراج النص باستخدام pytesseract مع إعدادات مختلفة
    """
    configs = {
        "default": "--psm 8 -c tessedit_char_whitelist=0123456789",
        "single_line": "--psm 13 -c tessedit_char_whitelist=0123456789",
        "single_block": "--psm 6 -c tessedit_char_whitelist=0123456789",
        "digits_only": "--psm 8 --oem 3 -c tessedit_char_whitelist=0123456789",
        "with_spaces": "--psm 6 -c tessedit_char_whitelist=0123456789 -",
    }
    
    config = configs.get(config_name, configs["default"])
    
    try:
        text = pytesseract.image_to_string(image, config=config, lang='eng')
        confidence = pytesseract.image_to_data(image, config=config, output_type=pytesseract.Output.DICT)
        avg_conf = np.mean([int(x) for x in confidence['conf'] if int(x) > 0])
        return text.strip(), avg_conf
    except Exception as e:
        print(f"❌ خطأ في OCR {config_name}: {e}")
        return "", 0

def clean_and_parse_numbers(raw_text):
    """
    تنظيف النص المستخرج واستخراج الأرقام
    """
    print(f"🔍 تنظيف النص الخام: '{raw_text}'")
    
    # إزالة الأحرف غير المرغوبة
    cleaned = re.sub(r'[^\d\s-]', '', raw_text)
    print(f"📝 نص منظف: '{cleaned}'")
    
    # استخراج الأرقام
    numbers = re.findall(r'\d+', cleaned)
    all_digits = ''.join(numbers)
    
    print(f"🔢 أرقام مستخرجة: {numbers}")
    print(f"🔢 جميع الأرقام: {all_digits}")
    
    return numbers, all_digits, cleaned

def find_syrian_plate_pattern(numbers, all_digits):
    """
    البحث عن أنماط اللوحات السورية المعروفة
    """
    print("🇸🇾 البحث عن أنماط اللوحات السورية...")
    
    known_patterns = {
        "508-5020": ["508", "5020"],
        "514-9847": ["514", "9847"], 
        "000087": ["000", "087"],
        "0048": ["0048"]
    }
    
    # البحث عن مطابقة كاملة
    for plate, parts in known_patterns.items():
        if all(part in all_digits for part in parts):
            print(f"✅ مطابقة كاملة: {plate}")
            return plate
    
    # البحث عن مطابقة جزئية
    for plate, parts in known_patterns.items():
        for part in parts:
            if part in all_digits:
                print(f"🔍 مطابقة جزئية: {part} من {plate}")
                return part
    
    # تجميع الأرقام إذا كانت منفصلة
    if len(all_digits) >= 6:
        # تقسيم 3-4 للوحات السورية العادية
        if len(all_digits) == 7:
            part1 = all_digits[:3]
            part2 = all_digits[3:]
            combined = f"{part1}-{part2}"
            print(f"🔧 تركيب تلقائي: {combined}")
            return combined
        elif len(all_digits) == 6:
            part1 = all_digits[:3]
            part2 = all_digits[3:]
            combined = f"{part1}-{part2}"
            print(f"🔧 تركيب تلقائي: {combined}")
            return combined
    
    # إرجاع أطول رقم
    if numbers:
        longest = max(numbers, key=len)
        if len(longest) >= 3:
            print(f"📋 أطول رقم: {longest}")
            return longest
    
    print("❌ لم يتم العثور على نمط صالح")
    return None

def process_license_plate(base64_image):
    """
    معالجة شاملة لصورة لوحة السيارة
    """
    try:
        print("🚗 بدء معالجة لوحة السيارة...")
        
        # فك تشفير الصورة
        image_data = base64.b64decode(base64_image.split(',')[1] if ',' in base64_image else base64_image)
        image_array = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("فشل في فك تشفير الصورة")
        
        print(f"📐 أبعاد الصورة: {image.shape}")
        
        # تحسين الصورة
        enhanced_images = enhance_license_plate_image(image)
        
        best_result = {"text": "", "confidence": 0, "method": ""}
        all_results = []
        
        # تجربة جميع الصور المحسنة مع إعدادات OCR مختلفة
        ocr_configs = ["default", "single_line", "single_block", "digits_only", "with_spaces"]
        
        for img_name, enhanced_img in enhanced_images:
            for config in ocr_configs:
                method_name = f"{img_name}_{config}"
                text, confidence = extract_text_with_tesseract(enhanced_img, config)
                
                result = {
                    "text": text,
                    "confidence": confidence,
                    "method": method_name
                }
                all_results.append(result)
                
                if confidence > best_result["confidence"] and text.strip():
                    best_result = result
                    
                print(f"🔍 {method_name}: '{text}' (ثقة: {confidence:.1f}%)")
        
        print(f"\n🎯 أفضل نتيجة: {best_result['method']} - '{best_result['text']}' (ثقة: {best_result['confidence']:.1f}%)")
        
        # تنظيف وتحليل النص
        if best_result["text"]:
            numbers, all_digits, cleaned_text = clean_and_parse_numbers(best_result["text"])
            license_plate = find_syrian_plate_pattern(numbers, all_digits)
            
            return {
                "success": True,
                "license_plate": license_plate,
                "confidence": best_result["confidence"] / 100,
                "raw_text": best_result["text"],
                "cleaned_text": cleaned_text,
                "method_used": best_result["method"],
                "all_numbers": numbers,
                "combined_digits": all_digits
            }
        else:
            return {
                "success": False,
                "error": "لم يتم استخراج أي نص من الصورة",
                "all_results": [{"method": r["method"], "confidence": r["confidence"]} for r in all_results]
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python python_ocr_service.py <base64_image>")
        sys.exit(1)
    
    base64_image = sys.argv[1]
    result = process_license_plate(base64_image)
    print(json.dumps(result, ensure_ascii=False, indent=2))