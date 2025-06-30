@echo off
chcp 65001 > nul
title "تشغيل مباشر - V POWER TUNING"

echo =========================================
echo    نظام توزيع المهام - V POWER TUNING
echo =========================================
echo.

REM Try to find Node.js in common installation paths
set "NODE_PATH="
set "NPM_PATH="

REM Check Program Files
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files\nodejs\node.exe"
    set "NPM_PATH=C:\Program Files\nodejs\npm.cmd"
)

REM Check Program Files (x86)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files (x86)\nodejs\node.exe"
    set "NPM_PATH=C:\Program Files (x86)\nodejs\npm.cmd"
)

REM Check AppData
if exist "%APPDATA%\npm\node.exe" (
    set "NODE_PATH=%APPDATA%\npm\node.exe"
    set "NPM_PATH=%APPDATA%\npm\npm.cmd"
)

REM Check if we found Node.js
if "%NODE_PATH%"=="" (
    echo ✗ لم يتم العثور على Node.js
    echo.
    echo يرجى التأكد من تثبيت Node.js من:
    echo https://nodejs.org
    echo.
    echo أو ابحث عن "Node.js command prompt" في قائمة Start
    echo.
    pause
    exit /b 1
)

echo ✓ تم العثور على Node.js في: %NODE_PATH%
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo تثبيت المكتبات...
    "%NPM_PATH%" install --force
    if errorlevel 1 (
        echo فشل في تثبيت المكتبات
        pause
        exit /b 1
    )
    echo تم التثبيت بنجاح ✓
    echo.
)

echo بدء تشغيل النظام...
echo.
echo ========================================
echo   النظام سيعمل على: http://localhost:3000
echo   افتح المتصفح وادخل العنوان أعلاه
echo ========================================
echo.
echo لإيقاف النظام: اضغط Ctrl+C
echo.

"%NPM_PATH%" run dev