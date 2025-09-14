#!/usr/bin/env node

import Database from 'better-sqlite3';
import XLSX from 'xlsx';
import fs from 'fs';

console.log('🚀 بدء استعادة بيانات الزبائن من Excel...');

// إعداد قاعدة البيانات
const db = new Database('v-power-tuning.db');

// البحث عن ملفات Excel
const excelFiles = fs.readdirSync('attached_assets')
  .filter(file => file.includes('ملف الزبائن') && file.endsWith('.xlsx'))
  .map(file => `attached_assets/${file}`);

console.log(`📁 وجدت ${excelFiles.length} ملف Excel:`, excelFiles);

let allCustomers = [];

for (const filePath of excelFiles) {
  console.log(`📂 معالجة: ${filePath}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 عدد الصفوف: ${data.length}`);
    
    // معالجة البيانات (تجاهل أول 5 صفوف)
    for (let i = 5; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      // البحث عن اسم الزبون (أول نص غير فارغ يحتوي على أحرف عربية)
      let customerName = '';
      let customerPhone = '';
      
      for (const cell of row) {
        if (!cell || cell === '') continue;
        
        const cellStr = String(cell).trim();
        if (cellStr.length < 2) continue;
        
        // إذا كان يحتوي على أحرف عربية، فهو اسم
        if (/[\u0600-\u06FF]/.test(cellStr) && !customerName) {
          customerName = cellStr;
        }
        // إذا كان رقماً وطويلاً، فهو هاتف
        else if (/^\d{8,}$/.test(cellStr.replace(/[-\s]/g, '')) && !customerPhone) {
          customerPhone = cellStr;
        }
      }
      
      if (customerName && customerName.length > 2) {
        allCustomers.push({
          name: customerName,
          phone: customerPhone || '',
          source: filePath
        });
      }
    }
  } catch (error) {
    console.error(`❌ خطأ في معالجة ${filePath}:`, error.message);
  }
}

console.log(`📊 تم استخراج ${allCustomers.length} زبون`);

// إزالة المكررات
const uniqueCustomers = [];
const seenNames = new Set();

for (const customer of allCustomers) {
  if (!seenNames.has(customer.name)) {
    seenNames.add(customer.name);
    uniqueCustomers.push(customer);
  }
}

console.log(`📊 زبائن فريدين: ${uniqueCustomers.length}`);

// حذف البيانات السابقة
try {
  db.prepare('DELETE FROM customers').run();
  console.log('🗑️ تم حذف بيانات الزبائن السابقة');
} catch (error) {
  console.log('⚠️ لا توجد بيانات سابقة لحذفها');
}

// إدراج الزبائن
const insertCustomer = db.prepare(`
  INSERT INTO customers (name, phone_number, notes, created_at)
  VALUES (?, ?, ?, ?)
`);

let insertedCount = 0;
for (const customer of uniqueCustomers) {
  try {
    insertCustomer.run(
      customer.name,
      customer.phone,
      'مستورد من Excel',
      new Date().toISOString()
    );
    insertedCount++;
  } catch (error) {
    console.error(`❌ خطأ في إدراج ${customer.name}:`, error.message);
  }
}

// التحقق من النتائج
const finalCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();
console.log(`✅ تم إدراج ${insertedCount} زبون بنجاح`);
console.log(`📊 إجمالي الزبائن في قاعدة البيانات: ${finalCount.count}`);

// عرض عينة
const sample = db.prepare('SELECT name, phone_number FROM customers LIMIT 10').all();
console.log('\n👥 عينة من الزبائن:');
sample.forEach((customer, index) => {
  console.log(`${index + 1}. ${customer.name} - ${customer.phone_number || 'لا يوجد هاتف'}`);
});

db.close();
console.log('\n✅ تم الانتهاء من استعادة بيانات الزبائن!');