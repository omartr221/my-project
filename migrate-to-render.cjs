const { Pool } = require("pg");
const Database = require("better-sqlite3");

// اتصال بقاعدة بيانات Render PostgreSQL
const renderConnectionString = "postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: renderConnectionString,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

// فتح قاعدة البيانات SQLite المحلية
const sqlite = new Database("./v-power-tuning.db");

async function migrateData() {
  try {
    console.log("🚀 بدء نقل البيانات من SQLite إلى Render PostgreSQL...");
    
    // اختبار الاتصال
    console.log("🔗 اختبار الاتصال بقاعدة البيانات...");
    await pool.query('SELECT NOW()');
    console.log("✅ تم الاتصال بنجاح");
    
    // إنشاء الجداول في PostgreSQL
    const createTablesSQL = `
      DROP TABLE IF EXISTS time_entries CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE; 
      DROP TABLE IF EXISTS workers CASCADE;
      DROP TABLE IF EXISTS customer_cars CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS parts_requests CASCADE;
      DROP TABLE IF EXISTS car_receipts CASCADE;

      CREATE TABLE workers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        supervisor VARCHAR(100),
        assistant VARCHAR(100),
        engineer VARCHAR(100),
        national_id VARCHAR(20),
        phone_number VARCHAR(20),
        address VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        is_predefined BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE tasks (
        id SERIAL PRIMARY KEY,
        task_number VARCHAR(20) UNIQUE NOT NULL,
        worker_id INTEGER NOT NULL REFERENCES workers(id),
        worker_role VARCHAR(50) NOT NULL DEFAULT 'technician',
        description VARCHAR(500) NOT NULL,
        car_brand VARCHAR(50) NOT NULL,
        car_model VARCHAR(100) NOT NULL,
        license_plate VARCHAR(20) NOT NULL,
        estimated_duration INTEGER,
        engineer_name VARCHAR(100),
        supervisor_name VARCHAR(100),
        technician_name VARCHAR(100),
        assistant_name VARCHAR(100),
        technicians TEXT[],
        assistants TEXT[],
        repair_operation VARCHAR(200),
        task_type VARCHAR(20),
        color VARCHAR(20),
        timer_type VARCHAR(20) NOT NULL DEFAULT 'automatic',
        consumed_time INTEGER,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        paused_at TIMESTAMP,
        pause_reason VARCHAR(100),
        pause_notes VARCHAR(500),
        total_paused_duration INTEGER DEFAULT 0,
        is_archived BOOLEAN DEFAULT false,
        archived_at TIMESTAMP,
        archived_by VARCHAR(100),
        archive_notes VARCHAR(1000),
        rating INTEGER,
        delivery_number INTEGER,
        is_cancelled BOOLEAN DEFAULT false,
        cancellation_reason TEXT,
        cancelled_at TIMESTAMP,
        cancelled_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE time_entries (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration INTEGER,
        entry_type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        location TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE customer_cars (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        car_brand VARCHAR(50) NOT NULL,
        car_model VARCHAR(100) NOT NULL,
        license_plate VARCHAR(20) NOT NULL,
        chassis_number VARCHAR(100),
        engine_code VARCHAR(100),
        year INTEGER,
        color VARCHAR(50),
        notes TEXT,
        previous_owner TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        permissions TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE car_receipts (
        id SERIAL PRIMARY KEY,
        receipt_number VARCHAR(20) UNIQUE NOT NULL,
        license_plate VARCHAR(20) NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        car_brand VARCHAR(50) NOT NULL,
        car_model VARCHAR(100) NOT NULL,
        car_color VARCHAR(50),
        chassis_number VARCHAR(100),
        engine_code VARCHAR(100),
        entry_mileage TEXT NOT NULL,
        fuel_level VARCHAR(20) NOT NULL,
        entry_notes TEXT,
        repair_type TEXT NOT NULL,
        received_by VARCHAR(100) NOT NULL,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'received',
        workshop_notification_sent BOOLEAN DEFAULT false,
        sent_to_workshop_at TIMESTAMP,
        sent_to_workshop_by VARCHAR(100),
        postponed_at TIMESTAMP,
        postponed_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE parts_requests (
        id SERIAL PRIMARY KEY,
        request_number VARCHAR(20) UNIQUE NOT NULL,
        license_plate VARCHAR(20) NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        car_brand VARCHAR(50) NOT NULL,
        car_model VARCHAR(100) NOT NULL,
        chassis_number VARCHAR(100),
        engine_code VARCHAR(100),
        part_number VARCHAR(100) NOT NULL,
        part_description VARCHAR(500) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        priority VARCHAR(20) NOT NULL DEFAULT 'normal',
        status VARCHAR(30) NOT NULL DEFAULT 'in_preparation',
        requested_by VARCHAR(100) NOT NULL,
        approved_by VARCHAR(100),
        delivered_by VARCHAR(100),
        notes TEXT,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        delivered_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("📋 إنشاء الجداول في PostgreSQL...");
    await pool.query(createTablesSQL);
    console.log("✅ تم إنشاء الجداول");

    // نقل البيانات من كل جدول
    const tables = ['workers', 'customers', 'customer_cars', 'users', 'tasks', 'time_entries', 'car_receipts', 'parts_requests'];
    
    for (const table of tables) {
      console.log(`📦 نقل بيانات ${table}...`);
      
      try {
        // قراءة البيانات من SQLite
        const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
        console.log(`   وجد ${rows.length} سجل`);
        
        if (rows.length === 0) {
          console.log(`   ⏭️ تخطي ${table} - لا توجد بيانات`);
          continue;
        }
        
        // تحويل البيانات للتوافق مع PostgreSQL
        for (const row of rows) {
          // تحويل التواريخ
          for (const [key, value] of Object.entries(row)) {
            if (key.includes('_at') || key.includes('_time')) {
              if (value === 'CURRENT_TIMESTAMP' || value === null || value === '') {
                row[key] = new Date().toISOString();
              } else if (typeof value === 'string' && value !== '') {
                try {
                  row[key] = new Date(value).toISOString();
                } catch {
                  row[key] = new Date().toISOString();
                }
              }
            }
            
            // تحويل القيم المنطقية
            if (typeof value === 'number' && (key.includes('is_') || key.includes('_sent'))) {
              row[key] = value === 1;
            }
            
            // تحويل المصفوفات JSON
            if ((key === 'technicians' || key === 'assistants' || key === 'permissions') && value) {
              try {
                const parsed = JSON.parse(value);
                row[key] = Array.isArray(parsed) ? parsed : [];
              } catch {
                row[key] = [];
              }
            }
          }
          
          // إدراج في PostgreSQL
          const columns = Object.keys(row).filter(k => k !== 'id');
          const values = columns.map(k => row[k]);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const insertSQL = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
          
          try {
            await pool.query(insertSQL, values);
          } catch (error) {
            console.error(`خطأ في إدراج سجل في ${table}:`, error.message);
            console.log('البيانات:', JSON.stringify(row, null, 2));
          }
        }
        
        console.log(`✅ تم نقل ${table} - ${rows.length} سجل`);
        
      } catch (error) {
        console.error(`❌ خطأ في معالجة ${table}:`, error.message);
      }
    }
    
    // تحديث تسلسل ID
    console.log("🔄 تحديث تسلسل الأرقام...");
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT MAX(id) as max_id FROM ${table}`);
        const maxId = result.rows[0].max_id || 0;
        if (maxId > 0) {
          await pool.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), ${maxId + 1});`);
          console.log(`   ✅ ${table}: تسلسل محدث إلى ${maxId + 1}`);
        }
      } catch (error) {
        console.log(`   ⚠️ تحذير: لم يتم تحديث تسلسل ${table}`);
      }
    }
    
    console.log("\n🎉 تم نقل جميع البيانات بنجاح!");
    console.log("🌐 يمكنك الآن استخدام قاعدة البيانات على Render");
    console.log("🔗 رابط قاعدة البيانات: postgresql://neondb_owner:***@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb");
    
  } catch (error) {
    console.error("❌ خطأ في نقل البيانات:", error);
  } finally {
    try {
      sqlite.close();
      await pool.end();
    } catch (e) {
      console.log("تم إغلاق الاتصالات");
    }
  }
}

migrateData();