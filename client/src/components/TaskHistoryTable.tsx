import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Filter, Download, Archive } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDuration, formatTime, getCarBrandInArabic, getTaskStatusInArabic, getTaskStatusColor } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type TaskHistory } from "@shared/schema";

export default function TaskHistoryTable() {
  const { toast } = useToast();
  
  const { data: taskHistory, isLoading } = useQuery({
    queryKey: ['/api/tasks/history'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const quickArchiveMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/archive`, {
        archivedBy: "نظام سريع",
        notes: "أرشفة سريعة من سجل المهام",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/archive'] });
      toast({
        title: "تم أرشفة المهمة",
        description: "تم نقل المهمة إلى الأرشيف بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الأرشفة",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">جاري تحميل السجل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <History className="ml-2 h-5 w-5" />
            سجل المهام
          </CardTitle>
          <div className="flex space-x-reverse space-x-2">
            <Button variant="outline">
              <Filter className="ml-2 h-4 w-4" />
              تصفية
            </Button>
            <Button className="success-bg">
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!taskHistory || taskHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا يوجد سجل مهام
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
                    نوع السيارة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموديل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم اللوحة
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
                            {task.worker.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.worker.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.description}
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
                      {task.startTime ? formatTime(new Date(task.startTime)) : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.endTime ? formatTime(new Date(task.endTime)) : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.status === 'active' ? (
                        <span className="error">
                          {formatDuration(Math.floor((Date.now() - new Date(task.startTime!).getTime()) / 1000))}
                        </span>
                      ) : (
                        formatDuration(task.totalDuration)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.estimatedDuration ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">
                            مقدر: {formatDuration(task.estimatedDuration * 60)}
                          </div>
                          {task.status === 'completed' && (
                            <div className={`text-xs ${
                              task.totalDuration > task.estimatedDuration * 60 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {task.totalDuration > task.estimatedDuration * 60 ? 'تأخير' : 'في الوقت'}
                            </div>
                          )}
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
                      {task.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => quickArchiveMutation.mutate(task.id)}
                          disabled={quickArchiveMutation.isPending}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Archive className="ml-1 h-3 w-3" />
                          أرشف
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
