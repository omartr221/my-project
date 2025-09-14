#!/usr/bin/env node

// Script بسيط لإنشاء قاعدة البيانات فقط
import Database from "better-sqlite3";

async function createSimpleDatabase() {
  console.log('🚀 إنشاء قاعدة بيانات SQLite بسيطة...');
  
  try {
    // حذف قاعدة البيانات القديمة إذا كانت موجودة
    const fs = await import('fs');
    if (fs.existsSync('v-power-tuning.db')) {
      fs.unlinkSync('v-power-tuning.db');
      console.log('🗑️ تم حذف قاعدة البيانات القديمة');
    }

    // إنشاء قاعدة بيانات جديدة
    const db = new Database("v-power-tuning.db");
    
    // إعداد SQLite
    db.pragma("journal_mode = WAL");
    console.log('✅ تم إنشاء قاعدة البيانات');

    // إنشاء جدول customers فقط للاختبار
    const createCustomersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone_number TEXT,
        address TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    db.exec(createCustomersTable);
    console.log('✅ تم إنشاء جدول customers');

    // اختبار إدراج زبون
    const insertCustomer = db.prepare('INSERT INTO customers (name, phone_number, address) VALUES (?, ?, ?)');
    const result = insertCustomer.run('زبون تجريبي', '0999123456', 'عنوان تجريبي');
    console.log('✅ تم إدراج زبون تجريبي:', result);

    // اختبار قراءة البيانات
    const selectCustomers = db.prepare('SELECT * FROM customers');
    const customers = selectCustomers.all();
    console.log('📊 الزبائن الموجودون:', customers);

    db.close();
    console.log('🎉 نجح إنشاء واختبار قاعدة البيانات!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء قاعدة البيانات:', error);
  }
}

createSimpleDatabase().catch(console.error);