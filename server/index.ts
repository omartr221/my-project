import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "./backup"; // تفعيل النسخ الاحتياطي التلقائي

// 🌐 تحديث قاعدة البيانات لتستخدم Render PostgreSQL
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log("🔄 تشغيل V POWER TUNING مع قاعدة بيانات Render...");
console.log("🌐 متصل بقاعدة البيانات السحابية");

// Graceful shutdown handling
process.on('SIGTERM', () => {
  log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production for better stability
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Give time for logging in production
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => process.exit(1), 1000);
  } else {
    process.exit(1);
  }
});

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// إضافة headers للتعامل مع النص العربي
app.use((req, res, next) => {
  // Only set JSON headers for API routes
  if (req.path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  res.setHeader('Accept-Charset', 'utf-8');
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Rate limiting for API routes
const rateLimitMap = new Map();
app.use('/api/', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // Max requests per window

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const limit = rateLimitMap.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + windowMs;
    return next();
  }

  if (limit.count >= maxRequests) {
    return res.status(429).json({ error: 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً.' });
  }

  limit.count++;
  next();
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Application Error:', err);
  
  if (res.headersSent) {
    return next(err);
  }
  
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: 'خطأ داخلي في الخادم',
    ...(isDev && { details: err.message, stack: err.stack })
  });
});

(async () => {
  try {
    log("🚀 بدء تشغيل السيرفر...");
    
    // Render requires process.env.PORT, fallback to 5000 for local development
    const port = parseInt(process.env.PORT || "5000");
    const host = process.env.NODE_ENV === 'production' ? "0.0.0.0" : (process.env.HOST || "0.0.0.0");

    // إنشاء خادم HTTP أولاً - Render compatible
    const server = app.listen(port, host, () => {
      log(`🚀 V POWER TUNING Server جاهز!`);
      log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`   - Port: ${port} ${process.env.PORT ? '(Render assigned)' : '(default)'}`);
      log(`   - Host: ${host}`);
      
      if (process.env.NODE_ENV !== 'production') {
        log(`   - من هذا الجهاز: http://localhost:${port}`);
        log(`   - من هذا الجهاز أيضاً: http://127.0.0.1:${port}`);
        log(`   - من أجهزة أخرى: http://[عنوان-IP]:${port}`);
        log(`📱 لمعرفة عنوان IP: اكتب ipconfig في cmd`);
        log(`💡 إذا لم يعمل localhost جرب: 127.0.0.1:${port}`);
      } else {
        log(`🌐 Production server ready on Render`);
      }
      
      log(`🔧 السيرفر يعمل على جميع عناوين الشبكة (${host})`);
      log(`🌐 قاعدة البيانات: Render PostgreSQL`);
      log(`🔑 مستخدم الاستقبال: كلمة المرور 11`);
      log(`📖 راجع ملف 'تجربة-الاتصال.md' للمساعدة`);
    });

    // إعداد routes أولاً قبل Vite
    await registerRoutes(app);
    
    // إعداد Vite مع الخادم الموجود
    await setupVite(app, server);

  } catch (error) {
    console.error('❌ خطأ في بدء تشغيل السيرفر:', error);
    process.exit(1);
  }
})();