import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Archive, Search, Download, FolderArchive, Calendar as CalendarIcon, Printer, FileText, Star, Edit2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDuration, formatTime, formatDate, getCarBrandInArabic, getTaskStatusInArabic, getTaskStatusColor, cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { type TaskHistory } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const archiveFormSchema = z.object({
  archivedBy: z.string().min(1, "يجب إدخال اسم المؤرشف"),
  notes: z.string().optional(),
});

const editTaskSchema = z.object({
  description: z.string().min(1, "وصف المهمة مطلوب"),
  engineerName: z.string().optional(),
  supervisorName: z.string().optional(),
  technicianName: z.string().optional(),
  assistantName: z.string().optional(),
  technicians: z.array(z.string()).optional(),
  assistants: z.array(z.string()).optional(),
  repairOperation: z.string().optional(),
  taskType: z.string().optional(),
  carBrand: z.string().min(1, "ماركة السيارة مطلوبة"),
  carModel: z.string().min(1, "موديل السيارة مطلوب"),
  licensePlate: z.string().optional(),
  color: z.string().optional(),
  estimatedDuration: z.number().optional(),
  totalDuration: z.number().optional(),
  dueDate: z.string().optional(),
  rating: z.number().min(1).max(3).optional(),
  archiveNotes: z.string().optional(),
});

type ArchiveFormData = z.infer<typeof archiveFormSchema>;
type EditTaskFormData = z.infer<typeof editTaskSchema>;

export default function ArchiveView() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // تحديد نص البحث المناسب حسب المستخدم
  const getSearchPlaceholder = () => {
    if (user?.username === 'بدوي') {
      return "ابحث برقم اللوحة أو اسم المهمة فقط...";
    }
    return "ابحث في المهام المؤرشفة...";
  };
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  });
  const [viewMode, setViewMode] = useState<"all" | "date" | "range">("all");

  // Fetch archived tasks
  const { data: archivedTasks, isLoading: loadingArchive } = useQuery({
    queryKey: ['/api/archive'],
    refetchInterval: 30000,
  });

  // Fetch search results
  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: [`/api/archive/search?q=${encodeURIComponent(searchTerm)}`],
    enabled: searchTerm.length > 2,
  });

  // Fetch task history for archiving
  const { data: taskHistory } = useQuery({
    queryKey: ['/api/tasks/history'],
    refetchInterval: 30000,
  });

  const form = useForm<ArchiveFormData>({
    resolver: zodResolver(archiveFormSchema),
    defaultValues: {
      archivedBy: "",
      notes: "",
    },
  });

  const editForm = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      description: "",
      engineerName: "",
      supervisorName: "",
      technicianName: "",
      assistantName: "",
      technicians: [],
      assistants: [],
      repairOperation: "",
      taskType: "",
      carBrand: "",
      carModel: "",
      licensePlate: "",
      color: "",
      estimatedDuration: undefined,
      totalDuration: undefined,
      dueDate: "",
      rating: undefined,
      archiveNotes: "",
    },
  });

  const archiveTaskMutation = useMutation({
    mutationFn: async (data: ArchiveFormData) => {
      if (!selectedTaskId) throw new Error("لم يتم اختيار مهمة");
      
      const response = await apiRequest("POST", `/api/tasks/${selectedTaskId}/archive`, {
        archivedBy: data.archivedBy,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/archive'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
      form.reset();
      setSelectedTaskId(null);
      toast({
        title: "تم أرشفة المهمة",
        description: "تم أرشفة المهمة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الأرشفة",
        description: "حدث خطأ أثناء أرشفة المهمة",
        variant: "destructive",
      });
    },
  });

  const editTaskMutation = useMutation({
    mutationFn: async (data: EditTaskFormData) => {
      if (!editTaskId) throw new Error("لم يتم اختيار مهمة للتعديل");
      
      // Convert totalDuration from minutes to seconds for database storage
      const updatedData = {
        ...data,
        totalDuration: data.totalDuration ? data.totalDuration * 60 : undefined,
      };
      
      const response = await apiRequest("PATCH", `/api/archive/${editTaskId}`, updatedData);
      return response.json();
    },
    onSuccess: () => {
      // Force invalidate ALL cache and refetch data
      queryClient.invalidateQueries();
      queryClient.refetchQueries({ queryKey: ['/api/archive'] });
      queryClient.refetchQueries({ queryKey: ['/api/tasks/history'] });
      queryClient.refetchQueries({ queryKey: ['/api/task-distribution'] });
      
      editForm.reset();
      setEditTaskId(null);
      toast({
        title: "تم تحديث المهمة",
        description: "تم تحديث المهمة المؤرشفة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error?.message || "حدث خطأ أثناء تحديث المهمة",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length > 2) {
      queryClient.invalidateQueries({ queryKey: [`/api/archive/search?q=${encodeURIComponent(searchTerm)}`] });
    }
  };

  const completedTasks = taskHistory?.filter(task => task.status === 'completed') || [];
  
  // Filter tasks based on view mode
  const getFilteredTasks = () => {
    let baseTasks = searchTerm.length > 2 ? searchResults : archivedTasks;
    if (!baseTasks) return [];

    switch (viewMode) {
      case "date":
        if (!selectedDate) return baseTasks;
        return baseTasks.filter(task => {
          if (!task.archivedAt) return false;
          const taskDate = new Date(task.archivedAt);
          return taskDate.toDateString() === selectedDate.toDateString();
        });
      
      case "range":
        if (!dateRange.from || !dateRange.to) return baseTasks;
        return baseTasks.filter(task => {
          if (!task.archivedAt) return false;
          const taskDate = new Date(task.archivedAt);
          return taskDate >= dateRange.from! && taskDate <= dateRange.to!;
        });
      
      default:
        return baseTasks;
    }
  };

  const displayTasks = getFilteredTasks();
  const isLoading = searchTerm.length > 2 ? loadingSearch : loadingArchive;

  const handlePrint = () => {
    const printContent = generatePrintContent(displayTasks || []);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const onSubmit = (data: ArchiveFormData) => {
    archiveTaskMutation.mutate(data);
  };

  // Function to clean corrupted arrays and extract actual names
  const cleanArrayData = (arrayData: any): string[] => {
    if (!arrayData) return [];
    
    if (Array.isArray(arrayData)) {
      const results: string[] = [];
      for (const item of arrayData) {
        if (typeof item === 'string') {
          let cleanItem = item;
          while (typeof cleanItem === 'string' && (cleanItem.includes('{') || cleanItem.includes('['))) {
            try {
              const parsed = JSON.parse(cleanItem);
              if (typeof parsed === 'string') {
                cleanItem = parsed;
              } else if (Array.isArray(parsed)) {
                results.push(...cleanArrayData(parsed));
                cleanItem = '';
                break;
              } else if (typeof parsed === 'object' && parsed !== null) {
                const keys = Object.keys(parsed);
                if (keys.length > 0) {
                  cleanItem = parsed[keys[0]];
                } else {
                  break;
                }
              } else {
                break;
              }
            } catch {
              break;
            }
          }
          if (typeof cleanItem === 'string' && cleanItem.trim() !== '') {
            results.push(cleanItem);
          }
        } else if (item) {
          results.push(String(item));
        }
      }
      return results.filter(item => item.trim() !== '');
    }
    
    if (typeof arrayData === 'string') {
      return cleanArrayData([arrayData]);
    }
    
    return [];
  };

  const onEditSubmit = (data: EditTaskFormData) => {
    console.log("=== Archive Edit Form Submit ===");
    console.log("Data being submitted:", data);
    console.log("Edit task ID:", editTaskId);
    
    // Clean the technicians and assistants arrays before submitting
    const cleanedData = {
      ...data,
      technicians: cleanArrayData(data.technicians),
      assistants: cleanArrayData(data.assistants)
    };
    
    console.log("Cleaned data:", cleanedData);
    editTaskMutation.mutate(cleanedData);
  };

  const handleEditTask = (task: TaskHistory) => {
    setEditTaskId(task.id);
    editForm.reset({
      description: task.description || "",
      engineerName: task.engineerName || "",
      supervisorName: task.supervisorName || "",
      technicianName: task.technicianName || "",
      assistantName: task.assistantName || "",
      technicians: cleanArrayData((task as any).technicians),
      assistants: cleanArrayData((task as any).assistants),
      repairOperation: (task as any).repairOperation || "",
      taskType: (task as any).taskType || "",
      carBrand: task.carBrand || "",
      carModel: task.carModel || "",
      licensePlate: task.licensePlate || "",
      color: (task as any).color || "",
      estimatedDuration: task.estimatedDuration || undefined,
      totalDuration: task.totalDuration ? Math.round(task.totalDuration / 60) : undefined, // Convert seconds to minutes
      dueDate: (task as any).dueDate ? new Date((task as any).dueDate).toISOString().split('T')[0] : "",
      rating: task.rating || undefined,
      archiveNotes: task.archiveNotes || "",
    });
  };

  const generatePrintContent = (tasks: TaskHistory[]) => {
    const currentDate = new Date().toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory',
      timeZone: 'Asia/Damascus'
    });
    const totalTasks = tasks.length;
    const totalDuration = tasks.reduce((sum, task) => sum + task.totalDuration, 0);

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الاستلام النهائي - V POWER TUNING</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            direction: rtl;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 5px;
          }
          .report-date {
            color: #718096;
            font-size: 14px;
          }
          .summary {
            background-color: #f7fafc;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .summary-item {
            display: inline-block;
            margin-left: 30px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
            font-size: 12px;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .status-active { background-color: #fed7d7; color: #c53030; }
          .status-paused { background-color: #fefcbf; color: #d69e2e; }
          .status-completed { background-color: #c6f6d5; color: #2f855a; }
          .status-archived { background-color: #bee3f8; color: #2b6cb0; }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #718096;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">V POWER TUNING</div>
          <div class="report-title">تقرير الاستلام النهائي</div>
          <div class="report-date">تاريخ التقرير: ${currentDate}</div>
        </div>
        
        <div class="summary">
          <span class="summary-item">إجمالي المهام: ${totalTasks}</span>
          <span class="summary-item">إجمالي الوقت: ${formatDuration(totalDuration)}</span>
          <span class="summary-item">النوع: ${viewMode === 'all' ? 'جميع المهام' : viewMode === 'date' ? 'يوم محدد' : 'فترة زمنية'}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>رقم التسليم</th>
              <th>العامل</th>
              <th>الدور</th>
              <th>المهمة</th>
              <th>عملية الإصلاح</th>
              <th>نوع المهمة</th>
              <th>السيارة</th>
              <th>رقم اللوحة</th>
              <th>اللون</th>
              <th>المهندس</th>
              <th>المشرف</th>
              <th>الفنيون</th>
              <th>المساعدون</th>
              <th>الوقت المقدر</th>
              <th>المدة الفعلية</th>
              <th>نسبة العمل المئوية</th>
              <th>التقييم</th>
              <th>تاريخ إنهاء المهمة</th>
              <th>تاريخ التسليم</th>
              <th>تم التسليم بواسطة</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map((task, index) => {
              const archiveDate = task.archivedAt ? 
                new Intl.DateTimeFormat('ar-EG', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  calendar: 'gregory',
                  timeZone: 'Asia/Damascus'
                }).format(new Date(task.archivedAt)) : '--';
              
              const endDate = task.endTime ? 
                new Intl.DateTimeFormat('ar-EG', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  calendar: 'gregory',
                  timeZone: 'Asia/Damascus'
                }).format(new Date(task.endTime)) : '--';
              
              const ratingText = task.rating === 1 ? 'مقبول' : task.rating === 2 ? 'جيد' : task.rating === 3 ? 'ممتاز' : '--';
              const engineerName = task.engineerName || '--';
              const supervisorName = task.supervisorName || '--';
              const actualDuration = (task as any).consumedTime && (task as any).consumedTime > 0
                ? (task as any).consumedTime 
                : (task.totalDuration || 0);
              const workPercentage = task.estimatedDuration ? 
                Math.round(((task.estimatedDuration * 60) / actualDuration) * 100) + '%' : '--';
              
              return `
                <tr>
                  <td>${(task as any).deliveryNumber || '--'}</td>
                  <td>${(task.engineerName && task.engineerName !== '') ? task.engineerName : 
                       (task.supervisorName && task.supervisorName !== '') ? task.supervisorName : 
                       (task.technicianName && task.technicianName !== '') ? task.technicianName : 
                       (task.assistantName && task.assistantName !== '') ? task.assistantName : 
                       task.worker.name}</td>
                  <td>${task.workerRole || '--'}</td>
                  <td>${task.description}</td>
                  <td>${(task as any).repairOperation || '--'}</td>
                  <td>${(task as any).taskType || '--'}</td>
                  <td>${getCarBrandInArabic(task.carBrand)} ${task.carModel}</td>
                  <td>${task.licensePlate || '--'}</td>
                  <td>${(task as any).color || '--'}</td>
                  <td>${engineerName}</td>
                  <td>${supervisorName}</td>
                  <td>${(() => {
                    const cleanedTechnicians = Array.isArray((task as any).technicians) 
                      ? (task as any).technicians.map((tech: any) => {
                          if (typeof tech === 'string') {
                            let cleanItem = tech;
                            while (typeof cleanItem === 'string' && (cleanItem.includes('{') || cleanItem.includes('['))) {
                              try {
                                const parsed = JSON.parse(cleanItem);
                                if (typeof parsed === 'string') {
                                  cleanItem = parsed;
                                } else if (Array.isArray(parsed) && parsed.length > 0) {
                                  cleanItem = parsed[0];
                                } else if (typeof parsed === 'object' && parsed !== null) {
                                  const keys = Object.keys(parsed);
                                  if (keys.length > 0) {
                                    cleanItem = parsed[keys[0]];
                                  } else {
                                    break;
                                  }
                                } else {
                                  break;
                                }
                              } catch {
                                break;
                              }
                            }
                            return cleanItem;
                          }
                          return tech;
                        }).filter((item: any) => typeof item === 'string' && item.trim() !== '')
                      : [];
                    return cleanedTechnicians.length > 0 ? cleanedTechnicians.join(', ') : ((task as any).technicianName || '--');
                  })()}</td>
                  <td>${(() => {
                    const cleanedAssistants = Array.isArray((task as any).assistants) 
                      ? (task as any).assistants.map((asst: any) => {
                          if (typeof asst === 'string') {
                            let cleanItem = asst;
                            while (typeof cleanItem === 'string' && (cleanItem.includes('{') || cleanItem.includes('['))) {
                              try {
                                const parsed = JSON.parse(cleanItem);
                                if (typeof parsed === 'string') {
                                  cleanItem = parsed;
                                } else if (Array.isArray(parsed) && parsed.length > 0) {
                                  cleanItem = parsed[0];
                                } else if (typeof parsed === 'object' && parsed !== null) {
                                  const keys = Object.keys(parsed);
                                  if (keys.length > 0) {
                                    cleanItem = parsed[keys[0]];
                                  } else {
                                    break;
                                  }
                                } else {
                                  break;
                                }
                              } catch {
                                break;
                              }
                            }
                            return cleanItem;
                          }
                          return asst;
                        }).filter((item: any) => typeof item === 'string' && item.trim() !== '')
                      : [];
                    return cleanedAssistants.length > 0 ? cleanedAssistants.join(', ') : ((task as any).assistantName || '--');
                  })()}</td>
                  <td>${task.estimatedDuration ? task.estimatedDuration + ' دقيقة' : 'غير محدد'}</td>
                  <td>${(task as any).consumedTime && (task as any).consumedTime > 0
                    ? formatDuration((task as any).consumedTime) 
                    : formatDuration(task.totalDuration || 0)}</td>
                  <td>${workPercentage}</td>
                  <td>${ratingText}</td>
                  <td>${endDate}</td>
                  <td>${archiveDate}</td>
                  <td>${task.archivedBy || '--'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          تم إنشاء هذا التقرير بواسطة نظام توزيع المهام - V POWER TUNING<br>
          جميع الحقوق محفوظة © 2025
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="w-5 h-5" />
          استلام نهائي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filter Section */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <Input
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Printer className="w-4 h-4 ml-1" />
              طباعة
            </Button>
          </div>

          {/* View Mode Buttons */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("all")}
            >
              جميع المهام
            </Button>
            <Button
              variant={viewMode === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("date")}
            >
              يوم محدد
            </Button>
          </div>

          {/* Date Picker for specific date */}
          {viewMode === "date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ar }) : "اختر تاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Tasks Display */}
        {isLoading ? (
          <div className="text-center py-8">جاري تحميل المهام...</div>
        ) : (
          <div>
            {displayTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد مهام في الاستلام النهائي
              </div>
            ) : (
              <div className="space-y-4">
                {displayTasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="mb-3 pb-2 border-b border-gray-300">
                      <h3 className={`text-lg font-semibold ${(task as any).isCancelled ? 'text-red-600' : 'text-blue-800'}`}>
                        {(task as any).isCancelled ? 'مهمة ملغاة - ' : 'تسليم رقم: '}{(task as any).deliveryNumber || 'غير محدد'}
                        {(task as any).isCancelled && (
                          <span className="mr-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                            ملغاة
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium">المهندس:</span> {((task as any).engineerName && (task as any).engineerName !== '') ? (task as any).engineerName : 
                         ((task as any).supervisorName && (task as any).supervisorName !== '') ? (task as any).supervisorName : 
                         ((task as any).technicianName && (task as any).technicianName !== '') ? (task as any).technicianName : 
                         ((task as any).assistantName && (task as any).assistantName !== '') ? (task as any).assistantName : 
                         task.worker.name}
                      </div>
                      <div>
                        <span className="font-medium">المهمة:</span> {task.description}
                      </div>
                      <div>
                        <span className="font-medium">عملية الإصلاح:</span> {(task as any).repairOperation && (task as any).repairOperation.trim() !== '' ? (task as any).repairOperation : '--'}
                      </div>
                      <div>
                        <span className="font-medium">نوع المهمة:</span> {(task as any).taskType && (task as any).taskType.trim() !== '' ? (task as any).taskType : '--'}
                      </div>
                      <div>
                        <span className="font-medium">السيارة:</span> {getCarBrandInArabic(task.carBrand)} {task.carModel}
                      </div>
                      <div>
                        <span className="font-medium">رقم اللوحة:</span> {task.licensePlate || '--'}
                      </div>
                      <div>
                        <span className="font-medium">اللون:</span> {(task as any).color || '--'}
                      </div>
                      <div>
                        <span className="font-medium">المشرفون:</span>
                        <div className="mt-1">
                          {(() => {
                            const cleanedSupervisors = cleanArrayData((task as any).supervisors);
                            return cleanedSupervisors.length > 0 ? (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                {cleanedSupervisors.join(', ')}
                              </span>
                            ) : task.supervisorName && task.supervisorName !== '' ? (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                {task.supervisorName}
                              </span>
                            ) : (
                              <span className="text-gray-500">--</span>
                            );
                          })()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">الفنيون:</span>
                        <div className="mt-1">
                          {(() => {
                            const cleanedTechnicians = cleanArrayData((task as any).technicians);
                            return cleanedTechnicians.length > 0 ? (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                {cleanedTechnicians.join(', ')}
                              </span>
                            ) : (task as any).technicianName && (task as any).technicianName !== '' ? (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                {(task as any).technicianName}
                              </span>
                            ) : (
                              <span className="text-gray-500">--</span>
                            );
                          })()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">المساعدون:</span>
                        <div className="mt-1">
                          {(() => {
                            const cleanedAssistants = cleanArrayData((task as any).assistants);
                            return cleanedAssistants.length > 0 ? (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                {cleanedAssistants.join(', ')}
                              </span>
                            ) : (task as any).assistantName && (task as any).assistantName !== '' ? (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                {(task as any).assistantName}
                              </span>
                            ) : (
                              <span className="text-gray-500">--</span>
                            );
                          })()}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium">الوقت المقدر:</span> {task.estimatedDuration ? `${task.estimatedDuration} دقيقة` : '--'}
                      </div>
                      <div>
                        <span className="font-medium">المدة الفعلية:</span> {formatDuration(task.totalDuration || 0)}
                      </div>
                      <div>
                        <span className="font-medium">نسبة العمل المئوية:</span> 
                        {task.estimatedDuration && task.estimatedDuration > 0 ? (() => {
                          const estimatedSeconds = task.estimatedDuration * 60;
                          const actualSeconds = task.totalDuration || 0;
                          // حساب الكفاءة: الوقت المقدر ÷ الوقت الفعلي × 100
                          const efficiency = actualSeconds > 0 ? Math.round((estimatedSeconds / actualSeconds) * 100) : 0;
                          return (
                            <span className={`font-bold ml-2 ${
                              actualSeconds <= estimatedSeconds ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {efficiency}% 
                              <span className="text-xs text-gray-500 mr-1">
                                ({task.estimatedDuration}د مقابل {formatDuration(actualSeconds)})
                              </span>
                            </span>
                          );
                        })() : <span className="text-gray-500">--</span>}
                      </div>
                      <div>
                        <span className="font-medium">تقييم العمل:</span> 
                        {task.rating ? (
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3].map((star) => (
                              <Star 
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= task.rating 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            ))}
                            <span className="text-sm mr-2">
                              {task.rating === 1 && "مقبول"}
                              {task.rating === 2 && "جيد"}  
                              {task.rating === 3 && "ممتاز"}
                            </span>
                          </div>
                        ) : '--'}
                      </div>
                      <div>
                        <span className="font-medium">تاريخ إنهاء المهمة:</span> {task.endTime ? 
                          new Intl.DateTimeFormat('ar-EG', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            calendar: 'gregory',
                            timeZone: 'Asia/Damascus'
                          }).format(new Date(task.endTime)) : '--'}
                      </div>
                      <div>
                        <span className="font-medium">تاريخ التسليم:</span> {task.archivedAt ? 
                          new Intl.DateTimeFormat('ar-EG', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            calendar: 'gregory',
                            timeZone: 'Asia/Damascus'
                          }).format(new Date(task.archivedAt)) : '--'}
                      </div>
                      <div>
                        <span className="font-medium">تم التسليم بواسطة:</span> {task.archivedBy || '--'}
                      </div>
                      {task.archiveNotes && (
                        <div className="col-span-full">
                          <span className="font-medium">ملاحظات التسليم:</span> {task.archiveNotes}
                        </div>
                      )}
                      
                      {(task as any).isCancelled && (
                        <div className="col-span-full bg-red-50 border border-red-200 rounded p-3 mt-4">
                          <h4 className="font-medium text-red-800 mb-2">معلومات الإلغاء:</h4>
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium text-red-700">سبب الإلغاء:</span> {(task as any).cancellationReason || '--'}
                            </div>
                            <div>
                              <span className="font-medium text-red-700">ألغاها:</span> {(task as any).cancelledBy || '--'}
                            </div>
                            <div>
                              <span className="font-medium text-red-700">تاريخ الإلغاء:</span> {(task as any).cancelledAt ? 
                                new Intl.DateTimeFormat('ar-EG', {
                                  day: 'numeric',
                                  month: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  calendar: 'gregory',
                                  timeZone: 'Asia/Damascus'
                                }).format(new Date((task as any).cancelledAt)) : '--'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* زر التعديل */}
                    <div className="mt-4 flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTask(task)}
                            className="flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            تعديل المهمة
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>تعديل المهمة المؤرشفة</DialogTitle>
                          </DialogHeader>
                          <Form {...editForm}>
                            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={editForm.control}
                                  name="description"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>وصف المهمة</FormLabel>
                                      <FormControl>
                                        <Textarea {...field} placeholder="أدخل وصف المهمة" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="repairOperation"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>عملية الإصلاح</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل عملية الإصلاح" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="taskType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>نوع المهمة</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل نوع المهمة" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="carBrand"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>ماركة السيارة</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل ماركة السيارة" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="carModel"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>موديل السيارة</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل موديل السيارة" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="licensePlate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>رقم اللوحة</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل رقم اللوحة" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="color"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>اللون</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل لون السيارة" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="engineerName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>اسم المهندس</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل اسم المهندس" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="supervisorName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>اسم المشرف</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل اسم المشرف" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="technicianName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>اسم الفني</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل اسم الفني" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="assistantName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>اسم المساعد</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="أدخل اسم المساعد" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="estimatedDuration"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>الوقت المقدر (بالدقائق)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="number" 
                                          placeholder="أدخل الوقت المقدر"
                                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="totalDuration"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>الوقت الفعلي (بالدقائق)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="number" 
                                          placeholder="الوقت الفعلي المستغرق"
                                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="dueDate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>تاريخ انتهاء المهمة</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="date" 
                                          placeholder="أدخل تاريخ انتهاء المهمة"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="rating"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>التقييم (1-3)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="number" 
                                          min="1" 
                                          max="3" 
                                          placeholder="أدخل التقييم"
                                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={editForm.control}
                                name="archiveNotes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ملاحظات التسليم</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} placeholder="أدخل ملاحظات التسليم" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setEditTaskId(null)}>
                                  إلغاء
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={editTaskMutation.isPending}
                                >
                                  {editTaskMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}