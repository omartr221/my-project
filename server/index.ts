// تحويل مؤقت إلى إصدار SQLite المبسط
console.log("🔄 تحويل إلى إصدار SQLite...");
console.log("🗄️ يعمل الآن مع قاعدة بيانات محلية");

// تحميل الإصدار المبسط
import("./index-simple.js").catch(() => {
  // If ES module import fails, use require
  require("./index-simple.ts");
});

// توقيف باقي الملف
export {};