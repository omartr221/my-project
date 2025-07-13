import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWorkerSchema, insertTaskSchema, insertCustomerSchema, insertCustomerCarSchema, insertPartsRequestSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

interface WebSocketClient extends WebSocket {
  isAlive?: boolean;
}

let wss: WebSocketServer;
const clients = new Set<WebSocketClient>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

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
      
      console.log(`Updating task ${id} with data:`, updates);
      
      // التحقق من صحة البيانات
      if (updates.description !== undefined && typeof updates.description !== 'string') {
        return res.status(400).json({ error: "وصف المهمة يجب أن يكون نص" });
      }
      
      if (updates.estimatedDuration !== undefined && (typeof updates.estimatedDuration !== 'number' || updates.estimatedDuration <= 0)) {
        return res.status(400).json({ error: "الوقت المقدر يجب أن يكون رقم موجب" });
      }

      const task = await storage.updateTask(id, updates);
      console.log("Task updated successfully:", task);
      
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

  // Get car data by license plate for autofill
  app.get("/api/cars/:licensePlate", async (req, res) => {
    try {
      const licensePlate = req.params.licensePlate;
      const carData = await storage.getCarDataByLicensePlate(licensePlate);
      
      if (!carData) {
        return res.status(404).json({ message: "Car not found" });
      }
      
      res.json(carData);
    } catch (error) {
      console.error("Error fetching car data:", error);
      res.status(500).json({ message: "Failed to fetch car data" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      
      broadcastUpdate("customer_created", customer);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid customer data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, updates);
      
      broadcastUpdate("customer_updated", customer);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid customer data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      
      broadcastUpdate("customer_deleted", { id });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Customer cars routes
  app.get("/api/customer-cars", async (req, res) => {
    try {
      const cars = await storage.getCustomerCars();
      res.json(cars);
    } catch (error) {
      console.error("Error fetching customer cars:", error);
      res.status(500).json({ message: "Failed to fetch customer cars" });
    }
  });

  app.get("/api/customer-cars/customer/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const cars = await storage.getCustomerCarsByCustomerId(customerId);
      res.json(cars);
    } catch (error) {
      console.error("Error fetching customer cars:", error);
      res.status(500).json({ message: "Failed to fetch customer cars" });
    }
  });

  app.get("/api/customer-cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCustomerCar(id);
      
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      
      res.json(car);
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  app.post("/api/customer-cars", async (req, res) => {
    try {
      const carData = insertCustomerCarSchema.parse(req.body);
      const car = await storage.createCustomerCar(carData);
      
      broadcastUpdate("customer_car_created", car);
      res.status(201).json(car);
    } catch (error) {
      console.error("Error creating customer car:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid car data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create customer car" });
    }
  });

  app.put("/api/customer-cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCustomerCarSchema.partial().parse(req.body);
      const car = await storage.updateCustomerCar(id, updates);
      
      broadcastUpdate("customer_car_updated", car);
      res.json(car);
    } catch (error) {
      console.error("Error updating customer car:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid car data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update customer car" });
    }
  });

  app.delete("/api/customer-cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomerCar(id);
      
      broadcastUpdate("customer_car_deleted", { id });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer car:", error);
      res.status(500).json({ message: "Failed to delete customer car" });
    }
  });

  // Parts requests routes
  app.get("/api/parts-requests", async (req, res) => {
    try {
      const requests = await storage.getPartsRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching parts requests:", error);
      res.status(500).json({ message: "Failed to fetch parts requests" });
    }
  });

  app.get("/api/parts-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getPartsRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Parts request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching parts request:", error);
      res.status(500).json({ message: "Failed to fetch parts request" });
    }
  });

  app.post("/api/parts-requests", async (req, res) => {
    try {
      console.log("📦 Received parts request data:", JSON.stringify(req.body, null, 2));
      
      const requestData = insertPartsRequestSchema.parse(req.body);
      console.log("✅ Parsed request data:", JSON.stringify(requestData, null, 2));
      
      const request = await storage.createPartsRequest(requestData);
      console.log("📋 Created request:", JSON.stringify(request, null, 2));
      
      // إرسال حدث مخصص للإشعارات
      if (request.engineerName && request.partName) {
        const eventData = {
          id: request.id,
          engineer: request.engineerName,
          partName: request.partName,
          requestNumber: request.requestNumber
        };
        
        // إرسال إشعار عبر WebSocket
        broadcastUpdate("parts_request_created", request);
        
        // تسجيل الحدث للتحقق
        console.log("🔔 Broadcasting parts request notification:", JSON.stringify(eventData, null, 2));
      }
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating parts request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create parts request" });
    }
  });

  app.patch("/api/parts-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      const request = await storage.updatePartsRequestStatus(id, status, notes);
      
      broadcastUpdate("parts_request_updated", request);
      res.json(request);
    } catch (error) {
      console.error("Error updating parts request status:", error);
      res.status(500).json({ message: "Failed to update parts request status" });
    }
  });

  app.get("/api/search-car-info", async (req, res) => {
    try {
      const { term } = req.query;
      if (!term) {
        return res.status(400).json({ message: "Search term is required" });
      }
      
      const carInfo = await storage.searchCarInfoForParts(term as string);
      res.json(carInfo);
    } catch (error) {
      console.error("Error searching car info:", error);
      res.status(500).json({ message: "Failed to search car info" });
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

  // Send timer updates more frequently for better precision (every 100ms)
  setInterval(() => {
    broadcastUpdate("timer_tick", { timestamp: Date.now() });
  }, 100);

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
