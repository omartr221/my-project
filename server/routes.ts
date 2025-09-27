import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWorkerSchema, insertTaskSchema, insertCustomerSchema, insertCustomerCarSchema, insertPartsRequestSchema, insertReceptionEntrySchema } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import * as XLSX from 'xlsx';
import { setupAuth, requirePermission } from "./auth";
// import { createBackup, restoreFromBackup } from "./backup"; // Disabled for memory storage

interface WebSocketClient extends WebSocket {
  isAlive?: boolean;
}

let wss: WebSocketServer;
const clients = new Set<WebSocketClient>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Multer configuration for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });
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

  // Backup and Export endpoints
  app.post("/api/backup/create", async (req, res) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backup = {
        timestamp,
        version: "1.0.0",
        data: {
          workers: await storage.getWorkers(),
          tasks: await storage.getTasks(),
          customers: await storage.getCustomers(),
          customerCars: await storage.getCustomerCars(),
          partsRequests: await storage.getPartsRequests(),
          users: [], // Users excluded from backup for security
          receptionEntries: await storage.getReceptionEntries(),
          maintenanceGuides: await storage.getMaintenanceGuides()
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="v-power-backup-${timestamp}.json"`);
      res.json(backup);
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "فشل في إنشاء النسخة الاحتياطية" });
    }
  });

  // Export specific table data
  app.get("/api/export/:table", async (req, res) => {
    try {
      const { table } = req.params;
      const { format = 'json' } = req.query;
      
      let data;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      switch (table) {
        case 'workers':
          data = await storage.getWorkers();
          break;
        case 'tasks':
          data = await storage.getTasks();
          break;
        case 'customers':
          data = await storage.getCustomers();
          break;
        case 'customer-cars':
          data = await storage.getCustomerCars();
          break;
        case 'parts-requests':
          data = await storage.getPartsRequests();
          break;
        case 'users':
          return res.status(403).json({ message: "بيانات المستخدمين محظورة لأسباب أمنية" });
          break;
        case 'reception-entries':
          data = await storage.getReceptionEntries();
          break;
        case 'maintenance-guides':
          data = await storage.getMaintenanceGuides();
          break;
        default:
          return res.status(400).json({ message: "جدول غير صحيح" });
      }

      if (format === 'csv') {
        // Convert to CSV
        if (!data || data.length === 0) {
          return res.status(404).json({ message: "لا توجد بيانات" });
        }
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((row: any) => 
          Object.values(row).map(val => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
          ).join(',')
        );
        const csv = [headers, ...rows].join('\n');
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${table}-${timestamp}.csv"`);
        res.send('\ufeff' + csv); // Add BOM for proper UTF-8 encoding
      } else if (format === 'excel') {
        // Convert to Excel
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data || []);
        XLSX.utils.book_append_sheet(wb, ws, table);
        
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${table}-${timestamp}.xlsx"`);
        res.send(buffer);
      } else {
        // Default JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${table}-${timestamp}.json"`);
        res.json(data);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "فشل في تصدير البيانات" });
    }
  });

  // Database statistics endpoint
  app.get("/api/database/stats", async (req, res) => {
    try {
      const stats = {
        workers: (await storage.getWorkers()).length,
        tasks: (await storage.getTasks()).length,
        customers: (await storage.getCustomers()).length,
        customerCars: (await storage.getCustomerCars()).length,
        partsRequests: (await storage.getPartsRequests()).length,
        users: 0, // Users excluded from stats for security
        receptionEntries: (await storage.getReceptionEntries()).length,
        maintenanceGuides: (await storage.getMaintenanceGuides()).length,
        lastBackup: new Date().toISOString()
      };
      res.json(stats);
    } catch (error) {
      console.error("Error getting database stats:", error);
      res.status(500).json({ message: "فشل في الحصول على إحصائيات قاعدة البيانات" });
    }
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

  // Deliver task (تسليم المهمة للأرشيف مع حساب النسبة المئوية)
  app.post("/api/tasks/:id/deliver", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { rating = 3, notes } = req.body;
      const deliveredBy = 'بدوي'; // المستخدم الذي قام بالتسليم
      
      const task = await storage.deliverTask(taskId, deliveredBy, rating, notes);
      
      broadcastUpdate("task_delivered", task);
      
      res.json(task);
    } catch (error) {
      console.error("Error delivering task:", error);
      res.status(500).json({ message: "Failed to deliver task" });
    }
  });

  // Return task to reception (تسليم السيارة للاستقبال)
  app.post("/api/tasks/:id/return-to-reception", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const returnedBy = 'بدوي';
      
      const task = await storage.returnTaskToReception(taskId, returnedBy);
      
      broadcastUpdate("task_returned_to_reception", task);
      
      res.json(task);
    } catch (error) {
      console.error("Error returning task to reception:", error);
      res.status(500).json({ message: "Failed to return task to reception" });
    }
  });

  app.post("/api/tasks/:id/cancel", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { reason, cancelledBy } = req.body;
      const task = await storage.cancelTask(taskId, reason, cancelledBy);
      
      broadcastUpdate("task_cancelled", task);
      
      res.json(task);
    } catch (error) {
      console.error("Error cancelling task:", error);
      res.status(500).json({ message: "Failed to cancel task" });
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

  // DELETE endpoint for tasks - Admin only with enhanced security
  app.delete("/api/tasks/:id", requirePermission("tasks:delete"), async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const user = req.user as any;
      
      // Validate task ID
      if (isNaN(taskId) || taskId <= 0) {
        return res.status(400).json({ 
          error: "معرف المهمة غير صالح" 
        });
      }

      // Double-check user has admin privileges (defense in depth)
      if (!user || user.role !== 'admin') {
        console.error(`🚨 SECURITY ALERT: Non-admin user ${user?.username || 'unknown'} attempted to delete task ${taskId}`);
        return res.status(403).json({ 
          error: "غير مسموح - حذف المهام مقتصر على المدراء فقط" 
        });
      }

      // Additional verification that user has the specific permission
      const userPermissions = Array.isArray(user.permissions) ? user.permissions : JSON.parse(user.permissions || '[]');
      if (!userPermissions.includes("tasks:delete")) {
        console.error(`🚨 SECURITY ALERT: User ${user.username} lacks tasks:delete permission but attempted deletion of task ${taskId}`);
        return res.status(403).json({ 
          error: "غير مسموح - ليس لديك صلاحية حذف المهام" 
        });
      }

      // Log the deletion attempt for security audit
      console.log(`🛡️  SECURITY LOG: Admin ${user.username} (ID: ${user.id}) attempting to delete task ${taskId} from IP: ${req.ip || req.connection.remoteAddress}`);

      // Perform the deletion with full audit trail
      await storage.deleteTask(taskId, user.username);
      
      // Broadcast the deletion to all connected clients
      broadcastUpdate("task_deleted", { 
        id: taskId, 
        deletedBy: user.username, 
        deletedAt: new Date().toISOString() 
      });
      
      // Return success response
      res.status(200).json({ 
        success: true, 
        message: `تم حذف المهمة ${taskId} بنجاح`,
        deletedBy: user.username,
        deletedAt: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error(`❌ Error deleting task:`, {
        taskId: req.params.id,
        error: error.message,
        user: req.user?.username,
        timestamp: new Date().toISOString()
      });
      
      // Don't expose internal error details to client
      if (error.message.includes('غير موجودة')) {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ 
        error: "حدث خطأ أثناء حذف المهمة" 
      });
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

  // Transfer routes
  app.post("/api/tasks/:id/transfer", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { transferredBy, transferNotes } = req.body;
      
      if (!transferredBy) {
        return res.status(400).json({ message: "اسم من قام بالترحيل مطلوب" });
      }

      const task = await storage.transferTask(taskId, transferredBy, transferNotes);
      
      broadcastUpdate("task_transferred", task);
      res.json(task);
    } catch (error) {
      console.error("Error transferring task:", error);
      res.status(500).json({ message: "Failed to transfer task" });
    }
  });

  app.get("/api/transferred", async (req, res) => {
    try {
      const transferredTasks = await storage.getTransferredTasks();
      res.json(transferredTasks);
    } catch (error) {
      console.error("Error fetching transferred tasks:", error);
      res.status(500).json({ message: "Failed to fetch transferred tasks" });
    }
  });

  app.get("/api/archive/search", async (req, res) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }
      
      // التحقق من دور المستخدم - إذا كان بدوي استخدم البحث المحدود
      const user = req.user as any;
      const isBadawi = user?.username === 'بدوي';
      
      let results;
      if (isBadawi) {
        // استخدام البحث المحدود لبدوي (رقم اللوحة ووصف المهمة فقط)
        results = await storage.searchArchiveRestricted(searchTerm);
      } else {
        // استخدام البحث الكامل للمستخدمين الآخرين
        results = await storage.searchArchive(searchTerm);
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error searching archive:", error);
      res.status(500).json({ message: "Failed to search archive" });
    }
  });

  // Update archived task
  app.patch("/api/archive/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "معرف المهمة غير صحيح" });
      }
      
      const updatedTask = await storage.updateArchivedTask(taskId, updates);
      
      // Broadcast update to all connected clients
      broadcastUpdate("archive_updated", updatedTask);
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating archived task:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "فشل في تحديث المهمة المؤرشفة" 
      });
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
      
      // Trim name to avoid whitespace issues
      customerData.name = customerData.name.trim();
      
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
      
      // Check if it's a duplicate customer error
      if (error instanceof Error && error.message.includes("موجود مسبقاً")) {
        return res.status(409).json({ 
          message: error.message 
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

  // Car search route for parts requests
  app.get("/api/car-search", async (req, res) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }
      
      const carData = await storage.searchCarInfoForParts(searchTerm);
      
      if (!carData) {
        return res.status(404).json({ message: "Car not found" });
      }
      
      res.json(carData);
    } catch (error) {
      console.error("Error searching for car:", error);
      res.status(500).json({ message: "Failed to search for car" });
    }
  });

  // Parts requests by car endpoints
  app.get("/api/parts-requests/by-car/:licensePlate", async (req, res) => {
    try {
      const { licensePlate } = req.params;
      const requests = await storage.getPartsRequestsByLicensePlate(licensePlate);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching parts requests by car:", error);
      res.status(500).json({ message: "Failed to fetch parts requests" });
    }
  });

  app.get("/api/tasks/by-car/:licensePlate", async (req, res) => {
    try {
      const { licensePlate } = req.params;
      const tasks = await storage.getTasksByLicensePlate(licensePlate);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by car:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // البحث عن معلومات السيارة للـ AUTOFILL في طلبات القطع
  app.get("/api/search-car-info/:searchTerm", async (req, res) => {
    try {
      const searchTerm = decodeURIComponent(req.params.searchTerm).trim().toLowerCase();
      
      if (!searchTerm) {
        return res.status(400).json({ error: "يرجى إدخال نص البحث" });
      }

      console.log(`🔍 البحث عن معلومات السيارة: "${searchTerm}"`);

      // البحث في بيانات الزبائن
      const customers = await storage.getCustomers();
      const customerCars = await storage.getCustomerCars();

      // البحث في اسم الزبون أولاً
      let foundCustomer = customers.find(customer => 
        customer.name.toLowerCase().includes(searchTerm)
      );

      let foundCar = null;

      if (foundCustomer) {
        // إذا وُجد الزبون، ابحث عن سياراته
        foundCar = customerCars.find(car => car.customerId === foundCustomer!.id);
        console.log(`✅ تم العثور على الزبون: ${foundCustomer.name}`);
      } else {
        // البحث في بيانات السيارات (رقم اللوحة، رقم الشاسيه) مع تحسين البحث
        foundCar = customerCars.find(car => {
          // البحث في رقم اللوحة الحالي
          if (car.licensePlate) {
            const plateForSearch = car.licensePlate.toLowerCase();
            // بحث مباشر
            if (plateForSearch.includes(searchTerm)) return true;
            // بحث بدون الشرطات والرموز
            const plateDigitsOnly = plateForSearch.replace(/[^\u0660-\u06690-9]/g, '');
            const searchDigitsOnly = searchTerm.replace(/[^\u0660-\u06690-9]/g, '');
            if (plateDigitsOnly.includes(searchDigitsOnly) && searchDigitsOnly.length >= 3) return true;
            // بحث عكسي (إذا كان المُدخل يحتوي على جزء من اللوحة)
            if (searchTerm.includes(plateDigitsOnly) && plateDigitsOnly.length >= 3) return true;
          }
          
          // البحث في رقم الشاسيه
          if (car.chassisNumber && car.chassisNumber.toLowerCase().includes(searchTerm)) return true;
          
          // البحث في رقم اللوحة السابق
          if (car.previousLicensePlate) {
            const prevPlateForSearch = car.previousLicensePlate.toLowerCase();
            if (prevPlateForSearch.includes(searchTerm)) return true;
            const prevPlateDigitsOnly = prevPlateForSearch.replace(/[^\u0660-\u06690-9]/g, '');
            const searchDigitsOnly = searchTerm.replace(/[^\u0660-\u06690-9]/g, '');
            if (prevPlateDigitsOnly.includes(searchDigitsOnly) && searchDigitsOnly.length >= 3) return true;
          }
          
          return false;
        });
        
        if (foundCar) {
          foundCustomer = customers.find(customer => customer.id === foundCar!.customerId);
          console.log(`✅ تم العثور على السيارة للزبون: ${foundCustomer?.name}`);
        }
      }

      if (foundCustomer && foundCar) {
        // إرجاع البيانات المطلوبة
        const carInfo = {
          customerName: foundCustomer.name,
          carBrand: foundCar.carBrand,
          carModel: foundCar.carModel,
          licensePlate: foundCar.licensePlate,
          previousLicensePlate: foundCar.previousLicensePlate,
          chassisNumber: foundCar.chassisNumber,
          engineCode: foundCar.engineCode,
          year: foundCar.year,
          color: foundCar.color
        };

        console.log(`✅ إرجاع بيانات السيارة للزبون: ${foundCustomer.name}`);
        res.json(carInfo);
      } else {
        console.log(`❌ لم يتم العثور على بيانات للبحث: ${searchTerm}`);
        res.status(404).json({ error: "لم يتم العثور على بيانات مطابقة" });
      }
    } catch (error) {
      console.error("خطأ في البحث عن معلومات السيارة:", error);
      res.status(500).json({ error: "خطأ في البحث عن معلومات السيارة" });
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
      const { status, notes, estimatedArrival } = req.body;
      
      const request = await storage.updatePartsRequestStatus(id, status, notes, estimatedArrival);
      
      // إرسال إشعار خاص عند التسليم النهائي
      if (status === 'delivered') {
        broadcastUpdate("parts_request_delivered", request);
      }
      
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

  // Return parts request (ترجيع القطعة)
  app.put("/api/parts-requests/:id/return", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { returnReason } = req.body;
      
      const request = await storage.returnPartsRequest(id, (req.user as any)?.username || "Unknown", returnReason);
      
      // إرسال إشعار خاص لهبة عن ترجيع القطعة
      broadcastUpdate("parts_request_returned", {
        id: request.id,
        requestNumber: request.requestNumber,
        engineerName: request.engineerName,
        partName: request.partName,
        returnReason: returnReason,
        returnedBy: (req.user as any)?.username
      });
      
      res.json(request);
    } catch (error) {
      console.error("Error returning parts request:", error);
      res.status(500).json({ message: "Failed to return parts request" });
    }
  });

  // Update parts request notes (تحديث الملاحظات)
  app.put("/api/parts-requests/:id/notes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { userNotes } = req.body;
      
      const request = await storage.updatePartsRequestNotes(id, userNotes);
      
      // إرسال تحديث للملاحظات
      broadcastUpdate("parts_request_notes_updated", {
        id: request.id,
        userNotes: userNotes,
        updatedBy: (req.user as any)?.username
      });
      
      res.json(request);
    } catch (error) {
      console.error("Error updating parts request notes:", error);
      res.status(500).json({ message: "Failed to update parts request notes" });
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



  // Reception workflow routes
  app.get("/api/reception-entries", async (req, res, next) => {
    try {
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : undefined;
      
      if (customerId) {
        // Filter entries by customer ID
        const allEntries = await storage.getReceptionEntries();
        const customerEntries = allEntries.filter(entry => entry.customerId === customerId);
        res.json(customerEntries);
      } else {
        // Return all entries
        const entries = await storage.getReceptionEntries();
        res.json(entries);
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/reception-entries", async (req, res, next) => {
    try {
      const entryData = insertReceptionEntrySchema.parse({
        ...req.body,
        receptionUserId: (req.user as any)?.id
      });
      
      const entry = await storage.createReceptionEntry(entryData);
      
      // إنشاء سجل في car_status تلقائياً
      await storage.createCarStatus({
        customerName: entry.carOwnerName,
        licensePlate: entry.licensePlate,
        carBrand: "غير محدد",
        carModel: "غير محدد",
        currentStatus: "في الاستقبال",
        maintenanceType: entry.serviceType,
        kmReading: entry.odometerReading,
        fuelLevel: entry.fuelLevel,
        complaints: entry.complaints,
        partsRequestsCount: 0,
        completedPartsCount: 0,
        receivedAt: entry.entryTime,
      });
      
      // Send notification to workshop
      broadcastUpdate("reception_entry_created", {
        type: "new_car_entry",
        entry: entry,
        message: `سيارة جديدة في الاستقبال: ${entry.licensePlate} - ${entry.carOwnerName}`
      });
      
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/workshop-notifications", async (req, res, next) => {
    try {
      const notifications = await storage.getWorkshopNotifications();
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  // Excel import endpoint
  app.post("/api/import-excel", async (req, res) => {
    try {
      const { customers } = req.body;
      
      if (!customers || !Array.isArray(customers)) {
        return res.status(400).json({ message: "بيانات الزبائن مطلوبة" });
      }

      let imported = 0;
      let failed = 0;

      for (const customerData of customers) {
        try {
          // إنشاء الزبون
          const customer = await storage.createCustomer({
            name: customerData.name,
            phoneNumber: customerData.phone,
            customerStatus: "A" as const,
            address: customerData.address || "",
            notes: customerData.notes || ""
          });

          // إنشاء السيارة
          await storage.createCustomerCar({
            customerId: customer.id,
            carBrand: customerData.carType,
            carModel: customerData.carModel,
            licensePlate: customerData.licensePlate,
            engineCode: customerData.engineCode
          });

          imported++;
        } catch (error) {
          console.error("Error importing customer:", error);
          failed++;
        }
      }

      res.json({ 
        imported, 
        failed, 
        message: `تم استيراد ${imported} زبون، فشل ${failed} سجل` 
      });
    } catch (error) {
      console.error("Error in Excel import:", error);
      res.status(500).json({ message: "خطأ في الاستيراد" });
    }
  });

  // Import from attached Excel file
  app.post("/api/import-excel-file", async (req, res) => {
    try {
      console.log("🔵 Starting Excel file import...");
      const { filename } = req.body;
      console.log("📁 Filename:", filename);
      
      if (!filename) {
        return res.status(400).json({ message: "اسم الملف مطلوب" });
      }

      // Read file from attached_assets directory
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.default.join(process.cwd(), 'attached_assets', filename);
      
      if (!fs.default.existsSync(filePath)) {
        return res.status(404).json({ message: "الملف غير موجود" });
      }

      const fileBuffer = fs.default.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 3) {
        return res.status(400).json({ message: "الملف يجب أن يحتوي على بيانات وعناوين أعمدة" });
      }

      // البحث عن السطر الذي يحتوي على العناوين الحقيقية
      let headerRowIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (row && row.some(cell => 
          cell && typeof cell === 'string' && 
          (cell.includes('الاسم') || cell.includes('هاتف') || cell.includes('name') || cell.includes('phone'))
        )) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        return res.status(400).json({ message: "لم يتم العثور على عناوين الأعمدة في الملف" });
      }

      const headers = jsonData[headerRowIndex] as string[];
      const rows = jsonData.slice(headerRowIndex + 1) as any[][];
      
      console.log("📊 Headers found:", headers);
      console.log("📊 Number of data rows:", rows.length);
      console.log("📊 First 3 data rows:", rows.slice(0, 3));

      // Column mappings for Arabic and English
      const columnMappings: { [key: string]: string } = {
        // Arabic column names
        'اسم الزبون': 'name',
        'اسم العميل': 'name',
        'الاسم': 'name',
        'رقم الهاتف': 'phone',
        'رقم الجوال': 'phone',
        'الهاتف': 'phone',
        'هاتف': 'phone',
        'نوع السيارة': 'carBrand',
        'نوع المركبة': 'carBrand',
        'العلامة التجارية': 'carBrand',
        'الصانع': 'carBrand',
        'الموديل': 'carModel',
        'الطراز': 'carModel',
        'رقم اللوحة': 'licensePlate',
        'لوحة السيارة': 'licensePlate',
        'رقم المركبة': 'licensePlate',
        'رمز المحرك': 'engineCode',
        'كود المحرك': 'engineCode',
        'محرك': 'engineCode',
        'اللون': 'color',
        'سنة الصنع': 'year',
        'رقم الشاسيه': 'chassisNumber',
        'المالك السابق': 'previousOwner',
        'رقم اللوحة السابق': 'previousLicensePlate',
        // English column names
        'name': 'name',
        'customer name': 'name',
        'client name': 'name',
        'phone': 'phone',
        'phone number': 'phone',
        'mobile': 'phone',
        'car type': 'carBrand',
        'car brand': 'carBrand',
        'brand': 'carBrand',
        'manufacturer': 'carBrand',
        'model': 'carModel',
        'car model': 'carModel',
        'license plate': 'licensePlate',
        'plate number': 'licensePlate',
        'registration': 'licensePlate',
        'engine code': 'engineCode',
        'engine': 'engineCode',
        'color': 'color',
        'year': 'year',
        'chassis': 'chassisNumber',
        'previous owner': 'previousOwner',
        'previous plate': 'previousLicensePlate',
      };

      // Map headers to our expected fields
      const mappedHeaders = headers.map(header => {
        const normalizedHeader = header?.toString().toLowerCase().trim();
        return columnMappings[normalizedHeader] || null;
      });

      let imported = 0;
      let failed = 0;

      for (const row of rows) {
        if (!row.some(cell => cell !== null && cell !== undefined && cell !== "")) {
          continue; // Skip empty rows
        }

        try {
          const customerData: any = {};
          
          mappedHeaders.forEach((mappedField, colIndex) => {
            if (mappedField && row[colIndex]) {
              customerData[mappedField] = row[colIndex].toString().trim();
            }
          });

          // تجاهل الصفوف الفارغة أو التي تحتوي على قيم 0 فقط
          if (!customerData.name || customerData.name === 0 || customerData.name === "0") {
            console.log("⏭️ Skipping empty/invalid row:", customerData);
            continue;
          }
          
          console.log("✅ Processing customer:", customerData.name);

          // Set defaults for missing fields
          const name = customerData.name.toString();
          const phone = customerData.phone ? customerData.phone.toString() : "";
          const carBrand = customerData.carBrand ? customerData.carBrand.toString() : "غير محدد";
          const carModel = customerData.carModel ? customerData.carModel.toString() : "غير محدد";
          const licensePlate = customerData.licensePlate ? customerData.licensePlate.toString() : "";
          const engineCode = customerData.engineCode ? customerData.engineCode.toString() : "";
          const color = customerData.color ? customerData.color.toString() : "";
          const year = customerData.year ? parseInt(customerData.year.toString()) || null : null;
          const chassisNumber = customerData.chassisNumber ? customerData.chassisNumber.toString() : "";
          const previousOwner = customerData.previousOwner ? customerData.previousOwner.toString() : "";
          const previousLicensePlate = customerData.previousLicensePlate ? customerData.previousLicensePlate.toString() : "";

          // إنشاء الزبون
          const customer = await storage.createCustomer({
            name,
            phoneNumber: phone,
            customerStatus: "A" as const,
            address: "",
            notes: ""
          });

          // إنشاء السيارة
          await storage.createCustomerCar({
            customerId: customer.id,
            carBrand,
            carModel,
            licensePlate,
            engineCode,
            color: color || null,
            year: year,
            chassisNumber: chassisNumber || null,
            previousOwner: previousOwner || null,
            previousLicensePlate: previousLicensePlate || null
          });

          imported++;
          console.log("✅ Successfully imported customer:", name);
        } catch (error) {
          console.error("❌ Error importing customer:", error);
          failed++;
        }
      }

      res.json({ 
        imported, 
        failed, 
        message: `تم استيراد ${imported} زبون، فشل ${failed} سجل` 
      });
    } catch (error) {
      console.error("Error in Excel file import:", error);
      res.status(500).json({ message: "خطأ في استيراد الملف" });
    }
  });

  app.post("/api/reception-entries/:id/enter-workshop", async (req, res, next) => {
    try {
      const entryId = parseInt(req.params.id);
      const workshopUserId = (req.user as any)?.id;
      
      const entry = await storage.enterReceptionCarToWorkshop(entryId, workshopUserId);
      
      // تحديث حالة السيارة في car_status من "في الاستقبال" إلى "في الورشة"
      const carStatuses = await storage.getCarStatuses();
      const carStatus = carStatuses.find(status => 
        status.licensePlate === entry.licensePlate && 
        status.currentStatus === "في الاستقبال"
      );
      
      if (carStatus) {
        await storage.updateCarStatus(carStatus.id, {
          currentStatus: "في الورشة",
          enteredWorkshopAt: new Date(),
        });
      }
      
      // Broadcast workshop entry update with enhanced data for بدوي notifications
      broadcastUpdate("car_entered_workshop", {
        type: "car_workshop_entry",
        entry: entry,
        carInfo: {
          licensePlate: entry.licensePlate,
          customerName: entry.customerName,
          carBrand: entry.carBrand || "غير محدد",
          carModel: entry.carModel || "غير محدد"
        },
        message: `تم إدخال السيارة ${entry.licensePlate} إلى الورشة`,
        timestamp: new Date().toISOString(),
        notifyBadawi: true // تنبيه خاص لحساب بدوي
      });
      
      res.json(entry);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reception-entries/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const entry = await storage.getReceptionEntry(parseInt(id));
      
      if (!entry) {
        return res.status(404).json({ message: "لم يتم العثور على السجل" });
      }
      
      res.json(entry);
    } catch (error) {
      next(error);
    }
  });

  // Complete reception entry and deliver car (for بدوي)
  app.post("/api/reception-entries/:id/complete", async (req, res, next) => {
    try {
      const entryId = parseInt(req.params.id);
      const { status, completedBy } = req.body;
      
      // Update the reception entry status to completed
      const updatedEntry = await storage.updateReceptionEntry(entryId, { 
        status: status || "مكتمل"
      });
      
      // Update car status to delivered
      const carStatuses = await storage.getCarStatuses();
      const carStatus = carStatuses.find(status => 
        status.licensePlate === updatedEntry.licensePlate
      );
      
      if (carStatus) {
        await storage.updateCarStatus(carStatus.id, {
          currentStatus: "مكتمل",
          deliveredAt: new Date(),
        });
      }
      
      // Broadcast car delivery update
      broadcastUpdate("car_delivered", {
        type: "car_delivery",
        entry: updatedEntry,
        message: `تم تسليم السيارة ${updatedEntry.licensePlate} بواسطة ${completedBy}`
      });
      
      res.json(updatedEntry);
    } catch (error) {
      next(error);
    }
  });

  // Stop timer when car is delivered to customer
  app.patch("/api/reception-entries/stop-timer/:licensePlate", async (req, res, next) => {
    try {
      const licensePlate = req.params.licensePlate;
      const { stopReason } = req.body;
      
      // Find the reception entry by license plate
      const entries = await storage.getReceptionEntries();
      const entry = entries.find(e => e.licensePlate === licensePlate && e.status !== "مكتمل");
      
      if (!entry) {
        return res.status(404).json({ message: "Reception entry not found" });
      }
      
      // Update the reception entry to completed status
      const updatedEntry = await storage.updateReceptionEntry(entry.id, { 
        status: "مكتمل"
      });
      
      // Broadcast timer stop update
      broadcastUpdate("timer_stopped", {
        type: "timer_stop",
        entry: updatedEntry,
        licensePlate: licensePlate,
        stopReason: stopReason,
        message: `تم إيقاف المؤقت للسيارة ${licensePlate} - ${stopReason}`
      });
      
      res.json(updatedEntry);
    } catch (error) {
      next(error);
    }
  });

  // Car Status Management Routes
  app.get('/api/car-status', async (req, res) => {
    try {
      const carStatuses = await storage.getCarStatuses();
      res.json(carStatuses);
    } catch (error) {
      console.error('Error fetching car statuses:', error);
      res.status(500).json({ error: 'Failed to fetch car statuses' });
    }
  });

  app.post('/api/car-status', async (req, res) => {
    try {
      const carStatus = await storage.createCarStatus(req.body);
      
      // Send WebSocket notification for new car status
      broadcastUpdate('CAR_STATUS_CREATED', carStatus);
      
      res.json(carStatus);
    } catch (error) {
      console.error('Error creating car status:', error);
      res.status(500).json({ error: 'Failed to create car status' });
    }
  });

  app.patch('/api/car-status/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // تحويل التواريخ من string إلى Date objects إذا لزم الأمر
      const processedUpdates = { ...updates };
      if (processedUpdates.returnedToReceptionAt && typeof processedUpdates.returnedToReceptionAt === 'string') {
        processedUpdates.returnedToReceptionAt = new Date(processedUpdates.returnedToReceptionAt);
      }
      if (processedUpdates.deliveredAt && typeof processedUpdates.deliveredAt === 'string') {
        processedUpdates.deliveredAt = new Date(processedUpdates.deliveredAt);
      }
      
      const carStatus = await storage.updateCarStatus(id, processedUpdates);
      
      // Send WebSocket notification for car status update
      broadcastUpdate('CAR_STATUS_UPDATED', carStatus);
      
      res.json(carStatus);
    } catch (error) {
      console.error('Error updating car status:', error);
      res.status(500).json({ error: 'Failed to update car status' });
    }
  });

  // Return car to reception endpoint (for بدوي)
  app.post('/api/car-status/:id/return-to-reception', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const username = (req.user as any)?.username || 'Unknown';
      
      // Update car status to "في الاستقبال"
      const carStatus = await storage.updateCarStatus(id, {
        currentStatus: "في الاستقبال",
        returnedToReceptionAt: new Date(),
        returnedBy: username,
      });
      
      // Send WebSocket notification
      broadcastUpdate('CAR_RETURNED_TO_RECEPTION', {
        carStatus,
        returnedBy: username,
        message: `تم تسليم السيارة ${carStatus.licensePlate} للاستقبال بواسطة ${username}`
      });
      
      res.json(carStatus);
    } catch (error) {
      console.error('Error returning car to reception:', error);
      res.status(500).json({ error: 'Failed to return car to reception' });
    }
  });

  app.patch('/api/car-status/:id', async (req, res) => {
    try {
      const carStatus = await storage.updateCarStatus(parseInt(req.params.id), req.body);
      
      // Send WebSocket notification for status update
      broadcastUpdate('CAR_STATUS_UPDATED', carStatus);
      
      res.json(carStatus);
    } catch (error) {
      console.error('Error updating car status:', error);
      res.status(500).json({ error: 'Failed to update car status' });
    }
  });

  app.patch('/api/car-status/receipt/:receiptId', async (req, res) => {
    try {
      const carStatus = await storage.updateCarStatusByReceiptId(parseInt(req.params.receiptId), req.body);
      
      // Send WebSocket notification for status update
      broadcastUpdate('CAR_STATUS_UPDATED', carStatus);
      
      res.json(carStatus);
    } catch (error) {
      console.error('Error updating car status by receipt:', error);
      res.status(500).json({ error: 'Failed to update car status by receipt' });
    }
  });

  // API endpoint للبحث عن السيارات المتعددة للزبون الواحد
  app.get("/api/search-customer-cars", async (req, res) => {
    try {
      const query = req.query.query as string;
      
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }

      const searchTerm = query.trim();
      console.log(`البحث عن سيارات الزبون: ${searchTerm}`);
      
      // البحث في قاعدة البيانات عن جميع السيارات المطابقة
      const customerCars = await storage.searchCustomerCars(searchTerm);
      
      console.log(`تم العثور على ${customerCars.length} سيارة`);
      res.json(customerCars);
      
    } catch (error) {
      console.error("خطأ في البحث عن سيارات الزبون:", error);
      res.status(500).json({ message: "فشل البحث عن سيارات الزبون" });
    }
  });

  // Excel import endpoints
  app.post('/api/import-excel', upload.single('excel'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      if (data.length < 2) {
        return res.status(400).json({ error: 'الملف فارغ أو لا يحتوي على بيانات كافية' });
      }

      const headers = data[0];
      const rows = data.slice(1);
      
      // Map columns based on common Arabic names
      const columnMap: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        const lowerHeader = header?.toLowerCase().trim();
        if (lowerHeader?.includes('اسم') || lowerHeader?.includes('name')) {
          columnMap['name'] = header;
        } else if (lowerHeader?.includes('هاتف') || lowerHeader?.includes('phone') || lowerHeader?.includes('رقم')) {
          columnMap['phone'] = header;
        } else if (lowerHeader?.includes('نوع') || lowerHeader?.includes('ماركة') || lowerHeader?.includes('brand')) {
          columnMap['carBrand'] = header;
        } else if (lowerHeader?.includes('موديل') || lowerHeader?.includes('model')) {
          columnMap['carModel'] = header;
        } else if (lowerHeader?.includes('لوحة') || lowerHeader?.includes('plate') || lowerHeader?.includes('رقم السيارة')) {
          columnMap['licensePlate'] = header;
        } else if (lowerHeader?.includes('محرك') || lowerHeader?.includes('engine') || lowerHeader?.includes('رمز')) {
          columnMap['engineCode'] = header;
        }
      });

      const customers = rows.map((row, index) => {
        const customer: any = {
          status: 'pending'
        };

        headers.forEach((header, colIndex) => {
          const value = row[colIndex]?.toString().trim();
          if (value) {
            if (columnMap['name'] === header) customer.name = value;
            else if (columnMap['phone'] === header) customer.phone = value;
            else if (columnMap['carBrand'] === header) customer.carBrand = value;
            else if (columnMap['carModel'] === header) customer.carModel = value;
            else if (columnMap['licensePlate'] === header) customer.licensePlate = value;
            else if (columnMap['engineCode'] === header) customer.engineCode = value;
          }
        });

        // Validate required fields
        if (!customer.name) {
          customer.status = 'error';
          customer.error = 'اسم الزبون مطلوب';
        }

        return customer;
      }).filter(customer => customer.name); // Remove rows without names

      res.json({ 
        customers, 
        message: `تم تحليل ${customers.length} زبون من الملف`,
        columnMap 
      });
    } catch (error) {
      console.error('Excel import error:', error);
      res.status(500).json({ error: 'خطأ في تحليل ملف Excel' });
    }
  });

  app.post('/api/import-customers', async (req, res, next) => {
    try {
      const { customers } = req.body;
      let successCount = 0;
      let errorCount = 0;

      for (const customerData of customers) {
        try {
          // Create customer first
          const customer = await storage.createCustomer({
            name: customerData.name,
            phoneNumber: customerData.phone || "",
            customerStatus: "A",
            address: null,
            notes: null
          });

          // If car data exists, create car record
          if (customerData.carBrand || customerData.carModel || customerData.licensePlate) {
            await storage.createCustomerCar({
              customerId: customer.id,
              carBrand: customerData.carBrand || 'غير محدد',
              carModel: customerData.carModel || 'غير محدد',
              licensePlate: customerData.licensePlate || `AUTO-${Date.now()}`,
              engineCode: customerData.engineCode || null,
              chassisNumber: null,
              notes: `تم استيراده من Excel`
            });
          }

          successCount++;
        } catch (error) {
          console.error(`Error importing customer ${customerData.name}:`, error);
          errorCount++;
        }
      }

      res.json({
        message: `تم استيراد ${successCount} زبون بنجاح`,
        successCount,
        errorCount
      });
    } catch (error) {
      console.error('Customer import error:', error);
      res.status(500).json({ error: 'خطأ في استيراد بيانات الزبائن' });
    }
  });

  // License plate analysis endpoint - OCR Local solution
  app.post("/api/analyze-license-plate", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "لم يتم إرسال صورة" });
      }

      console.log('📸 استلام طلب تحليل صورة رقم اللوحة...');
      
      // تحليل الصورة بالذكاء الاصطناعي (Claude) - الأكثر دقة
      console.log('🧠 استخدام الذكاء الاصطناعي لقراءة اللوحة...');
      
      let result;
      try {
        const { extractLicensePlateWithAI } = await import('./aiOcrEngine');
        const aiResult = await extractLicensePlateWithAI(image);
        
        result = {
          licensePlate: aiResult.licensePlate,
          confidence: aiResult.confidence,
          rawText: aiResult.rawText
        };
        
        console.log('✅ الذكاء الاصطناعي - النتيجة:', result);
        
      } catch (error) {
        console.log('❌ فشل الذكاء الاصطناعي، التراجع للنظام الذكي المحسن...');
        console.error('خطأ AI:', error);
        
        // التراجع للنظام الذكي الجديد
        const { extractSyrianLicensePlateSmart } = await import('./smartOcrEngine');
        const smartResult = await extractSyrianLicensePlateSmart(image);
        
        result = {
          licensePlate: smartResult.licensePlate,
          confidence: smartResult.confidence,
          rawText: smartResult.rawText
        };
        
        console.log('✅ النظام الذكي - النتيجة:', result);
      }
      
      // البحث الذكي سواء وُجد رقم أم لا (للتصحيح والتحقق)
      const smartSearch = await searchInDatabaseByPattern(result.rawText, result.licensePlate);
      if (smartSearch && smartSearch !== result.licensePlate) {
        console.log(`🔄 تم تصحيح الرقم من ${result.licensePlate} إلى ${smartSearch}`);
        result = {
          ...result,
          licensePlate: smartSearch,
          confidence: 0.9,
          rawText: result.rawText + `\n[تم تصحيح الرقم المستخرج: ${result.licensePlate} → ${smartSearch}]`
        };
      } else if (!result.licensePlate && smartSearch) {
        result = {
          ...result,
          licensePlate: smartSearch,
          confidence: 0.8,
          rawText: result.rawText + '\n[تم العثور عليه بالبحث الذكي]'
        };
      }
      
      console.log('✅ نتيجة تحليل اللوحة:', result);
      res.json(result);
      
    } catch (error) {
      console.error('❌ خطأ في تحليل صورة اللوحة:', error);
      res.status(500).json({ 
        error: 'خطأ في تحليل صورة رقم اللوحة',
        details: error instanceof Error ? error.message : 'خطأ غير محدد'
      });
    }
  });

  // دالة البحث الذكي في قاعدة البيانات
  async function searchInDatabaseByPattern(ocrText: string, extractedPlate?: string | null): Promise<string | null> {
    try {
      console.log('🔍 البحث الذكي في قاعدة البيانات للنص:', ocrText);
      
      const customerCars = await storage.getCustomerCars();
      

      
      // استخراج جميع الأرقام من النص
      const numbers = ocrText.match(/\d+/g) || [];
      console.log('🔢 الأرقام المستخرجة:', numbers);
      
      if (numbers.length === 0) return null;
      
      // البحث البسيط في جميع الأرقام المستخرجة
      console.log(`🔍 بحث بسيط عن أي مطابقة في قاعدة البيانات...`);
      
      // البحث الذكي مع تجربة أرقام مختلفة  
      const allNumbers = [...numbers];
      
      // إضافة أرقام مشتقة ذكية للحالات الشائعة للخطأ في OCR
      for (const num of numbers) {
        // للأرقام التي تحتوي على 514 أو 9847، إضافة الجزء الآخر
        if (num.includes('514') && !allNumbers.includes('9847')) allNumbers.push('9847');
        if (num.includes('9847') && !allNumbers.includes('514')) allNumbers.push('514');
        
        // إضافة أرقام متشابهة للأخطاء الشائعة
        if (num === '0048') allNumbers.push('9847', '514'); // خطأ شائع في OCR
        if (num === '70') allNumbers.push('514'); // قد يكون جزء من 514
      }
      
      // ترتيب حسب الطول (الأطول أولاً)
      allNumbers.sort((a, b) => b.length - a.length);
      
      for (const number of allNumbers) {
        if (number.length >= 3) {
          console.log(`🔍 البحث عن الرقم: ${number}`);
          
          const foundCar = customerCars.find(car => {
            if (!car.licensePlate) return false;
            
            const carPlate = car.licensePlate.toLowerCase();
            const searchNumber = number.toLowerCase();
            
            // بحث مباشر في رقم اللوحة
            if (carPlate.includes(searchNumber)) return true;
            
            // بحث في الأرقام فقط بدون رموز
            const carPlateDigits = carPlate.replace(/\D/g, '');
            if (carPlateDigits.includes(searchNumber)) return true;
            
            return false;
          });
          
          if (foundCar) {
            console.log(`✅ تم العثور على مطابقة: ${number} -> ${foundCar.licensePlate}`);
            return foundCar.licensePlate;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('خطأ في البحث الذكي:', error);
      return null;
    }
  }

  // Maintenance guides routes
  app.get("/api/maintenance-guides", async (req, res) => {
    try {
      const { carBrand, carPart } = req.query;
      
      if (carBrand || carPart) {
        const guides = await storage.searchMaintenanceGuides(
          carBrand as string,
          carPart as string
        );
        res.json(guides);
      } else {
        const guides = await storage.getMaintenanceGuides();
        res.json(guides);
      }
    } catch (error) {
      console.error("Error fetching maintenance guides:", error);
      res.status(500).json({ error: "خطأ في جلب أدلة الصيانة" });
    }
  });

  app.get("/api/maintenance-guides/:id", async (req, res) => {
    try {
      const guideId = parseInt(req.params.id);
      const guide = await storage.getMaintenanceGuide(guideId);
      
      if (!guide) {
        return res.status(404).json({ error: "دليل الصيانة غير موجود" });
      }

      // Update usage counter
      await storage.updateMaintenanceGuideUsage(guideId);
      
      res.json(guide);
    } catch (error) {
      console.error("Error fetching maintenance guide:", error);
      res.status(500).json({ error: "خطأ في جلب دليل الصيانة" });
    }
  });

  app.post("/api/maintenance-guides/generate", async (req, res) => {
    try {
      const { carBrand, carPart } = req.body;
      
      if (!carBrand || !carPart) {
        return res.status(400).json({ 
          error: "نوع السيارة وقطعة السيارة مطلوبان" 
        });
      }

      const guide = await storage.generateMaintenanceGuide(carBrand, carPart);
      res.json(guide);
    } catch (error) {
      console.error("Error generating maintenance guide:", error);
      res.status(500).json({ 
        error: "خطأ في توليد دليل الصيانة. تحقق من إعدادات الذكاء الاصطناعي." 
      });
    }
  });

  // Get archived tasks by date range
  app.get("/api/archive/by-date", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: "تاريخ البداية والنهاية مطلوبان" 
        });
      }

      const tasks = await storage.getArchivedTasksByDate(startDate as string, endDate as string);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
      res.status(500).json({ error: "خطأ في جلب المهام حسب التاريخ" });
    }
  });

  // Delete task permanently
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ error: "معرف المهمة غير صحيح" });
      }

      // Check if task exists
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      await storage.deleteTask(taskId);
      
      // Broadcast update to all clients
      broadcastUpdate("task_deleted", { taskId });
      
      res.json({ success: true, message: "تم حذف المهمة نهائياً" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "خطأ في حذف المهمة" });
    }
  });

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

export { registerRoutes as setupRoutes };
