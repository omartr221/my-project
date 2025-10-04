import { type Worker, type InsertWorker, type Task, type InsertTask, type TimeEntry, type InsertTimeEntry, type WorkerWithTasks, type TaskWithWorker, type TaskHistory, type Customer, type InsertCustomer, type CustomerCar, type InsertCustomerCar, type CustomerWithCars, type User, type InsertUser, type PartsRequest, type InsertPartsRequest, type CarReceipt, type InsertCarReceipt } from "@shared/schema";
import type { IStorage } from "./storage";

// In-memory data stores
let workers: Worker[] = [];
let tasks: Task[] = [];
let timeEntries: TimeEntry[] = [];
let customers: Customer[] = [];
let customerCars: CustomerCar[] = [];
let users: User[] = [];
let partsRequests: PartsRequest[] = [];
let carReceipts: CarReceipt[] = [];

// Auto-increment counters
let nextWorkerId = 1;
let nextTaskId = 1;
let nextTimeEntryId = 1;
let nextCustomerId = 1;
let nextCustomerCarId = 1;
let nextUserId = 1;
let nextPartsRequestId = 1;
let nextCarReceiptId = 1;
let nextTaskNumber = 1;
let nextReceiptNumber = 1;
let nextRequestNumber = 1;
let nextDeliveryNumber = 1;

export class MemoryStorage implements IStorage {
  
  // Worker management
  async getWorkers(): Promise<WorkerWithTasks[]> {
    return workers.map(worker => ({
      ...worker,
      tasks: tasks.filter(task => task.workerId === worker.id)
    }));
  }

  async getAllWorkerNames(): Promise<string[]> {
    return workers.map(w => w.name);
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    return workers.find(w => w.id === id);
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const newWorker: Worker = {
      ...worker,
      id: nextWorkerId++,
      isActive: worker.isActive ?? true,
      isPredefined: worker.isPredefined ?? false,
      createdAt: new Date().toISOString()
    };
    workers.push(newWorker);
    return newWorker;
  }

  async updateWorker(id: number, updates: Partial<InsertWorker>): Promise<Worker> {
    const index = workers.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Worker not found');
    workers[index] = { ...workers[index], ...updates };
    return workers[index];
  }

  // Task management
  async getTasks(): Promise<TaskWithWorker[]> {
    return tasks.map(task => {
      const worker = workers.find(w => w.id === task.workerId);
      return {
        ...task,
        worker: worker || null,
        technicians: typeof task.technicians === 'string' ? JSON.parse(task.technicians || '[]') : [],
        assistants: typeof task.assistants === 'string' ? JSON.parse(task.assistants || '[]') : []
      };
    });
  }

  async getActiveTasks(): Promise<TaskWithWorker[]> {
    const allTasks = await this.getTasks();
    return allTasks.filter(task => task.status === 'active');
  }

  async getTask(id: number): Promise<TaskWithWorker | undefined> {
    const task = tasks.find(t => t.id === id);
    if (!task) return undefined;
    
    const worker = workers.find(w => w.id === task.workerId);
    return {
      ...task,
      worker: worker || null,
      technicians: typeof task.technicians === 'string' ? JSON.parse(task.technicians || '[]') : [],
      assistants: typeof task.assistants === 'string' ? JSON.parse(task.assistants || '[]') : []
    };
  }

  async createTask(task: InsertTask): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: nextTaskId++,
      taskNumber: `T${nextTaskNumber++}`,
      status: task.status || 'active',
      timerType: task.timerType || 'automatic',
      workerRole: task.workerRole || 'technician',
      totalPausedDuration: task.totalPausedDuration || 0,
      isArchived: task.isArchived || false,
      isCancelled: task.isCancelled || false,
      startTime: task.startTime || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      technicians: typeof task.technicians === 'object' ? JSON.stringify(task.technicians) : task.technicians || '[]',
      assistants: typeof task.assistants === 'object' ? JSON.stringify(task.assistants) : task.assistants || '[]'
    };
    tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    
    if (updates.technicians && typeof updates.technicians === 'object') {
      updates.technicians = JSON.stringify(updates.technicians);
    }
    if (updates.assistants && typeof updates.assistants === 'object') {
      updates.assistants = JSON.stringify(updates.assistants);
    }
    
    tasks[index] = { ...tasks[index], ...updates };
    return tasks[index];
  }

  // Time tracking
  async startTask(taskId: number): Promise<TimeEntry> {
    const timeEntry: TimeEntry = {
      id: nextTimeEntryId++,
      taskId,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      entryType: 'work',
      createdAt: new Date().toISOString()
    };
    timeEntries.push(timeEntry);
    return timeEntry;
  }

  async pauseTask(taskId: number): Promise<Task> {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    
    task.status = 'paused';
    task.pausedAt = new Date().toISOString();
    return task;
  }

  async resumeTask(taskId: number): Promise<TimeEntry> {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    
    task.status = 'active';
    task.pausedAt = null;
    
    return this.startTask(taskId);
  }

  async finishTask(taskId: number): Promise<Task> {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    
    task.status = 'completed';
    task.endTime = new Date().toISOString();
    task.deliveryNumber = nextDeliveryNumber++;
    return task;
  }

  // Archive management
  async archiveTask(taskId: number, archivedBy: string, notes?: string, rating?: number): Promise<Task> {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    
    task.isArchived = true;
    task.archivedAt = new Date().toISOString();
    task.archivedBy = archivedBy;
    task.archiveNotes = notes || null;
    task.rating = rating || null;
    return task;
  }

  async cancelTask(taskId: number, cancelledBy: string, reason: string): Promise<Task> {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    
    task.isCancelled = true;
    task.cancelledAt = new Date().toISOString();
    task.cancelledBy = cancelledBy;
    task.cancellationReason = reason;
    task.status = 'cancelled';
    return task;
  }

  async getArchivedTasks(limit?: number): Promise<TaskHistory[]> {
    const archived = tasks.filter(task => task.isArchived);
    const result = archived.slice(0, limit);
    return result.map(task => ({
      ...task,
      worker: workers.find(w => w.id === task.workerId) || null,
      technicians: typeof task.technicians === 'string' ? JSON.parse(task.technicians || '[]') : [],
      assistants: typeof task.assistants === 'string' ? JSON.parse(task.assistants || '[]') : []
    }));
  }

  async searchArchive(searchTerm: string): Promise<TaskHistory[]> {
    const archived = tasks.filter(task => 
      task.isArchived && 
      (task.description.includes(searchTerm) || 
       task.licensePlate.includes(searchTerm) ||
       task.carBrand.includes(searchTerm) ||
       task.carModel.includes(searchTerm))
    );
    return archived.map(task => ({
      ...task,
      worker: workers.find(w => w.id === task.workerId) || null,
      technicians: typeof task.technicians === 'string' ? JSON.parse(task.technicians || '[]') : [],
      assistants: typeof task.assistants === 'string' ? JSON.parse(task.assistants || '[]') : []
    }));
  }

  // History and reporting
  async getTaskHistory(limit?: number): Promise<TaskHistory[]> {
    const completed = tasks.filter(task => task.status === 'completed' || task.isArchived);
    const result = completed.slice(0, limit);
    return result.map(task => ({
      ...task,
      worker: workers.find(w => w.id === task.workerId) || null,
      technicians: typeof task.technicians === 'string' ? JSON.parse(task.technicians || '[]') : [],
      assistants: typeof task.assistants === 'string' ? JSON.parse(task.assistants || '[]') : []
    }));
  }

  async getWorkerStats(): Promise<{ totalWorkers: number; availableWorkers: number; busyWorkers: number; activeTasks: number }> {
    const totalWorkers = workers.filter(w => w.isActive).length;
    const activeTasks = tasks.filter(t => t.status === 'active').length;
    const busyWorkerIds = new Set(tasks.filter(t => t.status === 'active').map(t => t.workerId));
    const busyWorkers = busyWorkerIds.size;
    const availableWorkers = totalWorkers - busyWorkers;

    return {
      totalWorkers,
      availableWorkers,
      busyWorkers,
      activeTasks
    };
  }

  // Car data for autofill
  async getCarDataByLicensePlate(licensePlate: string): Promise<{ carBrand: string; carModel: string; color?: string } | null> {
    const task = tasks.find(t => t.licensePlate === licensePlate);
    if (task) {
      return {
        carBrand: task.carBrand,
        carModel: task.carModel,
        color: task.color || undefined
      };
    }
    
    const car = customerCars.find(c => c.licensePlate === licensePlate);
    if (car) {
      return {
        carBrand: car.carBrand,
        carModel: car.carModel,
        color: car.color || undefined
      };
    }
    
    return null;
  }

  // Customer management
  async getCustomers(): Promise<Customer[]> {
    return customers;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return customers.find(c => c.id === id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const newCustomer: Customer = {
      ...customer,
      id: nextCustomerId++,
      customerStatus: customer.customerStatus || "A",
      isFavorite: customer.isFavorite ?? false,
      createdAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer> {
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    customers[index] = { ...customers[index], ...updates };
    return customers[index];
  }

  async deleteCustomer(id: number): Promise<void> {
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    customers.splice(index, 1);
  }

  // Customer cars management
  async getCustomerCars(): Promise<CustomerCar[]> {
    return customerCars;
  }

  async getCustomerCarsByCustomerId(customerId: number): Promise<CustomerCar[]> {
    return customerCars.filter(car => car.customerId === customerId);
  }

  async getCustomerCar(id: number): Promise<CustomerCar | undefined> {
    return customerCars.find(car => car.id === id);
  }

  async createCustomerCar(car: InsertCustomerCar): Promise<CustomerCar> {
    const newCar: CustomerCar = {
      ...car,
      id: nextCustomerCarId++,
      previousLicensePlate: car.previousLicensePlate || null,
      createdAt: new Date().toISOString()
    };
    customerCars.push(newCar);
    return newCar;
  }

  async updateCustomerCar(id: number, updates: Partial<InsertCustomerCar>): Promise<CustomerCar> {
    const index = customerCars.findIndex(car => car.id === id);
    if (index === -1) throw new Error('Customer car not found');
    customerCars[index] = { ...customerCars[index], ...updates };
    return customerCars[index];
  }

  async deleteCustomerCar(id: number): Promise<void> {
    const index = customerCars.findIndex(car => car.id === id);
    if (index === -1) throw new Error('Customer car not found');
    customerCars.splice(index, 1);
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: nextUserId++,
      permissions: Array.isArray(user.permissions) ? JSON.stringify(user.permissions) : user.permissions || '[]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    if (updates.permissions && Array.isArray(updates.permissions)) {
      updates.permissions = JSON.stringify(updates.permissions);
    }
    
    users[index] = { 
      ...users[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return users[index];
  }

  async updateUserPermissions(username: string, permissions: string[]): Promise<User> {
    const user = users.find(u => u.username === username);
    if (!user) throw new Error('User not found');
    
    user.permissions = JSON.stringify(permissions);
    user.updatedAt = new Date().toISOString();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users.splice(index, 1);
  }

  // Parts requests management
  async getPartsRequests(): Promise<PartsRequest[]> {
    return partsRequests;
  }

  async getPartsRequest(id: number): Promise<PartsRequest | undefined> {
    return partsRequests.find(p => p.id === id);
  }

  async createPartsRequest(request: InsertPartsRequest): Promise<PartsRequest> {
    const newRequest: PartsRequest = {
      ...request,
      id: nextPartsRequestId++,
      requestNumber: `PR${nextRequestNumber++}`,
      status: request.status || 'pending',
      requestedAt: new Date().toISOString()
    };
    partsRequests.push(newRequest);
    return newRequest;
  }

  async updatePartsRequestStatus(id: number, status: string, notes?: string): Promise<PartsRequest> {
    const index = partsRequests.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Parts request not found');
    
    const updates: any = { status };
    if (notes) updates.notes = notes;
    
    // Set appropriate timestamp based on status
    if (status === 'approved') updates.approvedAt = new Date().toISOString();
    else if (status === 'in_preparation') updates.inPreparationAt = new Date().toISOString();
    else if (status === 'ready_for_pickup') updates.readyForPickupAt = new Date().toISOString();
    else if (status === 'parts_arrived') updates.partsArrivedAt = new Date().toISOString();
    else if (status === 'delivered') updates.deliveredAt = new Date().toISOString();
    else if (status === 'unavailable') updates.unavailableAt = new Date().toISOString();
    else if (status === 'returned') updates.returnedAt = new Date().toISOString();
    
    partsRequests[index] = { ...partsRequests[index], ...updates };
    return partsRequests[index];
  }

  async searchCarInfoForParts(searchTerm: string): Promise<{ carBrand: string; carModel: string; color?: string; licensePlate?: string; chassisNumber?: string; engineCode?: string; customerName?: string } | null> {
    // Search in tasks first
    const task = tasks.find(t => 
      t.licensePlate?.includes(searchTerm) || 
      t.carBrand?.includes(searchTerm) ||
      t.carModel?.includes(searchTerm)
    );
    
    if (task) {
      return {
        carBrand: task.carBrand,
        carModel: task.carModel,
        color: task.color,
        licensePlate: task.licensePlate
      };
    }
    
    // Search in customer cars
    const car = customerCars.find(c => 
      c.licensePlate?.includes(searchTerm) ||
      c.carBrand?.includes(searchTerm) ||
      c.carModel?.includes(searchTerm) ||
      c.chassisNumber?.includes(searchTerm) ||
      c.engineCode?.includes(searchTerm)
    );
    
    if (car) {
      const customer = customers.find(cust => cust.id === car.customerId);
      return {
        carBrand: car.carBrand,
        carModel: car.carModel,
        color: car.color,
        licensePlate: car.licensePlate,
        chassisNumber: car.chassisNumber,
        engineCode: car.engineCode,
        customerName: customer?.name
      };
    }
    
    return null;
  }

  async getPartsRequestsByLicensePlate(licensePlate: string): Promise<PartsRequest[]> {
    return partsRequests.filter(p => p.licensePlate === licensePlate);
  }

  async getTasksByLicensePlate(licensePlate: string): Promise<Task[]> {
    return tasks.filter(t => t.licensePlate === licensePlate);
  }

  // Car receipts management
  async createCarReceipt(receiptData: InsertCarReceipt): Promise<CarReceipt> {
    const newReceipt: CarReceipt = {
      ...receiptData,
      id: nextCarReceiptId++,
      receiptNumber: `R${nextReceiptNumber++}`,
      createdAt: new Date().toISOString()
    };
    carReceipts.push(newReceipt);
    return newReceipt;
  }
}

export const memoryStorage = new MemoryStorage();