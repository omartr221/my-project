#!/usr/bin/env node

// Script لفحص بنية ملفات Excel وأسماء الأعمدة
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

async function checkExcelStructure() {
  console.log('🔍 فحص بنية ملفات Excel...');
  
  try {
    // البحث عن ملفات Excel في مجلد attached_assets
    const assetsDir = './attached_assets';
    const files = fs.readdirSync(assetsDir);
    const excelFiles = files.filter(file => 
      file.includes('ملف الزبائن') && (file.endsWith('.xlsx') || file.endsWith('.xls'))
    );

    console.log(`📁 تم العثور على ${excelFiles.length} ملف Excel`);

    for (const fileName of excelFiles) {
      console.log(`\n📊 فحص الملف: ${fileName}`);
      
      try {
        const filePath = path.join(assetsDir, fileName);
        const workbook = XLSX.readFile(filePath);
        
        console.log(`   📋 أسماء الشيتات: ${workbook.SheetNames.join(', ')}`);
        
        // فحص الشيت الأول
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length > 0) {
          console.log(`   📊 عدد الصفوف: ${data.length}`);
          console.log(`   🏷️ أسماء الأعمدة المتوفرة:`);
          const columns = Object.keys(data[0]);
          columns.forEach((col, index) => {
            console.log(`      ${index + 1}. "${col}"`);
          });
          
          console.log(`\n   📝 عينة من البيانات (أول 3 صفوف):`);
          for (let i = 0; i < Math.min(3, data.length); i++) {
            console.log(`   صف ${i + 1}:`);
            Object.entries(data[i]).forEach(([key, value]) => {
              console.log(`      ${key}: "${value}"`);
            });
            console.log('   ---');
          }
        } else {
          console.log(`   ⚠️ الشيت فارغ أو لا يحتوي على بيانات`);
        }

      } catch (error) {
        console.error(`❌ خطأ في فحص الملف ${fileName}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ خطأ عام في فحص الملفات:', error);
  }
}

// تشغيل الفحص
checkExcelStructure().catch(console.error);