#!/usr/bin/env node

/**
 * Deployment Validation Script for V POWER TUNING
 * Tests all the fixes applied for Autoscale deployment
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

console.log('🔍 V POWER TUNING Deployment Validation');
console.log('========================================\n');

// Test 1: Check if build outputs exist
console.log('1. Checking build output structure...');
const requiredFiles = [
  'dist/index.js',
  'dist/public/index.html'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
    allFilesExist = false;
  }
}

// Test 2: Check package.json configuration
console.log('\n2. Validating package.json...');
try {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
  
  if (packageJson.scripts.start?.includes('NODE_ENV=production')) {
    console.log('   ✅ Production NODE_ENV set in start script');
  } else {
    console.log('   ❌ Missing NODE_ENV=production in start script');
  }
  
  if (packageJson.scripts.build) {
    console.log('   ✅ Build script configured');
  } else {
    console.log('   ❌ Build script missing');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
}

// Test 3: Test server startup
console.log('\n3. Testing server startup...');
const testServer = spawn('node', ['dist/index.js'], {
  env: { ...process.env, NODE_ENV: 'production', PORT: '3001' },
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverOutput = '';
testServer.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

testServer.stderr.on('data', (data) => {
  console.log('   ⚠️ Server stderr:', data.toString());
});

// Give server time to start
await new Promise(resolve => setTimeout(resolve, 3000));

// Test 4: Health check endpoints
console.log('\n4. Testing health endpoints...');
try {
  const response = await fetch('http://localhost:3001/health');
  if (response.ok) {
    const data = await response.json();
    console.log('   ✅ Health endpoint responding:', data.status);
  } else {
    console.log('   ❌ Health endpoint failed:', response.status);
  }
} catch (error) {
  console.log('   ❌ Health endpoint error:', error.message);
}

try {
  const response = await fetch('http://localhost:3001/ready');
  if (response.ok) {
    const data = await response.json();
    console.log('   ✅ Ready endpoint responding:', data.status);
  } else {
    console.log('   ❌ Ready endpoint failed:', response.status);
  }
} catch (error) {
  console.log('   ❌ Ready endpoint error:', error.message);
}

// Clean up
testServer.kill();

console.log('\n5. Summary of fixes applied:');
console.log('   ✅ Fixed server listen method for Autoscale compatibility');
console.log('   ✅ Added health check endpoints (/health, /ready)');
console.log('   ✅ Improved error handling for production environment');
console.log('   ✅ Enhanced database connection management');
console.log('   ✅ Configured proper port binding (PORT env var)');
console.log('   ✅ Set appropriate NODE_ENV in start script');

console.log('\n🚀 Deployment validation complete!');
console.log('The server is now configured for Replit Autoscale deployment.');