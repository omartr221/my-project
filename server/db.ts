import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// إنشاء قاعدة بيانات SQLite
const sqlite = new Database('v-power-tuning.db');

// تمكين Foreign Keys
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// دالة تهيئة قاعدة البيانات
export async function initDatabase() {
  console.log('🔧 تهيئة قاعدة البيانات SQLite...');
  
  try {
    // الجداول منشئة مسبقاً - فقط التحقق من وجودها
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    if (tables.length > 0) {
      console.log('✅ تم إنشاء جداول قاعدة البيانات بنجاح');
      return true;
    } else {
      console.log('⚠️ لا توجد جداول - سيتم إنشاؤها من خلال Drizzle');
      return false;
    }
  } catch (error) {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
    throw error;
  }
}

// تصدير SQLite database للاستخدام المباشر
export { sqlite };