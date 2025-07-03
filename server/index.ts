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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// تقديم ملف HTML مباشرة من المسار الجذر
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>V POWER TUNING</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .subtitle {
            text-align: center;
            font-size: 1.2em;
            margin-bottom: 40px;
            opacity: 0.9;
        }
        .status {
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .form-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            margin-top: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }
        input, select {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            box-sizing: border-box;
        }
        .btn {
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .success {
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4CAF50;
        }
        .error {
            background: rgba(244, 67, 54, 0.2);
            border: 2px solid #f44336;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>V POWER TUNING</h1>
        <p class="subtitle">نظام إدارة المهام والصيانة</p>
        
        <div class="status">
            <h2>✓ النظام يعمل بنجاح!</h2>
            <p>الخادم متصل ومتاح لإنشاء المهام</p>
        </div>

        <div class="form-container">
            <h3>إنشاء مهمة جديدة</h3>
            <form id="taskForm">
                <div class="form-group">
                    <label for="description">وصف المهمة:</label>
                    <input type="text" id="description" placeholder="مثال: صيانة محرك" required>
                </div>
                
                <div class="form-group">
                    <label for="carBrand">نوع السيارة:</label>
                    <select id="carBrand" required>
                        <option value="audi">أودي</option>
                        <option value="seat">سيات</option>
                        <option value="skoda">سكودا</option>
                        <option value="volkswagen">فولكس فاجن</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="carModel">موديل السيارة:</label>
                    <input type="text" id="carModel" placeholder="مثال: A4" required>
                </div>
                
                <div class="form-group">
                    <label for="licensePlate">رقم اللوحة:</label>
                    <input type="text" id="licensePlate" placeholder="مثال: 123456" required>
                </div>
                
                <div class="form-group">
                    <label for="taskType">نوع المهمة:</label>
                    <select id="taskType" required>
                        <option value="ميكانيك">ميكانيك</option>
                        <option value="كهربا">كهربا</option>
                    </select>
                </div>
                
                <button type="submit" class="btn">إنشاء المهمة</button>
            </form>
            
            <div id="result"></div>
        </div>
    </div>

    <script>
        document.getElementById('taskForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<div style="color: #4ECDC4; text-align: center;">جاري إنشاء المهمة...</div>';
            
            const formData = {
                description: document.getElementById('description').value,
                carBrand: document.getElementById('carBrand').value,
                carModel: document.getElementById('carModel').value,
                licensePlate: document.getElementById('licensePlate').value,
                taskType: document.getElementById('taskType').value,
                workerId: 17,
                workerRole: 'assistant',
                estimatedDuration: 60,
                technicians: ['غدير'],
                assistants: ['حسام'],
                repairOperation: 'صيانة عامة'
            };
            
            try {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    resultDiv.innerHTML = \`
                        <div class="result success">
                            <h4>✓ تم إنشاء المهمة بنجاح!</h4>
                            <p>رقم المهمة: \${result.taskNumber || result.id}</p>
                            <p>تم البدء في تتبع الوقت</p>
                        </div>
                    \`;
                    document.getElementById('taskForm').reset();
                } else {
                    const errorText = await response.text();
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <h4>✗ خطأ في إنشاء المهمة</h4>
                            <p>كود الخطأ: \${response.status}</p>
                            <p>التفاصيل: \${errorText}</p>
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div class="result error">
                        <h4>✗ خطأ في الاتصال</h4>
                        <p>لا يمكن الوصول إلى الخادم</p>
                        <p>التفاصيل: \${error.message}</p>
                    </div>
                \`;
            }
        });
    </script>
</body>
</html>
  `);
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