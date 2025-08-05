import express from "express";
import { createServer } from "http";
import { setupAuth } from "./server/auth-sqlite.js";
import { setupRoutes } from "./server/routes-sqlite.js";
import { setupWebSocket } from "./server/websocket.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || "5000");
const host = process.env.HOST || "0.0.0.0";

console.log("🔄 تشغيل نظام V-POWER TUNING SQLite...");
console.log("🗄️ يعمل الآن مع قاعدة بيانات محلية");

// Create backups directory if it doesn't exist
const backupsDir = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup authentication
console.log("🔧 تهيئة نظام المصادقة...");
setupAuth(app);

// Setup routes
console.log("🛣️ تهيئة المسارات...");
setupRoutes(app);

// Add test routes for troubleshooting
app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "test-simple.html"));
});

app.get("/", (req, res) => {
  res.redirect("/test");
});

// Create HTTP server
const server = createServer(app);

// Setup WebSocket
console.log("🔌 تهيئة WebSocket...");
setupWebSocket(server);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'خطأ داخلي في الخادم' });
});

server.listen(port, host, () => {
  console.log(`🚀 V POWER TUNING Server جاهز!`);
  console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - Port: ${port}`);
  console.log(`   - Host: ${host}`);
  console.log(`   - من هذا الجهاز: http://localhost:${port}`);
  console.log(`   - من هذا الجهاز أيضاً: http://127.0.0.1:${port}`);
  console.log(`   - لاختبار النظام: http://localhost:${port}/test`);
  console.log(`📖 جاهز للاستخدام!`);
});