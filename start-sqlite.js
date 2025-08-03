#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🗄️ تشغيل V POWER TUNING مع SQLite...');
console.log('🔒 يعمل بدون إنترنت - البيانات محلية');
console.log('');

// Start SQLite server
const server = spawn('npx', ['tsx', 'server/index-sqlite.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

server.on('error', (err) => {
  console.error('❌ خطأ في تشغيل السيرفر:', err);
});

server.on('close', (code) => {
  console.log(`💡 السيرفر توقف مع الكود: ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n⏹️ إيقاف النظام...');
  server.kill();
  process.exit(0);
});

console.log('✅ النظام يعمل مع SQLite');
console.log('📱 افتح المتصفح على: http://localhost:5000');
console.log('🔑 مستخدم الاستقبال: كلمة المرور 11');
console.log('');
console.log('اضغط Ctrl+C لإيقاف النظام');