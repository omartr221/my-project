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

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
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
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (customer_id) REFERENCES customers (id)
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
      name: sanitizeValue(workerData.name) || '',
      category: sanitizeValue(workerData.category) || '',
      supervisor: workerData.supervisor ? sanitizeValue(workerData.supervisor) : null,
      assistant: workerData.assistant ? sanitizeValue(workerData.assistant) : null,
      engineer: workerData.engineer ? sanitizeValue(workerData.engineer) : null,
      national_id: workerData.nationalId ? sanitizeValue(workerData.nationalId) : null,
      phone_number: workerData.phoneNumber ? sanitizeValue(workerData.phoneNumber) : null,
      address: workerData.address ? sanitizeValue(workerData.address) : null,
      is_active: workerData.isActive === true ? 1 : 0,
      is_predefined: workerData.isPredefined === true ? 1 : 0
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
    try {
      console.log('📦 Received data for parts request:', JSON.stringify(requestData, null, 2));
      
      const stmt = db.prepare(`
        INSERT INTO parts_requests (request_number, engineer_name, car_info, car_brand, car_model, license_plate, chassis_number, engine_code, reason_type, part_name, quantity, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const requestNumber = `PR${Date.now()}`;
      // Handle car_info specifically since it's required
      let carInfo = sanitizeValue(requestData.carInfo);
      if (!carInfo) {
        carInfo = sanitizeValue(requestData.licensePlate);
      }
      if (!carInfo) {
        carInfo = 'غير محدد';
      }
      
      const sanitizedData = {
        request_number: requestNumber,
        engineer_name: sanitizeValue(requestData.engineerName) || 'غير محدد',
        car_info: carInfo,
        car_brand: sanitizeValue(requestData.carBrand) || null,
        car_model: sanitizeValue(requestData.carModel) || null,
        license_plate: sanitizeValue(requestData.licensePlate) || null,
        chassis_number: sanitizeValue(requestData.chassisNumber) || null,
        engine_code: sanitizeValue(requestData.engineCode) || null,
        reason_type: sanitizeValue(requestData.reasonType) || 'غير محدد',
        part_name: sanitizeValue(requestData.partName) || 'غير محدد',
        quantity: parseInt(requestData.quantity) || 1,
        notes: sanitizeValue(requestData.notes) || null,
        status: 'pending'
      };
      
      console.log('✅ Sanitized data for insertion:', JSON.stringify(sanitizedData, null, 2));
      
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
      
      console.log('✅ Insert successful, ID:', result.lastInsertRowid);
      
      const getStmt = db.prepare("SELECT * FROM parts_requests WHERE id = ?");
      return getStmt.get(result.lastInsertRowid);
    } catch (error) {
      console.error('❌ Error in createPartsRequest:', error);
      throw error;
    }
  },

  // جلب طلبات القطع
  getPartsRequests: () => {
    const stmt = db.prepare("SELECT * FROM parts_requests ORDER BY created_at DESC");
    return stmt.all();
  },

  // جلب طلبات القطع لسيارة معينة
  getPartsRequestsByLicensePlate: (licensePlate: string) => {
    const stmt = db.prepare("SELECT * FROM parts_requests WHERE license_plate = ? ORDER BY created_at DESC");
    return stmt.all(licensePlate);
  },

  // البحث عن بيانات السيارة للAutofill
  getCarDataByLicensePlate: (licensePlate: string) => {
    const stmt = db.prepare(`
      SELECT car_brand, car_model, color, chassis_number, engine_code 
      FROM customer_cars 
      WHERE license_plate = ? 
      LIMIT 1
    `);
    return stmt.get(licensePlate);
  },

  // الحصول على إحصائيات العمال
  getWorkerStats: () => {
    try {
      // جلب عدد العمال النشطين
      const activeWorkersStmt = db.prepare("SELECT COUNT(*) as count FROM workers WHERE is_active = 1");
      const activeWorkers = activeWorkersStmt.get() as { count: number };

      // جلب إجمالي العمال
      const totalWorkersStmt = db.prepare("SELECT COUNT(*) as count FROM workers");
      const totalWorkers = totalWorkersStmt.get() as { count: number };

      // إرجاع الإحصائيات
      return {
        activeWorkers: activeWorkers.count || 0,
        totalWorkers: totalWorkers.count || 0,
        totalTasks: 0, // سيتم تحديثها لاحقاً عند إضافة جدول المهام
        completedTasks: 0
      };
    } catch (error) {
      console.error("Error in getWorkerStats:", error);
      return {
        activeWorkers: 0,
        totalWorkers: 0,
        totalTasks: 0,
        completedTasks: 0
      };
    }
  },

  // إنشاء عميل جديد
  createCustomer: (customerData: any) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO customers (name, phone_number, email, address, notes)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const sanitizedData = {
        name: sanitizeValue(customerData.name) || '',
        phone_number: sanitizeValue(customerData.phoneNumber) || '',
        email: customerData.email ? sanitizeValue(customerData.email) : null,
        address: customerData.address ? sanitizeValue(customerData.address) : null,
        notes: customerData.notes ? sanitizeValue(customerData.notes) : null
      };
      
      const result = stmt.run(
        sanitizedData.name,
        sanitizedData.phone_number,
        sanitizedData.email,
        sanitizedData.address,
        sanitizedData.notes
      );
      
      const getStmt = db.prepare("SELECT * FROM customers WHERE id = ?");
      return getStmt.get(result.lastInsertRowid);
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  // جلب العملاء
  getCustomers: () => {
    const stmt = db.prepare("SELECT * FROM customers ORDER BY created_at DESC");
    return stmt.all();
  },

  // جلب أسماء العمال (للقوائم المنسدلة)
  getAllWorkerNames: () => {
    const stmt = db.prepare("SELECT id, name, category FROM workers WHERE is_active = 1 ORDER BY name");
    return stmt.all();
  },

  // جلب عميل بالID
  getCustomer: (id: number) => {
    const stmt = db.prepare("SELECT * FROM customers WHERE id = ?");
    return stmt.get(id);
  },

  // تحديث عميل
  updateCustomer: (id: number, customerData: any) => {
    try {
      const stmt = db.prepare(`
        UPDATE customers 
        SET name = ?, phone_number = ?, email = ?, address = ?, notes = ?, updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `);
      
      const sanitizedData = {
        name: sanitizeValue(customerData.name) || '',
        phone_number: sanitizeValue(customerData.phoneNumber) || '',
        email: customerData.email ? sanitizeValue(customerData.email) : null,
        address: customerData.address ? sanitizeValue(customerData.address) : null,
        notes: customerData.notes ? sanitizeValue(customerData.notes) : null
      };
      
      stmt.run(
        sanitizedData.name,
        sanitizedData.phone_number,
        sanitizedData.email,
        sanitizedData.address,
        sanitizedData.notes,
        id
      );
      
      // إرجاع العميل المحدث
      const getStmt = db.prepare("SELECT * FROM customers WHERE id = ?");
      return getStmt.get(id);
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  // حذف عميل
  deleteCustomer: (id: number) => {
    try {
      const stmt = db.prepare("DELETE FROM customers WHERE id = ?");
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },

  // === وظائف إدارة السيارات ===
  
  // إنشاء سيارة جديدة لزبون
  createCustomerCar: (carData: any) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO customer_cars (customer_id, car_brand, car_model, license_plate, chassis_number, engine_code, year, color, notes, previous_owner)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const sanitizedData = {
        customer_id: parseInt(carData.customerId) || 0,
        car_brand: sanitizeValue(carData.carBrand) || '',
        car_model: sanitizeValue(carData.carModel) || '',
        license_plate: sanitizeValue(carData.licensePlate) || '',
        chassis_number: carData.chassisNumber ? sanitizeValue(carData.chassisNumber) : null,
        engine_code: carData.engineCode ? sanitizeValue(carData.engineCode) : null,
        year: carData.year ? parseInt(carData.year) : null,
        color: carData.color ? sanitizeValue(carData.color) : null,
        notes: carData.notes ? sanitizeValue(carData.notes) : null,
        previous_owner: carData.previousOwner ? sanitizeValue(carData.previousOwner) : null
      };
      
      const result = stmt.run(
        sanitizedData.customer_id,
        sanitizedData.car_brand,
        sanitizedData.car_model,
        sanitizedData.license_plate,
        sanitizedData.chassis_number,
        sanitizedData.engine_code,
        sanitizedData.year,
        sanitizedData.color,
        sanitizedData.notes,
        sanitizedData.previous_owner
      );
      
      // إرجاع البيانات المُدخلة
      const getStmt = db.prepare("SELECT * FROM customer_cars WHERE id = ?");
      return getStmt.get(result.lastInsertRowid);
    } catch (error) {
      console.error("Error creating customer car:", error);
      throw error;
    }
  },

  // جلب جميع السيارات
  getCustomerCars: () => {
    const stmt = db.prepare(`
      SELECT cc.*, c.name as customer_name 
      FROM customer_cars cc
      LEFT JOIN customers c ON cc.customer_id = c.id
      ORDER BY cc.created_at DESC
    `);
    return stmt.all();
  },

  // جلب سيارات زبون معين
  getCustomerCarsByCustomerId: (customerId: number) => {
    const stmt = db.prepare(`
      SELECT cc.*, c.name as customer_name 
      FROM customer_cars cc
      LEFT JOIN customers c ON cc.customer_id = c.id
      WHERE cc.customer_id = ?
      ORDER BY cc.created_at DESC
    `);
    return stmt.all(customerId);
  },

  // جلب سيارة واحدة
  getCustomerCar: (id: number) => {
    const stmt = db.prepare(`
      SELECT cc.*, c.name as customer_name 
      FROM customer_cars cc
      LEFT JOIN customers c ON cc.customer_id = c.id
      WHERE cc.id = ?
    `);
    return stmt.get(id);
  }
};

export default directSQLite;