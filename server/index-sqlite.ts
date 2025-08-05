import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupVite, serveStatic } from "./vite";
import { setupAuth } from "./auth-sqlite";
import { storage } from "./storage-sqlite";
import { setupRoutes } from "./routes-sqlite";
import { setupWebSocket } from "./websocket";
import fs from "fs";
import path from "path";

const app = express();
const port = parseInt(process.env.PORT || "80");
const host = process.env.HOST || "0.0.0.0";

async function startServer() {
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
  
  // Add React interface route
  app.get("/react", (req, res) => {
    res.sendFile(path.join(process.cwd(), "client/simple-react.html"));
  });
  
  // Add test route for troubleshooting
  app.get("/test", (req, res) => {
    res.sendFile(path.join(process.cwd(), "test-simple.html"));
  });

  // Create HTTP server
  const server = createServer(app);

  // Serve the main HTML interface as default route
  app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "server/public/index.html"));
  });

  // Setup WebSocket
  const wss = new WebSocketServer({ server });
  setupWebSocket(wss);

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
      carReceipts: await storage.getCarReceipts()
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
    console.log(`   - من أجهزة أخرى: http://[عنوان-IP]:${port}`);
    console.log(`📱 لمعرفة عنوان IP: اكتب ipconfig في cmd`);
    console.log(`🔧 السيرفر يعمل على جميع عناوين الشبكة (${host})`);
    console.log(`💡 إذا لم يعمل localhost جرب: 127.0.0.1:${port}`);
    console.log(`📖 راجع ملف 'تجربة-الاتصال.md' للمساعدة`);
    
    // Create initial backup
    console.log("🚀 إنشاء نسخة احتياطية أولية...");
    createBackup().catch(console.error);
  });
}

startServer().catch(console.error);