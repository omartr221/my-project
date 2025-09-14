#!/usr/bin/env node

// Script اختبار قاعدة البيانات وإنشاء زبون واحد
import { initDatabase, db } from './server/db.js';
import { customers, customerCars } from './shared/schema.js';

async function testDatabase() {
  console.log('🧪 اختبار قاعدة البيانات...');
  
  try {
    // تهيئة قاعدة البيانات
    await initDatabase();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // إنشاء زبون اختباري واحد
    console.log('🔍 محاولة إنشاء زبون اختباري...');
    
    const testCustomer = {
      name: "زبون اختباري", 
      phoneNumber: "0999123456",
      address: "عنوان اختباري"
    };

    console.log('📄 بيانات الزبون للاختبار:', testCustomer);

    try {
      const [customer] = await db.insert(customers).values(testCustomer).returning();
      console.log('✅ تم إنشاء الزبون بنجاح!');
      console.log('📊 بيانات الزبون المنشأ:', customer);

      // محاولة إنشاء سيارة اختبارية
      const testCar = {
        customerId: customer.id,
        carBrand: "تويوتا",
        carModel: "كامري",
        licensePlate: "TEST-123"
      };

      const [car] = await db.insert(customerCars).values(testCar).returning();
      console.log('✅ تم إنشاء السيارة بنجاح!');
      console.log('📊 بيانات السيارة المنشأة:', car);

    } catch (error) {
      console.error('❌ خطأ في إنشاء الزبون:', error.message);
      console.error('📋 تفاصيل الخطأ:', error);
    }

  } catch (error) {
    console.error('❌ خطأ عام في اختبار قاعدة البيانات:', error);
  }
}

// تشغيل الاختبار
testDatabase().catch(console.error);