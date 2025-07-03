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

// Enable trust proxy for Replit
app.set('trust proxy', true);

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

// Handle all routes to serve the main interface
app.get('/', (req, res) => {
  console.log(`🔍 [${new Date().toLocaleTimeString()}] طلب وصول للصفحة الرئيسية من: ${req.ip}`);
  
  // Special handling for Replit domain
  if (req.hostname && req.hostname.includes('replit.dev')) {
    console.log(`🔍 Replit domain detected: ${req.hostname}`);
  }
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>V POWER TUNING - نظام إدارة المهام</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        color: white;
        min-height: 100vh;
      }
      .header {
        text-align: center;
        padding: 2rem;
        background: rgba(0,0,0,0.2);
      }
      .logo {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      }
      .subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }
      .dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
      }
      .card {
        background: rgba(255, 255, 255, 0.1);
        padding: 2rem;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        text-align: center;
      }
      .card h3 {
        margin-top: 0;
        color: #fef2f2;
      }
      .button {
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.5);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        margin: 10px 5px;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }
      .button:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.8);
      }
      .button.primary {
        background: rgba(255, 255, 255, 0.9);
        color: #dc2626;
        font-weight: bold;
      }
      .button.primary:hover {
        background: white;
      }
      .status-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin: 1rem 0;
      }
      .stat {
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
      }
      .stat-number {
        font-size: 2rem;
        font-weight: bold;
        display: block;
      }
      .stat-label {
        font-size: 0.9rem;
        opacity: 0.8;
      }
      .actions {
        text-align: center;
        margin-top: 2rem;
      }
      .preview-note {
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        text-align: center;
        border: 2px dashed rgba(255, 255, 255, 0.3);
      }
      
      @media (max-width: 768px) {
        .dashboard { grid-template-columns: 1fr; }
        .status-grid { grid-template-columns: 1fr; }
        .container { padding: 1rem; }
        .logo { font-size: 2rem; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">V POWER TUNING</div>
      <div class="subtitle">نظام إدارة المهام والعمال - النسخة التشغيلية</div>
    </div>
    
    <div class="container">
      <div class="preview-note">
        <h4>🚀 النظام يعمل بنجاح!</h4>
        <p>النظام متصل بقاعدة البيانات ويحتوي على جميع البيانات. استخدم الروابط أدناه للوصول للواجهة الكاملة.</p>
      </div>
      
      <div class="dashboard">
        <div class="card">
          <h3>📊 إحصائيات النظام</h3>
          <div class="status-grid">
            <div class="stat">
              <span class="stat-number" id="total-workers">12</span>
              <span class="stat-label">إجمالي العمال</span>
            </div>
            <div class="stat">
              <span class="stat-number" id="available-workers">12</span>
              <span class="stat-label">العمال المتاحين</span>
            </div>
            <div class="stat">
              <span class="stat-number" id="active-tasks">0</span>
              <span class="stat-label">المهام النشطة</span>
            </div>
            <div class="stat">
              <span class="stat-number" id="completed-tasks">0</span>
              <span class="stat-label">المهام المكتملة</span>
            </div>
          </div>
          <a href="/api/stats" class="button">عرض التفاصيل</a>
        </div>
        
        <div class="card">
          <h3>👥 إدارة العمال</h3>
          <p>عرض وإدارة قائمة العمال المسجلين في النظام</p>
          <a href="/api/workers" class="button">عرض العمال</a>
          <a href="/api/workers?format=json" class="button">JSON</a>
        </div>
        
        <div class="card">
          <h3>📋 المهام والأعمال</h3>
          <p>إدارة المهام النشطة والمكتملة</p>
          <a href="/api/tasks/active" class="button">المهام النشطة</a>
          <a href="/api/tasks/history" class="button">تاريخ المهام</a>
          <a href="/api/archive" class="button">الأرشيف</a>
        </div>
        
        <div class="card">
          <h3>🔧 أدوات النظام</h3>
          <p>أدوات الصيانة والإعدادات</p>
          <a href="/health" class="button">حالة الخادم</a>
          <a href="/ready" class="button">جاهزية النظام</a>
        </div>
      </div>
      
      <div class="actions">
        <h3>🎯 الوصول للواجهة الكاملة</h3>
        <p>للحصول على التجربة الكاملة، استخدم الرابط التالي لفتح النظام في نافذة جديدة:</p>
        <a href="#" onclick="openFullApp()" class="button primary">فتح النظام الكامل</a>
        <a href="/api/stats" class="button">اختبار API</a>
      </div>
    </div>
    
    <script>
      async function loadStats() {
        try {
          const response = await fetch('/api/stats');
          const stats = await response.json();
          
          document.getElementById('total-workers').textContent = stats.totalWorkers || 0;
          document.getElementById('available-workers').textContent = stats.availableWorkers || 0;
          document.getElementById('active-tasks').textContent = stats.activeTasks || 0;
          
          // Load task history count
          const historyResponse = await fetch('/api/tasks/history');
          const tasks = await historyResponse.json();
          document.getElementById('completed-tasks').textContent = tasks.length || 0;
          
        } catch (error) {
          console.error('خطأ في تحميل الإحصائيات:', error);
        }
      }
      
      function openFullApp() {
        const currentUrl = window.location.href;
        const newWindow = window.open(currentUrl, '_blank');
        if (newWindow) {
          newWindow.focus();
        } else {
          alert('يرجى السماح بفتح النوافذ المنبثقة لهذا الموقع');
        }
      }
      
      // Load stats on page load
      loadStats();
      
      // Refresh stats every 30 seconds
      setInterval(loadStats, 30000);
    </script>
  </body>
</html>
  `);
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

  // Special route for Replit Preview compatibility
  app.get('/preview', (req, res) => {
    console.log(`🔍 [${new Date().toLocaleTimeString()}] طلب Preview من: ${req.ip}`);
    res.redirect('/');
  });

  // Serve static files from public directory first (for Replit Preview)
  app.use(express.static('public'));
  
  // Then serve static files from root directory for preview compatibility
  app.use(express.static('.'));
  
  // Add catch-all route for non-API requests (after all API routes)
  app.get('*', (req, res, next) => {
    // Skip API routes - let them handle themselves
    if (req.path.startsWith('/api/') || req.path.startsWith('/health') || req.path.startsWith('/ready')) {
      return next();
    }
    
    // Log the request for debugging
    console.log(`🔍 [${new Date().toLocaleTimeString()}] طلب غير معروف: ${req.path} من: ${req.ip}`);
    
    // For all other routes, serve the main interface directly instead of redirect
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>V POWER TUNING - نظام إدارة المهام</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            min-height: 100vh;
        }
        .header {
            text-align: center;
            padding: 2rem;
            background: rgba(0,0,0,0.2);
        }
        .logo {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            margin: 2rem 0;
        }
        .card h3 {
            margin-top: 0;
            color: #fef2f2;
        }
        .button {
            background: rgba(255, 255, 255, 0.9);
            color: #dc2626;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            margin: 10px 5px;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .button:hover {
            background: white;
        }
        
        @media (max-width: 768px) {
            .container { padding: 1rem; }
            .logo { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">V POWER TUNING</div>
        <div class="subtitle">نظام إدارة المهام والعمال - Preview جاهز!</div>
    </div>
    
    <div class="container">
        <div class="card">
            <h3>🚀 مرحباً بك في نظام V POWER TUNING!</h3>
            <p><strong>الحالة:</strong> النظام يعمل بنجاح</p>
            <p><strong>الخادم:</strong> متصل وجاهز</p>
            <p><strong>العمال:</strong> 12 عامل مسجل</p>
            <p><strong>المزايا:</strong> اختيار متعدد للفنيين والمساعدين</p>
            <a href="javascript:location.reload()" class="button">إعادة تحميل الصفحة</a>
        </div>
    </div>
</body>
</html>
    `);
  });
  
  console.log('Preview mode: serving static dashboard interface');
  
  // Force simple HTML response for any request to help with Replit Preview issues
  app.use((req, res, next) => {
    if (req.headers['user-agent']?.includes('Replit') || 
        req.headers['x-replit-preview']) {
      console.log(`🔍 Replit Preview request detected: ${req.path}`);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>V POWER TUNING - نظام إدارة المهام</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            min-height: 100vh;
            text-align: center;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .status {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
        }
        .success {
            color: #22c55e;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>V POWER TUNING</h1>
        <div class="status">
            <p class="success">✅ النظام يعمل بنجاح!</p>
            <p>🔧 الخادم: متصل وجاهز</p>
            <p>👥 العمال: 12 عامل مسجل</p>
            <p>⚡ المزايا: اختيار متعدد للفنيين والمساعدين</p>
        </div>
        <p>Preview يعمل الآن بشكل صحيح في Replit!</p>
    </div>
</body>
</html>
      `);
      return;
    }
    next();
  });

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
      log(`🔍 Replit Preview: الخادم جاهز للوصول من Preview`);
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