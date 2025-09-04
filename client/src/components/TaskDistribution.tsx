import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users, Wrench, Package, Car, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { formatDuration } from "@/lib/utils";

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
  const [selectedStaff, setSelectedStaff] = useState("الكل");
  const [activeTab, setActiveTab] = useState("distribution"); // distribution, cost-center, vehicle-history
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [licensePlateSearch, setLicensePlateSearch] = useState("");

  // Fetch archived tasks
  const { data: archivedTasks = [] } = useQuery<TaskDistributionEntry[]>({
    queryKey: ["/api/archive"],
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // Fetch active tasks for selected license plate
  const { data: activeTasks = [] } = useQuery<any[]>({
    queryKey: ["/api/tasks/by-car", licensePlateSearch],
    enabled: !!licensePlateSearch,
    refetchInterval: 5000, // تحديث كل 5 ثواني
  });

  // Fetch customer info for selected license plate
  const { data: customerInfo } = useQuery<any>({
    queryKey: ["/api/search-car-info", licensePlateSearch],
    enabled: !!licensePlateSearch,
  });

  // Get all unique staff members from archived tasks
  const allStaff = Array.from(new Set([
    ...archivedTasks.map(task => task.workerName),
    ...archivedTasks.map(task => task.engineerName).filter(Boolean),
    ...archivedTasks.map(task => task.technicianName).filter(Boolean),
    ...archivedTasks.map(task => task.assistantName).filter(Boolean),
    ...archivedTasks.map(task => task.supervisorName).filter(Boolean),
    // Add technicians and assistants from the comma-separated fields
    ...archivedTasks.flatMap(task => (task as any).technicians ? (task as any).technicians.split(',').map((name: string) => name.trim()) : []).filter(Boolean),
    ...archivedTasks.flatMap(task => (task as any).assistants ? (task as any).assistants.split(',').map((name: string) => name.trim()) : []).filter(Boolean),
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
      ((task as any).technicians && (task as any).technicians.includes(selectedStaff)) ||
      ((task as any).assistants && (task as any).assistants.includes(selectedStaff));

    return matchesSearch && matchesStaff;
  });

  // Format duration from seconds to readable format
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}س ${minutes}د ${secs}ث`;
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
      const techs = (task as any).technicians.split(',').map((name: string) => name.trim()).filter(Boolean);
      techs.forEach((name: string) => {
        if (!staff.some(s => s.name === name)) {
          staff.push({ name, role: "فني" });
        }
      });
    }
    
    // Add assistants from both fields
    if (task.assistantName) staff.push({ name: task.assistantName, role: "مساعد" });
    if ((task as any).assistants) {
      const assists = (task as any).assistants.split(',').map((name: string) => name.trim()).filter(Boolean);
      assists.forEach((name: string) => {
        if (!staff.some(s => s.name === name)) {
          staff.push({ name, role: "مساعد" });
        }
      });
    }
    
    return staff;
  };

  // Get unique vehicles
  const allVehicles = Array.from(new Set(
    archivedTasks.map(task => `${task.carBrand} ${task.carModel} - ${task.licensePlate}`)
  )).sort();

  // Calculate worker hours for selected date range
  const calculateWorkerHours = (workerName: string) => {
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
      const workedOnTask = getTaskStaff(task).some(staff => staff.name === workerName);
      return isInPeriod && workedOnTask;
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

                      {/* Archive Info */}
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
              <div className="flex gap-4 mb-6">
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

              {selectedWorker ? (
                (() => {
                  const workerTasks = calculateWorkerHours(selectedWorker);
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
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="أدخل رقم اللوحة للبحث..."
                    value={licensePlateSearch}
                    onChange={(e) => setLicensePlateSearch(e.target.value)}
                    className="text-center font-mono text-lg"
                  />
                </div>
              </div>

              {licensePlateSearch ? (
                <div className="space-y-6">
                  {/* Customer Information */}
                  {customerInfo && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          معلومات الزبون والسيارة
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">اسم الزبون</p>
                            <p className="font-semibold">{customerInfo.customerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">رقم الهاتف</p>
                            <p className="font-semibold">{customerInfo.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">السيارة</p>
                            <p className="font-semibold">{customerInfo.carBrand} {customerInfo.carModel}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">رقم اللوحة</p>
                            <p className="font-semibold font-mono">{customerInfo.licensePlate}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Active Tasks */}
                  {activeTasks && activeTasks.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-500" />
                          المهام النشطة الحالية
                          <Badge variant="secondary">{activeTasks.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {activeTasks.map((task: any) => (
                            <Card key={task.id} className="border-r-4 border-r-orange-500">
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="font-medium">{task.description}</h4>
                                    <p className="text-sm text-gray-600">نوع: {task.taskType}</p>
                                    <Badge className={task.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                                      {task.status === 'active' ? 'نشط' : 'متوقف'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">العامل</p>
                                    <p className="font-medium">{task.workerName}</p>
                                    <p className="text-sm text-gray-500">
                                      بدأت: {new Date(task.startTime).toLocaleString('ar-SY')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">الوقت المقدر</p>
                                    <p className="font-medium text-blue-600">
                                      {task.estimatedDuration ? `${task.estimatedDuration} دقيقة` : 'غير محدد'}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Vehicle History */}
                  {(() => {
                    const vehicleHistory = archivedTasks.filter(task => 
                      task.licensePlate.toLowerCase().includes(licensePlateSearch.toLowerCase())
                    );
                    const totalHours = vehicleHistory.reduce((total, task) => total + (task.totalDuration || 0), 0);
                    
                    return vehicleHistory.length > 0 ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            تاريخ الزيارات
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{vehicleHistory.length}</p>
                              <p className="text-sm text-gray-600">عدد الزيارات</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{formatDuration(totalHours)}</p>
                              <p className="text-sm text-gray-600">إجمالي ساعات العمل</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600">
                                {vehicleHistory.length > 0 
                                  ? formatDistanceToNow(new Date(vehicleHistory[vehicleHistory.length - 1].archivedAt), { locale: ar, addSuffix: true })
                                  : '--'
                                }
                              </p>
                              <p className="text-sm text-gray-600">آخر زيارة</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {vehicleHistory.map((task) => (
                              <Card key={task.id} className="border-r-4 border-r-purple-500">
                                <CardContent className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                      <h4 className="font-medium">{task.description}</h4>
                                      <p className="text-sm text-gray-600">نوع: {task.taskType}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">التاريخ:</p>
                                      <p className="font-medium">{new Date(task.archivedAt).toLocaleDateString('ar-SY')}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">المدة:</p>
                                      <p className="font-medium text-green-600">{formatDuration(task.totalDuration || 0)}</p>
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
                    ) : null;
                  })()}

                  {!customerInfo && !activeTasks?.length && (
                    <div className="text-center py-12 text-gray-500">
                      <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد معلومات لرقم اللوحة المدخل</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>أدخل رقم اللوحة للبحث عن معلومات السيارة</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}