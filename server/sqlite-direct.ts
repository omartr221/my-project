import Database from "better-sqlite3";
import { sanitizeValue } from "./db-sqlite";

const db = new Database("database.db");

// إنشاء الجداول الأساسية
db.exec(`
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
    start_time TEXT DEFAULT (datetime('now', 'localtime')),
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
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (worker_id) REFERENCES workers (id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
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
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

// دوال مساعدة للعمل مع العمال
export const directSQLite = {
  // إنشاء عامل جديد
  createWorker: (workerData: any) => {
    const stmt = db.prepare(`
      INSERT INTO workers (name, category, supervisor, assistant, engineer, national_id, phone_number, address, is_active, is_predefined)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const sanitizedData = {
      name: sanitizeValue(workerData.name),
      category: sanitizeValue(workerData.category),
      supervisor: sanitizeValue(workerData.supervisor) || null,
      assistant: sanitizeValue(workerData.assistant) || null,
      engineer: sanitizeValue(workerData.engineer) || null,
      national_id: sanitizeValue(workerData.nationalId) || null,
      phone_number: sanitizeValue(workerData.phoneNumber) || null,
      address: sanitizeValue(workerData.address) || null,
      is_active: workerData.isActive ? 1 : 0,
      is_predefined: workerData.isPredefined ? 1 : 0
    };
    
    const result = stmt.run(
      sanitizedData.name,
      sanitizedData.category,
      sanitizedData.supervisor,
      sanitizedData.assistant,
      sanitizedData.engineer,
      sanitizedData.national_id,
      sanitizedData.phone_number,
      sanitizedData.address,
      sanitizedData.is_active,
      sanitizedData.is_predefined
    );
    
    // إرجاع البيانات المُدخلة
    const getStmt = db.prepare("SELECT * FROM workers WHERE id = ?");
    return getStmt.get(result.lastInsertRowid);
  },

  // جلب جميع العمال
  getWorkers: () => {
    const stmt = db.prepare("SELECT * FROM workers ORDER BY id DESC");
    return stmt.all();
  },

  // إنشاء مستخدم جديد
  createUser: (userData: any) => {
    const stmt = db.prepare(`
      INSERT INTO users (username, password, role, permissions)
      VALUES (?, ?, ?, ?)
    `);
    
    const sanitizedData = {
      username: sanitizeValue(userData.username),
      password: sanitizeValue(userData.password),
      role: sanitizeValue(userData.role),
      permissions: JSON.stringify(userData.permissions || [])
    };
    
    const result = stmt.run(
      sanitizedData.username,
      sanitizedData.password,
      sanitizedData.role,
      sanitizedData.permissions
    );
    
    const getStmt = db.prepare("SELECT * FROM users WHERE id = ?");
    return getStmt.get(result.lastInsertRowid);
  },

  // جلب مستخدم بالاسم
  getUserByUsername: (username: string) => {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    return stmt.get(sanitizeValue(username));
  },

  // إنشاء طلب قطع غيار
  createPartsRequest: (requestData: any) => {
    const stmt = db.prepare(`
      INSERT INTO parts_requests (request_number, engineer_name, car_info, car_brand, car_model, license_plate, chassis_number, engine_code, reason_type, part_name, quantity, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const requestNumber = `PR${Date.now()}`;
    const sanitizedData = {
      request_number: requestNumber,
      engineer_name: sanitizeValue(requestData.engineerName),
      car_info: sanitizeValue(requestData.carInfo),
      car_brand: sanitizeValue(requestData.carBrand) || null,
      car_model: sanitizeValue(requestData.carModel) || null,
      license_plate: sanitizeValue(requestData.licensePlate) || null,
      chassis_number: sanitizeValue(requestData.chassisNumber) || null,
      engine_code: sanitizeValue(requestData.engineCode) || null,
      reason_type: sanitizeValue(requestData.reasonType),
      part_name: sanitizeValue(requestData.partName),
      quantity: parseInt(requestData.quantity) || 1,
      notes: sanitizeValue(requestData.notes) || null,
      status: 'pending'
    };
    
    const result = stmt.run(
      sanitizedData.request_number,
      sanitizedData.engineer_name,
      sanitizedData.car_info,
      sanitizedData.car_brand,
      sanitizedData.car_model,
      sanitizedData.license_plate,
      sanitizedData.chassis_number,
      sanitizedData.engine_code,
      sanitizedData.reason_type,
      sanitizedData.part_name,
      sanitizedData.quantity,
      sanitizedData.notes,
      sanitizedData.status
    );
    
    const getStmt = db.prepare("SELECT * FROM parts_requests WHERE id = ?");
    return getStmt.get(result.lastInsertRowid);
  },

  // جلب طلبات القطع
  getPartsRequests: () => {
    const stmt = db.prepare("SELECT * FROM parts_requests ORDER BY created_at DESC");
    return stmt.all();
  }
};

export default directSQLite;