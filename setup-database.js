#!/usr/bin/env node

// Script لإعداد قاعدة البيانات SQLite وإنشاء البيانات الأساسية
import { initDatabase, db } from './server/db.js';
import { workers, users } from './shared/schema.js';
import bcrypt from 'bcrypt';

async function setupDatabase() {
  console.log('🚀 بدء إعداد قاعدة البيانات...');
  
  try {
    // تهيئة قاعدة البيانات وإنشاء الجداول
    await initDatabase();
    console.log('✅ تم إنشاء الجداول بنجاح');

    // إنشاء العمال الأساسيين
    const defaultWorkers = [
      { name: "بدوي", category: "technician", isPredefined: true },
      { name: "خالد", category: "technician", isPredefined: true },
      { name: "حكيم", category: "technician", isPredefined: true },
      { name: "محمد العلي", category: "technician", isPredefined: true },
      { name: "يزن", category: "assistant", isPredefined: true },
      { name: "عامر", category: "technician", isPredefined: true },
      { name: "زياد", category: "assistant", isPredefined: true },
      { name: "علي", category: "technician", isPredefined: true },
      { name: "عبد الحفيظ", category: "technician", isPredefined: true },
      { name: "مصطفى", category: "assistant", isPredefined: true },
      { name: "حسام", category: "technician", isPredefined: true },
      { name: "نواف", category: "assistant", isPredefined: true }
    ];

    console.log('🔧 إنشاء العمال الأساسيين...');
    for (const worker of defaultWorkers) {
      try {
        await db.insert(workers).values({
          ...worker,
          isActive: true,
          createdAt: new Date().toISOString()
        });
        console.log(`✅ تم إنشاء العامل: ${worker.name}`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`⚠️ العامل موجود مسبقاً: ${worker.name}`);
        } else {
          console.error(`❌ خطأ في إنشاء العامل ${worker.name}:`, error.message);
        }
      }
    }

    // إنشاء المستخدمين الأساسيين
    const defaultUsers = [
      { 
        username: "فارس", 
        password: "123456", 
        role: "admin", 
        permissions: JSON.stringify(["all"])
      },
      { 
        username: "بدوي", 
        password: "123456", 
        role: "workshop", 
        permissions: JSON.stringify(["workshop", "tasks", "parts"])
      },
      { 
        username: "هبة", 
        password: "123456", 
        role: "parts", 
        permissions: JSON.stringify(["parts", "customers"])
      },
      { 
        username: "ملك", 
        password: "123456", 
        role: "reception", 
        permissions: JSON.stringify(["reception", "customers"])
      },
      { 
        username: "روان", 
        password: "123456", 
        role: "reception", 
        permissions: JSON.stringify(["reception", "customers"])
      },
      { 
        username: "الاستقبال", 
        password: "123456", 
        role: "reception", 
        permissions: JSON.stringify(["reception", "customers"])
      }
    ];

    console.log('👥 إنشاء المستخدمين الأساسيين...');
    for (const user of defaultUsers) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.insert(users).values({
          ...user,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ تم إنشاء المستخدم: ${user.username}`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`⚠️ المستخدم موجود مسبقاً: ${user.username}`);
        } else {
          console.error(`❌ خطأ في إنشاء المستخدم ${user.username}:`, error.message);
        }
      }
    }

    console.log('🎉 تم إعداد قاعدة البيانات بنجاح!');
    console.log('📊 ملخص البيانات المنشأة:');
    console.log(`   - ${defaultWorkers.length} عامل`);
    console.log(`   - ${defaultUsers.length} مستخدم`);
    console.log('');
    console.log('🚀 يمكنك الآن تشغيل النظام باستخدام: npm run dev');

  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
    process.exit(1);
  }
}

// تشغيل الإعداد
setupDatabase().catch(console.error);