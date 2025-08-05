// تحويل إلى إصدار SQLite المحسن
console.log("🔄 تحويل إلى إصدار SQLite المحسن...");
console.log("🗄️ يعمل الآن مع قاعدة بيانات محلية محسنة");

// تحميل الإصدار المحسن
import("./index-sqlite-improved.js").catch(() => {
  // If ES module import fails, use require
  require("./index-sqlite-improved.ts");
});

export {};