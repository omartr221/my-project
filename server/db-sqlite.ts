import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema-sqlite";

const sqlite = new Database("database.db");

// دالة تنظيف القيم قبل الإدخال - تتوافق مع أنواع البيانات المدعومة في SQLite
export function sanitizeValue(value: any): string | number | bigint | Buffer | null {
  // SQLite يدعم فقط: numbers, strings, bigints, buffers, null
  if (value === null || value === undefined) {
    return null;
  }
  
  // معالجة النصوص
  if (typeof value === 'string') {
    // إزالة المحارف الخطيرة والتحكم
    const cleaned = value
      .replace(/[\x00-\x1F\x7F]/g, '') // إزالة محارف التحكم
      .replace(/[\uFEFF\uFFFE\uFFFF]/g, '') // إزالة محارف Unicode الخطيرة
      .trim();
    return cleaned.length > 0 ? cleaned : null;
  }
  
  // معالجة الأرقام
  if (typeof value === 'number') {
    // التأكد من صحة الأرقام
    if (!isFinite(value) || isNaN(value)) {
      return null;
    }
    return value;
  }
  
  // معالجة BigInt
  if (typeof value === 'bigint') {
    return value;
  }
  
  // معالجة Buffer
  if (Buffer.isBuffer(value)) {
    return value;
  }
  
  // معالجة البيانات المنطقية - تحويل إلى رقم (0 أو 1)
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  
  // معالجة التواريخ - تحويل إلى نص ISO
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // معالجة المصفوفات والكائنات - تحويل إلى JSON
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }
  
  // إذا لم يكن النوع مدعوم، حول إلى نص
  try {
    return String(value);
  } catch {
    return null;
  }
}

// دالة تنظيف البيانات قبل الإدخال في قاعدة البيانات
export function sanitizeInsertData<T extends Record<string, any>>(data: T): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // تنظيف المفتاح أولاً
    const cleanKey = sanitizeValue(key);
    if (typeof cleanKey !== 'string' || cleanKey.length === 0) {
      continue; // تجاهل المفاتيح غير الصحيحة
    }
    
    // تنظيف المصفوفات المحولة إلى JSON (الحقول الخاصة)
    if (key === 'permissions' || key === 'technicians' || key === 'assistants') {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            // تنظيف عناصر المصفوفة وإعادة تحويلها إلى JSON
            const cleanedArray = parsed
              .map(item => sanitizeValue(item))
              .filter(item => item !== null);
            sanitized[cleanKey] = JSON.stringify(cleanedArray);
          } else {
            sanitized[cleanKey] = sanitizeValue(value);
          }
        } catch {
          sanitized[cleanKey] = sanitizeValue(value);
        }
      } else if (Array.isArray(value)) {
        const cleanedArray = value
          .map(item => sanitizeValue(item))
          .filter(item => item !== null);
        sanitized[cleanKey] = JSON.stringify(cleanedArray);
      } else {
        sanitized[cleanKey] = sanitizeValue(value);
      }
    }
    // تنظيف باقي القيم
    else {
      const cleanedValue = sanitizeValue(value);
      if (cleanedValue !== null) {
        sanitized[cleanKey] = cleanedValue;
      }
    }
  }
  
  return sanitized;
}

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist - بدون استخدام دوال PostgreSQL
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    supervisor TEXT,
    assistant TEXT,
    engineer TEXT,
    national_id TEXT,
    phone_number TEXT,
    address TEXT,
    is_active INTEGER DEFAULT 1,
    is_predefined INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_number TEXT UNIQUE NOT NULL,
    worker_id INTEGER NOT NULL,
    worker_role TEXT NOT NULL DEFAULT 'technician',
    description TEXT NOT NULL,
    car_brand TEXT NOT NULL,
    car_model TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    estimated_duration INTEGER,
    engineer_name TEXT,
    supervisor_name TEXT,
    technician_name TEXT,
    assistant_name TEXT,
    technicians TEXT,
    assistants TEXT,
    repair_operation TEXT,
    task_type TEXT,
    color TEXT,
    timer_type TEXT NOT NULL DEFAULT 'automatic',
    consumed_time INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    start_time TEXT DEFAULT CURRENT_TIMESTAMP,
    end_time TEXT,
    paused_at TEXT,
    pause_reason TEXT,
    pause_notes TEXT,
    total_paused_duration INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    archived_at TEXT,
    archived_by TEXT,
    archive_notes TEXT,
    rating INTEGER,
    delivery_number INTEGER,
    is_cancelled INTEGER DEFAULT 0,
    cancellation_reason TEXT,
    cancelled_at TEXT,
    cancelled_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers (id)
  );

  CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration INTEGER,
    entry_type TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customer_cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    car_brand TEXT NOT NULL,
    car_model TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    chassis_number TEXT,
    engine_code TEXT,
    year INTEGER,
    color TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions TEXT DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS parts_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_number TEXT UNIQUE NOT NULL,
    engineer_name TEXT NOT NULL,
    car_info TEXT NOT NULL,
    car_brand TEXT,
    car_model TEXT,
    license_plate TEXT,
    chassis_number TEXT,
    engine_code TEXT,
    reason_type TEXT NOT NULL,
    part_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    user_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS car_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_number TEXT UNIQUE NOT NULL,
    license_plate TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    car_brand TEXT NOT NULL,
    car_model TEXT NOT NULL,
    car_color TEXT,
    chassis_number TEXT,
    engine_code TEXT,
    entry_mileage TEXT NOT NULL,
    fuel_level TEXT NOT NULL,
    entry_notes TEXT,
    repair_type TEXT NOT NULL,
    received_by TEXT NOT NULL,
    received_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'received',
    workshop_notification_sent INTEGER DEFAULT 0,
    sent_to_workshop_at TEXT,
    sent_to_workshop_by TEXT,
    postponed_at TEXT,
    postponed_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;