import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users, Wrench, Package, Car, Calendar, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { formatDuration } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Types for archived tasks with staff details
type TaskDistributionEntry = {
  id: number;
  description: string;
  taskType: string;
  status: string;
  startTime: string;
  endTime: string;
  totalDuration: number;
  estimatedDuration?: number; // in minutes
  consumedTime?: number;
  workerName: string;
  engineerName?: string;
  technicianName?: string;
  assistantName?: string;
  supervisorName?: string;
  carBrand: string;
  carModel: string;
  licensePlate: string;
  customerName?: string;
  partsUsed?: string[];
  archivedAt: string;
  archivedBy: string;
  rating?: number;
  notes?: string;
};

export default function TaskDistribution() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState("الكل");
  const [activeTab, setActiveTab] = useState("distribution"); // distribution, cost-center, vehicle-history
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [costCenterTaskType, setCostCenterTaskType] = useState(""); // For cost center task type filter

  // Fetch archived tasks
  const { data: archivedTasks = [] } = useQuery<TaskDistributionEntry[]>({
    queryKey: ["/api/archive"],
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // Transfer task mutation
  const transferTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest(`/api/tasks/${taskId}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transferredBy: "ملك", // Current user (owner)
          transferNotes: "تم الترحيل بواسطة ملك للمراجعة"
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transferred"] });
      toast({
        title: "تم الترحيل بنجاح",
        description: "تم ترحيل المهمة إلى قائمة المهام المرحلة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الترحيل",
        description: "فشل في ترحيل المهمة",
        variant: "destructive",
      });
    },
  });

  // Filter archived tasks based on vehicle search term
  const getVehicleFilteredTasks = () => {
    if (!vehicleSearchTerm) return archivedTasks;
    
    return archivedTasks.filter(task => 
      task.licensePlate.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
      (task as any).chassisNumber?.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
      task.customerName?.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
    );
  };

  const vehicleFilteredTasks = getVehicleFilteredTasks();

  // Get all unique staff members from archived tasks
  const allStaff = Array.from(new Set([
    ...archivedTasks.map(task => task.workerName),
    ...archivedTasks.map(task => task.engineerName).filter(Boolean),
    ...archivedTasks.map(task => task.technicianName).filter(Boolean),
    ...archivedTasks.map(task => task.assistantName).filter(Boolean),
    ...archivedTasks.map(task => task.supervisorName).filter(Boolean),
    // Add technicians and assistants from the comma-separated fields
    ...archivedTasks.flatMap(task => Array.isArray((task as any).technicians) ? (task as any).technicians : []).filter(Boolean),
    ...archivedTasks.flatMap(task => Array.isArray((task as any).assistants) ? (task as any).assistants : []).filter(Boolean),
  ].filter(Boolean))).sort();

  // Filter tasks based on search and staff selection
  const filteredTasks = archivedTasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.carBrand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStaff = selectedStaff === "الكل" || 
      task.workerName === selectedStaff ||
      task.engineerName === selectedStaff ||
      task.technicianName === selectedStaff ||
      task.assistantName === selectedStaff ||
      task.supervisorName === selectedStaff ||
      (Array.isArray((task as any).technicians) && (task as any).technicians.includes(selectedStaff)) ||
      (Array.isArray((task as any).assistants) && (task as any).assistants.includes(selectedStaff));

    return matchesSearch && matchesStaff;
  });

  // Format duration from seconds to readable format (hours and minutes only)
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}س ${minutes}د`;
    }
    return `${minutes}د`;
  };

  // Get staff roles for a task
  const getTaskStaff = (task: TaskDistributionEntry) => {
    const staff = [];
    if (task.workerName) staff.push({ name: task.workerName, role: "عامل" });
    if (task.engineerName) staff.push({ name: task.engineerName, role: "مهندس" });
    if (task.supervisorName) staff.push({ name: task.supervisorName, role: "مشرف" });
    
    // Add technicians from both fields
    if (task.technicianName) staff.push({ name: task.technicianName, role: "فني" });
    if ((task as any).technicians) {
      const techs = Array.isArray((task as any).technicians) ? (task as any).technicians : [];
      techs.forEach((name: string) => {
        if (!staff.some(s => s.name === name)) {
          staff.push({ name, role: "فني" });
        }
      });
    }
    
    // Add assistants from both fields
    if (task.assistantName) staff.push({ name: task.assistantName, role: "مساعد" });
    if ((task as any).assistants) {
      const assists = Array.isArray((task as any).assistants) ? (task as any).assistants : [];
      assists.forEach((name: string) => {
        if (!staff.some(s => s.name === name)) {
          staff.push({ name, role: "مساعد" });
        }
      });
    }
    
    return staff;
  };

  // Check if a worker participated in a task (regardless of multiple roles)
  const didWorkerParticipateInTask = (task: TaskDistributionEntry, workerName: string): boolean => {
    // Check all possible roles/fields where the worker could be assigned
    if (task.workerName === workerName) return true;
    if (task.engineerName === workerName) return true;
    if (task.supervisorName === workerName) return true;
    if (task.technicianName === workerName) return true;
    if (task.assistantName === workerName) return true;
    
    // Check array fields
    if (Array.isArray((task as any).technicians) && (task as any).technicians.includes(workerName)) return true;
    if (Array.isArray((task as any).assistants) && (task as any).assistants.includes(workerName)) return true;
    
    return false;
  };

  // Get unique vehicles
  const allVehicles = Array.from(new Set(
    archivedTasks.map(task => `${task.carBrand} ${task.carModel} - ${task.licensePlate}`)
  )).sort();

  // Get unique task types from vehicle filtered tasks
  const getAvailableTaskTypes = () => {
    const tasks = vehicleSearchTerm ? vehicleFilteredTasks : archivedTasks;
    return Array.from(new Set(
      tasks.map(task => task.taskType).filter(Boolean)
    )).sort();
  };

  const availableTaskTypes = getAvailableTaskTypes();

  // Calculate worker hours for selected date range (count each task only once per worker)
  const calculateWorkerHours = (workerName: string, taskType?: string) => {
    if (!startDate || !endDate) {
      return []; // Return empty if no date range selected
    }

    const periodStart = new Date(startDate);
    const periodEnd = new Date(endDate);
    // Set end date to end of day
    periodEnd.setHours(23, 59, 59, 999);

    return archivedTasks.filter(task => {
      const taskDate = new Date(task.archivedAt);
      const isInPeriod = taskDate >= periodStart && taskDate <= periodEnd;
      const workedOnTask = didWorkerParticipateInTask(task, workerName);
      const matchesTaskType = !taskType || task.taskType === taskType;
      return isInPeriod && workedOnTask && matchesTaskType;
    });
  };

  // Get vehicle history
  const getVehicleHistory = (vehicleInfo: string) => {
    return archivedTasks.filter(task => 
      `${task.carBrand} ${task.carModel} - ${task.licensePlate}` === vehicleInfo
    ).sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            إدارة المهام المتقدمة
          </CardTitle>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-reverse space-x-4 border-b">
            <button
              onClick={() => setActiveTab("distribution")}
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === "distribution"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              توزيع المهام
            </button>
            <button
              onClick={() => setActiveTab("cost-center")}
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === "cost-center"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              مركز الكلفة
            </button>
            <button
              onClick={() => setActiveTab("vehicle-history")}
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === "vehicle-history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              حركة السيارة
            </button>
            <button
              onClick={() => setActiveTab("transferred")}
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === "transferred"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              } relative`}
            >
              المهام المرحلة
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-2 h-2"></span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab Content */}
          {activeTab === "distribution" && (
            <>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="البحث في المهام..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="الكل">جميع الموظفين</option>
                  {allStaff.map(staff => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>
              </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{filteredTasks.length}</p>
                  <p className="text-sm text-gray-600">إجمالي المهام</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{allStaff.length}</p>
                  <p className="text-sm text-gray-600">إجمالي الموظفين</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatDuration(filteredTasks.reduce((total, task) => total + (task.consumedTime || task.totalDuration || 0), 0))}
                  </p>
                  <p className="text-sm text-gray-600">إجمالي الوقت</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {(filteredTasks.reduce((sum, task) => sum + (task.rating || 0), 0) / filteredTasks.length || 0).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">متوسط التقييم</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد مهام مؤرشفة
              </div>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className="border-r-4 border-r-green-500">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Task Info */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Wrench className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold">{task.description}</h3>
                            <p className="text-sm text-gray-600">نوع: {task.taskType}</p>
                            {(task as any).invoiceType && (
                              <p className="text-sm text-gray-600">نوع الفاتورة: {(task as any).invoiceType}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {task.carBrand} {task.carModel} - {task.licensePlate}
                          </span>
                        </div>
                        
                        {task.customerName && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{task.customerName}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-600">
                            الوقت المقدر: {task.estimatedDuration ? `${task.estimatedDuration} دقيقة` : 'غير محدد'}
                          </span>
                        </div>
                      </div>

                      {/* Staff Assignment */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          الفريق المكلف:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {getTaskStaff(task).map((member, index) => (
                            <Badge 
                              key={index}
                              variant={member.name === selectedStaff ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {member.name} ({member.role})
                            </Badge>
                          ))}
                        </div>
                        
                        {task.partsUsed && task.partsUsed.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-gray-600 flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              القطع المستخدمة:
                            </h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.partsUsed.map((part, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {part}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Archive Info with Transfer Button */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            أُرشف {formatDistanceToNow(new Date(task.archivedAt), { locale: ar, addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          بواسطة: {task.archivedBy}
                        </div>

                        {/* Transfer Button */}
                        <div className="pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border-blue-200"
                            onClick={() => transferTaskMutation.mutate(task.id)}
                            disabled={transferTaskMutation.isPending}
                          >
                            <ArrowRight className="h-4 w-4 ml-1" />
                            {transferTaskMutation.isPending ? "جاري الترحيل..." : "ترحيل"}
                          </Button>
                        </div>
                        
                        {task.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm">التقييم:</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span
                                  key={star}
                                  className={`text-sm ${
                                    star <= task.rating! ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({task.rating}/5)</span>
                          </div>
                        )}
                        
                        {task.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>ملاحظات:</strong> {task.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
            </>
          )}

          {/* Cost Center Tab */}
          {activeTab === "cost-center" && (
            <div className="space-y-6">
              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">اختر العامل</option>
                    {allStaff.map(staff => (
                      <option key={staff} value={staff}>{staff}</option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2 items-center">
                    <label className="text-sm font-medium">من:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    />
                    <label className="text-sm font-medium">إلى:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                
                {selectedWorker && ((() => {
                  const workerTasks = calculateWorkerHours(selectedWorker);
                  const taskTypes = Array.from(new Set(
                    workerTasks.map(task => task.taskType).filter(Boolean)
                  )).sort();
                  
                  return taskTypes.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">تصفية حسب نوع المهمة:</label>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setCostCenterTaskType("")}
                          className={`px-3 py-2 rounded-md text-sm ${
                            costCenterTaskType === ""
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                        >
                          جميع الأنواع
                        </button>
                        {taskTypes.map(taskType => {
                          const typeCount = calculateWorkerHours(selectedWorker, taskType).length;
                          const typeTotalTime = calculateWorkerHours(selectedWorker, taskType)
                            .reduce((total, task) => total + (task.estimatedDuration || 0), 0);
                          
                          return (
                            <button
                              key={taskType}
                              onClick={() => setCostCenterTaskType(taskType)}
                              className={`px-3 py-2 rounded-md text-sm ${
                                costCenterTaskType === taskType
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              {taskType} ({typeCount} - {typeTotalTime}د)
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })())}
              </div>

              {selectedWorker ? (
                (() => {
                  const workerTasks = calculateWorkerHours(selectedWorker, costCenterTaskType || undefined);
                  const totalHours = workerTasks.reduce((total, task) => total + ((task.estimatedDuration || 0) * 60), 0); // Convert minutes to seconds
                  
                  return (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            إحصائيات العامل: {selectedWorker}
                            {startDate && endDate && (
                              <span className="text-sm text-gray-500 font-normal"> ({startDate} إلى {endDate})</span>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{workerTasks.length}</p>
                              <p className="text-sm text-gray-600">عدد المهام</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{formatDuration(totalHours)}</p>
                              <p className="text-sm text-gray-600">إجمالي الساعات المقدرة</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600">
                                {workerTasks.length > 0 ? Math.round((workerTasks.reduce((total, task) => total + (task.estimatedDuration || 0), 0)) / workerTasks.length) : 0} دقيقة
                              </p>
                              <p className="text-sm text-gray-600">متوسط الوقت المقدر لكل مهمة</p>
                            </div>
                          </div>

                          {/* Task Types Breakdown */}
                          {workerTasks.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">أنواع المهام المنجزة</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {(() => {
                                  const taskTypeStats: Record<string, { count: number; totalTime: number }> = {};
                                  workerTasks.forEach(task => {
                                    const type = task.taskType || 'غير محدد';
                                    if (!taskTypeStats[type]) {
                                      taskTypeStats[type] = {
                                        count: 0,
                                        totalTime: 0
                                      };
                                    }
                                    taskTypeStats[type].count++;
                                    taskTypeStats[type].totalTime += (task.estimatedDuration || 0);
                                  });

                                  return Object.entries(taskTypeStats).map(([type, stats]) => (
                                    <Card key={type} className="border-2 border-gray-200">
                                      <CardContent className="p-4 text-center">
                                        <div className="text-xl font-bold text-purple-600">
                                          {stats.count}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">{type}</div>
                                        <div className="text-xs text-gray-500">
                                          {stats.totalTime} دقيقة إجمالية
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <div className="space-y-3">
                        {workerTasks.map((task) => (
                          <Card key={task.id} className="border-r-4 border-r-blue-500">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="font-medium">{task.description}</h4>
                                  <p className="text-sm text-gray-600">{task.carBrand} {task.carModel} - {task.licensePlate}</p>
                                  {(task as any).invoiceType && (
                                    <p className="text-sm text-blue-600">نوع الفاتورة: {(task as any).invoiceType}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">تاريخ الإنجاز:</p>
                                  <p className="font-medium">{new Date(task.archivedAt).toLocaleDateString('ar-SY')}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">الوقت المقدر:</p>
                                  <p className="font-medium text-blue-600">
                                    {task.estimatedDuration ? `${task.estimatedDuration} دقيقة` : 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {!selectedWorker && "اختر عاملاً لعرض إحصائياته"}
                  {selectedWorker && (!startDate || !endDate) && "حدد الفترة الزمنية لعرض الإحصائيات"}
                </div>
              )}
            </div>
          )}

          {/* Vehicle History Tab */}
          {activeTab === "vehicle-history" && (
            <div className="space-y-6">
              {/* Search and Type Filter */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="أدخل رقم اللوحة أو الشاسيه أو اسم الزبون..."
                      value={vehicleSearchTerm}
                      onChange={(e) => {
                        setVehicleSearchTerm(e.target.value);
                        setSelectedTaskType(""); // إعادة تعيين فلتر نوع المهمة عند تغيير البحث
                        setShowSearchSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowSearchSuggestions(vehicleSearchTerm.length > 0)}
                      onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)} // Delay to allow click
                      className="text-center font-mono text-lg"
                    />
                    
                    {/* Search Suggestions */}
                    {showSearchSuggestions && vehicleSearchTerm && (() => {
                      // Generate suggestions based on search term
                      const suggestions = [];
                      
                      // License plate suggestions
                      const licenseMatches = archivedTasks.filter(task => 
                        task.licensePlate.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
                      ).slice(0, 5);
                      
                      // Customer name suggestions
                      const customerMatches = archivedTasks.filter(task => 
                        task.customerName?.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
                      ).slice(0, 5);
                      
                      // Chassis number suggestions (if field exists)
                      const chassisMatches = archivedTasks.filter(task => 
                        (task as any).chassisNumber?.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
                      ).slice(0, 5);
                      
                      // Combine unique suggestions
                      licenseMatches.forEach(task => {
                        if (!suggestions.find(s => s.value === task.licensePlate)) {
                          suggestions.push({
                            type: 'رقم اللوحة',
                            value: task.licensePlate,
                            description: `${task.carBrand} ${task.carModel} - ${task.customerName || 'غير محدد'}`
                          });
                        }
                      });
                      
                      customerMatches.forEach(task => {
                        if (task.customerName && !suggestions.find(s => s.value === task.customerName)) {
                          suggestions.push({
                            type: 'اسم الزبون',
                            value: task.customerName,
                            description: `${task.carBrand} ${task.carModel} - ${task.licensePlate}`
                          });
                        }
                      });
                      
                      chassisMatches.forEach(task => {
                        if ((task as any).chassisNumber && !suggestions.find(s => s.value === (task as any).chassisNumber)) {
                          suggestions.push({
                            type: 'رقم الشاسيه',
                            value: (task as any).chassisNumber,
                            description: `${task.carBrand} ${task.carModel} - ${task.licensePlate}`
                          });
                        }
                      });
                      
                      return suggestions.length > 0 ? (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setVehicleSearchTerm(suggestion.value);
                                setShowSearchSuggestions(false);
                                setSelectedTaskType("");
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{suggestion.value}</div>
                                  <div className="text-sm text-gray-500">{suggestion.description}</div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.type}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Task Types Filter */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">تصفية حسب نوع المهمة</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Card 
                      className={`cursor-pointer border-2 transition-colors ${selectedTaskType === "" ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}
                      onClick={() => setSelectedTaskType("")}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {vehicleFilteredTasks.length}
                        </div>
                        <div className="text-sm text-gray-600">جميع المهام</div>
                      </CardContent>
                    </Card>
                    
                    {availableTaskTypes.map(taskType => {
                      const typeCount = vehicleFilteredTasks.filter(task => task.taskType === taskType).length;
                      return (
                        <Card 
                          key={taskType}
                          className={`cursor-pointer border-2 transition-colors ${selectedTaskType === taskType ? "border-green-500 bg-green-50" : "hover:border-gray-300"}`}
                          onClick={() => setSelectedTaskType(taskType)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {typeCount}
                            </div>
                            <div className="text-sm text-gray-600">{taskType}</div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>

              {(() => {
                // Apply both search and type filters
                let displayTasks = vehicleFilteredTasks;
                if (selectedTaskType) {
                  displayTasks = vehicleFilteredTasks.filter(task => task.taskType === selectedTaskType);
                }
                
                const totalHours = displayTasks.reduce((total, task) => total + (task.totalDuration || 0), 0);
                
                return displayTasks.length > 0 ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          {vehicleSearchTerm ? 'نتائج البحث' : selectedTaskType ? `مهام نوع: ${selectedTaskType}` : 'جميع المهام'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{displayTasks.length}</p>
                            <p className="text-sm text-gray-600">عدد المهام</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{formatDuration(totalHours)}</p>
                            <p className="text-sm text-gray-600">إجمالي ساعات العمل</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">
                              {displayTasks.length > 0 
                                ? formatDistanceToNow(new Date(displayTasks[displayTasks.length - 1].archivedAt), { locale: ar, addSuffix: true })
                                : '--'
                              }
                            </p>
                            <p className="text-sm text-gray-600">آخر مهمة</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {displayTasks.map((task) => (
                            <Card key={task.id} className="border-r-4 border-r-purple-500">
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <h4 className="font-medium">{task.description}</h4>
                                    <p className="text-sm text-gray-600">نوع: {task.taskType}</p>
                                    <p className="text-sm text-gray-500">{task.carBrand} {task.carModel}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">الزبون:</p>
                                    <p className="font-medium">{task.customerName || 'غير محدد'}</p>
                                    <p className="text-sm text-gray-500">{task.licensePlate}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">التاريخ:</p>
                                    <p className="font-medium">{new Date(task.archivedAt).toLocaleDateString('ar-SY')}</p>
                                    <p className="text-sm text-gray-500">المدة: {formatDuration(task.totalDuration || 0)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">العمال:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {getTaskStaff(task).map((member, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {member.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {vehicleSearchTerm 
                        ? `لا توجد مهام للبحث: ${vehicleSearchTerm}` 
                        : selectedTaskType 
                        ? `لا توجد مهام من نوع: ${selectedTaskType}`
                        : 'لا توجد مهام للعرض'
                      }
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Transferred Tasks Tab */}
          {activeTab === "transferred" && (
            <TransferredTasksView />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Component for transferred tasks
function TransferredTasksView() {
  const { data: transferredTasks = [] } = useQuery<TaskDistributionEntry[]>({
    queryKey: ["/api/transferred"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (transferredTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <ArrowRight className="h-16 w-16 mx-auto" />
        </div>
        <p className="text-gray-500">لا توجد مهام مرحلة بعد</p>
        <p className="text-sm text-gray-400">ستظهر المهام المرحلة هنا بعد قيام ملك بترحيلها</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">المهام المرحلة ({transferredTasks.length})</h3>
        </div>
        <p className="text-sm text-gray-500">المهام التي راجعتها ملك</p>
      </div>

      <div className="grid gap-4">
        {transferredTasks.map((task) => (
          <Card key={task.id} className="border-r-4 border-r-blue-500">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Info */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">{task.description}</h3>
                      <p className="text-sm text-gray-600">نوع: {task.taskType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {task.carBrand} {task.carModel} - {task.licensePlate}
                    </span>
                  </div>
                  
                  {task.customerName && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{task.customerName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">
                      الوقت المقدر: {task.estimatedDuration ? `${task.estimatedDuration} دقيقة` : 'غير محدد'}
                    </span>
                  </div>
                </div>

                {/* Staff Assignment */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    الفريق المكلف:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const staff = [];
                      if (task.workerName) staff.push({ name: task.workerName, role: 'عامل' });
                      if (task.engineerName) staff.push({ name: task.engineerName, role: 'مهندس' });
                      if (task.supervisorName) staff.push({ name: task.supervisorName, role: 'مشرف' });
                      if (task.technicianName) staff.push({ name: task.technicianName, role: 'فني' });
                      if (task.assistantName) staff.push({ name: task.assistantName, role: 'مساعد' });
                      return staff.map((member, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {member.name} ({member.role})
                        </Badge>
                      ));
                    })()}
                  </div>
                </div>

                {/* Transfer Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      رُحّل {formatDistanceToNow(new Date((task as any).transferredAt), { locale: ar, addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    بواسطة: {(task as any).transferredBy}
                  </div>
                  
                  {(task as any).transferNotes && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <strong>ملاحظات الترحيل:</strong> {(task as any).transferNotes}
                    </div>
                  )}

                  <div className="bg-blue-50 p-2 rounded text-center">
                    <span className="text-xs text-blue-600 font-medium">✓ تمت المراجعة</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}