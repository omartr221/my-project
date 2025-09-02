import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users, Wrench, Package, Car, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

// Types for archived tasks with staff details
type TaskDistributionEntry = {
  id: number;
  description: string;
  taskType: string;
  status: string;
  startTime: string;
  endTime: string;
  totalDuration: number;
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

  // Fetch archived tasks
  const { data: archivedTasks = [] } = useQuery<TaskDistributionEntry[]>({
    queryKey: ["/api/archive"],
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // Get all unique staff members from archived tasks
  const allStaff = Array.from(new Set([
    ...archivedTasks.map(task => task.workerName),
    ...archivedTasks.map(task => task.engineerName).filter(Boolean),
    ...archivedTasks.map(task => task.technicianName).filter(Boolean),
    ...archivedTasks.map(task => task.assistantName).filter(Boolean),
    ...archivedTasks.map(task => task.supervisorName).filter(Boolean),
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
      task.supervisorName === selectedStaff;

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
    if (task.technicianName) staff.push({ name: task.technicianName, role: "فني" });
    if (task.assistantName) staff.push({ name: task.assistantName, role: "مساعد" });
    if (task.supervisorName) staff.push({ name: task.supervisorName, role: "مشرف" });
    return staff;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            توزيع المهام - الأرشيف
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    {formatDuration(filteredTasks.reduce((total, task) => total + task.totalDuration, 0))}
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
                          <Clock className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            {formatDuration(task.totalDuration)}
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
        </CardContent>
      </Card>
    </div>
  );
}