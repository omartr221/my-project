// استخدام إصدار SQLite مع Vite
console.log("🔄 تحويل إلى إصدار SQLite...");
console.log("🗄️ يعمل الآن مع قاعدة بيانات محلية");

import("./index-sqlite.ts").then(() => {
  console.log("✅ تم تحميل إصدار SQLite بنجاح");
}).catch((error) => {
  console.error("❌ خطأ في تحميل إصدار SQLite:", error);
  process.exit(1);
});