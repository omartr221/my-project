import express, { type Request, Response, NextFunction } from "express";
import path from "path";
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

// Force HTML rendering for all requests
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/assets/')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
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

  // serve static files from public directory BEFORE vite
  app.use('/static', express.static(path.join(import.meta.dirname, 'public')));
  
  // working fallback route
  app.get('/system', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>V POWER TUNING - نظام إدارة المهام</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; direction: rtl; }
        .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); max-width: 500px; width: 100%; text-align: center; }
        .logo { font-size: 48px; font-weight: bold; color: #667eea; margin-bottom: 30px; }
        .btn { display: inline-block; margin: 10px; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 18px; }
        .btn:hover { opacity: 0.9; }
        .info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right; }
        .status { color: #28a745; font-weight: bold; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">V POWER TUNING</div>
        <h2>نظام إدارة المهام</h2>
        <div class="status">السيرفر يعمل بشكل صحيح</div>
        <a href="/work" class="btn">تسجيل الدخول</a>
        <a href="/dashboard" class="btn">لوحة التحكم</a>
        <div class="info">
            <strong>بيانات تسجيل الدخول:</strong><br>
            ملك (12345) - إدارة مالية<br>
            بدوي (0000) - مشغل النظام<br>
            هبة (123456) - مشاهد فقط<br>
            روان (1234567) - مشرف
        </div>
    </div>
</body>
</html>`);
  });
  
  // working login page that bypasses all issues
  app.get('/work', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>V POWER TUNING - تسجيل الدخول</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; direction: rtl; }
        .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); max-width: 400px; width: 100%; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; text-align: right; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
        input { width: 100%; padding: 15px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
        .btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 10px; }
        .btn:hover { opacity: 0.9; }
        .error { color: #e74c3c; margin-top: 15px; display: none; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: right; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">V POWER TUNING</div>
        <h2>نظام إدارة المهام</h2>
        <form id="loginForm">
            <div class="form-group">
                <label>اسم المستخدم:</label>
                <input type="text" id="username" required>
            </div>
            <div class="form-group">
                <label>كلمة المرور:</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit" class="btn">تسجيل الدخول</button>
            <div class="error" id="error">خطأ في البيانات</div>
        </form>
        <div class="info">
            <strong>بيانات التسجيل:</strong><br>
            ملك (12345) - بدوي (0000)<br>
            هبة (123456) - روان (1234567)
        </div>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });
                if (response.ok) {
                    window.location.href = '/';
                } else {
                    document.getElementById('error').style.display = 'block';
                }
            } catch (error) {
                document.getElementById('error').style.display = 'block';
            }
        });
    </script>
</body>
</html>`);
  });
  
  // working dashboard page
  app.get('/dashboard', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>V POWER TUNING - لوحة التحكم</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; direction: rtl; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 20px; }
        .card { background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .btn { padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
        .btn:hover { opacity: 0.9; }
        .stats { display: flex; justify-content: space-around; text-align: center; }
        .stat { background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
        .logout { float: left; }
        .welcome { text-align: right; font-size: 16px; margin-bottom: 20px; }
        .loading { text-align: center; padding: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">V POWER TUNING</div>
        <div>نظام إدارة المهام</div>
        <button class="btn logout" onclick="logout()">تسجيل خروج</button>
    </div>
    <div class="content">
        <div class="welcome" id="welcome">مرحباً بك في النظام</div>
        <div class="card">
            <h3>الإحصائيات</h3>
            <div class="stats">
                <div class="stat">
                    <div class="stat-number" id="activeTasks">0</div>
                    <div>المهام النشطة</div>
                </div>
                <div class="stat">
                    <div class="stat-number" id="completedTasks">0</div>
                    <div>المهام المكتملة</div>
                </div>
                <div class="stat">
                    <div class="stat-number" id="activeWorkers">0</div>
                    <div>العمال النشطون</div>
                </div>
            </div>
        </div>
        <div class="card">
            <h3>الأدوات</h3>
            <a href="/auth" class="btn">النظام الكامل</a>
            <a href="/work" class="btn">تسجيل دخول جديد</a>
            <button class="btn" onclick="checkAPI()">فحص API</button>
        </div>
        <div class="card">
            <h3>معلومات النظام</h3>
            <p>السيرفر يعمل بشكل صحيح</p>
            <p>النظام متاح للاستخدام</p>
            <div id="apiStatus"></div>
        </div>
    </div>
    <script>
        let currentUser = null;
        
        async function loadUserData() {
            try {
                const response = await fetch('/api/user', { credentials: 'include' });
                if (response.ok) {
                    currentUser = await response.json();
                    document.getElementById('welcome').textContent = 'مرحباً ' + currentUser.username;
                    loadStats();
                } else {
                    window.location.href = '/work';
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                window.location.href = '/work';
            }
        }
        
        async function loadStats() {
            try {
                const [tasksResponse, workersResponse] = await Promise.all([
                    fetch('/api/tasks', { credentials: 'include' }),
                    fetch('/api/workers', { credentials: 'include' })
                ]);
                
                if (tasksResponse.ok) {
                    const tasks = await tasksResponse.json();
                    const activeTasks = tasks.filter(t => !t.completedAt).length;
                    const completedTasks = tasks.filter(t => t.completedAt).length;
                    document.getElementById('activeTasks').textContent = activeTasks;
                    document.getElementById('completedTasks').textContent = completedTasks;
                }
                
                if (workersResponse.ok) {
                    const workers = await workersResponse.json();
                    document.getElementById('activeWorkers').textContent = workers.length;
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }
        
        async function logout() {
            try {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                window.location.href = '/work';
            } catch (error) {
                console.error('Error logging out:', error);
            }
        }
        
        async function checkAPI() {
            try {
                const response = await fetch('/api/user', { credentials: 'include' });
                const status = document.getElementById('apiStatus');
                if (response.ok) {
                    status.innerHTML = '<div style="color: green;">API يعمل بشكل صحيح</div>';
                } else {
                    status.innerHTML = '<div style="color: red;">مشكلة في API</div>';
                }
            } catch (error) {
                const status = document.getElementById('apiStatus');
                status.innerHTML = '<div style="color: red;">خطأ في الاتصال: ' + error.message + '</div>';
            }
        }
        
        // Load data when page loads
        loadUserData();
    </script>
</body>
</html>`);
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
  const host = '0.0.0.0';
  
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