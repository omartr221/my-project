const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for local network
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes with index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Please ensure public/index.html exists.');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log('🚀 V POWER TUNING Server جاهز!');
  console.log(`   - البورت: ${port}`);
  console.log(`   - من هذا الجهاز: http://localhost:${port}`);
  console.log(`   - من أجهزة أخرى: http://192.168.1.102:${port}`);
  console.log('🔧 السيرفر يعمل على جميع عناوين الشبكة (0.0.0.0)');
  console.log('💡 للتوقف: اضغط Ctrl+C');
});
