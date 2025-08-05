#!/usr/bin/env node

// تشغيل نظام V-POWER TUNING مع SQLite بدون Vite
console.log("🚀 بدء تشغيل نظام V-POWER TUNING SQLite...");
console.log("📁 المجلد الحالي:", process.cwd());

import("./start-simple-sqlite.js")
  .then(() => {
    console.log("✅ تم تحميل النظام بنجاح");
  })
  .catch((error) => {
    console.error("❌ خطأ في تشغيل النظام:", error);
    process.exit(1);
  });