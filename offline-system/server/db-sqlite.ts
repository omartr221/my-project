import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema-sqlite";
import { sql } from 'drizzle-orm';

// Create SQLite database file
const sqlite = new Database('tasks.db');

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Initialize database schema
export function initializeDatabase() {
  try {
    // Create workers table
    db.run(sql`
      CREATE TABLE IF NOT EXISTS workers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'technician',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tasks table
    db.run(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_number TEXT,
        worker_id INTEGER NOT NULL,
        worker_role TEXT DEFAULT 'technician',
        description TEXT NOT NULL,
        repair_operation TEXT,
        car_brand TEXT NOT NULL,
        car_model TEXT NOT NULL,
        license_plate TEXT,
        estimated_duration INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        start_time DATETIME,
        end_time DATETIME,
        pause_reason TEXT,
        pause_notes TEXT,
        engineer_name TEXT,
        supervisor_name TEXT,
        assistant_name TEXT,
        archived_at DATETIME,
        archived_by TEXT,
        archive_notes TEXT,
        rating INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
      )
    `);

    // Create time_entries table
    db.run(sql`
      CREATE TABLE IF NOT EXISTS time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration INTEGER DEFAULT 0,
        entry_type TEXT DEFAULT 'work',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    // Insert default workers if not exists
    const workersCount = sqlite.prepare('SELECT COUNT(*) as count FROM workers').get() as { count: number };
    
    if (workersCount.count === 0) {
      const workerNames = [
        'غدير', 'يحيى', 'حسام', 'مصطفى', 'زياد', 'سليمان', 
        'علي', 'حسن', 'بدوي', 'عبد الحفيظ', 'محمد علي'
      ];
      
      const stmt = sqlite.prepare('INSERT INTO workers (name, category) VALUES (?, ?)');
      for (const worker of workerNames) {
        stmt.run(worker, 'technician');
      }
    }

    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}