import { db } from './db';
import { customers, customerCars, partsRequests } from '@shared/schema';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
const backupDir = join(process.cwd(), 'backups');
if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
}

// دالة إنشاء نسخة احتياطية
export async function createBackup(): Promise<{ success: boolean; file?: string; timestamp?: string; error?: string }> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = join(backupDir, `backup-${timestamp}.json`);

    // جلب جميع البيانات
    const [customersData, customerCarsData, partsRequestsData] = await Promise.all([
      db.select().from(customers),
      db.select().from(customerCars),
      db.select().from(partsRequests)
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      customers: customersData,
      customerCars: customerCarsData,
      partsRequests: partsRequestsData,
      version: '1.0'
    };

    // حفظ النسخة الاحتياطية
    writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf8');
    
    console.log(`✅ تم إنشاء نسخة احتياطية: ${backupFile}`);
    return { success: true, file: backupFile, timestamp };
  } catch (error) {
    console.error('❌ خطأ في إنشاء النسخة الاحتياطية:', error);
    return { success: false, error: (error as Error).message };
  }
}

// دالة الاستعادة من النسخة الاحتياطية
export async function restoreFromBackup(backupData: any): Promise<{ success: boolean; error?: string }> {
  try {
    // حذف البيانات الحالية
    await db.delete(partsRequests);
    await db.delete(customerCars);
    await db.delete(customers);

    // استعادة البيانات
    if (backupData.customers && backupData.customers.length > 0) {
      await db.insert(customers).values(backupData.customers);
    }
    
    if (backupData.customerCars && backupData.customerCars.length > 0) {
      await db.insert(customerCars).values(backupData.customerCars);
    }
    
    if (backupData.partsRequests && backupData.partsRequests.length > 0) {
      await db.insert(partsRequests).values(backupData.partsRequests);
    }

    console.log('✅ تم استعادة البيانات بنجاح');
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في استعادة البيانات:', error);
    return { success: false, error: (error as Error).message };
  }
}

// نسخة احتياطية تلقائية كل ساعة
setInterval(async () => {
  console.log('🔄 بدء النسخ الاحتياطي التلقائي...');
  await createBackup();
}, 60 * 60 * 1000); // كل ساعة

// نسخة احتياطية عند بدء تشغيل السيرفر
setTimeout(async () => {
  console.log('🚀 إنشاء نسخة احتياطية أولية...');
  await createBackup();
}, 5000); // بعد 5 ثوان من التشغيل