import { workers, tasks, timeEntries, customers, customerCars, users, partsRequests, carReceipts, notifications, type Worker, type InsertWorker, type Task, type InsertTask, type TimeEntry, type InsertTimeEntry, type WorkerWithTasks, type TaskWithWorker, type TaskHistory, type Customer, type InsertCustomer, type CustomerCar, type InsertCustomerCar, type CustomerWithCars, type User, type InsertUser, type PartsRequest, type InsertPartsRequest, type CarReceipt, type InsertCarReceipt, type Notification, type InsertNotification } from "@shared/schema-sqlite";
import { db, initDatabase } from "./db-sqlite";
import { eq, desc, and, isNull, or, like, isNotNull, asc, sql } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";

const MemStore = MemoryStore(session);

export interface IStorage {
  // Worker management
  getWorkers(): Promise<WorkerWithTasks[]>;
  getAllWorkerNames(): Promise<string[]>;
  getWorker(id: number): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: number, updates: Partial<InsertWorker>): Promise<Worker>;
  
  // Task management
  getTasks(): Promise<TaskWithWorker[]>;
  getActiveTasks(): Promise<TaskWithWorker[]>;
  getTask(id: number): Promise<TaskWithWorker | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task>;
  
  // Time tracking
  startTask(taskId: number): Promise<TimeEntry>;
  pauseTask(taskId: number): Promise<Task>;
  resumeTask(taskId: number): Promise<TimeEntry>;
  finishTask(taskId: number): Promise<Task>;
  
  // Archive management
  archiveTask(taskId: number, archivedBy: string, notes?: string, rating?: number): Promise<Task>;
  cancelTask(taskId: number, cancelledBy: string, reason: string): Promise<Task>;
  getArchivedTasks(limit?: number): Promise<TaskHistory[]>;
  searchArchive(searchTerm: string): Promise<TaskHistory[]>;
  
  // History and reporting  
  getTaskHistory(limit?: number): Promise<TaskHistory[]>;
  getWorkerStats(): Promise<{ totalWorkers: number; availableWorkers: number; busyWorkers: number; activeTasks: number }>;
  
  // Car data for autofill
  getCarDataByLicensePlate(licensePlate: string): Promise<{ carBrand: string; carModel: string; color?: string } | null>;
  
  // Customer management
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;
  
  // Customer cars management
  getCustomerCars(): Promise<CustomerCar[]>;
  getCustomerCarsByCustomerId(customerId: number): Promise<CustomerCar[]>;
  getCustomerCar(id: number): Promise<CustomerCar | undefined>;
  createCustomerCar(car: InsertCustomerCar): Promise<CustomerCar>;
  updateCustomerCar(id: number, updates: Partial<InsertCustomerCar>): Promise<CustomerCar>;
  deleteCustomerCar(id: number): Promise<void>;
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  updateUserPermissions(username: string, permissions: string[]): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Parts requests management
  getPartsRequests(): Promise<PartsRequest[]>;
  getPartsRequest(id: number): Promise<PartsRequest | undefined>;
  createPartsRequest(request: InsertPartsRequest): Promise<PartsRequest>;
  updatePartsRequestStatus(id: number, status: string, notes?: string): Promise<PartsRequest>;
  searchCarInfoForParts(searchTerm: string): Promise<{ carBrand: string; carModel: string; color?: string; licensePlate?: string; chassisNumber?: string; engineCode?: string; customerName?: string } | null>;
  getPartsRequestsByLicensePlate(licensePlate: string): Promise<PartsRequest[]>;
  getTasksByLicensePlate(licensePlate: string): Promise<Task[]>;
  
  // Car receipts management
  createCarReceipt(receiptData: InsertCarReceipt): Promise<CarReceipt>;
  getCarReceipts(limit?: number): Promise<CarReceipt[]>;
  getCarReceipt(id: number): Promise<CarReceipt | undefined>;
  updateCarReceiptStatus(id: number, status: string, updatedBy?: string): Promise<CarReceipt>;
  sendCarToWorkshop(id: number, sentBy: string): Promise<CarReceipt>;
  postponeCarReceipt(id: number, postponedBy: string): Promise<CarReceipt>;
  searchCarReceipts(searchTerm: string): Promise<CarReceipt[]>;
  deleteCarReceipt(id: number): Promise<void>;
  
  // Notifications management
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string, isRead?: boolean): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  deleteNotification(id: number): Promise<void>;
  
  sessionStore: any;
}

// SQLite Storage Implementation
class SQLiteStorage implements IStorage {
  private nextTaskNumber = 1;
  private nextReceiptNumber = 1;
  private nextRequestNumber = 1;
  private nextDeliveryNumber = 1;
  public sessionStore: any;

  constructor() {
    this.sessionStore = new MemStore({
      checkPeriod: 86400000, // 24 hours
    });
    this.initializeData();
  }

  private async initializeData() {
    await initDatabase();
    
    // Initialize default workers
    const existingWorkers = await this.getWorkers();
    if (existingWorkers.length === 0) {
      const defaultWorkers = [
        { name: "غدير", category: "technician" },
        { name: "أحمد الفني", category: "technician" },
        { name: "محمد المساعد", category: "assistant" },
        { name: "علي", category: "technician" },
        { name: "فاطمة", category: "assistant" },
        { name: "سارة", category: "technician" },
        { name: "يوسف", category: "assistant" },
        { name: "مريم", category: "technician" },
        { name: "خالد", category: "assistant" },
        { name: "نور", category: "technician" },
        { name: "عمر", category: "assistant" }
      ];

      for (const worker of defaultWorkers) {
        await this.createWorker({ ...worker, isPredefined: true });
      }
    }

    // Initialize task numbering
    const latestTask = await db.select({ taskNumber: tasks.taskNumber })
      .from(tasks)
      .orderBy(desc(tasks.id))
      .limit(1);
    
    if (latestTask.length > 0) {
      const match = latestTask[0].taskNumber.match(/(\d+)$/);
      this.nextTaskNumber = match ? parseInt(match[1]) + 1 : 1;
    }

    // Initialize receipt numbering
    const latestReceipt = await db.select({ receiptNumber: carReceipts.receiptNumber })
      .from(carReceipts)
      .orderBy(desc(carReceipts.id))
      .limit(1);
    
    if (latestReceipt.length > 0) {
      const match = latestReceipt[0].receiptNumber.match(/(\d+)$/);
      this.nextReceiptNumber = match ? parseInt(match[1]) + 1 : 1;
    }

    // Initialize parts request numbering by counting all existing requests
    const requestCount = await db.select({ count: sql<number>`count(*)` })
      .from(partsRequests);
    
    this.nextRequestNumber = (requestCount[0]?.count || 0) + 1;

    // Initialize delivery numbering
    const latestDelivery = await db.select({ deliveryNumber: tasks.deliveryNumber })
      .from(tasks)
      .where(isNotNull(tasks.deliveryNumber))
      .orderBy(desc(tasks.deliveryNumber))
      .limit(1);
    
    if (latestDelivery.length > 0) {
      this.nextDeliveryNumber = latestDelivery[0].deliveryNumber! + 1;
    }
  }

  // Helper function to parse JSON arrays
  private parseJsonArray(jsonString: string | null | undefined): string[] {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  }

  // Helper function to stringify arrays
  private stringifyArray(array: string[] | undefined): string {
    return JSON.stringify(array || []);
  }

  // Worker management
  async getWorkers(): Promise<WorkerWithTasks[]> {
    const workersWithTasks = await db.select()
      .from(workers)
      .leftJoin(tasks, eq(workers.id, tasks.workerId))
      .where(eq(workers.isActive, true));

    const workerMap = new Map<number, WorkerWithTasks>();
    
    workersWithTasks.forEach(row => {
      const worker = row.workers;
      const task = row.tasks;
      
      if (!workerMap.has(worker.id)) {
        workerMap.set(worker.id, { ...worker, tasks: [] });
      }
      
      if (task && task.status === 'active') {
        workerMap.get(worker.id)!.tasks.push({
          ...task,
          technicians: this.parseJsonArray(task.technicians),
          assistants: this.parseJsonArray(task.assistants)
        } as Task);
      }
    });

    return Array.from(workerMap.values());
  }

  async getAllWorkerNames(): Promise<string[]> {
    const result = await db.select({ name: workers.name })
      .from(workers)
      .where(eq(workers.isActive, true));
    return result.map(w => w.name);
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    const result = await db.select().from(workers).where(eq(workers.id, id)).limit(1);
    return result[0];
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const result = await db.insert(workers).values(worker).returning();
    return result[0];
  }

  async updateWorker(id: number, updates: Partial<InsertWorker>): Promise<Worker> {
    const result = await db.update(workers)
      .set({ ...updates, createdAt: new Date().toISOString() })
      .where(eq(workers.id, id))
      .returning();
    return result[0];
  }

  // Task management
  async getTasks(): Promise<TaskWithWorker[]> {
    const result = await db.select()
      .from(tasks)
      .innerJoin(workers, eq(tasks.workerId, workers.id));

    return result.map(row => ({
      ...row.tasks,
      worker: row.workers,
      technicians: this.parseJsonArray(row.tasks.technicians),
      assistants: this.parseJsonArray(row.tasks.assistants)
    } as TaskWithWorker));
  }

  async getActiveTasks(): Promise<TaskWithWorker[]> {
    const result = await db.select()
      .from(tasks)
      .innerJoin(workers, eq(tasks.workerId, workers.id))
      .where(eq(tasks.status, "active"))
;

    return result.map(row => ({
      ...row.tasks,
      worker: row.workers,
      technicians: this.parseJsonArray(row.tasks.technicians),
      assistants: this.parseJsonArray(row.tasks.assistants)
    } as TaskWithWorker));
  }

  async getTask(id: number): Promise<TaskWithWorker | undefined> {
    const result = await db.select()
      .from(tasks)
      .innerJoin(workers, eq(tasks.workerId, workers.id))
      .where(eq(tasks.id, id))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0].tasks,
      worker: result[0].workers,
      technicians: this.parseJsonArray(result[0].tasks.technicians),
      assistants: this.parseJsonArray(result[0].tasks.assistants)
    };
  }

  async createTask(task: InsertTask): Promise<Task> {
    const taskNumber = `TSK-${this.nextTaskNumber.toString().padStart(4, '0')}`;
    this.nextTaskNumber++;

    const taskData: any = {
      ...task,
      taskNumber,
      technicians: this.stringifyArray((task as any).technicians),
      assistants: this.stringifyArray((task as any).assistants),
      startTime: new Date().toISOString()
    };

    const result = await db.insert(tasks).values(taskData).returning();
    const createdTask = result[0];

    // Create initial time entry
    await db.insert(timeEntries).values({
      taskId: createdTask.id,
      startTime: new Date().toISOString(),
      entryType: "work"
    });

    return {
      ...createdTask,
      technicians: this.parseJsonArray(createdTask.technicians),
      assistants: this.parseJsonArray(createdTask.assistants)
    };
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const updateData: any = { ...updates };
    if (updates.technicians) {
      updateData.technicians = this.stringifyArray(updates.technicians);
    }
    if (updates.assistants) {
      updateData.assistants = this.stringifyArray(updates.assistants);
    }

    const result = await db.update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    return {
      ...result[0],
      technicians: this.parseJsonArray(result[0].technicians),
      assistants: this.parseJsonArray(result[0].assistants)
    };
  }

  // Time tracking methods
  async startTask(taskId: number): Promise<TimeEntry> {
    const result = await db.insert(timeEntries).values({
      taskId,
      startTime: new Date().toISOString(),
      entryType: "work"
    }).returning();

    return result[0];
  }

  async pauseTask(taskId: number): Promise<Task> {
    const now = new Date().toISOString();
    
    // Update task status
    const result = await db.update(tasks)
      .set({ 
        status: "paused", 
        pausedAt: now 
      })
      .where(eq(tasks.id, taskId))
      .returning();

    // End current time entry
    const activeEntry = await db.select()
      .from(timeEntries)
      .where(and(
        eq(timeEntries.taskId, taskId),
        isNull(timeEntries.endTime),
        eq(timeEntries.entryType, "work")
      ))
      .limit(1);

    if (activeEntry.length > 0) {
      const startTime = new Date(activeEntry[0].startTime);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      await db.update(timeEntries)
        .set({ 
          endTime: now, 
          duration 
        })
        .where(eq(timeEntries.id, activeEntry[0].id));
    }

    return {
      ...result[0],
      technicians: this.parseJsonArray(result[0].technicians),
      assistants: this.parseJsonArray(result[0].assistants)
    } as Task;
  }

  async resumeTask(taskId: number): Promise<TimeEntry> {
    // Update task status
    await db.update(tasks)
      .set({ 
        status: "active", 
        pausedAt: null 
      })
      .where(eq(tasks.id, taskId));

    // Create new time entry
    const result = await db.insert(timeEntries).values({
      taskId,
      startTime: new Date().toISOString(),
      entryType: "work"
    }).returning();

    return result[0];
  }

  async finishTask(taskId: number): Promise<Task> {
    const now = new Date().toISOString();
    
    // End current time entry
    const activeEntry = await db.select()
      .from(timeEntries)
      .where(and(
        eq(timeEntries.taskId, taskId),
        isNull(timeEntries.endTime),
        eq(timeEntries.entryType, "work")
      ))
      .limit(1);

    if (activeEntry.length > 0) {
      const startTime = new Date(activeEntry[0].startTime);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      await db.update(timeEntries)
        .set({ 
          endTime: now, 
          duration 
        })
        .where(eq(timeEntries.id, activeEntry[0].id));
    }

    // Update task status
    const result = await db.update(tasks)
      .set({ 
        status: "completed", 
        endTime: now 
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return {
      ...result[0],
      technicians: this.parseJsonArray(result[0].technicians),
      assistants: this.parseJsonArray(result[0].assistants)
    } as Task;
  }

  // Archive management
  async archiveTask(taskId: number, archivedBy: string, notes?: string, rating?: number): Promise<Task> {
    const deliveryNumber = this.nextDeliveryNumber++;
    const now = new Date().toISOString();

    const result = await db.update(tasks)
      .set({
        isArchived: true,
        archivedAt: now,
        archivedBy,
        archiveNotes: notes,
        rating,
        deliveryNumber,
        status: "archived"
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return {
      ...result[0],
      technicians: this.parseJsonArray(result[0].technicians),
      assistants: this.parseJsonArray(result[0].assistants)
    } as Task;
  }

  async cancelTask(taskId: number, cancelledBy: string, reason: string): Promise<Task> {
    const now = new Date().toISOString();

    const result = await db.update(tasks)
      .set({
        isCancelled: true,
        cancelledAt: now,
        cancelledBy,
        cancellationReason: reason,
        status: "cancelled"
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return {
      ...result[0],
      technicians: this.parseJsonArray(result[0].technicians),
      assistants: this.parseJsonArray(result[0].assistants)
    } as Task;
  }

  async getArchivedTasks(limit = 50): Promise<TaskHistory[]> {
    const result = await db.select()
      .from(tasks)
      .innerJoin(workers, eq(tasks.workerId, workers.id))
      .where(eq(tasks.isArchived, true))
      .orderBy(desc(tasks.archivedAt))
      .limit(limit);

    return result.map(row => ({
      ...row.tasks,
      worker: row.workers,
      technicians: this.parseJsonArray(row.tasks.technicians),
      assistants: this.parseJsonArray(row.tasks.assistants)
    } as TaskHistory));
  }

  async searchArchive(searchTerm: string): Promise<TaskHistory[]> {
    const result = await db.select()
      .from(tasks)
      .innerJoin(workers, eq(tasks.workerId, workers.id))
      .where(and(
        eq(tasks.isArchived, true),
        or(
          like(tasks.description, `%${searchTerm}%`),
          like(tasks.licensePlate, `%${searchTerm}%`),
          like(tasks.carModel, `%${searchTerm}%`),
          like(tasks.taskNumber, `%${searchTerm}%`),
          like(workers.name, `%${searchTerm}%`)
        )
      ))
      .orderBy(desc(tasks.archivedAt));

    return result.map(row => ({
      ...row.tasks,
      worker: row.workers,
      technicians: this.parseJsonArray(row.tasks.technicians),
      assistants: this.parseJsonArray(row.tasks.assistants)
    } as TaskHistory));
  }

  // History and reporting
  async getTaskHistory(limit = 50): Promise<TaskHistory[]> {
    const result = await db.select()
      .from(tasks)
      .innerJoin(workers, eq(tasks.workerId, workers.id))
      .where(or(
        eq(tasks.status, "completed"),
        eq(tasks.isArchived, true),
        eq(tasks.isCancelled, true)
      ))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.tasks,
      worker: row.workers,
      technicians: this.parseJsonArray(row.tasks.technicians),
      assistants: this.parseJsonArray(row.tasks.assistants)
    } as TaskHistory));
  }

  async getWorkerStats(): Promise<{ totalWorkers: number; availableWorkers: number; busyWorkers: number; activeTasks: number }> {
    const [totalWorkers, activeTasks] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(workers).where(eq(workers.isActive, true)),
      db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.status, "active"))
    ]);

    const busyWorkerIds = await db.select({ workerId: tasks.workerId })
      .from(tasks)
      .where(eq(tasks.status, "active"));

    const uniqueBusyWorkers = new Set(busyWorkerIds.map(t => t.workerId)).size;

    return {
      totalWorkers: totalWorkers[0].count,
      availableWorkers: totalWorkers[0].count - uniqueBusyWorkers,
      busyWorkers: uniqueBusyWorkers,
      activeTasks: activeTasks[0].count
    };
  }

  // Car data for autofill
  async getCarDataByLicensePlate(licensePlate: string): Promise<{ carBrand: string; carModel: string; color?: string } | null> {
    try {
      // First search in customer cars
      const carResult = await db.select({
        carBrand: customerCars.carBrand,
        carModel: customerCars.carModel,
        color: customerCars.color
      })
      .from(customerCars)
      .where(eq(customerCars.licensePlate, licensePlate))
      .limit(1);

      if (carResult[0]) return carResult[0];

      // If not found in customer cars, search in tasks
      const taskResult = await db.select({
        carBrand: tasks.carBrand,
        carModel: tasks.carModel
      })
      .from(tasks)
      .where(eq(tasks.licensePlate, licensePlate))
      .limit(1);

      if (taskResult[0]) return { 
        carBrand: taskResult[0].carBrand,
        carModel: taskResult[0].carModel
      };

      return null;
    } catch (error) {
      console.error("خطأ في البحث عن بيانات السيارة:", error);
      return null;
    }
  }

  // Enhanced search for parts requests - by customer name, chassis number, or license plate
  async searchCarInfoForParts(searchTerm: string): Promise<{
    carBrand: string;
    carModel: string;
    licensePlate?: string;
    chassisNumber?: string;
    engineCode?: string;
    color?: string;
    customerName?: string;
  } | null> {
    try {
      const cleanTerm = searchTerm.trim();
      console.log("البحث عن:", cleanTerm);

      // البحث بواسطة اسم الزبون
      const customerSearch = await db.select({
        customerName: customers.name,
        carBrand: customerCars.carBrand,
        carModel: customerCars.carModel,
        licensePlate: customerCars.licensePlate,
        chassisNumber: customerCars.chassisNumber,
        engineCode: customerCars.engineCode,
        color: customerCars.color
      })
      .from(customers)
      .innerJoin(customerCars, eq(customers.id, customerCars.customerId))
      .where(like(customers.name, `%${cleanTerm}%`))
      .limit(1);

      if (customerSearch[0]) {
        console.log("تم العثور على الزبون:", customerSearch[0]);
        return customerSearch[0];
      }

      // البحث بواسطة رقم الشاسيه
      const chassisSearch = await db.select({
        customerName: customers.name,
        carBrand: customerCars.carBrand,
        carModel: customerCars.carModel,
        licensePlate: customerCars.licensePlate,
        chassisNumber: customerCars.chassisNumber,
        engineCode: customerCars.engineCode,
        color: customerCars.color
      })
      .from(customerCars)
      .leftJoin(customers, eq(customerCars.customerId, customers.id))
      .where(like(customerCars.chassisNumber, `%${cleanTerm}%`))
      .limit(1);

      if (chassisSearch[0]) {
        console.log("تم العثور بالشاسيه:", chassisSearch[0]);
        return chassisSearch[0];
      }

      // البحث بواسطة رقم اللوحة
      const plateSearch = await db.select({
        customerName: customers.name,
        carBrand: customerCars.carBrand,
        carModel: customerCars.carModel,
        licensePlate: customerCars.licensePlate,
        chassisNumber: customerCars.chassisNumber,
        engineCode: customerCars.engineCode,
        color: customerCars.color
      })
      .from(customerCars)
      .leftJoin(customers, eq(customerCars.customerId, customers.id))
      .where(like(customerCars.licensePlate, `%${cleanTerm}%`))
      .limit(1);

      if (plateSearch[0]) {
        console.log("تم العثور باللوحة:", plateSearch[0]);
        return plateSearch[0];
      }

      // البحث في المهام إذا لم توجد في الزبائن
      const taskSearch = await db.select({
        carBrand: tasks.carBrand,
        carModel: tasks.carModel,
        licensePlate: tasks.licensePlate,
        chassisNumber: tasks.chassisNumber
      })
      .from(tasks)
      .where(
        or(
          like(tasks.licensePlate, `%${cleanTerm}%`),
          like(tasks.chassisNumber, `%${cleanTerm}%`)
        )
      )
      .limit(1);

      if (taskSearch[0]) {
        console.log("تم العثور في المهام:", taskSearch[0]);
        return {
          carBrand: taskSearch[0].carBrand,
          carModel: taskSearch[0].carModel,
          licensePlate: taskSearch[0].licensePlate || undefined,
          chassisNumber: taskSearch[0].chassisNumber || undefined
        };
      }

      console.log("لم يتم العثور على نتائج");
      return null;
    } catch (error) {
      console.error("خطأ في البحث المتقدم:", error);
      return null;
    }
  }

  // Customer management
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values({
      ...customer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();
    return result[0];
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer> {
    const result = await db.update(customers)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Customer cars management
  async getCustomerCars(): Promise<CustomerCar[]> {
    return await db.select().from(customerCars).orderBy(desc(customerCars.createdAt));
  }

  async getCustomerCarsByCustomerId(customerId: number): Promise<CustomerCar[]> {
    return await db.select().from(customerCars)
      .where(eq(customerCars.customerId, customerId))
      .orderBy(desc(customerCars.createdAt));
  }

  async getCustomerCar(id: number): Promise<CustomerCar | undefined> {
    const result = await db.select().from(customerCars).where(eq(customerCars.id, id)).limit(1);
    return result[0];
  }

  async createCustomerCar(car: InsertCustomerCar): Promise<CustomerCar> {
    const result = await db.insert(customerCars).values({
      ...car,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();
    return result[0];
  }

  async updateCustomerCar(id: number, updates: Partial<InsertCustomerCar>): Promise<CustomerCar> {
    const result = await db.update(customerCars)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(customerCars.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomerCar(id: number): Promise<void> {
    await db.delete(customerCars).where(eq(customerCars.id, id));
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result[0]) {
      return {
        ...result[0],
        permissions: this.parseJsonArray(result[0].permissions)
      };
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (result[0]) {
      return {
        ...result[0],
        permissions: this.parseJsonArray(result[0].permissions)
      };
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const userData: any = {
      ...user,
      permissions: this.stringifyArray((user as any).permissions),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.insert(users).values(userData).returning();
    return {
      ...result[0],
      permissions: this.parseJsonArray(result[0].permissions)
    };
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if ((updates as any).permissions) {
      updateData.permissions = this.stringifyArray((updates as any).permissions);
    }

    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return {
      ...result[0],
      permissions: this.parseJsonArray(result[0].permissions)
    };
  }

  async updateUserPermissions(username: string, permissions: string[]): Promise<User> {
    const result = await db.update(users)
      .set({ 
        permissions: this.stringifyArray(permissions),
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.username, username))
      .returning();

    return {
      ...result[0],
      permissions: this.parseJsonArray(result[0].permissions)
    };
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Parts requests management
  async getPartsRequests(): Promise<PartsRequest[]> {
    return await db.select().from(partsRequests);
  }

  async getPartsRequest(id: number): Promise<PartsRequest | undefined> {
    const result = await db.select().from(partsRequests).where(eq(partsRequests.id, id)).limit(1);
    return result[0];
  }

  async createPartsRequest(request: InsertPartsRequest): Promise<PartsRequest> {
    const requestNumber = `REQ-${this.nextRequestNumber.toString().padStart(4, '0')}`;
    this.nextRequestNumber++;

    const requestData = {
      ...request,
      requestNumber,
      requestedAt: new Date().toISOString()
    };
    
    const result = await db.insert(partsRequests).values(requestData).returning();
    
    // إنشاء إشعار للمشرفين
    await this.createNotification({
      userId: "هبة", // اسم المشرفة
      type: "parts_request_created",
      title: "طلب قطعة جديد",
      message: `طلب قطعة جديد من ${request.requestedBy}: ${request.partName} للسيارة ${request.carInfo}`,
      relatedId: result[0].id,
      relatedType: "parts_request"
    });
    
    console.log("تم إنشاء طلب قطعة جديد، سيتم إشعار المشرفة");
    
    return result[0];
  }

  async updatePartsRequestStatus(id: number, status: string, notes?: string): Promise<PartsRequest> {
    const updateData: any = { status };
    
    if (status === "delivered") {
      updateData.deliveredAt = new Date().toISOString();
    } else if (status === "parts_arrived") {
      updateData.approvedAt = new Date().toISOString();
    }
    
    if (notes) {
      updateData.notes = notes;
    }

    const result = await db.update(partsRequests)
      .set(updateData)
      .where(eq(partsRequests.id, id))
      .returning();

    return result[0];
  }

  async searchCarInfoForParts(searchTerm: string): Promise<{ carBrand: string; carModel: string; color?: string; licensePlate?: string; chassisNumber?: string; engineCode?: string; customerName?: string } | null> {
    // Search in customer cars first
    const carResult = await db.select({
      carBrand: customerCars.carBrand,
      carModel: customerCars.carModel,
      color: customerCars.color,
      licensePlate: customerCars.licensePlate,
      chassisNumber: customerCars.chassisNumber,
      engineCode: customerCars.engineCode,
      customerName: customers.name
    })
    .from(customerCars)
    .innerJoin(customers, eq(customerCars.customerId, customers.id))
    .where(or(
      like(customerCars.licensePlate, `%${searchTerm}%`),
      like(customerCars.chassisNumber, `%${searchTerm}%`)
    ))
    .limit(1);

    if (carResult[0]) return carResult[0];

    // If not found in customer cars, search in tasks
    const taskResult = await db.select({
      carBrand: tasks.carBrand,
      carModel: tasks.carModel,
      licensePlate: tasks.licensePlate
    })
    .from(tasks)
    .where(like(tasks.licensePlate, `%${searchTerm}%`))
    .limit(1);

    return taskResult[0] || null;
  }

  async getPartsRequestsByLicensePlate(licensePlate: string): Promise<PartsRequest[]> {
    return await db.select().from(partsRequests)
      .where(eq(partsRequests.licensePlate, licensePlate))
      .orderBy(desc(partsRequests.createdAt));
  }

  async getTasksByLicensePlate(licensePlate: string): Promise<Task[]> {
    const result = await db.select().from(tasks)
      .where(eq(tasks.licensePlate, licensePlate))
      .orderBy(desc(tasks.createdAt));

    return result.map(task => ({
      ...task,
      technicians: this.parseJsonArray(task.technicians),
      assistants: this.parseJsonArray(task.assistants)
    } as Task));
  }

  // Car receipts management
  async createCarReceipt(receiptData: InsertCarReceipt): Promise<CarReceipt> {
    const receiptNumber = `CAR-${this.nextReceiptNumber.toString().padStart(4, '0')}`;
    this.nextReceiptNumber++;

    const result = await db.insert(carReceipts).values({
      ...receiptData,
      receiptNumber,
      receivedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }).returning();

    return result[0];
  }

  async getCarReceipts(limit = 50): Promise<CarReceipt[]> {
    return await db.select().from(carReceipts)
      .orderBy(desc(carReceipts.createdAt))
      .limit(limit);
  }

  async getCarReceipt(id: number): Promise<CarReceipt | undefined> {
    const result = await db.select().from(carReceipts).where(eq(carReceipts.id, id)).limit(1);
    return result[0];
  }

  async updateCarReceiptStatus(id: number, status: string, updatedBy?: string): Promise<CarReceipt> {
    const updateData: any = { status };
    
    if (status === "in_workshop" && updatedBy) {
      updateData.sentToWorkshopAt = new Date().toISOString();
      updateData.sentToWorkshopBy = updatedBy;
    } else if (status === "postponed" && updatedBy) {
      updateData.postponedAt = new Date().toISOString();
      updateData.postponedBy = updatedBy;
    }

    const result = await db.update(carReceipts)
      .set(updateData)
      .where(eq(carReceipts.id, id))
      .returning();

    return result[0];
  }

  async sendCarToWorkshop(id: number, sentBy: string): Promise<CarReceipt> {
    return this.updateCarReceiptStatus(id, "in_workshop", sentBy);
  }

  async postponeCarReceipt(id: number, postponedBy: string): Promise<CarReceipt> {
    return this.updateCarReceiptStatus(id, "postponed", postponedBy);
  }

  async searchCarReceipts(searchTerm: string): Promise<CarReceipt[]> {
    return await db.select().from(carReceipts)
      .where(or(
        like(carReceipts.licensePlate, `%${searchTerm}%`),
        like(carReceipts.customerName, `%${searchTerm}%`),
        like(carReceipts.receiptNumber, `%${searchTerm}%`)
      ))
      .orderBy(desc(carReceipts.createdAt));
  }

  async deleteCarReceipt(id: number): Promise<void> {
    await db.delete(carReceipts).where(eq(carReceipts.id, id));
  }

  // Notifications management
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values({
      ...notification,
      createdAt: new Date().toISOString()
    }).returning();
    return result[0];
  }

  async getNotifications(userId: string, isRead?: boolean): Promise<Notification[]> {
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));
    
    if (isRead !== undefined) {
      query = query.where(eq(notifications.isRead, isRead));
    }
    
    return await query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const result = await db.update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date().toISOString()
      })
      .where(eq(notifications.id, id))
      .returning();
    
    return result[0];
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }
}

export const storage = new SQLiteStorage();