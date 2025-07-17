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

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Handle all routes with index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Please build the project first.');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log('🚀 V POWER TUNING Server جاهز!');
  console.log(`   - البورت: ${port}`);
  console.log(`   - من هذا الجهاز: http://localhost:${port}`);
  console.log(`   - من أجهزة أخرى: http://192.168.1.102:${port}`);
  console.log('🔧 السيرفر يعمل على جميع عناوين الشبكة');
});