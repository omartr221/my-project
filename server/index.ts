import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

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

// Trust proxy for proper IP handling
app.set('trust proxy', true);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// إضافة headers للتعامل مع النص العربي والوصول من الأجهزة الأخرى
app.use((req, res, next) => {
  // Remove any restrictive headers that might cause forbidden errors
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-Content-Type-Options');
  
  // Enhanced CORS and accessibility headers for all environments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  // Set proper headers for API routes
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Accept-Charset', 'utf-8');
  }
  
  // Log all requests for debugging
  console.log(`${req.method} ${req.path} from ${req.ip || req.connection.remoteAddress}`);
  
  next();
});

// Health check endpoint for Autoscale deployment
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ready check endpoint
app.get('/ready', (_req, res) => {
  res.status(200).json({ 
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Let Vite handle the root route in development

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup appropriate serving mode based on environment
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    // In production, serve static files
    serveStatic(app);
  } else {
    // In development, use Vite
    await setupVite(app, server);
  }

  // Enhanced deployment port configuration for better accessibility
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  const host = '0.0.0.0'; // Always bind to all interfaces for better accessibility
  
  // Log deployment mode
  console.log(`🌐 Deployment mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Server binding to: ${host}:${port}`);
  
  // Enhanced server startup for Autoscale compatibility
  server.listen(port, host, () => {
    log(`🚀 V POWER TUNING Server جاهز!`);
    log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`   - Port: ${port}`);
    log(`   - Host: ${host}`);
    if (process.env.NODE_ENV !== "production") {
      log(`   - من هذا الجهاز: http://localhost:${port}`);
      log(`   - من هذا الجهاز أيضاً: http://127.0.0.1:${port}`);
      log(`   - من أجهزة أخرى: http://[عنوان-IP]:${port}`);
      log(`📱 لمعرفة عنوان IP: اكتب ipconfig في cmd`);
      log(`🔧 السيرفر يعمل على جميع عناوين الشبكة (0.0.0.0)`);
      log(`💡 إذا لم يعمل localhost جرب: 127.0.0.1:${port}`);
      log(`📖 راجع ملف 'تجربة-الاتصال.md' للمساعدة`);
      log(`🔥 جرب من جهاز آخر: http://[IP]:${port}`);
      log(`🚨 تأكد من إيقاف الفايروول أو السماح للبورت ${port}`);
    }
  }).on('error', (err: any) => {
    console.error(`❌ Server startup error:`, err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
    }
    // Enhanced error handling for production
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => process.exit(1), 1000);
    } else {
      process.exit(1);
    }
  });
})();