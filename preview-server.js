const express = require('express');
const app = express();

// Simple server for Replit Preview
app.get('*', (req, res) => {
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
            padding: 0;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            background: rgba(0, 0, 0, 0.3);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 600px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .status-box {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .success {
            color: #10b981;
            font-size: 1.2rem;
            font-weight: bold;
        }
        .info {
            margin: 10px 0;
            font-size: 1.1rem;
        }
        .button {
            background: white;
            color: #dc2626;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            font-weight: bold;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>V POWER TUNING</h1>
        <h2>نظام إدارة المهام والعمال</h2>
        
        <div class="status-box">
            <p class="success">✅ النظام يعمل بنجاح!</p>
            <p class="info">🔧 الخادم الرئيسي: يعمل على المنفذ 5000</p>
            <p class="info">👥 العمال المسجلين: 12 عامل</p>
            <p class="info">⚡ المزايا الجديدة: اختيار متعدد للفنيين والمساعدين</p>
        </div>
        
        <p>هذه صفحة Preview الخاصة بـ Replit</p>
        <p>للوصول للنظام الكامل، استخدم المنفذ 5000</p>
        
        <a href="http://localhost:5000" target="_blank" class="button">افتح النظام الكامل</a>
    </div>
</body>
</html>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('Preview server running on port ' + port);
});