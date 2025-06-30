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

// Serve the original React application
app.get('/', (_req, res) => {
  // In development, let Vite handle the routing
  if (process.env.NODE_ENV !== 'production') {
    res.redirect('/dashboard');
    return;
  }
  
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
            background: #f5f5f5;
            min-height: 100vh;
        }
        .header {
            background: linear-gradient(45deg, #dc2626, #991b1b);
            color: white;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { font-size: 16px; opacity: 0.9; }
        .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
        
        .tabs {
            display: flex;
            background: white;
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .tab {
            flex: 1;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            border: none;
            background: transparent;
            font-size: 14px;
            transition: all 0.3s;
        }
        .tab.active { background: #dc2626; color: white; }
        .tab:hover { background: #f8f9fa; }
        .tab.active:hover { background: #dc2626; }
        
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-title { color: #666; margin-bottom: 10px; font-size: 14px; }
        .stat-value { font-size: 28px; font-weight: bold; color: #dc2626; }
        
        .form-section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .btn {
            padding: 12px 24px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        .btn:hover { background: #b91c1c; }
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">V POWER TUNING</div>
        <div class="subtitle">نظام إدارة المهام والعمال</div>
    </div>

    <div class="container">
        <div class="tabs">
            <button class="tab active" onclick="showTab('dashboard')">لوحة التحكم</button>
            <button class="tab" onclick="showTab('tasks')">إدارة المهام</button>
            <button class="tab" onclick="showTab('history')">السجل</button>
            <button class="tab" onclick="showTab('archive')">الاستلام النهائي</button>
        </div>

        <div id="dashboard" class="tab-content active">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">إجمالي العمال</div>
                    <div class="stat-value" id="totalWorkers">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">العمال المتاحون</div>
                    <div class="stat-value" id="availableWorkers">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">العمال المشغولون</div>
                    <div class="stat-value" id="busyWorkers">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">المهام النشطة</div>
                    <div class="stat-value" id="activeTasks">0</div>
                </div>
            </div>

            <div class="form-section">
                <h3>العمال</h3>
                <div id="workersGrid" class="loading">جاري تحميل العمال...</div>
            </div>
        </div>

        <div id="tasks" class="tab-content">
            <div class="form-section">
                <h3>إدارة المهام</h3>
                <p class="loading">جاري تحميل واجهة المهام...</p>
            </div>
        </div>

        <div id="history" class="tab-content">
            <div class="form-section">
                <h3>سجل المهام</h3>
                <div id="historyTable" class="loading">جاري تحميل السجل...</div>
            </div>
        </div>

        <div id="archive" class="tab-content">
            <div class="form-section">
                <h3>الاستلام النهائي</h3>
                <div id="archiveTable" class="loading">جاري تحميل الأرشيف...</div>
            </div>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });

            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');

            if (tabName === 'history') {
                loadHistory();
            } else if (tabName === 'archive') {
                loadArchive();
            }
        }

        async function loadDashboardData() {
            try {
                const [stats, workers] = await Promise.all([
                    fetch('/api/stats').then(r => r.json()),
                    fetch('/api/workers').then(r => r.json())
                ]);
                
                document.getElementById('totalWorkers').textContent = stats.totalWorkers || 0;
                document.getElementById('availableWorkers').textContent = stats.availableWorkers || 0;
                document.getElementById('busyWorkers').textContent = stats.busyWorkers || 0;
                document.getElementById('activeTasks').textContent = stats.activeTasks || 0;

                const workersHTML = workers.map(worker => {
                    const category = getWorkerCategory(worker.category);
                    const status = worker.isAvailable ? 'متاح' : 'مشغول';
                    const statusColor = worker.isAvailable ? '#4CAF50' : '#FF9800';
                    
                    return '<div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; text-align: center; margin: 10px;">' +
                           '<div style="font-weight: bold; margin-bottom: 8px;">' + worker.name + '</div>' +
                           '<div style="font-size: 14px; color: #666; margin-bottom: 8px;">' + category + '</div>' +
                           '<div style="font-size: 12px; padding: 4px 8px; border-radius: 4px; color: white; background: ' + statusColor + '; display: inline-block;">' + status + '</div>' +
                           '</div>';
                }).join('');
                
                document.getElementById('workersGrid').innerHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">' + workersHTML + '</div>';
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        function getWorkerCategory(category) {
            const categories = {
                'technician': 'فني',
                'assistant': 'مساعد',
                'supervisor': 'مشرف',
                'trainee': 'متدرب'
            };
            return categories[category] || category;
        }

        async function loadHistory() {
            try {
                const response = await fetch('/api/tasks/history');
                const history = await response.json();
                
                let html = '<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden;"><thead><tr style="background: #f8f9fa;"><th style="padding: 12px; text-align: right;">الوصف</th><th style="padding: 12px; text-align: right;">السيارة</th><th style="padding: 12px; text-align: right;">الفني</th><th style="padding: 12px; text-align: right;">التاريخ</th></tr></thead><tbody>';
                history.forEach(task => {
                    html += '<tr style="border-bottom: 1px solid #eee;">' +
                           '<td style="padding: 12px;">' + task.description + '</td>' +
                           '<td style="padding: 12px;">' + task.carBrand + ' ' + task.carModel + '</td>' +
                           '<td style="padding: 12px;">' + (task.worker ? task.worker.name : 'غير محدد') + '</td>' +
                           '<td style="padding: 12px;">' + new Date(task.createdAt).toLocaleDateString('ar') + '</td>' +
                           '</tr>';
                });
                html += '</tbody></table>';
                
                document.getElementById('historyTable').innerHTML = html;
            } catch (error) {
                document.getElementById('historyTable').innerHTML = '<p style="color: #ef4444;">خطأ في تحميل السجل</p>';
            }
        }

        async function loadArchive() {
            try {
                const response = await fetch('/api/archive');
                const archive = await response.json();
                
                let html = '<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden;"><thead><tr style="background: #f8f9fa;"><th style="padding: 12px; text-align: right;">رقم المهمة</th><th style="padding: 12px; text-align: right;">الوصف</th><th style="padding: 12px; text-align: right;">السيارة</th><th style="padding: 12px; text-align: right;">التقييم</th></tr></thead><tbody>';
                archive.forEach(task => {
                    const rating = task.rating === 1 ? 'مقبول' : task.rating === 2 ? 'جيد' : task.rating === 3 ? 'ممتاز' : 'غير مقيم';
                    html += '<tr style="border-bottom: 1px solid #eee;">' +
                           '<td style="padding: 12px;">' + (task.taskNumber || '-') + '</td>' +
                           '<td style="padding: 12px;">' + task.description + '</td>' +
                           '<td style="padding: 12px;">' + task.carBrand + ' ' + task.carModel + '</td>' +
                           '<td style="padding: 12px;">' + rating + '</td>' +
                           '</tr>';
                });
                html += '</tbody></table>';
                
                document.getElementById('archiveTable').innerHTML = html;
            } catch (error) {
                document.getElementById('archiveTable').innerHTML = '<p style="color: #ef4444;">خطأ في تحميل الأرشيف</p>';
            }
        }

        // Load initial data
        loadDashboardData();
        
        // Auto-refresh every 30 seconds
        setInterval(loadDashboardData, 30000);
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