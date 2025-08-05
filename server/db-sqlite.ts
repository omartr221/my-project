import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema-sqlite";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import fs from "fs";

// Create database directory if it doesn't exist
const dbDir = path.dirname("./v-power-tuning.db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const sqlite = new Database("./v-power-tuning.db");

// Enable WAL mode for better concurrency
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("temp_store = MEMORY");

export const db = drizzle(sqlite, { schema });

// Initialize database tables
export async function initDatabase() {
  try {
    console.log("🔧 تهيئة قاعدة البيانات SQLite...");
    
    // Create tables manually using SQL since we don't have migration files for SQLite
    const createTablesSQL = `
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
        FOREIGN KEY (worker_id) REFERENCES workers(id)
      );

      CREATE TABLE IF NOT EXISTS time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration INTEGER,
        entry_type TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id)
      );

      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        location TEXT,
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
        previous_owner TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        permissions TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

      CREATE TABLE IF NOT EXISTS parts_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_number TEXT UNIQUE,
        engineer_name TEXT NOT NULL,
        customer_name TEXT,
        car_info TEXT NOT NULL,
        car_brand TEXT,
        car_model TEXT,
        license_plate TEXT,
        chassis_number TEXT,
        engine_code TEXT,
        reason_type TEXT NOT NULL,
        part_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        requested_by TEXT,
        requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
        approved_by TEXT,
        approved_at TEXT,
        in_preparation_at TEXT,
        ready_for_pickup_at TEXT,
        ordered_externally_at TEXT,
        ordered_externally_by TEXT,
        estimated_arrival TEXT,
        parts_arrived_at TEXT,
        parts_arrived_by TEXT,
        unavailable_at TEXT,
        unavailable_by TEXT,
        delivered_by TEXT,
        delivered_at TEXT,
        returned_at TEXT,
        returned_by TEXT,
        return_reason TEXT,
        user_notes TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        related_id INTEGER,
        related_type TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        read_at TEXT
      );
    `;

    // Execute table creation
    sqlite.exec(createTablesSQL);
    
    console.log("✅ تم إنشاء جداول قاعدة البيانات بنجاح");
    return true;
  } catch (error) {
    console.error("❌ خطأ في تهيئة قاعدة البيانات:", error);
    return false;
  }
}

// Export the sqlite instance for direct queries if needed
export { sqlite };