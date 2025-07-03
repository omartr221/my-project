import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWorkerSchema, insertTaskSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketClient extends WebSocket {
  isAlive?: boolean;
}

let wss: WebSocketServer;
const clients = new Set<WebSocketClient>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint - required for Autoscale deployment
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Note: Root path "/" is handled by Vite in development and static files in production

  // Worker routes
  app.get("/api/workers", async (req, res) => {
    try {
      const workers = await storage.getWorkers();
      res.json(workers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      res.status(500).json({ message: "Failed to fetch workers" });
    }
  });

  // Get all worker names (for dropdown)
  app.get("/api/workers/names", async (req, res) => {
    try {
      const workers = await storage.getAllWorkerNames();
      res.json(workers);
    } catch (error) {
      console.error("Error fetching worker names:", error);
      res.status(500).json({ message: "Failed to fetch worker names" });
    }
  });

  app.post("/api/workers", async (req, res) => {
    try {
      const workerData = insertWorkerSchema.parse(req.body);
      const worker = await storage.createWorker(workerData);
      
      // Broadcast update to all clients
      broadcastUpdate("worker_created", worker);
      
      res.json(worker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid worker data", errors: error.errors });
      } else {
        console.error("Error creating worker:", error);
        res.status(500).json({ message: "Failed to create worker" });
      }
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/active", async (req, res) => {
    try {
      const activeTasks = await storage.getActiveTasks();
      res.json(activeTasks);
    } catch (error) {
      console.error("Error fetching active tasks:", error);
      res.status(500).json({ message: "Failed to fetch active tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      // Remove taskNumber from request body since it's generated on server
      const { taskNumber, ...requestData } = req.body;
      const taskData = insertTaskSchema.parse(requestData);
      const task = await storage.createTask(taskData);
      
      // Broadcast update to all clients
      broadcastUpdate("task_created", task);
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  // Task control routes
  app.post("/api/tasks/:id/pause", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.pauseTask(taskId);
      
      broadcastUpdate("task_paused", task);
      
      res.json(task);
    } catch (error) {
      console.error("Error pausing task:", error);
      res.status(500).json({ message: "Failed to pause task" });
    }
  });

  app.post("/api/tasks/:id/resume", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const timeEntry = await storage.resumeTask(taskId);
      
      broadcastUpdate("task_resumed", { taskId, timeEntry });
      
      res.json(timeEntry);
    } catch (error) {
      console.error("Error resuming task:", error);
      res.status(500).json({ message: "Failed to resume task" });
    }
  });

  app.post("/api/tasks/:id/finish", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.finishTask(taskId);
      
      broadcastUpdate("task_finished", task);
      
      res.json(task);
    } catch (error) {
      console.error("Error finishing task:", error);
      res.status(500).json({ message: "Failed to finish task" });
    }
  });

  // تعديل مهمة
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // التحقق من صحة البيانات
      if (updates.description !== undefined && typeof updates.description !== 'string') {
        return res.status(400).json({ error: "وصف المهمة يجب أن يكون نص" });
      }
      
      if (updates.estimatedDuration !== undefined && (typeof updates.estimatedDuration !== 'number' || updates.estimatedDuration <= 0)) {
        return res.status(400).json({ error: "الوقت المقدر يجب أن يكون رقم موجب" });
      }

      const task = await storage.updateTask(id, updates);
      
      broadcastUpdate('task_updated', task);
      res.json(task);
    } catch (error: any) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: error.message || "فشل في تعديل المهمة" });
    }
  });

  // Statistics route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getWorkerStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Task history route
  app.get("/api/tasks/history", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const history = await storage.getTaskHistory(limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching task history:", error);
      res.status(500).json({ message: "Failed to fetch task history" });
    }
  });

  // Archive routes
  app.post("/api/tasks/:id/archive", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { archivedBy, notes, rating } = req.body;
      
      if (!archivedBy) {
        return res.status(400).json({ message: "archivedBy is required" });
      }
      
      const task = await storage.archiveTask(taskId, archivedBy, notes, rating);
      broadcastUpdate("task_archived", task);
      res.json(task);
    } catch (error) {
      console.error("Error archiving task:", error);
      res.status(500).json({ message: "Failed to archive task" });
    }
  });

  // Cancel task route
  app.post("/api/tasks/:id/cancel", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { cancelledBy, reason } = req.body;
      
      if (!cancelledBy || !reason) {
        return res.status(400).json({ message: "cancelledBy and reason are required" });
      }
      
      const task = await storage.cancelTask(taskId, cancelledBy, reason);
      broadcastUpdate("task_cancelled", task);
      res.json(task);
    } catch (error) {
      console.error("Error cancelling task:", error);
      res.status(500).json({ message: "Failed to cancel task" });
    }
  });

  app.get("/api/archive", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const archive = await storage.getArchivedTasks(limit);
      res.json(archive);
    } catch (error) {
      console.error("Error fetching archive:", error);
      res.status(500).json({ message: "Failed to fetch archive" });
    }
  });

  app.get("/api/archive/search", async (req, res) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }
      
      const results = await storage.searchArchive(searchTerm);
      res.json(results);
    } catch (error) {
      console.error("Error searching archive:", error);
      res.status(500).json({ message: "Failed to search archive" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketClient) => {
    ws.isAlive = true;
    clients.add(ws);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send initial data
    sendInitialData(ws);
  });

  // Heartbeat to keep connections alive
  setInterval(() => {
    clients.forEach((ws) => {
      if (!ws.isAlive) {
        clients.delete(ws);
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Send timer updates every second
  setInterval(() => {
    broadcastUpdate("timer_tick", { timestamp: Date.now() });
  }, 1000);

  return httpServer;
}

function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

async function sendInitialData(ws: WebSocket) {
  try {
    const [workers, activeTasks, stats] = await Promise.all([
      storage.getWorkers(),
      storage.getActiveTasks(),
      storage.getWorkerStats(),
    ]);

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "initial_data",
        data: {
          workers,
          activeTasks,
          stats,
        },
      }));
    }
  } catch (error) {
    console.error("Error sending initial data:", error);
  }
}
