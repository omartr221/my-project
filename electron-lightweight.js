// تطبيق Electron مبسط بدون مكتبات معقدة
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // إنشاء النافذة الرئيسية
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    title: 'V POWER TUNING - نظام إدارة المهام',
    show: false,
    autoHideMenuBar: false
  });

  // تحميل التطبيق
  mainWindow.loadURL('http://localhost:5000');

  // عرض النافذة عندما تكون جاهزة
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ تم فتح تطبيق V POWER TUNING Desktop');
  });

  // التعامل مع الأخطاء
  mainWindow.webContents.on('did-fail-load', () => {
    console.log('❌ فشل في تحميل التطبيق - تأكد من تشغيل السيرفر على المنفذ 5000');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // قائمة بسيطة
  const menuTemplate = [
    {
      label: 'ملف',
      submenu: [
        {
          label: 'إعادة تحميل',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        },
        {
          label: 'خروج',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'عرض',
      submenu: [
        {
          label: 'ملء الشاشة',
          accelerator: 'F11',
          click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen())
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log('🚀 بدء تشغيل V POWER TUNING Desktop...');