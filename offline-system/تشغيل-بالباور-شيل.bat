@echo off
chcp 65001 > nul
title "تشغيل بالـ PowerShell"

echo تشغيل النظام باستخدام PowerShell...
echo.

powershell -ExecutionPolicy Bypass -File "start-with-powershell.ps1"

pause