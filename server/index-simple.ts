import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite.js";
import { setupAuth } from "./auth-sqlite.js";
import { setupRoutes } from "./routes-sqlite.js";
import fs from "fs";
import path from "path";

const app = express();
const port = parseInt(process.env.PORT || "5000");
const host = process.env.HOST || "0.0.0.0";

async function startServer() {
  console.log("🔧 تهيئة السيرفر المحلي...");
  
  // Create backups directory
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

  // Setup Vite middleware
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Error handler
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
    console.log(`📖 جاهز للاستخدام!`);
  });
}

startServer().catch(console.error);