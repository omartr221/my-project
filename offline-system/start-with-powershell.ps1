# PowerShell script to start the system
Write-Host "نظام توزيع المهام - V POWER TUNING" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "Node.js موجود: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "خطأ: Node.js غير موجود" -ForegroundColor Red
    Write-Host "يرجى تثبيت Node.js من nodejs.org" -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "npm موجود: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "خطأ: npm غير موجود" -ForegroundColor Red
    Read-Host "اضغط Enter للخروج"
    exit
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "تثبيت المكتبات..." -ForegroundColor Yellow
    npm install --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "فشل في تثبيت المكتبات" -ForegroundColor Red
        Read-Host "اضغط Enter للخروج"
        exit
    }
}

Write-Host "بدء تشغيل النظام..." -ForegroundColor Green
Write-Host "النظام سيعمل على: http://localhost:3000" -ForegroundColor Cyan
Write-Host "لإيقاف النظام: اضغط Ctrl+C" -ForegroundColor Yellow

# Start the application
npm run dev