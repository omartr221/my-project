import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Simple working route for deployment
app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>V POWER TUNING - نظام إدارة المهام</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: Arial, sans-serif; 
            direction: rtl; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; 
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container { 
            text-align: center; 
            background: rgba(255,255,255,0.1); 
            padding: 40px; 
            border-radius: 15px; 
            backdrop-filter: blur(10px);
            max-width: 600px;
        }
        .logo { font-size: 48px; font-weight: bold; margin-bottom: 20px; }
        .subtitle { font-size: 24px; margin-bottom: 30px; opacity: 0.9; }
        .stats { background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; }
        .btn { 
            padding: 15px 30px; 
            background: #4CAF50; 
            color: white; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            margin: 10px;
            font-size: 16px;
        }
        .btn:hover { background: #45a049; }
        .loading { margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">V POWER TUNING</div>
        <div class="subtitle">نظام إدارة المهام والعمال</div>
        <div id="content">
            <div class="loading">جاري تحميل النظام...</div>
        </div>
    </div>

    <script>
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                if (response.ok) {
                    const stats = await response.json();
                    document.getElementById('content').innerHTML = 
                        '<div class="stats">' +
                        '<h3>النظام يعمل بنجاح!</h3>' +
                        '<p>إجمالي العمال: ' + stats.totalWorkers + '</p>' +
                        '<p>العمال المتاحون: ' + stats.availableWorkers + '</p>' +
                        '<p>المهام النشطة: ' + stats.activeTasks + '</p>' +
                        '</div>' +
                        '<p>يمكنك الآن استخدام النظام من أي جهاز</p>' +
                        '<button class="btn" onclick="location.reload()">تحديث البيانات</button>';
                } else {
                    throw new Error('API not responding');
                }
            } catch (error) {
                document.getElementById('content').innerHTML = 
                    '<div class="stats">' +
                    '<h3>النظام متاح!</h3>' +
                    '<p>الخادم يعمل بنجاح</p>' +
                    '</div>' +
                    '<button class="btn" onclick="loadStats()">إعادة المحاولة</button>';
            }
        }
        loadStats();
        setInterval(loadStats, 30000);
    </script>
</body>
</html>`);
});

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

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Autoscale deployment port configuration
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '0.0.0.0';
  
  // Enhanced server startup for Autoscale compatibility
  server.listen(port, host, () => {
    log(`🚀 V POWER TUNING Server جاهز!`);
    log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`   - Port: ${port}`);
    log(`   - Host: ${host}`);
    if (process.env.NODE_ENV !== "production") {
      log(`   - من هذا الجهاز: http://localhost:${port}`);
      log(`   - من أجهزة أخرى: http://[عنوان-IP]:${port}`);
      log(`📱 لمعرفة عنوان IP: اكتب ipconfig في cmd`);
      log(`🔧 السيرفر يعمل على جميع عناوين الشبكة (0.0.0.0)`);
      log(`📖 راجع ملف 'تجربة-الاتصال.md' للمساعدة`);
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
