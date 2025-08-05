// تشغيل مباشر لنظام SQLite
console.log("🔄 تشغيل نظام V-POWER TUNING مع SQLite...");

import("./index-direct.js").then(() => {
  console.log("✅ تم تحميل النظام بنجاح");
}).catch((error) => {
  console.error("❌ خطأ في تحميل النظام:", error);
  process.exit(1);
});