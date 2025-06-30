// V POWER TUNING Production Server
const express = require('express');
const { Pool } = require('@neondatabase/serverless');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

// إعداد قاعدة البيانات
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'your_database_url_here'
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'dist')));

// WebSocket setup
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('عميل جديد متصل');
  sendInitialData(ws);
  
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

async function sendInitialData(ws) {
  try {
    const [workersResult, tasksResult] = await Promise.all([
      pool.query('SELECT * FROM workers ORDER BY name'),
      pool.query(`
        SELECT t.*, w.name as worker_name 
        FROM tasks t 
        LEFT JOIN workers w ON t.worker_id = w.id 
        WHERE t.status IN ('pending', 'in_progress', 'paused')
        ORDER BY t.created_at DESC
      `)
    ]);

    const workers = workersResult.rows.map(worker => ({
      ...worker,
      tasks: tasksResult.rows.filter(t => t.worker_id === worker.id),
      isAvailable: !tasksResult.rows.some(t => t.worker_id === worker.id && t.status === 'in_progress')
    }));

    const activeTasks = tasksResult.rows.filter(t => t.status === 'in_progress').length;
    const busyWorkers = new Set(tasksResult.rows.filter(t => t.status === 'in_progress').map(t => t.worker_id)).size;

    ws.send(JSON.stringify({
      type: 'initial_data',
      data: {
        workers,
        tasks: tasksResult.rows,
        stats: {
          totalWorkers: workers.length,
          availableWorkers: workers.length - busyWorkers,
          busyWorkers,
          activeTasks
        }
      }
    }));
  } catch (error) {
    console.error('خطأ في إرسال البيانات الأولية:', error);
  }
}

// API Routes
app.get('/api/workers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, 
        COUNT(t.id) as task_count,
        CASE WHEN EXISTS(SELECT 1 FROM tasks WHERE worker_id = w.id AND status = 'in_progress') 
             THEN false ELSE true END as is_available
      FROM workers w 
      LEFT JOIN tasks t ON w.id = t.worker_id 
      GROUP BY w.id 
      ORDER BY w.name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workers/names', async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM workers ORDER BY name');
    res.json(result.rows.map(w => w.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/active', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, w.name as worker_name
      FROM tasks t
      LEFT JOIN workers w ON t.worker_id = w.id
      WHERE t.status IN ('pending', 'in_progress', 'paused')
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, w.name as worker_name
      FROM tasks t
      LEFT JOIN workers w ON t.worker_id = w.id
      WHERE t.status = 'completed'
      ORDER BY t.completed_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/archive', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, w.name as worker_name
      FROM tasks t
      LEFT JOIN workers w ON t.worker_id = w.id
      WHERE t.archived_at IS NOT NULL
      ORDER BY t.archived_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [workersResult, tasksResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM workers'),
      pool.query(`
        SELECT 
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_tasks,
          COUNT(DISTINCT CASE WHEN status = 'in_progress' THEN worker_id END) as busy_workers
        FROM tasks
      `)
    ]);

    const totalWorkers = parseInt(workersResult.rows[0].total);
    const activeTasks = parseInt(tasksResult.rows[0].active_tasks);
    const busyWorkers = parseInt(tasksResult.rows[0].busy_workers);

    res.json({
      totalWorkers,
      availableWorkers: totalWorkers - busyWorkers,
      busyWorkers,
      activeTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST routes for task operations
app.post('/api/tasks', async (req, res) => {
  try {
    const { description, carBrand, carModel, licensePlate, estimatedDuration, engineerId, supervisorId, technicianId, assistantId, repairOperation } = req.body;
    
    const result = await pool.query(`
      INSERT INTO tasks (description, car_brand, car_model, license_plate, estimated_duration, worker_id, engineer_id, supervisor_id, assistant_id, repair_operation, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW())
      RETURNING *
    `, [description, carBrand, carModel, licensePlate, estimatedDuration, technicianId, engineerId, supervisorId, assistantId, repairOperation]);
    
    broadcastUpdate('task_created', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:id/start', async (req, res) => {
  try {
    const taskId = req.params.id;
    const result = await pool.query(`
      UPDATE tasks SET status = 'in_progress', started_at = NOW() WHERE id = $1 RETURNING *
    `, [taskId]);
    
    await pool.query(`
      INSERT INTO time_entries (task_id, start_time, type) VALUES ($1, NOW(), 'work')
    `, [taskId]);
    
    broadcastUpdate('task_started', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:id/finish', async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // إنهاء التسجيل النشط
    await pool.query(`
      UPDATE time_entries SET end_time = NOW() 
      WHERE task_id = $1 AND end_time IS NULL
    `, [taskId]);
    
    // حساب المدة الإجمالية
    const durationResult = await pool.query(`
      SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))), 0) as total_duration
      FROM time_entries WHERE task_id = $1 AND end_time IS NOT NULL
    `, [taskId]);
    
    const totalDuration = Math.floor(durationResult.rows[0].total_duration);
    
    const result = await pool.query(`
      UPDATE tasks SET 
        status = 'completed', 
        completed_at = NOW(),
        actual_duration = $2
      WHERE id = $1 RETURNING *
    `, [taskId, totalDuration]);
    
    broadcastUpdate('task_completed', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:id/archive', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { notes, rating, archivedBy } = req.body;
    
    const result = await pool.query(`
      UPDATE tasks SET 
        archived_at = NOW(),
        archived_by = $2,
        notes = $3,
        rating = $4
      WHERE id = $1 RETURNING *
    `, [taskId, archivedBy, notes, rating]);
    
    broadcastUpdate('task_archived', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { description, estimatedDuration, repairOperation } = req.body;
    
    const result = await pool.query(`
      UPDATE tasks SET 
        description = COALESCE($2, description),
        estimated_duration = COALESCE($3, estimated_duration),
        repair_operation = COALESCE($4, repair_operation)
      WHERE id = $1 RETURNING *
    `, [taskId, description, estimatedDuration, repairOperation]);
    
    broadcastUpdate('task_updated', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log('🚀 V POWER TUNING Production Server');
  console.log(`   - المنفذ: ${PORT}`);
  console.log(`   - من هذا الجهاز: http://localhost:${PORT}`);
  console.log(`   - من أجهزة أخرى: http://[IP-ADDRESS]:${PORT}`);
  console.log('📊 قاعدة البيانات: PostgreSQL');
  console.log('🔄 WebSocket: مفعل');
  console.log('✅ النظام جاهز للعمل');
});

process.on('SIGTERM', () => {
  console.log('إيقاف السيرفر...');
  server.close(() => {
    console.log('تم إيقاف السيرفر');
  });
});