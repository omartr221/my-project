// نظام V POWER TUNING - سيرفر مستقل
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// إعداد المسارات
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// قاعدة بيانات مؤقتة في الذاكرة لحين النقل
let workers = [
  { id: 26, name: "غدير", category: "technician" },
  { id: 27, name: "يحيى", category: "technician" },
  { id: 28, name: "حسام", category: "technician" },
  { id: 29, name: "مصطفى", category: "technician" },
  { id: 30, name: "زياد", category: "technician" },
  { id: 31, name: "سليمان", category: "assistant" },
  { id: 32, name: "علي", category: "assistant" },
  { id: 33, name: "حسن", category: "assistant" },
  { id: 34, name: "بدوي", category: "supervisor" },
  { id: 35, name: "عبد الحفيظ", category: "supervisor" }
];

let tasks = [];
let timeEntries = [];
let archivedTasks = [];

// WebSocket للتحديثات المباشرة
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('عميل جديد متصل');
  
  // إرسال البيانات الأولية
  ws.send(JSON.stringify({
    type: 'initial_data',
    data: {
      workers: workers.map(w => ({ ...w, tasks: [], currentTask: null, totalWorkTime: 0, isAvailable: true })),
      tasks: [],
      stats: { totalWorkers: workers.length, availableWorkers: workers.length, busyWorkers: 0, activeTasks: 0 }
    }
  }));

  ws.on('close', () => {
    console.log('عميل قطع الاتصال');
  });
});

function broadcastUpdate(type, data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data }));
    }
  });
}

// API Routes
app.get('/api/workers', (req, res) => {
  const workersWithTasks = workers.map(worker => ({
    ...worker,
    tasks: tasks.filter(t => t.workerId === worker.id),
    currentTask: tasks.find(t => t.workerId === worker.id && t.status === 'in_progress'),
    totalWorkTime: 0,
    isAvailable: !tasks.some(t => t.workerId === worker.id && t.status === 'in_progress')
  }));
  res.json(workersWithTasks);
});

app.get('/api/workers/names', (req, res) => {
  res.json(workers.map(w => w.name));
});

app.get('/api/tasks', (req, res) => {
  const tasksWithWorkers = tasks.map(task => ({
    ...task,
    worker: workers.find(w => w.id === task.workerId),
    currentDuration: 0
  }));
  res.json(tasksWithWorkers);
});

app.get('/api/tasks/active', (req, res) => {
  const activeTasks = tasks.filter(t => t.status === 'in_progress').map(task => ({
    ...task,
    worker: workers.find(w => w.id === task.workerId),
    currentDuration: 0
  }));
  res.json(activeTasks);
});

app.get('/api/tasks/history', (req, res) => {
  const completedTasks = tasks.filter(t => t.status === 'completed').map(task => ({
    ...task,
    worker: workers.find(w => w.id === task.workerId),
    totalDuration: task.actualDuration || 0
  }));
  res.json(completedTasks);
});

app.get('/api/archive', (req, res) => {
  res.json(archivedTasks);
});

app.get('/api/stats', (req, res) => {
  const activeTasks = tasks.filter(t => t.status === 'in_progress').length;
  const busyWorkers = new Set(tasks.filter(t => t.status === 'in_progress').map(t => t.workerId)).size;
  
  res.json({
    totalWorkers: workers.length,
    availableWorkers: workers.length - busyWorkers,
    busyWorkers,
    activeTasks
  });
});

// إنشاء مهمة جديدة
app.post('/api/tasks', (req, res) => {
  const { description, carBrand, carModel, licensePlate, estimatedDuration, engineerId, supervisorId, technicianId, assistantId, repairOperation } = req.body;
  
  const newTask = {
    id: tasks.length + 1,
    description,
    carBrand,
    carModel,
    licensePlate,
    estimatedDuration,
    repairOperation,
    workerId: technicianId, // الفني الرئيسي
    engineerId,
    supervisorId,
    assistantId,
    status: 'pending',
    createdAt: new Date(),
    startedAt: null,
    completedAt: null,
    actualDuration: 0
  };
  
  tasks.push(newTask);
  broadcastUpdate('task_created', newTask);
  res.json(newTask);
});

// بدء مهمة
app.post('/api/tasks/:id/start', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  task.status = 'in_progress';
  task.startedAt = new Date();
  
  broadcastUpdate('task_started', task);
  res.json(task);
});

// إنهاء مهمة
app.post('/api/tasks/:id/finish', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  task.status = 'completed';
  task.completedAt = new Date();
  task.actualDuration = task.startedAt ? Math.floor((new Date() - task.startedAt) / 1000) : 0;
  
  broadcastUpdate('task_completed', task);
  res.json(task);
});

// أرشفة مهمة
app.post('/api/tasks/:id/archive', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { notes, rating, archivedBy } = req.body;
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  const archivedTask = {
    ...task,
    worker: workers.find(w => w.id === task.workerId),
    archivedAt: new Date(),
    archivedBy,
    notes,
    rating,
    totalDuration: task.actualDuration || 0
  };
  
  archivedTasks.push(archivedTask);
  tasks = tasks.filter(t => t.id !== taskId);
  
  broadcastUpdate('task_archived', archivedTask);
  res.json(archivedTask);
});

// تحديث مهمة
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  Object.assign(task, req.body);
  broadcastUpdate('task_updated', task);
  res.json(task);
});

// تقديم الملفات الثابتة
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// بدء السيرفر
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // للسماح بالوصول من أجهزة أخرى

server.listen(PORT, HOST, () => {
  console.log('🚀 V POWER TUNING Server جاهز!');
  console.log(`   - من هذا الجهاز: http://localhost:${PORT}`);
  console.log(`   - من أجهزة أخرى: http://[عنوان-IP]:${PORT}`);
  console.log('📱 لمعرفة عنوان IP: اكتب ipconfig في cmd');
  console.log('🔧 نظام إدارة المهام جاهز للاستخدام');
});

// معالجة إغلاق السيرفر
process.on('SIGTERM', () => {
  console.log('إيقاف السيرفر...');
  server.close(() => {
    console.log('تم إيقاف السيرفر');
  });
});