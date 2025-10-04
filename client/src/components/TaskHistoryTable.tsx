import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Archive, Clock, CheckCircle, Calendar, Star, Edit } from "lucide-react";
import EditTaskDialog from "./EditTaskDialog";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDuration, formatTime, formatDate, getCarBrandInArabic, getTaskStatusInArabic, getTaskStatusColor } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { type TaskHistory } from "@shared/schema";

const archiveFormSchema = z.object({
  archivedBy: z.string().min(1, "يجب إدخال اسم المستلم"),
  notes: z.string().optional(),
  rating: z.number().min(1, "يجب اختيار تقييم").max(3, "التقييم من 1 إلى 3 نجوم"),
});

type ArchiveFormData = z.infer<typeof archiveFormSchema>;

export default function TaskHistoryTable() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const { data: taskHistory, isLoading } = useQuery({
    queryKey: ['/api/tasks/history'],
    refetchInterval: 5000,
  });



  const archiveForm = useForm<ArchiveFormData>({
    resolver: zodResolver(archiveFormSchema),
    defaultValues: {
      archivedBy: "",
      notes: "",
      rating: 0,
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (data: ArchiveFormData & { taskId: number }) => {
      const response = await apiRequest("POST", `/api/tasks/${data.taskId}/archive`, {
        archivedBy: data.archivedBy,
        notes: data.notes,
        rating: data.rating,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
      archiveForm.reset();
      setSelectedTaskId(null);
      setSelectedRating(0);
      toast({
        title: "تم تسليم المهمة",
        description: "تم تسليم المهمة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في التسليم",
        description: "حدث خطأ أثناء تسليم المهمة",
        variant: "destructive",
      });
    },
  });

  const quickArchiveMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/archive`, {
        archivedBy: "نظام",
        notes: "أرشفة سريعة",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
      toast({
        title: "تم أرشفة المهمة",
        description: "تم أرشفة المهمة بنجاح",
      });
    },
  });

  const onArchiveSubmit = (data: ArchiveFormData) => {
    if (selectedTaskId && selectedRating > 0) {
      archiveMutation.mutate({ ...data, taskId: selectedTaskId, rating: selectedRating });
    }
  };

  const handleTaskSelect = (taskId: number) => {
    setSelectedTaskId(taskId);
    setSelectedRating(0);
    archiveForm.reset();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جاري تحميل السجل...</div>
        </CardContent>
      </Card>
    );
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          سجل المهام
        </CardTitle>
      </CardHeader>
      <CardContent>

        {!taskHistory || taskHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد مهام في السجل
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المهندس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المشرف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفني
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المساعد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وصف المهمة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملية الإصلاح
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع المهمة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع السيارة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموديل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم اللوحة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اللون
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وقت البداية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وقت الانتهاء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المقدر/الفعلي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskHistory.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ml-3 ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'active' ? 'bg-red-500 animate-pulse' :
                          'bg-yellow-500'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {((task as any).engineerName && (task as any).engineerName !== '') ? (task as any).engineerName : 
                             ((task as any).supervisorName && (task as any).supervisorName !== '') ? (task as any).supervisorName : 
                             ((task as any).technicianName && (task as any).technicianName !== '') ? (task as any).technicianName : 
                             ((task as any).assistantName && (task as any).assistantName !== '') ? (task as any).assistantName : 
                             task.worker.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.supervisorName || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {(task as any).technicians && Array.isArray((task as any).technicians) && (task as any).technicians.length > 0 && (
                          <div>{(task as any).technicians.join(', ')}</div>
                        )}
                        {(task as any).technicianName && (task as any).technicianName !== '' && (
                          <div>{(task as any).technicianName}</div>
                        )}
                        {!(task as any).technicians?.length && !(task as any).technicianName && '--'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {(task as any).assistants && Array.isArray((task as any).assistants) && (task as any).assistants.length > 0 && (
                          <div>{(task as any).assistants.join(', ')}</div>
                        )}
                        {(task as any).assistantName && (task as any).assistantName !== '' && (
                          <div>{(task as any).assistantName}</div>
                        )}
                        {!(task as any).assistants?.length && !(task as any).assistantName && '--'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(task as any).repairOperation || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(task as any).taskType || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCarBrandInArabic(task.carBrand)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.carModel || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.licensePlate || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(task as any).color || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.startTime ? formatTime(task.startTime) : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.endTime ? formatTime(task.endTime) : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(task.totalDuration || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.estimatedDuration ? (
                        <div className="flex flex-col">
                          <span className="text-gray-600">
                            مقدر: {formatDuration(task.estimatedDuration * 60)}
                          </span>
                          <span className={`font-medium ${
                            (task.totalDuration || 0) > (task.estimatedDuration * 60) ? 'text-red-600' : 'text-green-600'
                          }`}>
                            فعلي: {formatDuration(task.totalDuration || 0)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">غير محدد</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getTaskStatusColor(task.status)}>
                        {getTaskStatusInArabic(task.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <EditTaskDialog 
                          task={{
                            ...task,
                            worker: task.worker,
                            currentDuration: task.totalDuration
                          }} 
                        />
                        {task.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskSelect(task.id)}
                            disabled={archiveMutation.isPending}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Archive className="ml-1 h-3 w-3" />
                            تسليم
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Archive Dialog */}
      <Dialog open={selectedTaskId !== null} onOpenChange={() => setSelectedTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تسليم المهمة</DialogTitle>
          </DialogHeader>
          <Form {...archiveForm}>
            <form onSubmit={archiveForm.handleSubmit(onArchiveSubmit)} className="space-y-4">
              <FormField
                control={archiveForm.control}
                name="archivedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستلم</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم من قام بالاستلام" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* تقييم العمل */}
              <div className="space-y-2">
                <label className="text-sm font-medium">تقييم العمل</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setSelectedRating(star);
                        archiveForm.setValue("rating", star);
                      }}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        selectedRating >= star
                          ? "border-yellow-400 bg-yellow-50 text-yellow-600"
                          : "border-gray-200 bg-white text-gray-400 hover:border-yellow-200"
                      }`}
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          selectedRating >= star ? "fill-yellow-400" : "fill-transparent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedRating === 1 && "مقبول"}
                  {selectedRating === 2 && "جيد"}
                  {selectedRating === 3 && "ممتاز"}
                  {selectedRating === 0 && "اختر تقييم العمل"}
                </div>
              </div>

              <FormField
                control={archiveForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أضف أي ملاحظات حول المهمة..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={archiveMutation.isPending || selectedRating === 0}
                >
                  {archiveMutation.isPending ? "جاري التسليم..." : "تسليم المهمة"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setSelectedTaskId(null);
                    setSelectedRating(0);
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}