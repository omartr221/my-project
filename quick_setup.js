#!/usr/bin/env node

import Database from 'better-sqlite3';

// إعداد قاعدة البيانات
const db = new Database('v-power-tuning.db');

console.log('🚀 بدء إعداد البيانات الأساسية...');

// إنشاء العمال الأساسيين (11 عامل نشط)
const workers = [
  'بدوي', 'خالد', 'حكيم', 'محمد العلي', 'عامر', 
  'زياد', 'علي', 'حسام', 'عبد الحفيظ', 'مصطفى', 'نواف'
];

console.log('🔧 إضافة العمال الأساسيين...');

const workerStmt = db.prepare(`
  INSERT OR IGNORE INTO workers (name, category, is_active, is_predefined, created_at)
  VALUES (?, 'technician', 1, 1, ?)
`);

let workersAdded = 0;
for (const workerName of workers) {
  try {
    const result = workerStmt.run(workerName, new Date().toISOString());
    if (result.changes > 0) {
      console.log(`✅ تم إضافة العامل: ${workerName}`);
      workersAdded++;
    } else {
      console.log(`⚠️ العامل موجود مسبقاً: ${workerName}`);
    }
  } catch (error) {
    console.error(`❌ خطأ في إضافة العامل ${workerName}:`, error.message);
  }
}

// التحقق من العدد النهائي
const workersCount = db.prepare('SELECT COUNT(*) as count FROM workers WHERE is_active = 1').get();
console.log(`📊 إجمالي العمال النشطين: ${workersCount.count}`);

// التحقق من المستخدمين
const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`👥 إجمالي المستخدمين: ${usersCount.count}`);

// عرض عينة من العمال
console.log('\n👷 قائمة العمال النشطين:');
const activeWorkers = db.prepare('SELECT name FROM workers WHERE is_active = 1 ORDER BY name').all();
activeWorkers.forEach((worker, index) => {
  console.log(`${index + 1}. ${worker.name}`);
});

db.close();
console.log('\n✅ تم الانتهاء من إعداد البيانات الأساسية!');