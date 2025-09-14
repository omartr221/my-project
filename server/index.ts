// ضبط التوقيت السوري كتوقيت افتراضي للنظام
process.env.TZ = process.env.TZ || 'Asia/Damascus';

import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite.js";
import { setupAuth } from "./auth.js";
import { setupRoutes } from "./routes.js";

const app = express();
const port = parseInt(process.env.PORT || "5000");
const host = process.env.HOST || "0.0.0.0";

async function startServer() {
  console.log("🚀 بدء تشغيل خادم V POWER TUNING...");
  
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