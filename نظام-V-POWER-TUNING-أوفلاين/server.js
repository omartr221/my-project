#!/usr/bin/env node

// نظام V POWER TUNING - سيرفر أوفلاين محسن
const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// إعداد المسارات
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// قاعدة بيانات JSON بسيطة
const DB_FILE = path.join(__dirname, 'database.json');

// إنشاء قاعدة البيانات الافتراضية
const defaultData = {
  workers: [
    { id: 26, name: "غدير", category: "technician" },
    { id: 27, name: "يحيى", category: "technician" },
    { id: 28, name: "حسام", category: "technician" },
    { id: 29, name: "مصطفى", category: "technician" },
    { id: 30, name: "زياد", category: "technician" },
    { id: 31, name: "سليمان", category: "assistant" },
    { id: 32, name: "علي", category: "assistant" },
    { id: 33, name: "حسن", category: "assistant" },
    { id: 34, name: "بدوي", category: "supervisor" },
    { id: 35, name: "عبد الحفيظ", category: "supervisor" },
    { id: 36, name: "مصطفى", category: "trainee" }
  ],
  tasks: [],
  timeEntries: [],
  archivedTasks: [],
  nextTaskId: 1,
  nextTimeEntryId: 1
};

// تحميل البيانات من الملف
function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      return { ...defaultData, ...data };
    }
  } catch (error) {
    console.log('خطأ في تحميل البيانات، سيتم استخدام البيانات الافتراضية');
  }
  return defaultData;
}

// حفظ البيانات
function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('خطأ في حفظ البيانات:', error);
  }
}

let data = loadData();

// WebSocket للتحديثات المباشرة
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('عميل جديد متصل');
  
  // إرسال البيانات الأولية
  sendInitialData(ws);

  ws.on('close', () => {
    console.log('عميل قطع الاتصال');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcastUpdate(type, updateData) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data: updateData }));
    }
  });
}

function sendInitialData(ws) {
  const workersWithTasks = data.workers.map(worker => ({
    ...worker,
    tasks: data.tasks.filter(t => t.workerId === worker.id),
    currentTask: data.tasks.find(t => t.workerId === worker.id && t.status === 'in_progress'),
    totalWorkTime: calculateWorkerTotalTime(worker.id),
    isAvailable: !data.tasks.some(t => t.workerId === worker.id && t.status === 'in_progress')
  }));

  const activeTasks = data.tasks.filter(t => t.status === 'in_progress').length;
  const busyWorkers = new Set(data.tasks.filter(t => t.status === 'in_progress').map(t => t.workerId)).size;

  ws.send(JSON.stringify({
    type: 'initial_data',
    data: {
      workers: workersWithTasks,
      tasks: data.tasks.map(task => ({
        ...task,
        worker: data.workers.find(w => w.id === task.workerId),
        currentDuration: calculateCurrentDuration(task)
      })),
      stats: {
        totalWorkers: data.workers.length,
        availableWorkers: data.workers.length - busyWorkers,
        busyWorkers,
        activeTasks
      }
    }
  }));
}

function calculateWorkerTotalTime(workerId) {
  return data.tasks
    .filter(t => t.workerId === workerId && t.status === 'completed')
    .reduce((total, task) => total + (task.actualDuration || 0), 0);
}

function calculateCurrentDuration(task) {
  if (task.status !== 'in_progress' || !task.startedAt) return 0;
  return Math.floor((Date.now() - new Date(task.startedAt)) / 1000);
}

// API Routes
app.get('/api/workers', (req, res) => {
  const workersWithTasks = data.workers.map(worker => ({
    ...worker,
    tasks: data.tasks.filter(t => t.workerId === worker.id),
    currentTask: data.tasks.find(t => t.workerId === worker.id && t.status === 'in_progress'),
    totalWorkTime: calculateWorkerTotalTime(worker.id),
    isAvailable: !data.tasks.some(t => t.workerId === worker.id && t.status === 'in_progress')
  }));
  res.json(workersWithTasks);
});

app.get('/api/workers/names', (req, res) => {
  res.json(data.workers.map(w => w.name));
});

app.get('/api/tasks', (req, res) => {
  const tasksWithWorkers = data.tasks.map(task => ({
    ...task,
    worker: data.workers.find(w => w.id === task.workerId),
    currentDuration: calculateCurrentDuration(task)
  }));
  res.json(tasksWithWorkers);
});

app.get('/api/tasks/active', (req, res) => {
  const activeTasks = data.tasks.filter(t => t.status === 'in_progress').map(task => ({
    ...task,
    worker: data.workers.find(w => w.id === task.workerId),
    currentDuration: calculateCurrentDuration(task)
  }));
  res.json(activeTasks);
});

app.get('/api/tasks/history', (req, res) => {
  const completedTasks = data.tasks.filter(t => t.status === 'completed').map(task => ({
    ...task,
    worker: data.workers.find(w => w.id === task.workerId),
    totalDuration: task.actualDuration || 0
  }));
  res.json(completedTasks);
});

app.get('/api/archive', (req, res) => {
  const archivedWithWorkers = data.archivedTasks.map(task => ({
    ...task,
    worker: data.workers.find(w => w.id === task.workerId)
  }));
  res.json(archivedWithWorkers);
});

app.get('/api/stats', (req, res) => {
  const activeTasks = data.tasks.filter(t => t.status === 'in_progress').length;
  const busyWorkers = new Set(data.tasks.filter(t => t.status === 'in_progress').map(t => t.workerId)).size;
  
  res.json({
    totalWorkers: data.workers.length,
    availableWorkers: data.workers.length - busyWorkers,
    busyWorkers,
    activeTasks
  });
});

// إنشاء مهمة جديدة
app.post('/api/tasks', (req, res) => {
  const { description, carBrand, carModel, licensePlate, estimatedDuration, engineerId, supervisorId, technicianId, assistantId, repairOperation } = req.body;
  
  const newTask = {
    id: data.nextTaskId++,
    description,
    carBrand,
    carModel,
    licensePlate,
    estimatedDuration,
    repairOperation,
    workerId: technicianId,
    engineerId,
    supervisorId,
    assistantId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    actualDuration: 0
  };
  
  data.tasks.push(newTask);
  saveData(data);
  broadcastUpdate('task_created', newTask);
  res.json(newTask);
});

// بدء مهمة
app.post('/api/tasks/:id/start', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = data.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  task.status = 'in_progress';
  task.startedAt = new Date().toISOString();
  
  const timeEntry = {
    id: data.nextTimeEntryId++,
    taskId: task.id,
    startTime: new Date().toISOString(),
    endTime: null,
    type: 'work'
  };
  
  data.timeEntries.push(timeEntry);
  saveData(data);
  broadcastUpdate('task_started', task);
  res.json(timeEntry);
});

// إيقاف مهمة مؤقتاً
app.post('/api/tasks/:id/pause', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { reason, notes } = req.body;
  const task = data.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  // إنهاء التسجيل الحالي
  const activeEntry = data.timeEntries.find(e => e.taskId === taskId && !e.endTime);
  if (activeEntry) {
    activeEntry.endTime = new Date().toISOString();
  }
  
  task.status = 'paused';
  task.pauseReason = reason;
  task.pauseNotes = notes;
  
  saveData(data);
  broadcastUpdate('task_paused', task);
  res.json(task);
});

// استئناف مهمة
app.post('/api/tasks/:id/resume', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = data.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  task.status = 'in_progress';
  
  const timeEntry = {
    id: data.nextTimeEntryId++,
    taskId: task.id,
    startTime: new Date().toISOString(),
    endTime: null,
    type: 'work'
  };
  
  data.timeEntries.push(timeEntry);
  saveData(data);
  broadcastUpdate('task_resumed', task);
  res.json(timeEntry);
});

// إنهاء مهمة
app.post('/api/tasks/:id/finish', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = data.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  // إنهاء التسجيل الحالي
  const activeEntry = data.timeEntries.find(e => e.taskId === taskId && !e.endTime);
  if (activeEntry) {
    activeEntry.endTime = new Date().toISOString();
  }
  
  // حساب الوقت الإجمالي
  const taskEntries = data.timeEntries.filter(e => e.taskId === taskId);
  const totalDuration = taskEntries.reduce((total, entry) => {
    if (entry.endTime) {
      return total + Math.floor((new Date(entry.endTime) - new Date(entry.startTime)) / 1000);
    }
    return total;
  }, 0);
  
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  task.actualDuration = totalDuration;
  
  saveData(data);
  broadcastUpdate('task_completed', task);
  res.json(task);
});

// أرشفة مهمة
app.post('/api/tasks/:id/archive', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { notes, rating, archivedBy } = req.body;
  const task = data.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  const archivedTask = {
    ...task,
    archivedAt: new Date().toISOString(),
    archivedBy,
    notes,
    rating,
    totalDuration: task.actualDuration || 0
  };
  
  data.archivedTasks.push(archivedTask);
  data.tasks = data.tasks.filter(t => t.id !== taskId);
  
  saveData(data);
  broadcastUpdate('task_archived', archivedTask);
  res.json(archivedTask);
});

// تحديث مهمة
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = data.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  Object.assign(task, req.body);
  saveData(data);
  broadcastUpdate('task_updated', task);
  res.json(task);
});

// البحث في الأرشيف
app.get('/api/archive/search', (req, res) => {
  const { term } = req.query;
  if (!term) {
    return res.json([]);
  }
  
  const results = data.archivedTasks.filter(task => 
    task.description.includes(term) ||
    task.carModel.includes(term) ||
    task.licensePlate.includes(term) ||
    (task.notes && task.notes.includes(term))
  ).map(task => ({
    ...task,
    worker: data.workers.find(w => w.id === task.workerId)
  }));
  
  res.json(results);
});

// تقديم ملف HTML الرئيسي
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// بدء السيرفر
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('🚀 نظام V POWER TUNING جاهز للعمل!');
  console.log('=================================');
  console.log(`📍 المنفذ: ${PORT}`);
  console.log(`🏠 من هذا الجهاز: http://localhost:${PORT}`);
  console.log(`🌐 من أجهزة أخرى: http://[IP-ADDRESS]:${PORT}`);
  console.log('');
  console.log('💡 لمعرفة عنوان IP:');
  console.log('   - Windows: ipconfig');
  console.log('   - Mac/Linux: ifconfig');
  console.log('');
  console.log('📊 قاعدة البيانات: ' + DB_FILE);
  console.log('🔄 التحديثات المباشرة: مفعلة');
  console.log('=================================');
});

// حفظ البيانات عند إغلاق السيرفر
process.on('SIGTERM', () => {
  console.log('حفظ البيانات...');
  saveData(data);
  server.close(() => {
    console.log('تم إيقاف السيرفر');
  });
});

process.on('SIGINT', () => {
  console.log('حفظ البيانات...');
  saveData(data);
  process.exit(0);
});