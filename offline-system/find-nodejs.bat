@echo off
chcp 65001 > nul
title "البحث عن Node.js"

echo البحث عن Node.js في النظام...
echo =====================================
echo.

REM Search in common locations
echo البحث في Program Files...
if exist "C:\Program Files\nodejs\node.exe" (
    echo ✓ موجود في: C:\Program Files\nodejs\
    echo النسخة:
    "C:\Program Files\nodejs\node.exe" --version
    echo.
)

echo البحث في Program Files x86...
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    echo ✓ موجود في: C:\Program Files (x86)\nodejs\
    echo النسخة:
    "C:\Program Files (x86)\nodejs\node.exe" --version
    echo.
)

echo البحث في AppData...
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    echo ✓ موجود في: %LOCALAPPDATA%\Programs\nodejs\
    echo النسخة:
    "%LOCALAPPDATA%\Programs\nodejs\node.exe" --version
    echo.
)

echo البحث في مسار النظام...
where node >nul 2>&1
if not errorlevel 1 (
    echo ✓ Node.js موجود في مسار النظام
    node --version
) else (
    echo ✗ Node.js غير موجود في مسار النظام
)

echo.
echo البحث في مجلد المستخدم...
if exist "%USERPROFILE%\AppData\Roaming\npm\node.exe" (
    echo ✓ موجود في: %USERPROFILE%\AppData\Roaming\npm\
)

echo.
echo انتهى البحث
pause