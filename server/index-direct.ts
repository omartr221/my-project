// Direct SQLite server without Vite
import express from "express";
import { createServer } from "http";
import { setupAuth } from "./auth-sqlite.js";
import { setupRoutes } from "./routes-sqlite.js";
import { setupWebSocket } from "./websocket.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    console.log("🔄 تشغيل نظام V-POWER TUNING مع SQLite...");
    console.log("🗄️ يعمل الآن مع قاعدة بيانات محلية");
    
    const app = express();
    const port = parseInt(process.env.PORT || "5000");
    const host = process.env.HOST || "0.0.0.0";

    console.log("🔧 تهيئة قاعدة البيانات SQLite...");
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Setup authentication
    console.log("🔧 تهيئة نظام المصادقة...");
    await setupAuth(app);

    // Setup routes
    console.log("🛣️ تهيئة مسارات API...");
    setupRoutes(app);
    
    // Serve main HTML interface
    app.get("/", (req, res) => {
      console.log("📄 طلب الصفحة الرئيسية");
      res.sendFile(path.join(__dirname, "../index.html"));
    });
    
    app.get("/test", (req, res) => {
      console.log("📄 طلب صفحة الاختبار");
      res.sendFile(path.join(__dirname, "../test-simple.html"));
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
      console.log(`   - الواجهة الرئيسية: http://localhost:${port}`);
      console.log(`   - صفحة الاختبار: http://localhost:${port}/test`);
      console.log(`📖 جاهز للاستخدام!`);
    });
  } catch (error) {
    console.error("❌ خطأ في تشغيل النظام:", error);
    process.exit(1);
  }
}

startServer();