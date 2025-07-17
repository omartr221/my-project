import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS for local network
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'public', 'index.html');
    const indexContent = readFileSync(indexPath, 'utf-8');
    res.send(indexContent);
  } catch (error) {
    res.status(500).send('Error loading application');
  }
});

const server = createServer(app);
const port = 3000;
const host = '0.0.0.0';

server.listen(port, host, () => {
  console.log('🚀 V POWER TUNING Server جاهز!');
  console.log(`   - البورت: ${port}`);
  console.log(`   - من هذا الجهاز: http://localhost:${port}`);
  console.log(`   - من أجهزة أخرى: http://[عنوان-IP]:${port}`);
  console.log('📱 لمعرفة عنوان IP: اكتب ipconfig في cmd');
  console.log('🔧 السيرفر يعمل على جميع عناوين الشبكة');
});

server.on('error', (err) => {
  console.error('❌ خطأ في تشغيل السيرفر:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`البورت ${port} مستخدم بالفعل`);
  }
});