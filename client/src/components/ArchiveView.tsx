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
import { Archive, Search, Download, FolderArchive, Calendar as CalendarIcon, Printer, FileText, Star } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDuration, formatTime, formatDate, getCarBrandInArabic, getTaskStatusInArabic, getTaskStatusColor, cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type TaskHistory } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const archiveFormSchema = z.object({
  archivedBy: z.string().min(1, "يجب إدخال اسم المؤرشف"),
  notes: z.string().optional(),
});

type ArchiveFormData = z.infer<typeof archiveFormSchema>;

export default function ArchiveView() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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
    queryKey: ['/api/archive/search', searchTerm],
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length > 2) {
      queryClient.invalidateQueries({ queryKey: ['/api/archive/search', searchTerm] });
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
              
              const ratingText = task.rating === 1 ? 'مقبول' : task.rating === 2 ? 'جيد' : task.rating === 3 ? 'ممتاز' : '--';
              const engineerName = task.engineerName || '--';
              const supervisorName = task.supervisorName || '--';
              const actualDuration = (task as any).timerType === 'manual' && (task as any).consumedTime 
                ? (task as any).consumedTime * 60 
                : task.totalDuration;
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
                  <td>${(task as any).technicians && (task as any).technicians.length > 0 ? 
                    (task as any).technicians.join(', ') : 
                    ((task as any).technicianName || '--')}</td>
                  <td>${(task as any).assistants && (task as any).assistants.length > 0 ? 
                    (task as any).assistants.join(', ') : 
                    ((task as any).assistantName || '--')}</td>
                  <td>${task.estimatedDuration ? task.estimatedDuration + ' دقيقة' : 'غير محدد'}</td>
                  <td>${(task as any).timerType === 'manual' && (task as any).consumedTime 
                    ? formatDuration((task as any).consumedTime * 60) 
                    : formatDuration(task.totalDuration)}</td>
                  <td>${workPercentage}</td>
                  <td>${ratingText}</td>
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
                placeholder="ابحث في المهام المؤرشفة..."
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
                        <span className="font-medium">عملية الإصلاح:</span> {(task as any).repairOperation || '--'}
                      </div>
                      <div>
                        <span className="font-medium">نوع المهمة:</span> {(task as any).taskType || '--'}
                        {/* Debug: Show task data */}
                        {console.log('Task data:', task)}
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
                        <span className="font-medium">المشرف:</span> {task.supervisorName || '--'}
                      </div>
                      <div>
                        <span className="font-medium">الفنيون:</span>
                        <div className="mt-1">
                          {(task as any).technicians && (task as any).technicians.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(task as any).technicians.map((tech: string, index: number) => (
                                <span key={index} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          ) : (task as any).technicianName && (task as any).technicianName !== '' ? (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                              {(task as any).technicianName}
                            </span>
                          ) : (
                            <span className="text-gray-500">--</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">المساعدون:</span>
                        <div className="mt-1">
                          {(task as any).assistants && (task as any).assistants.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(task as any).assistants.map((assistant: string, index: number) => (
                                <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                  {assistant}
                                </span>
                              ))}
                            </div>
                          ) : (task as any).assistantName && (task as any).assistantName !== '' ? (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                              {(task as any).assistantName}
                            </span>
                          ) : (
                            <span className="text-gray-500">--</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium">الوقت المقدر:</span> {task.estimatedDuration ? `${task.estimatedDuration} دقيقة` : '--'}
                      </div>
                      <div>
                        <span className="font-medium">المدة الفعلية:</span> {(task as any).timerType === 'manual' && (task as any).consumedTime 
                          ? formatDuration((task as any).consumedTime * 60) 
                          : formatDuration(task.totalDuration)}
                      </div>
                      <div>
                        <span className="font-medium">نسبة العمل المئوية:</span> 
                        {task.estimatedDuration && task.estimatedDuration > 0 ? (() => {
                          const estimatedSeconds = task.estimatedDuration * 60;
                          const actualSeconds = (task as any).timerType === 'manual' && (task as any).consumedTime 
                            ? (task as any).consumedTime * 60 
                            : task.totalDuration;
                          // حساب الكفاءة: الوقت المقدر ÷ الوقت الفعلي × 100
                          const efficiency = Math.round((estimatedSeconds / actualSeconds) * 100);
                          return (
                            <span className={`font-bold ml-2 ${
                              actualSeconds <= estimatedSeconds ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {efficiency}% 
                              <span className="text-xs text-gray-500 mr-1">
                                ({task.estimatedDuration}د مقابل {Math.round(actualSeconds/60)}د)
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