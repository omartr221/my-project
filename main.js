const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// تفعيل live reload في development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

let mainWindow;
let serverProcess;

// إنشاء النافذة الرئيسية
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // سيتم إنشاؤها لاحقاً
    title: 'V POWER TUNING - نظام إدارة المهام',
    titleBarStyle: 'default',
    show: false // لا نعرض النافذة حتى تكون جاهزة
  });

  // تحميل التطبيق بعد تشغيل السيرفر
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:5000');
  }, 3000);

  // عرض النافذة عندما تكون جاهزة
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // فتح أدوات المطور في وضع التطوير
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // التعامل مع إغلاق النافذة
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // فتح الروابط الخارجية في المتصفح الافتراضي
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// تشغيل سيرفر Express
function startServer() {
  return new Promise((resolve, reject) => {
    try {
      console.log('🚀 تشغيل سيرفر V POWER TUNING...');
      
      serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
      });

      serverProcess.on('error', (error) => {
        console.error('❌ خطأ في تشغيل السيرفر:', error);
        reject(error);
      });

      // انتظار تشغيل السيرفر
      setTimeout(() => {
        console.log('✅ السيرفر جاهز!');
        resolve();
      }, 2000);

    } catch (error) {
      console.error('❌ فشل في تشغيل السيرفر:', error);
      reject(error);
    }
  });
}

// إيقاف السيرفر
function stopServer() {
  if (serverProcess) {
    console.log('🛑 إيقاف السيرفر...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

// إعداد القائمة
function createMenu() {
  const template = [
    {
      label: 'ملف',
      submenu: [
        {
          label: 'إعادة تحميل',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'فتح أدوات المطور',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'خروج',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'عرض',
      submenu: [
        {
          label: 'تكبير',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 1);
            }
          }
        },
        {
          label: 'تصغير',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 1);
            }
          }
        },
        {
          label: 'الحجم الطبيعي',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'ملء الشاشة',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        }
      ]
    },
    {
      label: 'مساعدة',
      submenu: [
        {
          label: 'حول التطبيق',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'حول التطبيق',
              message: 'V POWER TUNING',
              detail: 'نظام إدارة المهام والخدمات\nإصدار 1.0.0',
              buttons: ['موافق']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// عند جاهزية التطبيق
app.whenReady().then(async () => {
  try {
    // تشغيل السيرفر أولاً
    await startServer();
    
    // إنشاء النافذة
    createWindow();
    
    // إعداد القائمة
    createMenu();
    
  } catch (error) {
    console.error('❌ فشل في تشغيل التطبيق:', error);
    dialog.showErrorBox('خطأ في التشغيل', 'فشل في تشغيل سيرفر التطبيق');
    app.quit();
  }
});

// إغلاق التطبيق عند إغلاق جميع النوافذ
app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// إعادة تفعيل التطبيق على macOS
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// التعامل مع إغلاق التطبيق
app.on('before-quit', () => {
  stopServer();
});

// تجنب تحذيرات الأمان
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';