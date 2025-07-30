#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 تشغيل V POWER TUNING Desktop...');
console.log('==================================');

// تشغيل Electron
const electronProcess = spawn('npx', ['electron', '.'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

electronProcess.on('error', (error) => {
  console.error('❌ خطأ في تشغيل التطبيق:', error);
  process.exit(1);
});

electronProcess.on('close', (code) => {
  console.log(`✅ تم إغلاق التطبيق (${code})`);
  process.exit(code);
});

// التعامل مع إشارات الإغلاق
process.on('SIGINT', () => {
  console.log('\n🛑 جاري إغلاق التطبيق...');
  electronProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 جاري إغلاق التطبيق...');
  electronProcess.kill('SIGTERM');
});