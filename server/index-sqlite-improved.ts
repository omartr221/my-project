import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";
import { setupAuth } from "./auth-sqlite";
import { storage } from "./storage-sqlite";
import { setupRoutes } from "./routes-sqlite";
import { setupWebSocket } from "./websocket-improved";
import fs from "fs";
import path from "path";

console.log("🔧 تهيئة قاعدة البيانات SQLite...");

const app = express();
const port = parseInt(process.env.PORT || "5000");
const host = process.env.HOST || "0.0.0.0";

// Handle graceful shutdown
let server: any = null;
let wsServer: any = null;

const gracefulShutdown = (signal: string) => {
  console.log(`\n📡 تلقي إشارة ${signal}، إيقاف النظام بأمان...`);
  
  if (wsServer?.close) {
    wsServer.close();
  }
  
  if (server) {
    server.close(() => {
      console.log("✅ تم إيقاف النظام بنجاح");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

async function startServer() {
  try {
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Basic middleware
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // CORS headers
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Setup authentication
    setupAuth(app);

    // Setup routes
    setupRoutes(app);

    // Create HTTP server
    server = createServer(app);

    // Setup development middleware first
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Setup WebSocket after Vite to avoid conflicts
    wsServer = setupWebSocket(server);

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
    const backupInterval = setInterval(createBackup, 60 * 60 * 1000);

    // Cleanup on shutdown
    process.on('exit', () => {
      clearInterval(backupInterval);
    });

    // Error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('❌ Server Error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'خطأ داخلي في الخادم' });
      }
    });

    // Start listening
    await new Promise<void>((resolve, reject) => {
      server.listen(port, host, (err?: any) => {
        if (err) reject(err);
        else resolve();
      });
      
      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ المنفذ ${port} مستخدم بالفعل. جاري المحاولة على منفذ آخر...`);
          const newPort = port + 1;
          server.listen(newPort, host, () => {
            console.log(`🚀 V POWER TUNING Server جاهز على المنفذ الجديد!`);
            printServerInfo(newPort);
            resolve();
          });
        } else {
          reject(error);
        }
      });
    });

    console.log(`🚀 V POWER TUNING Server جاهز!`);
    printServerInfo(port);
    
    // Create initial backup
    console.log("🚀 إنشاء نسخة احتياطية أولية...");
    await createBackup();

  } catch (error) {
    console.error('❌ خطأ في تشغيل الخادم:', error);
    process.exit(1);
  }
}

function printServerInfo(actualPort: number) {
  console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - Port: ${actualPort}`);
  console.log(`   - Host: ${host}`);
  console.log(`   - من هذا الجهاز: http://localhost:${actualPort}`);
  console.log(`   - من هذا الجهاز أيضاً: http://127.0.0.1:${actualPort}`);
  console.log(`   - من أجهزة أخرى: http://[عنوان-IP]:${actualPort}`);
  console.log(`📱 لمعرفة عنوان IP: اكتب ipconfig في cmd`);
  console.log(`🔧 السيرفر يعمل على جميع عناوين الشبكة (${host})`);
  console.log(`💡 إذا لم يعمل localhost جرب: 127.0.0.1:${actualPort}`);
  console.log(`📖 راجع ملف 'تجربة-الاتصال.md' للمساعدة`);
  console.log(`🔗 WebSocket متاح: ws://localhost:${actualPort}`);
}

startServer().catch(console.error);