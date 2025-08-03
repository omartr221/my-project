import { workers, tasks, timeEntries, customers, customerCars, users, partsRequests, carReceipts, type Worker, type InsertWorker, type Task, type InsertTask, type TimeEntry, type InsertTimeEntry, type WorkerWithTasks, type TaskWithWorker, type TaskHistory, type Customer, type InsertCustomer, type CustomerCar, type InsertCustomerCar, type CustomerWithCars, type User, type InsertUser, type PartsRequest, type InsertPartsRequest, type CarReceipt, type InsertCarReceipt } from "@shared/schema-sqlite";
import { db, sanitizeInsertData } from "./db-sqlite";
import { eq, desc, and, isNull, or, like, isNotNull, asc, sql } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";
import { sanitizeValue } from "./db-sqlite";

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
  getCarReceipts(): Promise<CarReceipt[]>;
  getCarReceiptById(id: number): Promise<CarReceipt | undefined>;
  updateCarReceipt(id: number, updates: Partial<CarReceipt>): Promise<CarReceipt>;
  deleteCarReceipt(id: number): Promise<void>;
  sendCarReceiptToWorkshop(id: number, sentBy: string): Promise<CarReceipt>;
  enterCarToWorkshop(id: number, enteredBy: string): Promise<CarReceipt>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new (MemoryStore(session))({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }
  
  async getWorkers(): Promise<WorkerWithTasks[]> {
    try {
      const allWorkers = await db.select().from(workers);
      const activeTasks = await db.select().from(tasks).where(eq(tasks.status, "active"));
      
      return allWorkers.map(worker => {
        const currentTask = activeTasks.find(task => task.workerId === worker.id);
        return {
          ...worker,
          tasks: currentTask ? [currentTask] : [],
          currentTask: currentTask || undefined,
          totalWorkTime: 0,
          isAvailable: !currentTask,
        };
      });
    } catch (error) {
      console.error("Error getting workers:", error);
      return [];
    }
  }

  async getAllWorkerNames(): Promise<string[]> {
    try {
      const allWorkers = await db.select({ name: workers.name }).from(workers);
      return allWorkers.map(w => w.name);
    } catch (error) {
      console.error("Error getting worker names:", error);
      return [];
    }
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    try {
      const [worker] = await db.select().from(workers).where(eq(workers.id, id));
      return worker || undefined;
    } catch (error) {
      console.error("Error getting worker:", error);
      return undefined;
    }
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const sanitizedWorker = sanitizeInsertData(worker);
    const [newWorker] = await db.insert(workers).values(sanitizedWorker).returning();
    return newWorker;
  }

  async updateWorker(id: number, updates: Partial<InsertWorker>): Promise<Worker> {
    const sanitizedUpdates = sanitizeInsertData(updates);
    const [updated] = await db.update(workers).set(sanitizedUpdates).where(eq(workers.id, id)).returning();
    return updated;
  }

  async getTasks(): Promise<TaskWithWorker[]> {
    try {
      const allTasks = await db.select().from(tasks);
      const allWorkers = await db.select().from(workers);
      
      return allTasks.map(task => ({
        ...task,
        worker: allWorkers.find(w => w.id === task.workerId)!
      }));
    } catch (error) {
      console.error("Error getting tasks:", error);
      return [];
    }
  }

  async getActiveTasks(): Promise<TaskWithWorker[]> {
    try {
      const activeTasks = await db.select().from(tasks).where(eq(tasks.status, "active"));
      const allWorkers = await db.select().from(workers);
      
      return activeTasks.map(task => ({
        ...task,
        worker: allWorkers.find(w => w.id === task.workerId)!
      }));
    } catch (error) {
      console.error("Error getting active tasks:", error);
      return [];
    }
  }

  async getTask(id: number): Promise<TaskWithWorker | undefined> {
    try {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
      if (!task) return undefined;
      
      const [worker] = await db.select().from(workers).where(eq(workers.id, task.workerId));
      return { ...task, worker };
    } catch (error) {
      console.error("Error getting task:", error);
      return undefined;
    }
  }

  async createTask(task: InsertTask): Promise<Task> {
    const sanitizedTask = sanitizeInsertData(task);
    const [newTask] = await db.insert(tasks).values(sanitizedTask).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const sanitizedUpdates = sanitizeInsertData(updates);
    const [updated] = await db.update(tasks).set(sanitizedUpdates).where(eq(tasks.id, id)).returning();
    return updated;
  }

  // Simplified implementations for other methods
  async startTask(taskId: number): Promise<TimeEntry> {
    const entryData = sanitizeInsertData({
      taskId,
      startTime: new Date().toISOString(),
      entryType: "work"
    });
    const timeEntry = await db.insert(timeEntries).values(entryData).returning();
    return timeEntry[0];
  }

  async pauseTask(taskId: number): Promise<Task> {
    const updateData = sanitizeInsertData({
      status: "paused",
      pausedAt: new Date().toISOString()
    });
    const [updated] = await db.update(tasks).set(updateData).where(eq(tasks.id, taskId)).returning();
    return updated;
  }

  async resumeTask(taskId: number): Promise<TimeEntry> {
    await db.update(tasks).set({
      status: "active",
      pausedAt: null
    }).where(eq(tasks.id, taskId));
    
    const entryData = sanitizeInsertData({
      taskId,
      startTime: new Date().toISOString(),
      entryType: "work"
    });
    const timeEntry = await db.insert(timeEntries).values(entryData).returning();
    return timeEntry[0];
  }

  async finishTask(taskId: number): Promise<Task> {
    const updateData = sanitizeInsertData({
      status: "completed",
      endTime: new Date().toISOString()
    });
    const [updated] = await db.update(tasks).set(updateData).where(eq(tasks.id, taskId)).returning();
    return updated;
  }

  async archiveTask(taskId: number, archivedBy: string, notes?: string, rating?: number): Promise<Task> {
    const updateData = sanitizeInsertData({
      status: "archived",
      isArchived: true,
      archivedAt: new Date().toISOString(),
      archivedBy,
      archiveNotes: notes,
      rating
    });
    const [updated] = await db.update(tasks).set(updateData).where(eq(tasks.id, taskId)).returning();
    return updated;
  }

  async cancelTask(taskId: number, cancelledBy: string, reason: string): Promise<Task> {
    const updateData = sanitizeInsertData({
      status: "cancelled",
      isCancelled: true,
      cancelledAt: new Date().toISOString(),
      cancelledBy,
      cancellationReason: reason
    });
    const [updated] = await db.update(tasks).set(updateData).where(eq(tasks.id, taskId)).returning();
    return updated;
  }

  async getArchivedTasks(limit = 50): Promise<TaskHistory[]> {
    try {
      const archived = await db.select().from(tasks)
        .where(eq(tasks.isArchived, true))
        .orderBy(desc(tasks.archivedAt))
        .limit(limit);
      return archived;
    } catch (error) {
      return [];
    }
  }

  async searchArchive(searchTerm: string): Promise<TaskHistory[]> {
    try {
      const results = await db.select().from(tasks)
        .where(
          and(
            eq(tasks.isArchived, true),
            or(
              like(tasks.description, `%${searchTerm}%`),
              like(tasks.licensePlate, `%${searchTerm}%`)
            )
          )
        )
        .orderBy(desc(tasks.archivedAt));
      return results;
    } catch (error) {
      return [];
    }
  }

  async getTaskHistory(limit = 100): Promise<TaskHistory[]> {
    try {
      const history = await db.select().from(tasks)
        .where(isNotNull(tasks.endTime))
        .orderBy(desc(tasks.endTime))
        .limit(limit);
      return history;
    } catch (error) {
      return [];
    }
  }

  async getWorkerStats(): Promise<{ totalWorkers: number; availableWorkers: number; busyWorkers: number; activeTasks: number }> {
    try {
      const allWorkers = await db.select().from(workers);
      const activeTasks = await db.select().from(tasks).where(eq(tasks.status, "active"));
      
      const totalWorkers = allWorkers.length;
      const busyWorkers = new Set(activeTasks.map(t => t.workerId)).size;
      const availableWorkers = totalWorkers - busyWorkers;
      
      return {
        totalWorkers,
        availableWorkers,
        busyWorkers,
        activeTasks: activeTasks.length
      };
    } catch (error) {
      return { totalWorkers: 0, availableWorkers: 0, busyWorkers: 0, activeTasks: 0 };
    }
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const userData = sanitizeInsertData({
      ...user,
      permissions: Array.isArray(user.permissions) 
        ? JSON.stringify(user.permissions) 
        : JSON.stringify([])
    });
    
    const [newUser] = await db.insert(users).values(userData).returning();
    return {
      ...newUser,
      permissions: JSON.parse(newUser.permissions || '[]')
    };
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const updateData = { ...updates };
    if (updateData.permissions) {
      updateData.permissions = Array.isArray(updateData.permissions)
        ? JSON.stringify(updateData.permissions)
        : JSON.stringify([]);
    }
    
    const sanitizedUpdates = sanitizeInsertData(updateData);
    const [updated] = await db.update(users).set(sanitizedUpdates).where(eq(users.id, id)).returning();
    return {
      ...updated,
      permissions: JSON.parse(updated.permissions || '[]')
    };
  }

  async updateUserPermissions(username: string, permissions: string[]): Promise<User> {
    const updateData = sanitizeInsertData({ 
      permissions: JSON.stringify(permissions.map(p => sanitizeValue(p))) 
    });
    const [updated] = await db.update(users)
      .set(updateData)
      .where(eq(users.username, username))
      .returning();
    return {
      ...updated,
      permissions: JSON.parse(updated.permissions || '[]')
    };
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Simplified implementations for remaining methods
  async getCarDataByLicensePlate(): Promise<null> { return null; }
  async getCustomers(): Promise<Customer[]> { return []; }
  async getCustomer(): Promise<undefined> { return undefined; }
  async createCustomer(customer: InsertCustomer): Promise<Customer> { 
    const sanitizedCustomer = sanitizeInsertData(customer);
    const [newCustomer] = await db.insert(customers).values(sanitizedCustomer).returning();
    return newCustomer;
  }
  async updateCustomer(): Promise<Customer> { throw new Error("Not implemented"); }
  async deleteCustomer(): Promise<void> { }
  async getCustomerCars(): Promise<CustomerCar[]> { return []; }
  async getCustomerCarsByCustomerId(): Promise<CustomerCar[]> { return []; }
  async getCustomerCar(): Promise<undefined> { return undefined; }
  async createCustomerCar(): Promise<CustomerCar> { throw new Error("Not implemented"); }
  async updateCustomerCar(): Promise<CustomerCar> { throw new Error("Not implemented"); }
  async deleteCustomerCar(): Promise<void> { }
  
  // Parts requests
  async getPartsRequests(): Promise<PartsRequest[]> {
    try {
      const requests = await db.select().from(partsRequests).orderBy(desc(partsRequests.createdAt));
      return requests;
    } catch (error) {
      return [];
    }
  }
  
  async getPartsRequest(id: number): Promise<PartsRequest | undefined> {
    try {
      const [request] = await db.select().from(partsRequests).where(eq(partsRequests.id, id));
      return request || undefined;
    } catch (error) {
      return undefined;
    }
  }
  
  async createPartsRequest(request: InsertPartsRequest): Promise<PartsRequest> {
    const requestNumber = `PR${Date.now()}`;
    const sanitizedRequest = sanitizeInsertData({
      ...request,
      requestNumber
    });
    const [newRequest] = await db.insert(partsRequests).values(sanitizedRequest).returning();
    return newRequest;
  }
  
  async updatePartsRequestStatus(id: number, status: string, notes?: string): Promise<PartsRequest> {
    const updateData = sanitizeInsertData({ status, notes });
    const [updated] = await db.update(partsRequests)
      .set(updateData)
      .where(eq(partsRequests.id, id))
      .returning();
    return updated;
  }
  
  async searchCarInfoForParts(): Promise<null> { return null; }
  async getPartsRequestsByLicensePlate(): Promise<PartsRequest[]> { return []; }
  async getTasksByLicensePlate(): Promise<Task[]> { return []; }
  
  // Car receipts
  async createCarReceipt(): Promise<CarReceipt> { throw new Error("Not implemented"); }
  async getCarReceipts(): Promise<CarReceipt[]> { return []; }
  async getCarReceiptById(): Promise<undefined> { return undefined; }
  async updateCarReceipt(): Promise<CarReceipt> { throw new Error("Not implemented"); }
  async deleteCarReceipt(): Promise<void> { }
  async sendCarReceiptToWorkshop(): Promise<CarReceipt> { throw new Error("Not implemented"); }
  async enterCarToWorkshop(): Promise<CarReceipt> { throw new Error("Not implemented"); }
}

export const storage = new DatabaseStorage();