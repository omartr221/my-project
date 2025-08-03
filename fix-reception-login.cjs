const { Pool } = require("pg");
const { scrypt, randomBytes } = require("crypto");
const { promisify } = require("util");

const scryptAsync = promisify(scrypt);

// اتصال بقاعدة بيانات Render PostgreSQL
const connectionString = "postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function fixReceptionLogin() {
  try {
    console.log("🔧 إصلاح تسجيل دخول مستخدم الاستقبال...");
    
    // تشفير كلمة المرور "11"
    const hashedPassword = await hashPassword("11");
    console.log("🔑 تم تشفير كلمة المرور الجديدة");
    
    // تحديث كلمة المرور في قاعدة البيانات
    const updateResult = await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE username = $2',
      [hashedPassword, 'الاستقبال']
    );
    
    if (updateResult.rowCount > 0) {
      console.log("✅ تم تحديث كلمة مرور مستخدم الاستقبال");
      console.log("📝 اسم المستخدم: الاستقبال");
      console.log("🔑 كلمة المرور: 11");
    } else {
      console.log("❌ لم يتم العثور على مستخدم الاستقبال");
    }
    
    // التحقق من جميع المستخدمين
    console.log("\n📋 قائمة المستخدمين:");
    const usersResult = await pool.query('SELECT username, role FROM users ORDER BY id');
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });
    
    // اختبار المصادقة
    console.log("\n🧪 اختبار المصادقة...");
    const testResult = await pool.query(
      'SELECT username, role FROM users WHERE username = $1',
      ['الاستقبال']
    );
    
    if (testResult.rows.length > 0) {
      console.log("✅ مستخدم الاستقبال موجود في قاعدة البيانات");
      console.log(`   الدور: ${testResult.rows[0].role}`);
    } else {
      console.log("❌ مستخدم الاستقبال غير موجود!");
    }
    
  } catch (error) {
    console.error("❌ خطأ في إصلاح تسجيل الدخول:", error);
  } finally {
    await pool.end();
  }
}

fixReceptionLogin();