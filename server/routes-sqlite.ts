import { Express } from "express";
import { storage } from "./storage-sqlite";
import { insertWorkerSchema, insertTaskSchema, insertCustomerSchema, insertCustomerCarSchema, insertPartsRequestSchema, insertCarReceiptSchema } from "@shared/schema-sqlite";
import { ZodError } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Helper function to handle authentication check
function requireAuth(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Set user object for convenience
  if (!req.user) {
    storage.getUser(userId).then(user => {
      if (user) {
        req.user = user;
      }
      next();
    }).catch(() => {
      return res.status(401).json({ error: "Authentication required" });
    });
  } else {
    next();
  }
}

// Helper function to check permissions
function requirePermission(permission: string) {
  return async (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(403).json({ error: "User not found" });
      }
      
      req.user = user; // Set user for other middlewares
      
      // Check if user has permissions and the specific permission
      const permissions = user.permissions || [];
      if (!Array.isArray(permissions) || !permissions.includes(permission)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ error: "Authentication required" });
    }
  };
}

// Setup multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_config });

export function setupRoutes(app: Express) {
  // Worker routes - remove permission requirement for basic viewing
  app.get("/api/workers", requireAuth, async (req, res, next) => {
    try {
      const workers = await storage.getWorkers();
      res.json(workers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/workers/names", requireAuth, async (req, res, next) => {
    try {
      const names = await storage.getAllWorkerNames();
      res.json(names);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/workers", requireAuth, async (req, res, next) => {
    try {
      const workerData = insertWorkerSchema.parse(req.body);
      const worker = await storage.createWorker(workerData);
      res.status(201).json(worker);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/workers/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertWorkerSchema.partial().parse(req.body);
      const worker = await storage.updateWorker(id, updates);
      res.json(worker);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  // Task routes
  app.get("/api/tasks", requireAuth, async (req, res, next) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/active", requireAuth, async (req, res, next) => {
    try {
      const tasks = await storage.getActiveTasks();
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/history", requireAuth, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const tasks = await storage.getTaskHistory(limit);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res, next) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateTask(id, updates);
      res.json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  // Timer routes
  app.post("/api/tasks/:id/start", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const timeEntry = await storage.startTask(id);
      res.json(timeEntry);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks/:id/pause", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.pauseTask(id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks/:id/resume", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const timeEntry = await storage.resumeTask(id);
      res.json(timeEntry);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks/:id/finish", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.finishTask(id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  // Archive routes
  app.post("/api/tasks/:id/archive", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { archivedBy, notes, rating } = req.body;
      const task = await storage.archiveTask(id, archivedBy, notes, rating);
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks/:id/cancel", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { cancelledBy, reason } = req.body;
      const task = await storage.cancelTask(id, cancelledBy, reason);
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/archive", requireAuth, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const tasks = await storage.getArchivedTasks(limit);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/archive/search", requireAuth, async (req, res, next) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
      }
      const tasks = await storage.searchArchive(searchTerm);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  // Statistics route
  app.get("/api/stats", requireAuth, async (req, res, next) => {
    try {
      const stats = await storage.getWorkerStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Car data route for autofill
  app.get("/api/car-data/:licensePlate", requireAuth, async (req, res, next) => {
    try {
      const licensePlate = req.params.licensePlate;
      const carData = await storage.getCarDataByLicensePlate(licensePlate);
      res.json(carData);
    } catch (error) {
      next(error);
    }
  });

  // Enhanced car search for parts requests (by customer name, chassis number, or license plate)
  app.get("/api/search-car-info/:searchTerm", requireAuth, async (req, res, next) => {
    try {
      const searchTerm = req.params.searchTerm;
      const carData = await storage.searchCarInfoForParts(searchTerm);
      res.json(carData);
    } catch (error) {
      next(error);
    }
  });

  // Customer routes
  app.get("/api/customers", requireAuth, async (req, res, next) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/customers/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "العميل غير موجود" });
      }
      res.json(customer);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/customers", requirePermission("customers:write"), async (req, res, next) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/customers/:id", requirePermission("customers:write"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, updates);
      res.json(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/customers/:id", requirePermission("customers:delete"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Customer cars routes
  app.get("/api/customer-cars", requireAuth, async (req, res, next) => {
    try {
      const cars = await storage.getCustomerCars();
      res.json(cars);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/customers/:customerId/cars", requireAuth, async (req, res, next) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const cars = await storage.getCustomerCarsByCustomerId(customerId);
      res.json(cars);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/customer-cars/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCustomerCar(id);
      if (!car) {
        return res.status(404).json({ error: "السيارة غير موجودة" });
      }
      res.json(car);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/customer-cars", requirePermission("customers:write"), async (req, res, next) => {
    try {
      const carData = insertCustomerCarSchema.parse(req.body);
      const car = await storage.createCustomerCar(carData);
      res.status(201).json(car);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/customer-cars/:id", requirePermission("customers:write"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCustomerCarSchema.partial().parse(req.body);
      const car = await storage.updateCustomerCar(id, updates);
      res.json(car);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/customer-cars/:id", requirePermission("customers:delete"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomerCar(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Parts requests routes
  app.get("/api/parts-requests", requireAuth, async (req, res, next) => {
    try {
      const requests = await storage.getPartsRequests();
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/parts-requests/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getPartsRequest(id);
      if (!request) {
        return res.status(404).json({ error: "طلب القطع غير موجود" });
      }
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/parts-requests", requirePermission("parts:create"), async (req, res, next) => {
    try {
      // إضافة معلومات المستخدم الذي طلب القطعة
      const requestData = {
        ...req.body,
        requestedBy: (req as any).user?.username || 'غير معروف'
      };
      
      console.log('Creating parts request:', requestData);
      const request = await storage.createPartsRequest(requestData);
      
      // إرسال إشعار لهبة (المشرفة) - سيتم تنفيذه لاحقاً
      console.log('تم إنشاء طلب قطعة جديد، سيتم إشعار المشرفة');
      
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating parts request:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/parts-requests/:id/status", requirePermission("parts:approve"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      const request = await storage.updatePartsRequestStatus(id, status, notes);
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/search/car-info", requireAuth, async (req, res, next) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
      }
      const carInfo = await storage.searchCarInfoForParts(searchTerm);
      res.json(carInfo);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/parts-requests/license/:licensePlate", requireAuth, async (req, res, next) => {
    try {
      const licensePlate = req.params.licensePlate;
      const requests = await storage.getPartsRequestsByLicensePlate(licensePlate);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/license/:licensePlate", requireAuth, async (req, res, next) => {
    try {
      const licensePlate = req.params.licensePlate;
      const tasks = await storage.getTasksByLicensePlate(licensePlate);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  // Car receipts routes
  app.post("/api/car-receipts", requirePermission("receipts:create"), async (req, res, next) => {
    try {
      const receiptData = insertCarReceiptSchema.parse(req.body);
      const receipt = await storage.createCarReceipt(receiptData);
      res.status(201).json(receipt);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/car-receipts", requireAuth, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const receipts = await storage.getCarReceipts(limit);
      res.json(receipts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/car-receipts/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const receipt = await storage.getCarReceipt(id);
      if (!receipt) {
        return res.status(404).json({ error: "إيصال السيارة غير موجود" });
      }
      res.json(receipt);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/car-receipts/:id/status", requirePermission("receipts:write"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { status, updatedBy } = req.body;
      const receipt = await storage.updateCarReceiptStatus(id, status, updatedBy);
      res.json(receipt);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/car-receipts/:id/send-to-workshop", requirePermission("receipts:write"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { sentBy } = req.body;
      const receipt = await storage.sendCarToWorkshop(id, sentBy);
      res.json(receipt);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/car-receipts/:id/postpone", requirePermission("receipts:write"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { postponedBy } = req.body;
      const receipt = await storage.postponeCarReceipt(id, postponedBy);
      res.json(receipt);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/car-receipts/search", requireAuth, async (req, res, next) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
      }
      const receipts = await storage.searchCarReceipts(searchTerm);
      res.json(receipts);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/car-receipts/:id", requirePermission("receipts:delete"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCarReceipt(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // File upload route
  app.post("/api/upload", requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });
  });

  // Notifications endpoints
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
      
      const notifications = await storage.getNotifications(user.username, isRead);
      res.json(notifications);
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({ error: "خطأ في استرجاع الإشعارات" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(notificationId);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "خطأ في تحديث الإشعار" });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.deleteNotification(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "خطأ في حذف الإشعار" });
    }
  });

  // Authentication routes
  app.post("/api/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيح" });
      }

      // Verify password
      const crypto = require('crypto');
      const [hash, salt] = user.password.split('.');
      const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      
      if (testHash !== hash) {
        return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيح" });
      }

      // Set user in session
      (req as any).session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "خطأ في تسجيل الخروج" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/user", async (req, res, next) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
}