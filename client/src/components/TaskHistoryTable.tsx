import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Filter, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDuration, formatTime, getCarBrandInArabic, getTaskStatusInArabic, getTaskStatusColor } from "@/lib/utils";
import { type TaskHistory } from "@shared/schema";

export default function TaskHistoryTable() {
  const { data: taskHistory, isLoading } = useQuery({
    queryKey: ['/api/tasks/history'],
    refetchInterval: 30000, // Refresh every 30 seconds
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
                    الحالة
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
  );
}
