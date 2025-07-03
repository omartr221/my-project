const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// تفعيل JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// تقديم الملفات الثابتة
app.use(express.static(path.join(__dirname, 'client', 'public')));

// اختبار endpoint بسيط
app.get('/api/test', (req, res) => {
  res.json({ message: 'الخادم يعمل بشكل صحيح', timestamp: new Date().toISOString() });
});

// endpoint للعمال (مزيف للاختبار)
app.get('/api/workers', (req, res) => {
  const workers = [
    { id: 1, name: 'غدير', category: 'technician' },
    { id: 2, name: 'حسام', category: 'assistant' },
    { id: 3, name: 'حسن', category: 'technician' },
    { id: 4, name: 'يحيى', category: 'assistant' },
    { id: 5, name: 'سليمان', category: 'supervisor' }
  ];
  res.json(workers);
});

// endpoint لإنشاء المهام
app.post('/api/tasks', (req, res) => {
  console.log('تم استلام طلب إنشاء مهمة:', req.body);
  
  // التحقق من البيانات الأساسية
  if (!req.body.description || !req.body.carModel || !req.body.licensePlate) {
    return res.status(400).json({ 
      error: 'بيانات ناقصة', 
      message: 'يجب ملء جميع الحقول المطلوبة' 
    });
  }
  
  // إرجاع استجابة نجاح
  const task = {
    id: Math.floor(Math.random() * 1000),
    taskNumber: Math.floor(Math.random() * 100).toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'in_progress'
  };
  
  console.log('تم إنشاء المهمة بنجاح:', task);
  res.json(task);
});

// صفحة اختبار بسيطة
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>V POWER TUNING - اختبار بسيط</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
            .card { background: white; border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 8px; }
            .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin: 10px 0; }
            .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>V POWER TUNING</h1>
            <h2>اختبار الخادم البسيط</h2>
            <div class="success">✓ الخادم يعمل بشكل صحيح</div>
            
            <h3>اختبار إنشاء مهمة</h3>
            <form id="taskForm">
                <div style="margin: 10px 0;">
                    <label>وصف المهمة:</label><br>
                    <input type="text" id="description" placeholder="اختبار المهمة" style="width: 300px; padding: 8px;">
                </div>
                <div style="margin: 10px 0;">
                    <label>موديل السيارة:</label><br>
                    <input type="text" id="carModel" placeholder="A4" style="width: 300px; padding: 8px;">
                </div>
                <div style="margin: 10px 0;">
                    <label>رقم اللوحة:</label><br>
                    <input type="text" id="licensePlate" placeholder="123456" style="width: 300px; padding: 8px;">
                </div>
                <button type="submit" class="button">إنشاء المهمة</button>
            </form>
            <div id="result"></div>
        </div>

        <script>
            document.getElementById('taskForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const result = document.getElementById('result');
                result.innerHTML = '<div style="color: blue;">جاري إنشاء المهمة...</div>';
                
                const formData = {
                    description: document.getElementById('description').value,
                    carBrand: 'audi',
                    carModel: document.getElementById('carModel').value,
                    licensePlate: document.getElementById('licensePlate').value,
                    workerId: 1,
                    workerRole: 'assistant',
                    estimatedDuration: 60,
                    technicians: ['غدير'],
                    assistants: ['حسام'],
                    repairOperation: 'اختبار',
                    taskType: 'ميكانيك'
                };
                
                try {
                    const response = await fetch('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    
                    if (response.ok) {
                        const task = await response.json();
                        result.innerHTML = '<div class="success">✓ تم إنشاء المهمة بنجاح!<br>رقم المهمة: ' + task.taskNumber + '</div>';
                        document.getElementById('taskForm').reset();
                    } else {
                        const error = await response.json();
                        result.innerHTML = '<div class="error">✗ خطأ: ' + error.message + '</div>';
                    }
                } catch (error) {
                    result.innerHTML = '<div class="error">✗ خطأ في الاتصال: ' + error.message + '</div>';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// بدء الخادم
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 خادم اختبار V POWER TUNING جاهز على:`);
  console.log(`   - http://localhost:${port}`);
  console.log(`   - http://0.0.0.0:${port}`);
  console.log(`🔧 الخادم بسيط ويعمل بدون مكتبات معقدة`);
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم:', err);
  res.status(500).json({ error: 'خطأ داخلي في الخادم' });
});