// 🔄 تحويل إلى إصدار SQLite
console.log("🔄 تحويل إلى إصدار SQLite...");
console.log("🗄️ يعمل الآن مع قاعدة بيانات محلية");

// تشغيل الإصدار الجديد
import { spawn } from "child_process";

const server = spawn("npx", ["tsx", "server/index-sqlite.ts"], {
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "development" }
});

server.on("error", (err) => {
  console.error("❌ خطأ في تشغيل SQLite:", err);
});

process.on("SIGINT", () => {
  console.log("\n⏹️ إيقاف النظام...");
  server.kill();
  process.exit(0);
});

export {};