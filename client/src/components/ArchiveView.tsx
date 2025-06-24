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
import { Archive, Search, Download, FolderArchive, Calendar as CalendarIcon, Printer, FileText } from "lucide-react";
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

  // Fetch all task history for archiving
  const { data: taskHistory } = useQuery({
    queryKey: ['/api/tasks/history'],
  });

  const form = useForm<ArchiveFormData>({
    resolver: zodResolver(archiveFormSchema),
    defaultValues: {
      archivedBy: "",
      notes: "",
    },
  });

  const archiveTaskMutation = useMutation({
    mutationFn: async (data: ArchiveFormData & { taskId: number }) => {
      const response = await apiRequest("POST", `/api/tasks/${data.taskId}/archive`, {
        archivedBy: data.archivedBy,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/archive'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      form.reset();
      setSelectedTaskId(null);
      toast({
        title: "تم أرشفة المهمة بنجاح",
        description: "تم نقل المهمة إلى الأرشيف",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في أرشفة المهمة",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ArchiveFormData) => {
    if (selectedTaskId) {
      archiveTaskMutation.mutate({ ...data, taskId: selectedTaskId });
    }
  };

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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintContent(displayTasks);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generatePrintContent = (tasks: TaskHistory[]) => {
    const currentDate = format(new Date(), 'PPP', { locale: ar });
    const totalTasks = tasks.length;
    const totalDuration = tasks.reduce((sum, task) => sum + task.totalDuration, 0);

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الأرشيف - V POWER TUNING</title>
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
          <div class="report-title">تقرير أرشيف المهام</div>
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
              <th>العامل</th>
              <th>المهمة</th>
              <th>السيارة</th>
              <th>المدة</th>
              <th>تاريخ الأرشفة</th>
              <th>المؤرشف بواسطة</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(task => `
              <tr>
                <td>${task.worker.name}</td>
                <td>
                  ${task.description}
                  ${task.archiveNotes ? `<br><small>ملاحظات: ${task.archiveNotes}</small>` : ''}
                </td>
                <td>
                  ${getCarBrandInArabic(task.carBrand)}<br>
                  <small>${task.carModel} - ${task.licensePlate}</small>
                </td>
                <td>${formatDuration(task.totalDuration)}</td>
                <td>${task.archivedAt ? format(new Date(task.archivedAt), 'PP', { locale: ar }) : '--'}</td>
                <td>${task.archivedBy || '--'}</td>
                <td class="status-${task.status}">${getTaskStatusInArabic(task.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          تم إنشاء هذا التقرير بواسطة نظام إدارة الوقت - V POWER TUNING<br>
          جميع الحقوق محفوظة © 2025
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Archive Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Archive Task */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderArchive className="ml-2 h-5 w-5" />
              أرشفة مهمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  لا توجد مهام مكتملة للأرشفة
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">اختر مهمة للأرشفة:</p>
                  {completedTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{task.worker.name}</p>
                        <p className="text-sm text-gray-600">
                          {task.description} - {getCarBrandInArabic(task.carBrand)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.carModel} - {task.licensePlate}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedTaskId(task.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Archive className="ml-1 h-3 w-3" />
                            أرشف
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>أرشفة المهمة</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <FormField
                                control={form.control}
                                name="archivedBy"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>اسم المؤرشف</FormLabel>
                                    <FormControl>
                                      <Input placeholder="اسم المدير أو المسؤول" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ملاحظات الأرشفة (اختيارية)</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="أي ملاحظات إضافية حول المهمة..."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button 
                                type="submit" 
                                disabled={archiveTaskMutation.isPending}
                                className="w-full"
                              >
                                {archiveTaskMutation.isPending ? "جاري الأرشفة..." : "أرشف المهمة"}
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter Archive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="ml-2 h-5 w-5" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <form onSubmit={handleSearch}>
                <div className="flex space-x-reverse space-x-2">
                  <Input
                    type="text"
                    placeholder="ابحث في الوصف، الموديل، رقم اللوحة، أو الملاحظات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={searchTerm.length < 3}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Date Filter Buttons */}
              <div className="flex flex-wrap gap-2">
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
                <Button
                  variant={viewMode === "range" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("range")}
                >
                  فترة زمنية
                </Button>
              </div>

              {/* Date Pickers */}
              {viewMode === "date" && (
                <div className="flex items-center space-x-reverse space-x-2">
                  <label className="text-sm font-medium">التاريخ:</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-right font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
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
                </div>
              )}

              {viewMode === "range" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">من:</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-right font-normal w-full",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {dateRange.from ? (
                            format(dateRange.from, "PPP", { locale: ar })
                          ) : (
                            <span>التاريخ الأول</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">إلى:</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-right font-normal w-full",
                            !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {dateRange.to ? (
                            format(dateRange.to, "PPP", { locale: ar })
                          ) : (
                            <span>التاريخ الثاني</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Archive Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Archive className="ml-2 h-5 w-5" />
                {searchTerm.length > 2 ? `نتائج البحث: "${searchTerm}"` : "الأرشيف"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {displayTasks?.length || 0} مهمة
                {viewMode === "date" && selectedDate && ` - ${format(selectedDate, "PPP", { locale: ar })}`}
                {viewMode === "range" && dateRange.from && dateRange.to && 
                  ` - من ${format(dateRange.from, "PP", { locale: ar })} إلى ${format(dateRange.to, "PP", { locale: ar })}`
                }
              </p>
            </div>
            <div className="flex space-x-reverse space-x-2">
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="ml-2 h-4 w-4" />
                طباعة التقرير
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="ml-2 h-4 w-4" />
                تصدير Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              جاري التحميل...
            </div>
          ) : !displayTasks || displayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm.length > 2 ? "لا توجد نتائج للبحث" : "لا توجد مهام مؤرشفة"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العامل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المهمة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السيارة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المدة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الأداء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الأرشفة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المؤرشف بواسطة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 ml-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {task.worker.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{task.description}</div>
                          {task.archiveNotes && (
                            <div className="text-xs text-gray-500 mt-1">
                              ملاحظات: {task.archiveNotes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {getCarBrandInArabic(task.carBrand)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.carModel} - {task.licensePlate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDuration(task.totalDuration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.estimatedDuration ? (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">
                              مقدر: {formatDuration(task.estimatedDuration * 60)}
                            </div>
                            <div className={`text-xs ${
                              task.totalDuration > task.estimatedDuration * 60 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {task.totalDuration > task.estimatedDuration * 60 ? 'متأخر' : 'في الوقت'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">غير محدد</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.archivedAt ? formatDate(new Date(task.archivedAt)) : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.archivedBy || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTaskStatusColor(task.status)}>
                          {getTaskStatusInArabic(task.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}