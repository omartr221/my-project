const { Pool } = require("pg");
const { scrypt } = require("crypto");
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

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return hashedBuf.equals(suppliedBuf);
}

async function testLogin() {
  try {
    console.log("🧪 اختبار تسجيل الدخول مباشرة...");
    
    // جلب بيانات مستخدم الاستقبال
    const result = await pool.query(
      'SELECT username, password, role FROM users WHERE username = $1',
      ['الاستقبال']
    );
    
    if (result.rows.length === 0) {
      console.log("❌ مستخدم الاستقبال غير موجود!");
      return;
    }
    
    const user = result.rows[0];
    console.log(`✅ تم العثور على المستخدم: ${user.username}`);
    console.log(`   الدور: ${user.role}`);
    console.log(`   طول كلمة المرور المشفرة: ${user.password.length}`);
    
    // اختبار كلمة المرور
    const passwordMatch = await comparePasswords("11", user.password);
    
    if (passwordMatch) {
      console.log("✅ كلمة المرور صحيحة - تسجيل الدخول يجب أن يعمل!");
    } else {
      console.log("❌ كلمة المرور خاطئة - سأقوم بإعادة تعيينها");
      
      // إعادة تعيين كلمة المرور
      const { scrypt, randomBytes } = require("crypto");
      const salt = randomBytes(16).toString("hex");
      const buf = await scryptAsync("11", salt, 64);
      const newPassword = `${buf.toString("hex")}.${salt}`;
      
      await pool.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE username = $2',
        [newPassword, 'الاستقبال']
      );
      
      console.log("✅ تم إعادة تعيين كلمة المرور بنجاح");
    }
    
    // عرض جميع المستخدمين
    console.log("\n📋 جميع المستخدمين:");
    const allUsers = await pool.query('SELECT username, role FROM users ORDER BY id');
    allUsers.rows.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });
    
  } catch (error) {
    console.error("❌ خطأ في الاختبار:", error.message);
  } finally {
    await pool.end();
  }
}

testLogin();