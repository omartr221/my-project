#!/usr/bin/env node

// Script لاستيراد بيانات الزبائن من ملفات Excel
import XLSX from 'xlsx';
import { initDatabase, db } from './server/db.js';
import { customers, customerCars } from './shared/schema.js';
import fs from 'fs';
import path from 'path';

async function importCustomerData() {
  console.log('🚀 بدء استيراد بيانات الزبائن من ملفات Excel...');
  
  try {
    // تهيئة قاعدة البيانات
    await initDatabase();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // البحث عن ملفات Excel في مجلد attached_assets
    const assetsDir = './attached_assets';
    const files = fs.readdirSync(assetsDir);
    const excelFiles = files.filter(file => 
      file.includes('ملف الزبائن') && (file.endsWith('.xlsx') || file.endsWith('.xls'))
    );

    console.log(`📁 تم العثور على ${excelFiles.length} ملف Excel للزبائن`);

    let totalCustomers = 0;
    let totalCars = 0;

    for (const fileName of excelFiles) {
      console.log(`\n📊 معالجة الملف: ${fileName}`);
      
      try {
        const filePath = path.join(assetsDir, fileName);
        const workbook = XLSX.readFile(filePath);
        
        // افتراض أن البيانات في الشيت الأول
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`   📋 تم قراءة ${data.length} صف من البيانات`);

        // تجاهل الصف الأول (العناوين) والصفوف الفارغة
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          
          try {
            // استخدام أسماء الأعمدة الفعلية من بنية Excel
            const customerName = row['لائحة الزبائن'] || '';
            const customerPhone = row['__EMPTY'] || '';
            
            // تنظيف البيانات وتحويلها (إزالة address إذا لم يكن موجود في الجدول)
            const customerData = {
              name: customerName.toString().trim(),
              phoneNumber: customerPhone.toString().trim(),
              notes: row['__EMPTY_8'] || '', // العمل
              createdAt: new Date().toISOString()
            };

            // تجاهل الصفوف الفارغة أو العناوين
            if (!customerData.name || 
                customerData.name === '' || 
                customerData.name === 'الاسم' ||
                customerData.name === '0' ||
                customerData.name.length < 2) {
              continue;
            }

            // إنشاء الزبون
            const [customer] = await db.insert(customers).values(customerData).returning();
            totalCustomers++;

            // إنشاء السيارة إذا كانت البيانات متوفرة
            const carBrand = row['__EMPTY_1'] || ''; // الصانع
            const carModel = row['__EMPTY_4'] || ''; // الطراز
            const licensePlate = row['__EMPTY_7'] || ''; // رقم اللوحة
            const chassisNumber = row['__EMPTY_6'] || ''; // رقم الشاسيه
            const engineCode = row['__EMPTY_3'] || ''; // رمز المحرك
            const color = row['__EMPTY_2'] || ''; // اللون
            const year = row['__EMPTY_5'] || null; // سنة الصنع

            const carData = {
              customerId: customer.id,
              carBrand: carBrand.toString().trim(),
              carModel: carModel.toString().trim(),
              licensePlate: licensePlate.toString().trim(),
              chassisNumber: chassisNumber.toString().trim(),
              engineCode: engineCode.toString().trim(),
              color: color.toString().trim(),
              year: year && year !== '0' ? parseInt(year) : null,
              createdAt: new Date().toISOString()
            };

            // إنشاء السيارة فقط إذا كان هناك معلومات مفيدة
            if (carData.carBrand !== '0' && carData.carModel !== '0' && 
                (carData.carBrand || carData.carModel || carData.licensePlate)) {
              await db.insert(customerCars).values(carData);
              totalCars++;
            }

            console.log(`   ✅ تم إنشاء الزبون: ${customerData.name} - ${carData.carBrand} ${carData.carModel}`);

          } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
              console.log(`   ⚠️ الزبون موجود مسبقاً: ${row['لائحة الزبائن'] || 'غير معروف'}`);
            } else {
              console.error(`   ❌ خطأ في معالجة الصف ${i}:`, error.message);
              console.error(`   البيانات:`, JSON.stringify(row, null, 2));
            }
          }
        }

      } catch (error) {
        console.error(`❌ خطأ في معالجة الملف ${fileName}:`, error.message);
      }
    }

    console.log('\n🎉 انتهاء استيراد بيانات الزبائن!');
    console.log(`📊 الإحصائيات النهائية:`);
    console.log(`   - تم إنشاء ${totalCustomers} زبون`);
    console.log(`   - تم إنشاء ${totalCars} سيارة`);

  } catch (error) {
    console.error('❌ خطأ عام في استيراد البيانات:', error);
    process.exit(1);
  }
}

// تشغيل الاستيراد
importCustomerData().catch(console.error);