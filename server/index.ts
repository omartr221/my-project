// ضبط التوقيت السوري كتوقيت افتراضي للنظام
process.env.TZ = process.env.TZ || 'Asia/Damascus';

import express from "express";
import { createServer } from "http";
// import { WebSocketServer } from "ws"; // مؤقتاً معطل لحل مشكلة WebSocket
import { setupVite, serveStatic } from "./vite";
import { setupAuth } from "./auth-sqlite";
import { storage } from "./storage-sqlite";
import { setupRoutes } from "./routes-sqlite.js";
// import { setupWebSocket } from "./websocket.js"; // مؤقتاً معطل لحل مشكلة WebSocket
import fs from "fs";
import path from "path";

const app = express();
const port = parseInt(process.env.PORT || "5000");
const host = process.env.HOST || "0.0.0.0";

async function startServer() {
  console.log("🚀 بدء تشغيل خادم V POWER TUNING...");
  
  // Create backups directory if it doesn't exist
  const backupsDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Setup authentication
  setupAuth(app);

  // Setup routes
  setupRoutes(app);

  // Create HTTP server
  const server = createServer(app);

  // Setup development middleware
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Setup WebSocket - مؤقتاً معطل لحل مشكلة WebSocket
  // const wss = new WebSocketServer({ server });
  // setupWebSocket(wss);

  // Backup functionality
  const createBackup = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupData = {
        timestamp,
        customers: await storage.getCustomers(),
        customerCars: await storage.getCustomerCars(),
        partsRequests: await storage.getPartsRequests(),
        workers: await storage.getWorkers(),
        tasks: await storage.getTasks(),
        // receptionEntries: await storage.getReceptionEntries() // مؤقتاً معطل
      };

      const backupPath = path.join(backupsDir, `backup-${timestamp}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      console.log(`✅ تم إنشاء نسخة احتياطية: ${backupPath}`);
      
      return backupPath;
    } catch (error) {
      console.error('❌ خطأ في إنشاء النسخة الاحتياطية:', error);
      throw error;
    }
  };

  // Auto backup every hour
  setInterval(createBackup, 60 * 60 * 1000);

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('❌ خطأ في الخادم:', err);
    res.status(500).json({ error: 'خطأ داخلي في الخادم' });
  });

  server.listen(port, host, () => {
    console.log(`✅ الخادم يعمل الآن!`);
    console.log(`   - البيئة: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - المنفذ: ${port}`);
    console.log(`   - العنوان: ${host}`);
    console.log(`   - الرابط المحلي: http://localhost:${port}`);
    console.log(`   - التوقيت: ${process.env.TZ || 'UTC'} (${new Date().toString()})`);
    console.log(`📖 النظام جاهز للاستخدام!`);
    console.log(`🗄️ يستخدم SQLite - بيانات محلية`);
    
    // Create initial backup
    console.log("🚀 إنشاء نسخة احتياطية أولية...");
    createBackup().catch(console.error);
  });
}

startServer().catch(console.error);