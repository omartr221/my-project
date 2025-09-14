// ضبط التوقيت السوري كتوقيت افتراضي للنظام
process.env.TZ = process.env.TZ || 'Asia/Damascus';

import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite.js";

// Check if we should use SQLite instead of PostgreSQL (مؤقت لحل مشكلة قاعدة البيانات)
const USE_SQLITE = true; // تفعيل SQLite مؤقتاً

// Conditional imports based on database type
let setupAuth: any;
let setupRoutes: any;
let initDatabase: any;

async function loadModules() {
  if (USE_SQLITE) {
    console.log('🔄 بدء تشغيل النظام باستخدام SQLite (وضع مؤقت)...');
    const [sqliteAuth, sqliteRoutes, sqliteDb] = await Promise.all([
      import('./auth-sqlite.js'),
      import('./routes-sqlite.js'),
      import('./db-sqlite.js')
    ]);
    setupAuth = sqliteAuth.setupAuth;
    setupRoutes = sqliteRoutes.setupRoutes;
    initDatabase = sqliteDb.initDatabase;
  } else {
    console.log('🔄 بدء تشغيل النظام باستخدام PostgreSQL...');
    const [pgAuth, pgRoutes] = await Promise.all([
      import('./auth.js'),
      import('./routes.js')
    ]);
    setupAuth = pgAuth.setupAuth;
    setupRoutes = pgRoutes.setupRoutes;
  }
}

const app = express();
const port = parseInt(process.env.PORT || "5000");
const host = process.env.HOST || "0.0.0.0";

async function startServer() {
  console.log("🚀 بدء تشغيل خادم V POWER TUNING...");
  
  // Load the appropriate modules first
  await loadModules();
  
  // Initialize SQLite database if needed
  if (USE_SQLITE && initDatabase) {
    await initDatabase();
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
  });
}

startServer().catch(console.error);