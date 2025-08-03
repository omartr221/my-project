const { Pool } = require("pg");
const { scrypt } = require("crypto");
const { promisify } = require("util");

const scryptAsync = promisify(scrypt);

// اتصال بقاعدة بيانات Render PostgreSQL
const renderConnectionString = "postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: renderConnectionString,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function hashPassword(password) {
  const salt = require("crypto").randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function updateReceptionPassword() {
  try {
    console.log("🔄 تحديث كلمة مرور مستخدم الاستقبال...");
    
    // تشفير كلمة المرور الجديدة
    const newPassword = await hashPassword("11");
    
    // تحديث كلمة المرور في قاعدة البيانات
    const result = await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE username = $2',
      [newPassword, 'الاستقبال']
    );
    
    if (result.rowCount > 0) {
      console.log("✅ تم تحديث كلمة مرور مستخدم الاستقبال بنجاح");
      console.log("🔑 كلمة المرور الجديدة: 11");
    } else {
      console.log("⚠️ لم يتم العثور على مستخدم الاستقبال");
    }
    
  } catch (error) {
    console.error("❌ خطأ في تحديث كلمة المرور:", error);
  } finally {
    await pool.end();
  }
}

updateReceptionPassword();