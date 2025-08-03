#!/usr/bin/env node

// Render startup script for V POWER TUNING
// This ensures the correct port binding for Render deployment

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting V POWER TUNING on Render...');
console.log('📍 Port:', process.env.PORT || '5000');
console.log('🌍 Environment:', process.env.NODE_ENV || 'production');

// Start the server with tsx
const serverPath = path.join(__dirname, 'server', 'index.ts');
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

child.on('error', (error) => {
  console.error('❌ Server startup error:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log('🔚 Server exited with code:', code);
  process.exit(code);
});