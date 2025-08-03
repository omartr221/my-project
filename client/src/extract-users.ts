console.log("DB URL:", process.env.DATABASE_URL);
import { db } from "../../server/db";  // عدّل المسار حسب مكان الملفين
import { users } from "@shared/schema";  // استيراد جدول المستخدمين

// دالة لاستخراج المستخدمين
export async function extractUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log(allUsers);
    return allUsers;
  } catch (error) {
    console.error("Failed to extract users:", error);
    throw error;
  }
}

// يمكنك اختبار الدالة هنا أو تستدعيها من مكان آخر
extractUsers();

